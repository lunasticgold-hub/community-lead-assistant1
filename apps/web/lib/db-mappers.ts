import type { Lead } from "./types";

type LeadDbRow = Record<string, unknown>;

export function leadToDb(lead: Partial<Lead>) {
  return {
    id: lead.id,
    workspace_id: lead.workspaceId,
    campaign_id: lead.campaignId,
    platform: lead.platform,
    community_name: lead.communityName,
    community_url: lead.communityUrl || "",
    platform_user_id: lead.platformUserId || "",
    profile_variables: lead.profileVariables || {},
    current_sequence_id: lead.currentSequenceId || null,
    current_sequence_step: lead.currentSequenceStep || 0,
    author_name: lead.authorName,
    author_profile_url: lead.authorProfileUrl,
    source_url: lead.sourceUrl,
    post_text: lead.postText,
    post_snippet: lead.postSnippet,
    matched_keywords: lead.matchedKeywords || [],
    negative_signals: lead.negativeSignals || [],
    lead_score: lead.leadScore || 0,
    lead_temperature: lead.leadTemperature || "Review",
    status: lead.status || "New",
    notes: lead.notes || "",
    owner_id: lead.ownerId || null,
    follow_up_date: lead.followUpDate || null,
    outreach_draft: lead.outreachDraft || "",
    follow_up_draft: lead.followUpDraft || "",
    duplicate_key: lead.duplicateKey || "",
    updated_at: new Date().toISOString()
  };
}

export function leadPatchToDb(lead: Partial<Lead>) {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (lead.status !== undefined) patch.status = lead.status;
  if (lead.notes !== undefined) patch.notes = lead.notes;
  if (lead.ownerId !== undefined) patch.owner_id = lead.ownerId;
  if (lead.followUpDate !== undefined) patch.follow_up_date = lead.followUpDate || null;
  if (lead.outreachDraft !== undefined) patch.outreach_draft = lead.outreachDraft;
  if (lead.followUpDraft !== undefined) patch.follow_up_draft = lead.followUpDraft;
  if (lead.communityUrl !== undefined) patch.community_url = lead.communityUrl || "";
  if (lead.sourceUrl !== undefined) patch.source_url = lead.sourceUrl || "";
  if (lead.authorProfileUrl !== undefined) patch.author_profile_url = lead.authorProfileUrl || "";
  if (lead.platformUserId !== undefined) patch.platform_user_id = lead.platformUserId || "";
  if (lead.profileVariables !== undefined) patch.profile_variables = lead.profileVariables || {};
  if (lead.currentSequenceId !== undefined) patch.current_sequence_id = lead.currentSequenceId || null;
  if (lead.currentSequenceStep !== undefined) patch.current_sequence_step = lead.currentSequenceStep || 0;

  return patch;
}

export function leadFromDb(row: LeadDbRow): Lead {
  return {
    id: String(row.id || ""),
    workspaceId: String(row.workspace_id || ""),
    campaignId: String(row.campaign_id || ""),
    platform: String(row.platform || ""),
    communityName: String(row.community_name || ""),
    communityUrl: String(row.community_url || ""),
    platformUserId: String(row.platform_user_id || ""),
    profileVariables: isStringRecord(row.profile_variables) ? row.profile_variables : {},
    currentSequenceId: typeof row.current_sequence_id === "string" ? row.current_sequence_id : null,
    currentSequenceStep: Number(row.current_sequence_step || 0),
    authorName: String(row.author_name || ""),
    authorProfileUrl: String(row.author_profile_url || ""),
    sourceUrl: String(row.source_url || ""),
    postText: String(row.post_text || ""),
    postSnippet: String(row.post_snippet || ""),
    matchedKeywords: Array.isArray(row.matched_keywords) ? row.matched_keywords.map(String) : [],
    negativeSignals: Array.isArray(row.negative_signals) ? row.negative_signals.map(String) : [],
    leadScore: Number(row.lead_score || 0),
    leadTemperature: row.lead_temperature === "Hot" || row.lead_temperature === "Warm" || row.lead_temperature === "Ignore" ? row.lead_temperature : "Review",
    status: typeof row.status === "string" ? (row.status as Lead["status"]) : "New",
    notes: String(row.notes || ""),
    ownerId: typeof row.owner_id === "string" ? row.owner_id : null,
    followUpDate: typeof row.follow_up_date === "string" ? row.follow_up_date : null,
    outreachDraft: String(row.outreach_draft || ""),
    followUpDraft: String(row.follow_up_draft || ""),
    duplicateKey: String(row.duplicate_key || ""),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
    synced: true
  };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
