import assert from "node:assert/strict";
import test from "node:test";

function scoreLeadText(text) {
  const source = text.toLowerCase();
  let score = 0;
  const matched = new Set();
  const negative = new Set();
  const add = (points, terms) => {
    const hits = terms.filter(term => source.includes(term));
    if (hits.length) {
      score += points;
      hits.forEach(hit => matched.add(hit));
    }
  };
  add(30, ["looking for", "need help"]);
  add(25, ["hiring"]);
  add(25, ["paid", "budget"]);
  add(20, ["b2b", "founder", "startup"]);
  add(20, ["lead generation", "outbound", "cold email"]);
  add(15, ["remote", "work from home", "wfh", "anywhere", "remotely", "fully remote"]);
  add(15, ["freelance", "contract"]);
  add(10, ["asap", "immediately", "this week"]);
  ["unpaid", "volunteer only", "free work"].forEach(term => {
    if (source.includes(term)) {
      score -= 30;
      negative.add(term);
    }
  });
  ["job seeker", "looking for work", "student looking for internship"].forEach(term => {
    if (source.includes(term)) {
      score -= 50;
      negative.add(term);
    }
  });
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    temperature: score >= 80 ? "Hot" : score >= 50 ? "Warm" : score >= 25 ? "Review" : "Ignore",
    matchedKeywords: Array.from(matched),
    negativeSignals: Array.from(negative)
  };
}

function stableHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return `h_${Math.abs(hash)}`;
}

function identityKeyForLead(lead) {
  const person = String(lead.authorProfileUrl || lead.authorName || "unknown")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .replace(/[^a-z0-9@._/-]+/g, "-")
    .replace(/-+/g, "-") || "unknown";
  const text = String(lead.postText || "")
    .trim()
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s$@._-]/gu, " ")
    .replace(/\s+/g, " ");
  return `identity:${lead.platform}:${person}:${stableHash(text.slice(0, 1400))}`;
}

function duplicateKeysForLead(lead) {
  const keys = new Set();
  keys.add(identityKeyForLead(lead));
  if (lead.sourceUrl) keys.add(`source:${lead.sourceUrl}`);
  if (lead.authorProfileUrl) keys.add(`profile:${lead.authorProfileUrl}`);
  if (lead.authorName && lead.platform) keys.add(`author:${lead.platform}:${lead.authorName.toLowerCase()}`);
  if (lead.platform && lead.communityName && lead.authorName) keys.add(`community-author:${lead.platform}:${lead.communityName.toLowerCase()}:${lead.authorName.toLowerCase()}`);
  keys.add(`text:${lead.platform}:${stableHash(lead.postText.slice(0, 600))}`);
  return Array.from(keys);
}

test("scores high-intent buyer posts as hot", () => {
  const result = scoreLeadText("Founder looking for outbound and cold email help for our B2B startup. We have budget and need help this week.");
  assert.equal(result.temperature, "Hot");
  assert.ok(result.score >= 80);
  assert.ok(result.matchedKeywords.includes("looking for"));
});

test("negative job-seeker intent lowers score", () => {
  const result = scoreLeadText("Student looking for internship and unpaid volunteer work in marketing.");
  assert.equal(result.temperature, "Ignore");
  assert.ok(result.negativeSignals.length >= 1);
});

test("duplicate keys prioritize person plus content identity and still cover source/profile fallbacks", () => {
  const keys = duplicateKeysForLead({
    platform: "reddit",
    communityName: "SaaS",
    authorName: "founder_user",
    authorProfileUrl: "https://reddit.com/u/founder_user",
    sourceUrl: "https://reddit.com/r/SaaS/comments/1",
    postText: "Need lead generation help"
  });
  assert.ok(keys.some(key => key.startsWith("identity:reddit:reddit.com/u/founder_user:")));
  assert.ok(keys.some(key => key.startsWith("source:")));
  assert.ok(keys.some(key => key.startsWith("profile:")));
  assert.ok(keys.some(key => key.startsWith("author:reddit:founder_user")));
  assert.ok(keys.some(key => key.startsWith("community-author:reddit:saas:founder_user")));
  assert.ok(keys.some(key => key.startsWith("text:reddit:")));
});
