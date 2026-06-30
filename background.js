const EXTENSION_VERSION = "7.0.0";

const STATUSES = [
  "New",
  "Reviewed",
  "Draft Opened",
  "Contacted Manually",
  "Follow-up Due",
  "Not Relevant",
  "Converted",
  "Ignored"
];

const DEFAULTS = {
  extensionVersion: EXTENSION_VERSION,
  scanMode: "review",
  minLeadScore: 25,
  minGapSec: 30,
  maxGapSec: 40,
  scanItemDelayMs: 350,
  runUntilAt: "",
  maxLeadsPerRun: 0,
  includeFreelancePreset: false,
  leadKeywords: [
    "need help getting customers",
    "looking for sdrs",
    "looking for sdr",
    "need lead generation",
    "looking for lead generation",
    "looking for marketing agency",
    "need a marketing agency",
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
  ],
  blockedKeywords: [
    "unpaid",
    "volunteer only",
    "scam",
    "not hiring",
    "free work",
    "avoid this",
    "warning",
    "job seeker looking for work",
    "student looking for internship"
  ],
  enabledPlatforms: {
    reddit: true,
    indiehackers: true,
    startupschool: true,
    microconf: true,
    slack: true,
    discord: true,
    facebook: true,
    whatsapp: true,
    telegram: true
  },
  knowledgeBase: {
    myService: "B2B lead generation and outbound sales support",
    companyDescription: "We help B2B founders find and convert qualified leads from outbound and community channels.",
    idealCustomerProfile: "B2B SaaS founders, agencies, consultants, and service businesses that need more qualified calls.",
    offer: "A practical lead generation and outbound setup that helps book qualified sales conversations.",
    proof: "We focus on targeted lead lists, clear outreach angles, and manual review before sending.",
    cta: "Open to a quick chat?",
    tone: "friendly, concise, helpful, not pushy",
    blockedWords: "guaranteed, spam, blast, bot"
  },
  templates: {
    shortDirect: "Hi {author}, saw your post in {community} about {matched_keywords}.\n\nI help with {my_service}. {cta}\n\nPost: {post_snippet}",
    friendly: "Hi {author}, I noticed your {platform} post about {intent_summary}.\n\nThis caught my eye because {offer}. If useful, happy to share a few ideas.\n\n{cta}",
    serviceSpecific: "Hi {author}, saw your post in {community}.\n\nI help {ideal_customer_profile} with {my_service}. Based on your post, {offer} may be relevant.\n\n{proof}\n\n{cta}",
    followUp1: "Hi {author}, just following up on your post about {matched_keywords}.\n\nIf this is still a priority, happy to share a few practical ideas around {my_service}.",
    followUp2: "Hi {author}, quick second follow-up. Your post sounded like {intent_summary}.\n\nIf useful, I can send over a simple approach for {offer}.",
    finalFollowUp: "Hi {author}, closing the loop here. If {matched_keywords} becomes a priority later, happy to help.\n\nWishing you luck with it."
  },
  lastDraftOpenedAt: 0,
  scannedCount: 0,
  foundCount: 0,
  dmDraftsOpened: 0,
  commentsLogged: 0,
  csvExports: 0,
  matchedQueue: [],
  logs: [],
  processedKeys: [],
  status: "Idle",
  lastError: ""
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const patch = {};
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (existing[key] === undefined) patch[key] = value;
  }
  patch.extensionVersion = EXTENSION_VERSION;
  if (Object.keys(patch).length) await chrome.storage.local.set(patch);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(async error => {
    const text = error.message || String(error);
    console.error(error);
    await chrome.storage.local.set({ status: "Error", lastError: text });
    sendResponse({ ok: false, error: text });
  });
  return true;
});

async function handleMessage(message) {
  switch (message.type) {
    case "ENSURE_CONTENT_SCRIPT":
      return ensureContentScript(message.tabId);
    case "GET_REPLY_DRAFT":
      return getReplyDraft(message.itemId, message.templateType);
    case "OPEN_OUTREACH":
    case "OPEN_DM_DRAFT":
      return openOutreach(message.itemId, message.templateType);
    case "LOG_OUTREACH":
    case "LOG_COMMENT":
      return logOutreach(message.itemId);
    case "UPDATE_LEAD":
      return updateLead(message.itemId, message.patch || {});
    case "PREPARE_CSV_EXPORT":
      return prepareCsvExport();
    case "RESET_SESSION":
      await chrome.storage.local.set({
        scannedCount: 0,
        foundCount: 0,
        dmDraftsOpened: 0,
        commentsLogged: 0,
        matchedQueue: [],
        logs: [],
        processedKeys: [],
        lastDraftOpenedAt: 0,
        status: "Session reset",
        lastError: ""
      });
      return { ok: true };
    default:
      return { ok: false, error: "Unknown message type" };
  }
}

