export type Platform =
  | "reddit"
  | "indiehackers"
  | "facebook"
  | "slack"
  | "discord"
  | "telegram"
  | "whatsapp";

export type ScanMode = "scan_only" | "review_leads";
export type LeadTemperature = "Hot" | "Warm" | "Review" | "Ignore";
export type LeadStatus =
  | "New"
  | "Reviewed"
  | "Draft Opened"
  | "Contacted Manually"
  | "Follow-up Due"
  | "Not Relevant"
  | "Converted"
  | "Ignored";

export type KnowledgeBase = {
  myService: string;
  offer: string;
  icp: string;
  painPoints: string[];
  proof: string;
  cta: string;
  tone: string;
  blockedWords: string[];
  faqs: string[];
  objections: string[];
};

export type KnowledgeDocument = {
  id: string;
  workspaceId: string;
  knowledgeBaseId: string | null;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storagePath: string;
  extractedSummary: string;
  processingStatus: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
};

export type TemplateSet = {
  shortDirect: string;
  friendly: string;
  serviceSpecific: string;
  followUp1: string;
  followUp2: string;
  finalFollowUp: string;
};

export type KeywordGroup = {
  id: string;
  name: string;
  positiveKeywords: string[];
  negativeKeywords: string[];
  requiredCombinations: string[][];
  scoreWeights: Record<string, number>;
};

export type Campaign = {
  id: string;
  workspaceId: string;
  name: string;
  active: boolean;
  targetPlatforms: Platform[];
  minScore: number;
  scanMode: ScanMode;
  pauseAfterLeads: number;
  knowledgeBaseId: string;
  templateSetId: string;
};

export type Lead = {
  id: string;
  workspaceId: string;
  campaignId: string;
  platform: Platform | string;
  communityName: string;
  authorName: string;
  authorProfileUrl: string;
  sourceUrl: string;
  postText: string;
  postSnippet: string;
  matchedKeywords: string[];
  negativeSignals: string[];
  leadScore: number;
  leadTemperature: LeadTemperature;
  status: LeadStatus;
  notes: string;
  ownerId: string | null;
  followUpDate: string | null;
  outreachDraft: string;
  followUpDraft: string;
  duplicateKey: string;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
};

export type ScoreResult = {
  score: number;
  temperature: LeadTemperature;
  matchedKeywords: string[];
  negativeSignals: string[];
  breakdown: { label: string; points: number }[];
};
