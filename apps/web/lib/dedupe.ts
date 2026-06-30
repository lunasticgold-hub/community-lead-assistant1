import type { Lead } from "./types";

export function stableHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return `h_${Math.abs(hash)}`;
}

export function duplicateKeysForLead(lead: Pick<Lead, "sourceUrl" | "authorProfileUrl" | "authorName" | "platform" | "communityName" | "postText">): string[] {
  const keys = new Set<string>();
  if (lead.sourceUrl) keys.add(`source:${lead.sourceUrl}`);
  if (lead.authorProfileUrl) keys.add(`profile:${lead.authorProfileUrl}`);
  if (lead.authorName && lead.platform) keys.add(`author:${lead.platform}:${lead.authorName.toLowerCase()}`);
  if (lead.platform && lead.communityName && lead.authorName) {
    keys.add(`community-author:${lead.platform}:${lead.communityName.toLowerCase()}:${lead.authorName.toLowerCase()}`);
  }
  if (lead.postText) keys.add(`text:${lead.platform}:${stableHash(lead.postText.slice(0, 600))}`);
  return Array.from(keys);
}

export function primaryDuplicateKey(lead: Pick<Lead, "sourceUrl" | "authorProfileUrl" | "authorName" | "platform" | "communityName" | "postText">): string {
  return duplicateKeysForLead(lead)[0] || `text:${stableHash(JSON.stringify(lead))}`;
}
