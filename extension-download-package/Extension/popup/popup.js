const $ = id => document.getElementById(id);
const els = {
  workspaceName: $("workspaceName"), syncPill: $("syncPill"), loggedOut: $("loggedOut"), unsupported: $("unsupported"), app: $("app"),
  apiBaseUrl: $("apiBaseUrl"), email: $("email"), password: $("password"), passwordLoginBtn: $("passwordLoginBtn"), googleLoginBtn: $("googleLoginBtn"),
  websiteSessionBtn: $("websiteSessionBtn"), platformName: $("platformName"), communityName: $("communityName"),
  campaignName: $("campaignName"), modePill: $("modePill"), reviewMode: $("reviewMode"), scanOnlyMode: $("scanOnlyMode"), startBtn: $("startBtn"),
  scanVisibleBtn: $("scanVisibleBtn"), stopBtn: $("stopBtn"), runStatus: $("runStatus"), activity: $("activity"), progressBar: $("progressBar"),
  scanned: $("scanned"), leadsFound: $("leadsFound"), hotLeads: $("hotLeads"), savedToday: $("savedToday"), reviewQueueCount: $("reviewQueueCount"), leadList: $("leadList"),
  syncBtn: $("syncBtn"), openDashboard: $("openDashboard"), openReviewQueue: $("openReviewQueue"), openSettings: $("openSettings"), exportCsv: $("exportCsv"), toast: $("toast"),
  drawer: $("drawer"), closeDrawer: $("closeDrawer"), drawerAuthor: $("drawerAuthor"), drawerMeta: $("drawerMeta"), drawerSnippet: $("drawerSnippet"),
  drawerDraft: $("drawerDraft"), copyDrawer: $("copyDrawer"), sourceDrawer: $("sourceDrawer"), outreachDrawer: $("outreachDrawer"), contactedDrawer: $("contactedDrawer"),
  openDashboardLoggedOut: $("openDashboardLoggedOut"), openDashboardUnsupported: $("openDashboardUnsupported"), healthText: $("healthText")
};
let mode = "review_leads";
let selectedLead = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bind();
  await hydrateApiBaseUrl();
  await refresh();
  await detectPage();
  chrome.storage.onChanged.addListener(() => refresh());
}

function bind() {
  els.passwordLoginBtn.onclick = loginWithPassword;
  els.googleLoginBtn.onclick = openGoogleLogin;
  els.websiteSessionBtn.onclick = connectWebsiteSession;
  els.reviewMode.onclick = () => setMode("review_leads");
  els.scanOnlyMode.onclick = () => setMode("scan_only");
  els.startBtn.onclick = () => chrome.runtime.sendMessage({ type: "START_SCAN", mode });
  els.scanVisibleBtn.onclick = () => chrome.runtime.sendMessage({ type: "SCAN_VISIBLE", mode });
  els.stopBtn.onclick = () => chrome.runtime.sendMessage({ type: "STOP_SCAN" });
  els.syncBtn.onclick = async () => { await chrome.runtime.sendMessage({ type: "SYNC_NOW" }); await chrome.runtime.sendMessage({ type: "REFRESH_QUEUE_BADGE" }); toast("Sync attempted"); };
  els.openDashboard.onclick = () => chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD", path: "/dashboard" });
  els.openReviewQueue.onclick = () => chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD", path: "/review-queue" });
  els.openDashboardLoggedOut.onclick = () => chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD", path: "/login" });
  els.openDashboardUnsupported.onclick = () => chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD", path: "/dashboard" });
  els.openSettings.onclick = () => chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD", path: "/campaigns" });
  els.exportCsv.onclick = () => chrome.runtime.sendMessage({ type: "EXPORT_LOCAL_CSV" });
  els.closeDrawer.onclick = () => els.drawer.classList.add("hidden");
  els.copyDrawer.onclick = copySelectedDraft;
  els.sourceDrawer.onclick = () => selectedLead?.sourceUrl && chrome.tabs.create({ url: selectedLead.sourceUrl });
  els.outreachDrawer.onclick = openSelectedOutreach;
  els.contactedDrawer.onclick = markSelectedContacted;
}

