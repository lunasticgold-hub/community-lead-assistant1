const VERSION = "2.0.0";
const ADAPTER_FILES = [
  "adapters/reddit.js",
  "adapters/indiehackers.js",
  "adapters/facebook.js",
  "adapters/slack.js",
  "adapters/discord.js",
  "adapters/telegram.js",
  "adapters/whatsapp.js",
  "adapters/linkedin.js",
  "adapters/producthunt.js",
  "adapters/twitter.js",
  "content.js"
];
const SUPPORTED_HOSTS = [
  /(^|\.)reddit\.com$/i,
  /(^|\.)indiehackers\.com$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)slack\.com$/i,
  /^discord\.com$/i,
  /(^|\.)discord\.com$/i,
  /^web\.telegram\.org$/i,
  /^web\.whatsapp\.com$/i,
  /(^|\.)linkedin\.com$/i,
  /(^|\.)producthunt\.com$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)twitter\.com$/i
];
const PLATFORM_RULES = [
  { id: "reddit", name: "Reddit", test: url => /reddit\.com$/i.test(url.hostname) && /\/r\//i.test(url.pathname), community: url => url.pathname.match(/\/r\/([^/]+)/i)?.[1] || "Reddit" },
  { id: "indiehackers", name: "Indie Hackers", test: url => /indiehackers\.com$/i.test(url.hostname), community: () => "Indie Hackers" },
  { id: "facebook", name: "Facebook Groups", test: url => /facebook\.com$/i.test(url.hostname) && /\/groups\//i.test(url.pathname), community: () => "Facebook group" },
  { id: "slack", name: "Slack", test: url => /\.slack\.com$/i.test(url.hostname), community: url => url.hostname.split(".")[0] || "Slack" },
  { id: "discord", name: "Discord", test: url => /discord\.com$/i.test(url.hostname), community: () => "Discord" },
  { id: "telegram", name: "Telegram", test: url => /^web\.telegram\.org$/i.test(url.hostname), community: () => "Telegram" },
  { id: "whatsapp", name: "WhatsApp", test: url => /^web\.whatsapp\.com$/i.test(url.hostname), community: () => "WhatsApp" },
  { id: "linkedin", name: "LinkedIn", test: url => /linkedin\.com$/i.test(url.hostname), community: url => url.pathname.match(/\/groups\/([^/]+)/i)?.[1] ? `LinkedIn group ${url.pathname.match(/\/groups\/([^/]+)/i)?.[1]}` : "LinkedIn" },
  { id: "producthunt", name: "Product Hunt", test: url => /producthunt\.com$/i.test(url.hostname), community: () => "Product Hunt" },
  { id: "x", name: "X (Twitter)", test: url => /(^|\.)x\.com$/i.test(url.hostname) || /(^|\.)twitter\.com$/i.test(url.hostname), community: url => url.pathname.startsWith("/search") ? "X Search" : "X" }
];
const DEFAULTS = {
  apiBaseUrl: "https://communityleadassistant.com",
  extensionToken: "",
  workspace: null,
  campaign: null,
  knowledgeBase: null,
  keywordGroups: [],
  templateSet: null,
  reviewQueueCount: 0,
  scanMode: "review_leads",
  syncStatus: "offline",
  platformStatus: null,
  running: false,
  progress: { current: 0, total: 0, activity: "Idle" },
  stats: { scanned: 0, leadsFound: 0, hotLeads: 0, savedToday: 0, draftsOpened: 0, exports: 0 },
  recentLeads: [],
  syncQueue: [],
  logs: [],
  lastError: ""
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const patch = {};
  for (const [key, value] of Object.entries(DEFAULTS)) if (existing[key] === undefined) patch[key] = value;
  if (Object.keys(patch).length) await chrome.storage.local.set(patch);
  chrome.action.setBadgeBackgroundColor({ color: "#2563eb" }).catch(() => {});
  await refreshReviewQueueBadge().catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(async error => {
    const text = error.message || String(error);
    await logEvent("extension_error", { error: text });
    await chrome.storage.local.set({ lastError: text, syncStatus: "failed" });
    sendResponse({ ok: false, error: text });
  });
  return true;
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  handleExternalMessage(message, sender).then(sendResponse).catch(async error => {
    sendResponse({ ok: false, error: error.message || String(error) });
  });
  return true;
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case "LOGIN_WITH_PASSWORD": return loginWithPassword(message.email, message.password, message.apiBaseUrl);
    case "LOGIN_WITH_TOKEN": return loginWithToken(message.token, message.apiBaseUrl);
    case "CONNECT_WEBSITE_SESSION": return connectWebsiteSession(message.apiBaseUrl);
    case "OPEN_GOOGLE_LOGIN": return openGoogleLogin(message.apiBaseUrl);
    case "LOGOUT": return logout();
    case "BOOTSTRAP": return bootstrap();
    case "GET_ACTIVE_TAB_STATUS": return getActiveTabStatus();
    case "ENSURE_CONTENT": return ensureContent(message.tabId);
    case "START_SCAN": return sendToActiveTab({ type: "START_SCAN", mode: message.mode });
    case "STOP_SCAN": return sendToActiveTab({ type: "STOP_SCAN" });
    case "SCAN_VISIBLE": return scanVisibleCommand(message.mode);
    case "PLATFORM_STATUS": return updatePlatformStatus(message.status);
    case "SCAN_PROGRESS": return updateProgress(message.progress);
    case "SCAN_CYCLE_COMPLETE": return scanCycleComplete(message.summary || {});
    case "SCAN_EVENT": return logEvent(message.eventType || "scan_event", message.metadata || {});
    case "LEAD_FOUND": return leadFound(message.lead);
    case "ADD_PROFILE_TO_SEQUENCE": return addProfileToSequence(message.profile || {});
    case "REFRESH_QUEUE_BADGE": return refreshReviewQueueBadge();
    case "SYNC_NOW": return syncQueued();
    case "COPY_DRAFT": return getDraft(message.leadId, message.templateKey || "shortDirect");
    case "OPEN_OUTREACH": return openOutreach(message.leadId);
    case "MARK_CONTACTED": return updateLeadStatus(message.leadId, "Contacted Manually");
    case "OPEN_DASHBOARD": return openDashboard(message.path || "/dashboard");
    case "EXPORT_LOCAL_CSV": return exportLocalCsv();
    case "CLEAR_LOCAL": await chrome.storage.local.set({ recentLeads: [], syncQueue: [], logs: [], stats: DEFAULTS.stats }); return { ok: true };
    default: return { ok: false, error: "Unknown message type" };
  }
}

async function handleExternalMessage(message, sender) {
  if (message?.type !== "CLA_EXTENSION_SESSION") return { ok: false, error: "Unknown external message" };
  const base = appOriginFromUrl(sender?.url || "");
  if (!base) return { ok: false, error: "Unsupported website origin" };
  if (!message.payload?.token) return { ok: false, error: "Missing extension session" };
  await applyExtensionSession(message.payload, base);
  await logEvent("extension_login", { method: "website_bridge" });
  return { ok: true };
}

async function loginWithToken(token, apiBaseUrl) {
  const base = (apiBaseUrl || DEFAULTS.apiBaseUrl).replace(/\/$/, "");
  const response = await fetch(`${base}/api/extension/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token })
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Token login failed");
  await chrome.storage.local.set({ extensionToken: token, apiBaseUrl: base, syncStatus: "syncing" });
  await bootstrap();
  await logEvent("extension_login", {});
  return { ok: true };
}

async function loginWithPassword(email, password, apiBaseUrl) {
  const base = (apiBaseUrl || DEFAULTS.apiBaseUrl).replace(/\/$/, "");
  const response = await fetch(`${base}/api/extension/auth/password`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || "Extension login failed");
  await applyExtensionSession(data, base);
  await logEvent("extension_login", { method: "password" });
  return { ok: true };
}

async function connectWebsiteSession(apiBaseUrl) {
  const base = (apiBaseUrl || DEFAULTS.apiBaseUrl).replace(/\/$/, "");
  await chrome.storage.local.set({ apiBaseUrl: base, syncStatus: "syncing" });
  const connectUrl = `${base}/extension/connect?${new URLSearchParams({ extensionId: chrome.runtime.id })}`;
  await chrome.tabs.create({ url: connectUrl });
  return { ok: true, opened: true };
}

async function applyExtensionSession(data, base) {
  await chrome.storage.local.set({
    extensionToken: data.token,
    apiBaseUrl: base,
    workspace: data.workspace || null,
    campaign: data.campaign || null,
    knowledgeBase: data.knowledgeBase || null,
    keywordGroups: data.keywordGroups || [],
    templateSet: data.templateSet || null,
    reviewQueueCount: Number(data.reviewQueueCount || 0),
    syncStatus: "synced",
    lastError: ""
  });
  await updateBadge(Number(data.reviewQueueCount || 0));
}

async function openGoogleLogin(apiBaseUrl) {
  const base = (apiBaseUrl || DEFAULTS.apiBaseUrl).replace(/\/$/, "");
  await chrome.storage.local.set({ apiBaseUrl: base });
  const next = `/extension/connect?${new URLSearchParams({ extensionId: chrome.runtime.id })}`;
  await chrome.tabs.create({ url: `${base}/login?${new URLSearchParams({ next })}` });
  return { ok: true };
}

async function logout() {
  await chrome.storage.local.set({ extensionToken: "", workspace: null, campaign: null, reviewQueueCount: 0, syncStatus: "offline" });
  await updateBadge(0);
  return { ok: true };
}

async function bootstrap() {
  const state = await chrome.storage.local.get(["apiBaseUrl", "extensionToken"]);
  if (!state.extensionToken) return { ok: false, error: "Missing extension token" };
  const response = await fetch(`${state.apiBaseUrl}/api/extension/bootstrap`, {
    headers: { authorization: `Bearer ${state.extensionToken}` }
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Could not load workspace settings");
  await chrome.storage.local.set({
    workspace: data.workspace,
    campaign: data.campaign,
    knowledgeBase: data.knowledgeBase,
    keywordGroups: data.keywordGroups || [],
    templateSet: data.templateSet,
    reviewQueueCount: Number(data.reviewQueueCount || 0),
    syncStatus: "synced",
    lastError: ""
  });
  await updateBadge(Number(data.reviewQueueCount || 0));
  return { ok: true, data };
}

async function ensureContent(tabId) {
  if (!tabId) throw new Error("No active tab found");
  const tab = await chrome.tabs.get(tabId);
  const inferred = inferPlatformStatus(tab?.url || "");
  await chrome.storage.local.set({ platformStatus: inferred });
  if (!inferred.supported) {
    await chrome.storage.local.set({
      running: false,
      progress: { current: 0, total: 0, activity: "Unsupported platform" }
    });
    return { ok: false, unsupported: true, error: "This platform is currently unsupported." };
  }
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "PING" });
    if (response?.status) await chrome.storage.local.set({ platformStatus: response.status });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ADAPTER_FILES
    });
    const response = await chrome.tabs.sendMessage(tabId, { type: "DETECT_PLATFORM" }).catch(() => null);
    if (response?.status) await chrome.storage.local.set({ platformStatus: response.status });
  }
  return { ok: true };
}

async function getActiveTabStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const status = inferPlatformStatus(tab?.url || "");
  await chrome.storage.local.set({
    platformStatus: status,
    progress: status.supported ? DEFAULTS.progress : { current: 0, total: 0, activity: "Unsupported platform" }
  });
  return { ok: true, status, tabId: tab?.id || null };
}

async function sendToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Open a supported community page first");
  const ensured = await ensureContent(tab.id);
  if (!ensured.ok) return ensured;
  const response = await chrome.tabs.sendMessage(tab.id, message);
  return response || { ok: true };
}

function isSupportedUrl(value) {
  return inferPlatformStatus(value).supported;
}

function inferPlatformStatus(value) {
  try {
    const url = new URL(value);
    const rule = PLATFORM_RULES.find(item => item.test(url));
    if (!rule) return { supported: false, platform: "", platformId: "", communityName: "", communityUrl: "", sourceUrl: value || "" };
    return {
      supported: true,
      platform: rule.name,
      platformId: rule.id,
      communityName: rule.community(url),
      communityUrl: platformCommunityUrl(rule.id, url),
      sourceUrl: url.href
    };
  } catch {
    return { supported: false, platform: "", platformId: "", communityName: "", communityUrl: "", sourceUrl: value || "" };
  }
}

function platformCommunityUrl(platformId, url) {
  if (platformId === "reddit") {
    const community = url.pathname.match(/\/r\/([^/]+)/i)?.[1];
    return community ? `${url.origin}/r/${community}/` : url.origin;
  }
  if (platformId === "linkedin") {
    const group = url.pathname.match(/\/groups\/([^/]+)/i)?.[1];
    return group ? `${url.origin}/groups/${group}/` : url.origin;
  }
  if (platformId === "facebook") {
    const group = url.pathname.match(/\/groups\/([^/]+)/i)?.[1];
    return group ? `${url.origin}/groups/${group}/` : url.origin;
  }
  return url.origin;
}

function appOriginFromUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const allowed =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "communityleadassistant.com" ||
      host === "www.communityleadassistant.com" ||
      host.endsWith(".vercel.app");
    return allowed ? url.origin : "";
  } catch {
    return "";
  }
}

async function updatePlatformStatus(status) {
  await chrome.storage.local.set({ platformStatus: status });
  return { ok: true };
}

async function updateProgress(progress) {
  await chrome.storage.local.set({ progress, running: progress.running });
  return { ok: true };
}

async function scanVisibleCommand(mode) {
  const result = await sendToActiveTab({ type: "SCAN_VISIBLE", mode });
  if (result?.ok) await scanCycleComplete(result);
  return result;
}

async function scanCycleComplete(summary) {
  const state = await chrome.storage.local.get(["stats"]);
  const stats = state.stats || DEFAULTS.stats;
  stats.scanned += Number(summary.scanned || 0);
  await chrome.storage.local.set({ stats });
  return { ok: true };
}

async function leadFound(lead) {
  const state = await chrome.storage.local.get(["recentLeads", "stats", "syncQueue", "scanMode"]);
  const existing = state.recentLeads || [];
  if (existing.some(item => item.duplicateKey === lead.duplicateKey)) return { ok: true, duplicate: true };
  const recentLeads = [{ ...lead, synced: false }, ...existing].slice(0, 100);
  const stats = state.stats || DEFAULTS.stats;
  stats.leadsFound += 1;
  stats.savedToday += 1;
  if (lead.leadTemperature === "Hot") stats.hotLeads += 1;
  const syncQueue = [...(state.syncQueue || []), { type: "lead", payload: lead, id: lead.id }];
  await chrome.storage.local.set({ recentLeads, stats, syncQueue });
  await logEvent("lead_found", { platform: lead.platform, score: lead.leadScore });
  await syncQueued();
  return { ok: true };
}

async function addProfileToSequence(profile) {
  const state = await chrome.storage.local.get(["apiBaseUrl", "extensionToken", "workspace"]);
  if (!state.extensionToken) throw new Error("Log in before adding profiles to a sequence");
  const response = await fetch(`${state.apiBaseUrl}/api/extension/outreach/enroll`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${state.extensionToken}` },
    body: JSON.stringify({ profile })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || "Could not add profile to sequence");
  await logEvent("profile_added_to_sequence", { platform: profile.platform, authorName: profile.authorName, sourceUrl: profile.sourceUrl });
  await refreshReviewQueueBadge();
  return { ok: true, data };
}

