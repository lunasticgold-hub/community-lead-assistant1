import { createHash } from "crypto";

export type LeadIdentityInput = {
  platform?: string | null;
  authorName?: string | null;
  authorProfileUrl?: string | null;
  postText?: string | null;
  postSnippet?: string | null;
  sourceUrl?: string | null;
};

export function normalizeLeadPerson(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .replace(/[^a-z0-9@._/-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

export function normalizeLeadTextForIdentity(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s$@._-]/gu, " ")
    .replace(/\s+/g, " ")
    .slice(0, 1400);
}

export function createLeadIdentityKey(input: LeadIdentityInput): string {
  const platform = normalizeLeadPerson(input.platform || "unknown") || "unknown";
  const person = normalizeLeadPerson(input.authorProfileUrl || input.authorName || "unknown") || "unknown";
  const text = normalizeLeadTextForIdentity(input.postText || input.postSnippet || input.sourceUrl || "");
  const contentHash = createHash("sha256").update(text || "empty").digest("hex").slice(0, 24);
  return `identity:${platform}:${person}:${contentHash}`;
}