async function loginWithPassword() {
  const email = els.email.value.trim();
  const password = els.password.value;
  const apiBaseUrl = els.apiBaseUrl.value.trim() || "https://communityleadassistant.com";
  if (!email || !password) return toast("Enter email and password");
  const response = await chrome.runtime.sendMessage({ type: "LOGIN_WITH_PASSWORD", email, password, apiBaseUrl });
  if (!response?.ok) return toast(response?.error || "Login failed");
  toast("Connected to workspace");
  await refresh();
}

async function connectWebsiteSession() {
  const apiBaseUrl = els.apiBaseUrl.value.trim() || "https://communityleadassistant.com";
  const response = await chrome.runtime.sendMessage({ type: "CONNECT_WEBSITE_SESSION", apiBaseUrl });
  if (!response?.ok) return toast(response?.error || "Could not open website connect");
  toast("Website connect page opened");
  await refresh();
}

async function openGoogleLogin() {
  const apiBaseUrl = els.apiBaseUrl.value.trim() || "https://communityleadassistant.com";
  await chrome.runtime.sendMessage({ type: "OPEN_GOOGLE_LOGIN", apiBaseUrl });
  toast("Google login opened");
}

async function hydrateApiBaseUrl() {
  const suggested = await suggestedAppOrigin();
  if (!suggested) return;
  const state = await chrome.storage.local.get(["apiBaseUrl"]);
  const current = String(state.apiBaseUrl || "");
  if (!current || current === "https://communityleadassistant.com" || current.includes("localhost") || current.includes("127.0.0.1")) {
    await chrome.storage.local.set({ apiBaseUrl: suggested });
    els.apiBaseUrl.value = suggested;
  }
}

async function suggestedAppOrigin() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return "";
  try {
    const url = new URL(tab.url);
    const host = url.hostname.toLowerCase();
    const isApp =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "communityleadassistant.com" ||
      host === "www.communityleadassistant.com" ||
      host.endsWith(".vercel.app");
    return isApp ? url.origin : "";
  } catch {
    return "";
  }
}

async function detectPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_STATUS" }).catch(() => {});
  await chrome.runtime.sendMessage({ type: "ENSURE_CONTENT", tabId: tab.id }).catch(() => {});
  await chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_STATUS" }).catch(() => {});
  await refresh();
}

async function refresh() {
  const state = await chrome.storage.local.get(null);
  const loggedIn = Boolean(state.extensionToken);
  els.apiBaseUrl.value = state.apiBaseUrl || "https://communityleadassistant.com";
  els.loggedOut.classList.toggle("hidden", loggedIn);
  els.app.classList.toggle("hidden", !loggedIn);
  els.workspaceName.textContent = state.workspace?.name || "Local workspace";
  syncState(state.syncStatus || "offline");
  const platform = state.platformStatus;
  els.unsupported.classList.toggle("hidden", !loggedIn || platform?.supported);
  if (loggedIn && !platform?.supported) els.app.classList.add("hidden");
  if (platform?.supported) {
    els.platformName.textContent = platform.platform;
    els.communityName.textContent = platform.communityName || "Detected community";
  } else {
    els.platformName.textContent = "Unsupported";
    els.communityName.textContent = "Open a supported community";
  }
  els.campaignName.textContent = state.campaign?.name || "Local scan";
  const progress = state.progress || {};
  els.runStatus.textContent = progress.running ? "Running" : "Idle";
  els.runStatus.classList.toggle("muted", !progress.running);
  els.activity.textContent = progress.activity || "Waiting";
  els.healthText.textContent = state.lastError ? "Needs attention" : "Healthy";
  const pct = progress.total ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;
  els.progressBar.style.width = `${pct}%`;
  const stats = state.stats || {};
  els.scanned.textContent = stats.scanned || 0;
  els.leadsFound.textContent = stats.leadsFound || 0;
  els.hotLeads.textContent = stats.hotLeads || 0;
  els.savedToday.textContent = stats.savedToday || 0;
  els.reviewQueueCount.textContent = state.reviewQueueCount || 0;
  renderLeads(state.recentLeads || [], state.scanMode || mode);
}

