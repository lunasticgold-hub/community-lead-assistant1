import "server-only";
import { getReviewQueueCount } from "@/lib/outreach";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getExtensionBootstrap(workspaceId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");

  const [workspace, campaign, knowledgeBase, keywordGroups, templateSet] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
    supabase.from("campaigns").select("*").eq("workspace_id", workspaceId).eq("active", true).limit(1).maybeSingle(),
    supabase.from("knowledge_bases").select("*").eq("workspace_id", workspaceId).limit(1).maybeSingle(),
    supabase.from("keyword_groups").select("*").eq("workspace_id", workspaceId),
    supabase.from("template_sets").select("*").eq("workspace_id", workspaceId).limit(1).maybeSingle()
  ]);

  if (workspace.error) throw workspace.error;
  if (campaign.error) throw campaign.error;
  if (knowledgeBase.error) throw knowledgeBase.error;
  if (keywordGroups.error) throw keywordGroups.error;
  if (templateSet.error) throw templateSet.error;

  return {
    workspace: workspace.data,
    campaign: campaign.data,
    knowledgeBase: knowledgeBase.data,
    keywordGroups: keywordGroups.data || [],
    templateSet: templateSet.data,
    reviewQueueCount: await getReviewQueueCount(workspaceId).catch(() => 0)
  };
}