async function ensureContentScript(tabId) {
  if (!tabId) throw new Error("No active supported community tab found.");
  try {
    await chrome.tabs.sendMessage(tabId, { type: "PING" });
    return { ok: true, alreadyInjected: true };
  } catch (e) {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    await new Promise(resolve => setTimeout(resolve, 250));
    return { ok: true, injected: true };
  }
}

async function getReplyDraft(itemId, templateType) {
  const state = await chrome.storage.local.get(null);
  const { item } = findItem(state, itemId);
  if (!item) throw new Error("Matched item not found.");
  return { ok: true, text: buildDraftText(normalizeLead(item), state, templateType || "shortDirect") };
}

async function openOutreach(itemId, templateType) {
  const state = await chrome.storage.local.get(null);
  if (state.scanMode === "scanOnly" || state.scanMode === "research") {
    throw new Error("Outreach is disabled in the current scan mode.");
  }

  const { item } = findItem(state, itemId);
  if (!item) throw new Error("Matched item not found.");
  const lead = normalizeLead(item);
  const draft = buildDraftText(lead, state, templateType || "shortDirect");
  const now = new Date().toISOString();

  if (lead.platformId === "reddit") {
    if (!lead.authorName || lead.authorName === "Unknown member") throw new Error("No Reddit username was detected for this lead.");
    const wait = getCooldown(state, item);
    if (wait.remainingMs > 0) {
      await chrome.storage.local.set({ status: `Wait ${formatMs(wait.remainingMs)} before next draft` });
      return { ok: false, cooldown: true, remainingMs: wait.remainingMs, error: `Please wait ${formatMs(wait.remainingMs)} before opening another draft.` };
    }
    const url = "https://www.reddit.com/message/compose/?" + new URLSearchParams({ to: lead.authorName, message: draft }).toString();
    await chrome.tabs.create({ url, active: true });
    item.requiredGapMs = wait.nextGapMs;
    item.dmDraftOpenedAt = now;
  } else {
    const targetUrl = lead.authorProfileUrl || lead.sourceUrl;
    if (targetUrl) await chrome.tabs.create({ url: targetUrl, active: true });
  }

  item.status = "Draft Opened";
  item.updatedAt = now;
  item.outreachDraft = draft;
  const logs = state.logs || [];
  logs.unshift({ ...normalizeLead(item), action: "Manual outreach page opened", actionAt: now });

  await chrome.storage.local.set({
    matchedQueue: state.matchedQueue,
    logs: logs.slice(0, 2000),
    dmDraftsOpened: Number(state.dmDraftsOpened || 0) + 1,
    lastDraftOpenedAt: lead.platformId === "reddit" ? Date.now() : Number(state.lastDraftOpenedAt || 0),
    status: lead.platformId === "reddit" ? `Opened Reddit manual DM draft for ${lead.authorName}` : "Copied draft and opened outreach page"
  });
  return { ok: true, draft, opened: true };
}

async function logOutreach(itemId) {
  const state = await chrome.storage.local.get(null);
  const { item } = findItem(state, itemId);
  if (!item) throw new Error("Matched item not found.");
  const now = new Date().toISOString();
  item.status = "Contacted Manually";
  item.updatedAt = now;
  item.outreachDraft = item.outreachDraft || buildDraftText(normalizeLead(item), state, "shortDirect");
  const logs = state.logs || [];
  logs.unshift({ ...normalizeLead(item), action: "Contacted manually", actionAt: now });
  await chrome.storage.local.set({
    matchedQueue: state.matchedQueue,
    logs: logs.slice(0, 2000),
    commentsLogged: Number(state.commentsLogged || 0) + 1,
    status: `Logged manual outreach for ${item.authorName || item.username || "lead"}`
  });
  return { ok: true };
}

async function updateLead(itemId, patch) {
  const state = await chrome.storage.local.get(["matchedQueue", "logs"]);
  const { item } = findItem(state, itemId);
  if (!item) throw new Error("Matched item not found.");
  const allowed = ["status", "notes", "note", "followUpDate", "followUpAt"];
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    if (key === "note") item.notes = patch[key];
    else if (key === "followUpAt") item.followUpDate = patch[key];
    else item[key] = patch[key];
  }
  if (!STATUSES.includes(item.status)) item.status = "Reviewed";
  item.updatedAt = new Date().toISOString();
  const logs = state.logs || [];
  logs.unshift({ ...normalizeLead(item), action: `Lead updated: ${item.status}`, actionAt: item.updatedAt });
  await chrome.storage.local.set({
    matchedQueue: state.matchedQueue,
    logs: logs.slice(0, 2000),
    status: "Lead updated"
  });
  return { ok: true };
}

