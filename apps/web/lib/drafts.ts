import { defaultKnowledgeBase, defaultTemplates } from "./defaults";
import type { KnowledgeBase, Lead, TemplateSet } from "./types";

export function renderDraft(template: string, lead: Partial<Lead>, kb: Partial<KnowledgeBase> = {}): string {
  const merged = { ...defaultKnowledgeBase, ...kb };
  const values: Record<string, string> = {
    author: lead.authorName || "",
    platform: String(lead.platform || ""),
    community: lead.communityName || "",
    post_snippet: lead.postSnippet || "",
    matched_keywords: (lead.matchedKeywords || []).join(", "),
    my_service: merged.myService,
    offer: merged.offer,
    cta: merged.cta,
    proof: merged.proof,
    icp: merged.icp
  };
  let output = Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
  for (const word of merged.blockedWords || []) {
    if (word.trim()) output = output.replace(new RegExp(escapeRegExp(word.trim()), "gi"), "");
  }
  return output.replace(/\n{3,}/g, "\n\n").trim();
}

export function buildDraftSet(lead: Partial<Lead>, kb: Partial<KnowledgeBase> = {}, templates: Partial<TemplateSet> = {}) {
  const merged = { ...defaultTemplates, ...templates };
  return {
    shortDirect: renderDraft(merged.shortDirect, lead, kb),
    friendly: renderDraft(merged.friendly, lead, kb),
    serviceSpecific: renderDraft(merged.serviceSpecific, lead, kb),
    followUp1: renderDraft(merged.followUp1, lead, kb),
    followUp2: renderDraft(merged.followUp2, lead, kb),
    finalFollowUp: renderDraft(merged.finalFollowUp, lead, kb)
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
