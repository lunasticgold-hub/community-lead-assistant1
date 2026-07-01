const VERSION = "1.0.0";
const DEFAULTS = {
  apiBaseUrl: "https://communityleadassistant.com",
  extensionToken: "",
  workspace: null,
  campaign: null,
  knowledgeBase: null,
  keywordGroups: [],
  templateSet: null,
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

async function handleMessage(message, sender) {
  switch (message.type) {
    case "LOGIN_WITH_TOKEN": return loginWithToken(message.token, message.apiBaseUrl);
    case "LOGOUT": return logout();
    case "BOOTSTRAP": return bootstrap();
    case "ENSURE_CONTENT": return ensureContent(message.tabId);
    case "START_SCAN": return sendToActiveTab({ type: "START_SCAN", mode: message.mode });
    case "STOP_SCAN": return sendToActiveTab({ type: "STOP_SCAN" });
    case "SCAN_VISIBLE": return sendToActiveTab({ type: "SCAN_VISIBLE", mode: message.mode });
    case "PLATFORM_STATUS": return updatePlatformStatus(message.status);
    case "SCAN_PROGRESS": return updateProgress(message.progress);
    case "LEAD_FOUND": return leadFound(message.lead);
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

async function logout() {
  await chrome.storage.local.set({ extensionToken: "", workspace: null, campaign: null, syncStatus: "offline" });
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
    syncStatus: "synced",
    lastError: ""
  });
  return { ok: true, data };
}

async function ensureContent(tabId) {
  if (!tabId) throw new Error("No active tab found");
  try {
    await chrome.tabs.sendMessage(tabId, { type: "PING" });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        "adapters/reddit.js",
        "adapters/indiehackers.js",
        "adapters/facebook.js",
        "adapters/slack.js",
        "adapters/discord.js",
        "adapters/telegram.js",
        "adapters/whatsapp.js",
        "content.js"
      ]
    });
  }
  return { ok: true };
}

async function sendToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Open a supported community page first");
  await ensureContent(tab.id);
  const response = await chrome.tabs.sendMessage(tab.id, message);
  return response || { ok: true };
}

async function updatePlatformStatus(status) {
  await chrome.storage.local.set({ platformStatus: status });
  return { ok: true };
}

async function updateProgress(progress) {
  await chrome.storage.local.set({ progress, running: progress.running });
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

async function syncQueued() {
  const state = await chrome.storage.local.get(["apiBaseUrl", "extensionToken", "syncQueue", "recentLeads"]);
  if (!state.extensionToken || !state.syncQueue?.length) {
    await chrome.storage.local.set({ syncStatus: state.extensionToken ? "synced" : "offline" });
    return { ok: true, synced: 0 };
  }
  await chrome.storage.local.set({ syncStatus: "syncing" });
  const leads = state.syncQueue.filter(item => item.type === "lead").map(item => item.payload);
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
    const syncedIds = new Set(leads.map(lead => lead.id));
    await chrome.storage.local.set({
      syncQueue: [],
      syncStatus: "synced",
      recentLeads: (state.recentLeads || []).map(lead => syncedIds.has(lead.id) ? { ...lead, synced: true } : lead)
    });
    return { ok: true, synced: leads.length };
  } catch (error) {
    await chrome.storage.local.set({ syncStatus: "failed" });
    return { ok: false, error: error.message };
  }
}

async function getDraft(leadId, templateKey) {
  const state = await chrome.storage.local.get(["recentLeads"]);
  const lead = (state.recentLeads || []).find(item => item.id === leadId);
  if (!lead) throw new Error("Lead not found");
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
  const state = await chrome.storage.local.get(["logs", "syncQueue"]);
  const event = { eventType, metadata, extensionVersion: VERSION, createdAt: new Date().toISOString() };
  await chrome.storage.local.set({ logs: [event, ...(state.logs || [])].slice(0, 200) });
}

async function navigatorWrite(text) {
  await chrome.offscreen?.createDocument?.({ url: "offscreen.html", reasons: ["CLIPBOARD"], justification: "Copy manual outreach draft" }).catch(() => {});
  await navigator.clipboard.writeText(text).catch(() => {});
}

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
