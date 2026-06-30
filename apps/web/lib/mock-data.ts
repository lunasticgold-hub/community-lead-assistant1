import { defaultKnowledgeBase, defaultKeywordGroups, defaultTemplates, demoCampaign } from "./defaults";
import { buildDraftSet } from "./drafts";
import { primaryDuplicateKey } from "./dedupe";
import { scoreLeadText } from "./scoring";
import type { Lead } from "./types";

const now = new Date().toISOString();

function makeLead(id: string, platform: string, authorName: string, communityName: string, postText: string): Lead {
  const score = scoreLeadText(postText, defaultKeywordGroups);
  const base = {
    id,
    workspaceId: "demo-workspace",
    campaignId: "demo-campaign",
    platform,
    communityName,
    authorName,
    authorProfileUrl: `https://example.com/${authorName}`,
    sourceUrl: `https://example.com/${platform}/${id}`,
    postText,
    postSnippet: postText.slice(0, 180),
    matchedKeywords: score.matchedKeywords,
    negativeSignals: score.negativeSignals,
    leadScore: score.score,
    leadTemperature: score.temperature,
    status: "New",
    notes: "",
    ownerId: null,
    followUpDate: null,
    outreachDraft: "",
    followUpDraft: "",
    duplicateKey: "",
    createdAt: now,
    updatedAt: now
  } satisfies Lead;
  const drafts = buildDraftSet(base, defaultKnowledgeBase, defaultTemplates);
  return {
    ...base,
    outreachDraft: drafts.shortDirect,
    followUpDraft: drafts.followUp1,
    duplicateKey: primaryDuplicateKey(base)
  };
}

export const demoWorkspace = {
  id: "demo-workspace",
  name: "Acme Growth Studio",
  plan: "trial",
  ownerId: "demo-user",
  billingStatus: "trialing",
  monthlyLeadLimit: 50,
  monthlyAiDraftLimit: 50
};

export const demoLeads: Lead[] = [
  makeLead("lead-1", "reddit", "saasfounder23", "r/SaaS", "Looking for SDRs or outbound help for our B2B SaaS. We have budget and need meetings this week."),
  makeLead("lead-2", "facebook", "Maya Founder", "SaaS Growth Hacks", "Need help getting customers for a new marketing analytics tool. Cold email and lead list ideas welcome."),
  makeLead("lead-3", "slack", "Daniel Ops", "demand-gen", "Hiring a contractor for lead generation and appointment setting. Paid project, ideally someone who knows B2B sales."),
  makeLead("lead-4", "indiehackers", "indie_lee", "growth", "Trying to improve SEO and demand gen for our bootstrapped product. Looking for a marketing agency recommendation.")
];

export const demoBootstrap = {
  workspace: demoWorkspace,
  campaign: demoCampaign,
  knowledgeBase: defaultKnowledgeBase,
  keywordGroups: defaultKeywordGroups,
  templateSet: defaultTemplates
};
