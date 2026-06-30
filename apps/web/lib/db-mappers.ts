import type { Lead } from "./types";

export function leadToDb(lead: Partial<Lead>) {
  return {
    id: lead.id,
    workspace_id: lead.workspaceId,
    campaign_id: lead.campaignId,
    platform: lead.platform,
    community_name: lead.communityName,
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

export function leadFromDb(row: Record<string, any>): Lead {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    campaignId: row.campaign_id,
    platform: row.platform,
    communityName: row.community_name,
    authorName: row.author_name,
    authorProfileUrl: row.author_profile_url || "",
    sourceUrl: row.source_url || "",
    postText: row.post_text || "",
    postSnippet: row.post_snippet || "",
    matchedKeywords: row.matched_keywords || [],
    negativeSignals: row.negative_signals || [],
    leadScore: row.lead_score || 0,
    leadTemperature: row.lead_temperature || "Review",
    status: row.status || "New",
    notes: row.notes || "",
    ownerId: row.owner_id || null,
    followUpDate: row.follow_up_date || null,
    outreachDraft: row.outreach_draft || "",
    followUpDraft: row.follow_up_draft || "",
    duplicateKey: row.duplicate_key || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    synced: true
  };
}