async function refreshReviewQueueBadge() {
  const state = await chrome.storage.local.get(["apiBaseUrl", "extensionToken"]);
  if (!state.extensionToken) {
    await updateBadge(0);
    return { ok: true, count: 0 };
  }
  const response = await fetch(`${state.apiBaseUrl}/api/extension/outreach/count`, {
    headers: { authorization: `Bearer ${state.extensionToken}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || "Could not refresh review queue badge");
  const count = Number(data.count || 0);
  await chrome.storage.local.set({ reviewQueueCount: count });
  await updateBadge(count);
  return { ok: true, count };
}

async function updateBadge(count) {
  const text = count > 99 ? "99+" : count > 0 ? String(count) : "";
  await chrome.action.setBadgeText({ text }).catch(() => {});
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" }).catch(() => {});
}

async function syncQueued() {
  const state = await chrome.storage.local.get(["apiBaseUrl", "extensionToken", "syncQueue", "recentLeads"]);
  if (!state.extensionToken || !state.syncQueue?.length) {
    await chrome.storage.local.set({ syncStatus: state.extensionToken ? "synced" : "offline" });
    return { ok: true, synced: 0 };
  }
  await chrome.storage.local.set({ syncStatus: "syncing" });
  const leads = state.syncQueue.filter(item => item.type === "lead").map(item => item.payload);
  const events = state.syncQueue.filter(item => item.type === "event").map(item => item.payload);
  try {
    if (leads.length) {
      const response = await fetch(`${state.apiBaseUrl}/api/extension/leads`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${state.extensionToken}` },
        body: JSON.stringify({ leads })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || "Lead sync failed");
    }
    if (events.length) {
      const response = await fetch(`${state.apiBaseUrl}/api/extension/events`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${state.extensionToken}` },
        body: JSON.stringify({ events })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || "Event sync failed");
    }
    const syncedIds = new Set(leads.map(lead => lead.id));
    await chrome.storage.local.set({
      syncQueue: [],
      syncStatus: "synced",
      recentLeads: (state.recentLeads || []).map(lead => syncedIds.has(lead.id) ? { ...lead, synced: true } : lead)
    });
    return { ok: true, synced: leads.length + events.length };
  } catch (error) {
    await chrome.storage.local.set({ syncStatus: "failed" });
    return { ok: false, error: error.message };
  }
}

async function getDraft(leadId, templateKey) {
  const state = await chrome.storage.local.get(["recentLeads"]);
  const lead = (state.recentLeads || []).find(item => item.id === leadId);
  if (!lead) throw new Error("Lead not found");
  await logEvent("draft_copied", { platform: lead.platform, leadId });
  return { ok: true, draft: lead.drafts?.[templateKey] || lead.outreachDraft || "" };
}

async function openOutreach(leadId) {
  const state = await chrome.storage.local.get(["recentLeads", "stats"]);
  const lead = (state.recentLeads || []).find(item => item.id === leadId);
  if (!lead) throw new Error("Lead not found");
  if (lead.scanMode === "scan_only") throw new Error("Scan Only Mode does not allow outreach actions");
  const draft = lead.outreachDraft || lead.drafts?.shortDirect || "";
  await navigatorWrite(draft);
  if (lead.platform === "reddit" && lead.authorName) {
    await chrome.tabs.create({ url: `https://www.reddit.com/message/compose/?${new URLSearchParams({ to: lead.authorName, message: draft })}` });
  } else {
    await chrome.tabs.create({ url: lead.authorProfileUrl || lead.sourceUrl, active: true });
  }
  const stats = state.stats || DEFAULTS.stats;
  stats.draftsOpened += 1;
  await chrome.storage.local.set({ stats });
  await logEvent("manual_outreach_opened", { platform: lead.platform });
  return { ok: true };
}

async function updateLeadStatus(leadId, status) {
  const state = await chrome.storage.local.get(["recentLeads"]);
  const recentLeads = (state.recentLeads || []).map(lead => lead.id === leadId ? { ...lead, status, updatedAt: new Date().toISOString() } : lead);
  await chrome.storage.local.set({ recentLeads });
  await logEvent("lead_status_updated", { leadId, status });
  return { ok: true };
}

async function openDashboard(path) {
  const state = await chrome.storage.local.get(["apiBaseUrl"]);
  await chrome.tabs.create({ url: `${state.apiBaseUrl || DEFAULTS.apiBaseUrl}${path}` });
  return { ok: true };
}

async function exportLocalCsv() {
  const state = await chrome.storage.local.get(["recentLeads", "stats"]);
  const headers = ["authorName", "platform", "communityName", "leadScore", "leadTemperature", "status", "matchedKeywords", "sourceUrl", "outreachDraft"];
  const csv = [headers.join(","), ...(state.recentLeads || []).map(lead => headers.map(header => csvCell(Array.isArray(lead[header]) ? lead[header].join(" | ") : lead[header] || "")).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  await chrome.downloads.download({ url, filename: `community-leads-local-${new Date().toISOString().slice(0, 10)}.csv`, saveAs: true });
  const stats = state.stats || DEFAULTS.stats;
  stats.exports += 1;
  await chrome.storage.local.set({ stats });
  await logEvent("export_created", {});
  return { ok: true };
}

async function logEvent(eventType, metadata) {
  const state = await chrome.storage.local.get(["logs", "syncQueue", "extensionToken", "platformStatus"]);
  const event = {
    eventType,
    platform: metadata?.platform || state.platformStatus?.platformId || state.platformStatus?.platform || null,
    metadata,
    extensionVersion: VERSION,
    createdAt: new Date().toISOString()
  };
  const patch = { logs: [event, ...(state.logs || [])].slice(0, 200) };
  if (state.extensionToken) {
    patch.syncQueue = [...(state.syncQueue || []), { type: "event", payload: event, id: `${eventType}-${Date.now()}-${Math.random()}` }].slice(-250);
  }
  await chrome.storage.local.set(patch);
  if (state.extensionToken) await syncQueued();
}

async function navigatorWrite(text) {
  await chrome.offscreen?.createDocument?.({ url: "offscreen.html", reasons: ["CLIPBOARD"], justification: "Copy manual outreach draft" }).catch(() => {});
  await navigator.clipboard.writeText(text).catch(() => {});
}

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
