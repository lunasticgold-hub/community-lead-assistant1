import type { Campaign, KnowledgeBase, KeywordGroup, TemplateSet } from "./types";

export const planLimits = {
  trial: {
    label: "7-day Trial",
    priceLabel: "Free for 7 days",
    leadsPerMonth: 50,
    aiDraftsPerMonth: 50,
    users: 1,
    workspaces: 1,
    trialDays: 7,
    stripePriceEnv: null,
    description: "Test the full workflow with 50 saved lead credits and 50 Gemini draft credits."
  },
  starter: {
    label: "Starter",
    priceLabel: "TBD",
    leadsPerMonth: 1000,
    aiDraftsPerMonth: 1000,
    users: 1,
    workspaces: 1,
    trialDays: 0,
    stripePriceEnv: "STRIPE_STARTER_PRICE_ID",
    description: "For solo freelancers and founder-led service providers."
  },
  pro: {
    label: "Pro",
    priceLabel: "TBD",
    leadsPerMonth: 5000,
    aiDraftsPerMonth: 5000,
    users: 3,
    workspaces: 3,
    trialDays: 0,
    stripePriceEnv: "STRIPE_PRO_PRICE_ID",
    description: "For small agencies and growth teams managing campaigns."
  },
  agency: {
    label: "Agency",
    priceLabel: "TBD",
    leadsPerMonth: 25000,
    aiDraftsPerMonth: 25000,
    users: 10,
    workspaces: 10,
    trialDays: 0,
    stripePriceEnv: "STRIPE_AGENCY_PRICE_ID",
    description: "For teams that need higher limits, workspace controls, and analytics."
  }
} as const;

export const productConfig = {
  name: "Community Lead Assistant",
  domain: "communityleadassistant.com",
  supportEmail: "support@communityleadassistant.com",
  legalName: "communityleadassistant.com",
  trialDays: 7,
  trialLeadLimit: 50,
  trialAiDraftLimit: 50,
  supabaseRegion: "us-east-1",
  aiProvider: "gemini",
  aiModel: "gemini-2.5-flash",
  maxKnowledgeFileMb: 10,
  allowedKnowledgeFileTypes: ["PDF", "DOCX", "TXT"]
} as const;

export const landingFeatures = [
  ["Community lead scanning", "Scan visible posts and messages across high-intent communities without hidden scraping."],
  ["Lead scoring", "Separate buyers from job seekers, promoted content, and low-fit posts with configurable scoring."],
  ["Manual outreach draft generation", "Use your knowledge base and Gemini-powered drafts while keeping every send manual."],
  ["Lead CRM", "Review, save, assign, filter, export, and manage leads from one clean workspace."],
  ["Follow-up reminders", "Create safe follow-up tasks and drafts after a user marks a lead as contacted manually."]
] as const;

export const defaultBuyerSignals = [
  "need help getting customers",
  "looking for sdrs",
  "need lead generation",
  "looking for marketing agency",
  "need seo",
  "appointment setters",
  "outbound",
  "cold email",
  "b2b sales",
  "demand gen",
  "growth help",
  "sales calls",
  "booking meetings",
  "lead list",
  "email automation",
  "sales automation"
];

export const defaultNegativeSignals = [
  "unpaid",
  "volunteer only",
  "scam",
  "not hiring",
  "free work",
  "avoid this",
  "warning",
  "job seeker looking for work",
  "student looking for internship"
];

export const defaultKnowledgeBase: KnowledgeBase = {
  myService: "B2B lead generation and outbound sales support",
  offer: "A practical lead generation system that helps book qualified sales conversations.",
  icp: "B2B SaaS founders, agencies, consultants, and service businesses.",
  painPoints: ["Not enough qualified calls", "Outbound is inconsistent", "No clear lead list"],
  proof: "We focus on targeted lead lists, sharp positioning, and manual review before any outreach.",
  cta: "Open to a quick chat?",
  tone: "Friendly, concise, useful, and not pushy.",
  blockedWords: ["guaranteed", "blast", "spam", "bot"],
  faqs: ["Do you send messages automatically? No, all sending is manual."],
  objections: ["Already have outbound", "No budget", "Too early"]
};

export const defaultTemplates: TemplateSet = {
  shortDirect:
    "Hi {author}, saw your post in {community} about {matched_keywords}.\n\nI help with {my_service}. {cta}\n\nPost: {post_snippet}",
  friendly:
    "Hi {author}, noticed your {platform} post about {matched_keywords}.\n\nThis caught my eye because {offer}. If useful, happy to share a few ideas.\n\n{cta}",
  serviceSpecific:
    "Hi {author}, saw your post in {community}.\n\nI help {icp} with {my_service}. Based on your post, {offer} may be relevant.\n\n{proof}\n\n{cta}",
  followUp1:
    "Hi {author}, just following up on your post about {matched_keywords}.\n\nIf this is still a priority, happy to share a few practical ideas around {my_service}.",
  followUp2:
    "Hi {author}, quick second follow-up. Your post sounded related to {matched_keywords}.\n\nIf useful, I can send a simple approach for {offer}.",
  finalFollowUp:
    "Hi {author}, closing the loop here. If {matched_keywords} becomes a priority later, happy to help.\n\nWishing you luck with it."
};

export const defaultKeywordGroups: KeywordGroup[] = [
  {
    id: "buyer-intent",
    name: "Buyer intent",
    positiveKeywords: defaultBuyerSignals,
    negativeKeywords: defaultNegativeSignals,
    requiredCombinations: [],
    scoreWeights: {
      "looking for": 30,
      "need help": 30,
      hiring: 25,
      paid: 25,
      budget: 25,
      b2b: 20,
      founder: 20,
      startup: 20,
      "lead generation": 20,
      outbound: 20,
      "cold email": 20
    }
  },
  {
    id: "freelance-remote",
    name: "Freelance remote work",
    positiveKeywords: ["remote", "work from home", "wfh", "anywhere", "remotely", "fully remote", "freelance", "contract", "paid", "project"],
    negativeKeywords: defaultNegativeSignals,
    requiredCombinations: [
      ["remote", "work from home", "wfh", "anywhere", "remotely", "fully remote"],
      ["freelance", "freelancer", "contract", "contractor", "gig", "part-time", "project-based"],
      ["hiring", "looking for", "need someone", "paid", "project", "role", "opportunity", "client"]
    ],
    scoreWeights: {}
  }
];

export const defaultCampaign: Campaign = {
  id: "default-campaign",
  workspaceId: "",
  name: "Founder communities",
  active: true,
  targetPlatforms: ["reddit", "indiehackers", "facebook", "slack", "discord", "telegram", "whatsapp"],
  minScore: 25,
  scanMode: "review_leads",
  pauseAfterLeads: 25,
  knowledgeBaseId: "demo-kb",
  templateSetId: "demo-templates"
};
