export type Platform =
  | "reddit"
  | "indiehackers"
  | "facebook"
  | "linkedin"
  | "slack"
  | "discord"
  | "telegram"
  | "whatsapp"
  | "producthunt"
  | "x";

export type ScanMode = "scan_only" | "review_leads";
export type LeadTemperature = "Hot" | "Warm" | "Review" | "Ignore";
export type LeadStatus =
  | "New"
  | "Reviewed"
  | "Draft Opened"
  | "Contacted Manually"
  | "Follow-up Due"
  | "Replied"
  | "Interested"
  | "Not Interested"
  | "Nurture"
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
  communityUrl?: string;
  platformUserId?: string;
  profileVariables?: Record<string, string>;
  currentSequenceId?: string | null;
  currentSequenceStep?: number;
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

export type OutreachSequenceStatus = "draft" | "active" | "paused" | "completed";
export type LeadSequenceStatus = "active" | "paused" | "replied" | "completed" | "archived";
export type DraftQueueStatus = "queued" | "review" | "ready_to_send" | "sent_manually" | "replied" | "archived" | "failed";

export type OutreachSequence = {
  id: string;
  workspaceId: string;
  campaignId: string | null;
  name: string;
  objective: string;
  targetPlatform: Platform | string;
  status: OutreachSequenceStatus;
  timezone: string;
  sendWindowStart: string;
  sendWindowEnd: string;
  sendDays: string[];
  dailyReviewLimit: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OutreachSequenceStep = {
  id: string;
  workspaceId: string;
  sequenceId: string;
  stepOrder: number;
  name: string;
  delayHours: number;
  template: string;
  variationCount: number;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeadSequence = {
  id: string;
  workspaceId: string;
  leadId: string;
  sequenceId: string;
  currentStepId: string | null;
  currentStepOrder: number;
  status: LeadSequenceStatus;
  repliedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OutreachDraftQueueItem = {
  id: string;
  workspaceId: string;
  leadId: string;
  leadSequenceId: string | null;
  sequenceId: string | null;
  stepId: string | null;
  stepOrder: number;
  platform: string;
  status: DraftQueueStatus;
  dueAt: string;
  draftText: string;
  draftVariations: string[];
  selectedVariationIndex: number;
  copiedAt: string | null;
  profileOpenedAt: string | null;
  sentManuallyAt: string | null;
  approvedAt: string | null;
  failedReason: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OutreachActivityEvent = {
  id: string;
  workspaceId: string;
  leadId: string | null;
  leadSequenceId: string | null;
  queueItemId: string | null;
  sequenceId: string | null;
  userId: string | null;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