async function prepareCsvExport() {
  const state = await chrome.storage.local.get(null);
  const leads = (state.matchedQueue || []).map(normalizeLead);
  const logs = (state.logs || []).map(normalizeLead);
  const rows = [
    ...logs.map(row => ({ ...row, rowType: "log" })),
    ...leads.map(row => ({ ...row, rowType: "lead" }))
  ];
  const headers = [
    "rowType",
    "id",
    "platform",
    "communityName",
    "authorName",
    "authorProfileUrl",
    "sourceUrl",
    "postSnippet",
    "matchedKeywords",
    "negativeSignals",
    "leadScore",
    "leadTemperature",
    "status",
    "notes",
    "followUpDate",
    "scanMode",
    "createdAt",
    "updatedAt",
    "outreachDraft",
    "followUpDraft"
  ];
  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(header => csvCell(Array.isArray(row[header]) ? row[header].join(" | ") : row[header] || "")).join(","))
  ].join("\n");
  await chrome.storage.local.set({
    csvExports: Number(state.csvExports || 0) + 1,
    status: "CSV export prepared"
  });
  return { ok: true, csv, filename: `community-leads-${new Date().toISOString().slice(0, 10)}.csv` };
}

function findItem(state, itemId) {
  const matchedQueue = Array.isArray(state.matchedQueue) ? state.matchedQueue : [];
  const index = matchedQueue.findIndex(item => item.id === itemId);
  return { item: index >= 0 ? matchedQueue[index] : null, index };
}

function getCooldown(state, item) {
  const now = Date.now();
  const minGapMs = Math.max(5, Number(state.minGapSec || 30)) * 1000;
  const maxGapMs = Math.max(minGapMs, Number(state.maxGapSec || 40) * 1000);
  const variableGapMs = item.requiredGapMs || randomInt(minGapMs, maxGapMs);
  const lastDraftOpenedAt = Number(state.lastDraftOpenedAt || 0);
  const remainingMs = lastDraftOpenedAt ? Math.max(0, lastDraftOpenedAt + variableGapMs - now) : 0;
  return { remainingMs, nextGapMs: randomInt(minGapMs, maxGapMs) };
}

function buildDraftText(lead, state, templateType) {
  const templates = state.templates || DEFAULTS.templates;
  const key = templateType === "followUp" ? "followUp1" : templateType;
  const template = templates[key] || templates.shortDirect || DEFAULTS.templates.shortDirect;
  return fillTemplate(template, lead, state);
}

function fillTemplate(template, lead, state) {
  const kb = { ...DEFAULTS.knowledgeBase, ...(state.knowledgeBase || {}) };
  const values = {
    author: lead.authorName || "",
    username: lead.authorName || "",
    platform: lead.platform || "",
    community: lead.communityName || "",
    source_community: lead.communityName || "",
    post_snippet: lead.postSnippet || "",
    matched_keywords: (lead.matchedKeywords || []).join(", "),
    my_service: kb.myService || "",
    offer: kb.offer || "",
    cta: kb.cta || "",
    proof: kb.proof || "",
    ideal_customer_profile: kb.idealCustomerProfile || "",
    tone: kb.tone || "",
    lead_score: String(lead.leadScore || ""),
    lead_tier: lead.leadTemperature || "",
    lead_temperature: lead.leadTemperature || "",
    intent_summary: lead.intentSummary || ""
  };
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), String(template || ""));
}

function normalizeLead(item) {
  return {
    id: item.id || "",
    platform: item.platform || "",
    platformId: item.platformId || "",
    communityName: item.communityName || item.sourceCommunity || "",
    authorName: item.authorName || item.username || "Unknown member",
    authorProfileUrl: item.authorProfileUrl || "",
    sourceUrl: item.sourceUrl || item.postUrl || item.pageUrl || "",
    postText: item.postText || item.postSnippet || "",
    postSnippet: item.postSnippet || "",
    matchedKeywords: item.matchedKeywords || [],
    negativeSignals: item.negativeSignals || [],
    leadScore: Number(item.leadScore || 0),
    leadTemperature: item.leadTemperature || item.leadTier || "Review",
    status: item.status || "New",
    notes: item.notes || item.note || "",
    followUpDate: item.followUpDate || item.followUpAt || "",
    createdAt: item.createdAt || item.foundAt || "",
    updatedAt: item.updatedAt || "",
    outreachDraft: item.outreachDraft || "",
    followUpDraft: item.followUpDraft || "",
    scanMode: item.scanMode || "",
    intentSummary: item.intentSummary || "",
    action: item.action || "",
    actionAt: item.actionAt || ""
  };
}

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatMs(ms) {
  const sec = Math.ceil(ms / 1000);
  return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
}