function setMode(nextMode) {
  mode = nextMode;
  els.reviewMode.classList.toggle("active", mode === "review_leads");
  els.scanOnlyMode.classList.toggle("active", mode === "scan_only");
  els.modePill.textContent = mode === "scan_only" ? "Scan Only" : "Review";
  els.modePill.classList.toggle("warn", mode === "scan_only");
  chrome.storage.local.set({ scanMode: mode });
}

function renderLeads(leads, currentMode) {
  els.leadList.innerHTML = "";
  if (!leads.length) {
    els.leadList.innerHTML = `<div class="lead"><p>No leads yet. Start with Scan Visible on a supported community page.</p></div>`;
    return;
  }
  leads.slice(0, 5).forEach(lead => {
    const row = document.createElement("div");
    row.className = "lead";
    const chips = (lead.matchedKeywords || []).slice(0, 3).map(signal => `<span class="chip">${escapeHtml(signal)}</span>`).join("");
    const scoreClass = lead.leadTemperature === "Hot" ? "score hot" : "score";
    row.innerHTML = `
      <div class="lead-top"><strong>${escapeHtml(lead.authorName || "Unknown")}</strong><span class="${scoreClass}">${escapeHtml(lead.leadTemperature)} ${lead.leadScore}</span></div>
      <p>${escapeHtml(lead.postSnippet || "")}</p>
      <div class="chips">${chips}</div>
      <div class="lead-actions">
        <button class="secondary" data-view>View</button>
        <button class="secondary" data-source>Source</button>
        ${currentMode === "scan_only" ? "" : "<button data-copy>Copy Draft</button>"}
      </div>`;
    row.querySelector("[data-view]").onclick = () => openDrawer(lead, currentMode);
    row.querySelector("[data-source]").onclick = () => lead.sourceUrl && chrome.tabs.create({ url: lead.sourceUrl });
    row.querySelector("[data-copy]")?.addEventListener("click", () => copyLeadDraft(lead));
    els.leadList.appendChild(row);
  });
}

function openDrawer(lead, currentMode) {
  selectedLead = lead;
  els.drawerAuthor.textContent = lead.authorName || "Lead";
  els.drawerMeta.textContent = `${lead.platform} / ${lead.communityName} / ${lead.leadTemperature} ${lead.leadScore}`;
  els.drawerSnippet.textContent = lead.postSnippet || "";
  els.drawerDraft.textContent = lead.outreachDraft || "";
  els.copyDrawer.style.display = currentMode === "scan_only" ? "none" : "";
  els.outreachDrawer.style.display = currentMode === "scan_only" ? "none" : "";
  els.contactedDrawer.style.display = currentMode === "scan_only" ? "none" : "";
  els.drawer.classList.remove("hidden");
}

async function copyLeadDraft(lead) {
  await navigator.clipboard.writeText(lead.outreachDraft || "");
  await chrome.runtime.sendMessage({ type: "COPY_DRAFT", leadId: lead.id });
  toast("Draft copied. Review before sending.");
}

async function copySelectedDraft() {
  if (!selectedLead) return;
  await copyLeadDraft(selectedLead);
}

async function openSelectedOutreach() {
  if (!selectedLead) return;
  if (!confirm("Open manual outreach? Review the draft and send manually.")) return;
  await navigator.clipboard.writeText(selectedLead.outreachDraft || "");
  const response = await chrome.runtime.sendMessage({ type: "OPEN_OUTREACH", leadId: selectedLead.id });
  if (!response?.ok) return toast(response?.error || "Could not open outreach");
  toast("Manual outreach opened");
}

async function markSelectedContacted() {
  if (!selectedLead) return;
  await chrome.runtime.sendMessage({ type: "MARK_CONTACTED", leadId: selectedLead.id });
  toast("Marked contacted manually");
  els.drawer.classList.add("hidden");
}

function syncState(status) {
  const label = status === "synced" ? "Synced" : status === "syncing" ? "Syncing" : status === "failed" ? "Retry" : "Local";
  els.syncPill.textContent = label;
  els.syncPill.className = `pill ${status === "synced" ? "" : status === "failed" ? "warn" : "muted"}`;
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  setTimeout(() => els.toast.classList.add("hidden"), 2400);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}
