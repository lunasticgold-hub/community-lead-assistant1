import "server-only";
import type { User } from "@supabase/supabase-js";
import { defaultCampaign, defaultKeywordGroups, defaultKnowledgeBase, defaultTemplates } from "./defaults";
import { getNumberEnv } from "./env";
import { getSupabaseAdmin } from "./supabase-admin";

export type ProvisionedWorkspace = {
  id: string;
  name: string;
  owner_id: string | null;
  plan: string;
};

function displayName(user: User) {
  return String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Workspace");
}

export async function ensureUserWorkspace(user: User): Promise<ProvisionedWorkspace> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");

  const name = displayName(user);
  const email = user.email || "";

  await supabase.from("users").upsert({
    id: user.id,
    email,
    name
  });

  const { data: existingMembership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, owner_id, plan)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;

  const existingWorkspace = Array.isArray(existingMembership?.workspaces)
    ? existingMembership?.workspaces[0]
    : existingMembership?.workspaces;
  if (existingWorkspace?.id) return existingWorkspace as ProvisionedWorkspace;

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: `${name}'s Workspace`,
      owner_id: user.id,
      plan: "trial",
      billing_status: "trialing",
      monthly_lead_limit: getNumberEnv("TRIAL_LEAD_LIMIT", 50),
      monthly_ai_draft_limit: getNumberEnv("TRIAL_AI_DRAFT_LIMIT", 50),
      trial_ends_at: new Date(Date.now() + getNumberEnv("TRIAL_DAYS", 7) * 24 * 60 * 60 * 1000).toISOString(),
      data_retention_days: getNumberEnv("DATA_RETENTION_DAYS", 90)
    })
    .select("id, name, owner_id, plan")
    .single();

  if (workspaceError) throw workspaceError;

  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner"
  });

  const { data: knowledgeBase } = await supabase
    .from("knowledge_bases")
    .insert({
      workspace_id: workspace.id,
      name: "Default knowledge base",
      my_service: defaultKnowledgeBase.myService,
      offer: defaultKnowledgeBase.offer,
      icp: defaultKnowledgeBase.icp,
      pain_points: defaultKnowledgeBase.painPoints,
      proof: defaultKnowledgeBase.proof,
      cta: defaultKnowledgeBase.cta,
      tone: defaultKnowledgeBase.tone,
      blocked_words: defaultKnowledgeBase.blockedWords,
      faqs: defaultKnowledgeBase.faqs,
      objections: defaultKnowledgeBase.objections
    })
    .select("id")
    .single();

  const { data: templateSet } = await supabase
    .from("template_sets")
    .insert({
      workspace_id: workspace.id,
      name: "Default templates",
      short_direct: defaultTemplates.shortDirect,
      friendly: defaultTemplates.friendly,
      service_specific: defaultTemplates.serviceSpecific,
      follow_up_1: defaultTemplates.followUp1,
      follow_up_2: defaultTemplates.followUp2,
      final_follow_up: defaultTemplates.finalFollowUp
    })
    .select("id")
    .single();

  await supabase.from("keyword_groups").insert(defaultKeywordGroups.map(group => ({
    workspace_id: workspace.id,
    name: group.name,
    positive_keywords: group.positiveKeywords,
    negative_keywords: group.negativeKeywords,
    required_combinations: group.requiredCombinations,
    score_weights: group.scoreWeights
  })));

  await supabase.from("campaigns").insert({
    workspace_id: workspace.id,
    name: defaultCampaign.name,
    active: true,
    target_platforms: defaultCampaign.targetPlatforms,
    min_score: defaultCampaign.minScore,
    scan_mode: defaultCampaign.scanMode,
    pause_after_leads: defaultCampaign.pauseAfterLeads,
    keyword_group_ids: [],
    template_set_id: templateSet?.id || null,
    knowledge_base_id: knowledgeBase?.id || null
  });

  return workspace as ProvisionedWorkspace;
}
