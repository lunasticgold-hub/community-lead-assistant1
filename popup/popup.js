const $ = id => document.getElementById(id);

const els = {
  pageStatus: $("pageStatus"),
  dot: $("dot"),
  status: $("status"),
  scanned: $("scanned"),
  found: $("found"),
  drafts: $("drafts"),
  exports: $("exports"),
  error: $("error"),
  scanMode: $("scanMode"),
  start: $("start"),
  stop: $("stop"),
  scan: $("scan"),
  scanOnlyMode: $("scanOnlyMode"),
  testScroll: $("testScroll"),
  reset: $("reset"),
  minGap: $("minGap"),
  maxGap: $("maxGap"),
  itemDelay: $("itemDelay"),
  maxLeads: $("maxLeads"),
  runUntil: $("runUntil"),
  saveRunSettings: $("saveRunSettings"),
  clearSchedule: $("clearSchedule"),
  platformToggles: $("platformToggles"),
  minScore: $("minScore"),
  includeFreelance: $("includeFreelance"),
  leadKeywords: $("leadKeywords"),
  blockedKeywords: $("blockedKeywords"),
  saveQualification: $("saveQualification"),
  companyDescription: $("companyDescription"),
  myService: $("myService"),
  idealCustomerProfile: $("idealCustomerProfile"),
  offer: $("offer"),
  proof: $("proof"),
  cta: $("cta"),
  tone: $("tone"),
  kbBlockedWords: $("kbBlockedWords"),
  saveKb: $("saveKb"),
  tplShortDirect: $("tplShortDirect"),
  tplFriendly: $("tplFriendly"),
  tplService: $("tplService"),
  tplFollow1: $("tplFollow1"),
  tplFollow2: $("tplFollow2"),
  tplFinal: $("tplFinal"),
  saveTemplates: $("saveTemplates"),
  queue: $("queue"),
  logs: $("logs"),
  exportCsv: $("exportCsv")
};

const PLATFORMS = [
  ["reddit", "Reddit"],
  ["indiehackers", "Indie Hackers"],
  ["startupschool", "Startup School"],
  ["microconf", "MicroConf"],
  ["slack", "Slack Web"],
  ["discord", "Discord Web"],
  ["facebook", "Facebook Groups"],
  ["whatsapp", "WhatsApp Web"],
  ["telegram", "Telegram Web"]
];

const SUPPORTED_PAGES = [
  { name: "Reddit community", test: url => /reddit\.com\/r\//i.test(url) },
  { name: "Indie Hackers", test: url => /indiehackers\.com/i.test(url) },
  { name: "Startup School", test: url => /startupschool\.org/i.test(url) },
  { name: "MicroConf Connect", test: url => /microconf\.com|microconfconnect\.com/i.test(url) },
  { name: "Slack workspace", test: url => /\.slack\.com/i.test(url) },
  { name: "Discord", test: url => /discord\.com/i.test(url) },
  { name: "Facebook group", test: url => /facebook\.com\/groups\//i.test(url) },
  { name: "WhatsApp Web", test: url => /web\.whatsapp\.com/i.test(url) },
  { name: "Telegram Web", test: url => /web\.telegram\.org/i.test(url) }
];

const STATUSES = ["New", "Reviewed", "Draft Opened", "Contacted Manually", "Follow-up Due", "Not Relevant", "Converted", "Ignored"];

let formDirty = false;
let lastState = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bind();
  renderPlatformToggles({});
  await refresh(true);
  await checkPage();
}

function bind() {
  els.start.onclick = async () => { await saveRunSettings(false); await sendContent({ type: "START" }); };
  els.stop.onclick = () => sendContent({ type: "STOP" });
  els.scan.onclick = async () => { await saveRunSettings(false); await sendContent({ type: "SCAN_NOW" }); };
  els.scanOnlyMode.onclick = async () => {
    els.scanMode.value = "scanOnly";
    await saveRunSettings(false);
    await sendContent({ type: "SCAN_NOW" });
  };
  els.testScroll.onclick = () => sendContent({ type: "DEBUG_SCROLL" });
  els.reset.onclick = async () => {
    await chrome.runtime.sendMessage({ type: "RESET_SESSION" });
    await refresh(true);
  };
  els.saveRunSettings.onclick = () => saveRunSettings(true);
  els.clearSchedule.onclick = async () => {
    els.runUntil.value = "";
    await saveRunSettings(true);
  };
  els.saveQualification.onclick = saveQualification;
  els.saveKb.onclick = saveKnowledgeBase;
  els.saveTemplates.onclick = saveTemplates;
  els.exportCsv.onclick = exportCsv;

  document.querySelectorAll("input, textarea, select").forEach(input => {
    input.addEventListener("input", () => { formDirty = true; });
    input.addEventListener("change", () => { formDirty = true; });
  });
  chrome.storage.onChanged.addListener(() => refresh(false));
}

async function refresh(forceForms) {
  const state = await chrome.storage.local.get(null);
  lastState = state;
  els.status.textContent = state.status || "Idle";
  els.scanned.textContent = state.scannedCount || 0;
  els.found.textContent = state.foundCount || 0;
  els.drafts.textContent = state.dmDraftsOpened || 0;
  els.exports.textContent = state.csvExports || 0;
  els.error.textContent = state.lastError || "";
  els.dot.classList.toggle("run", String(state.status || "").toLowerCase().includes("running"));

  if (forceForms || !formDirty) fillForms(state);
  renderQueue(state.matchedQueue || [], state.scanMode || "review");
  renderLogs(state.logs || []);
}

function fillForms(state) {
  els.scanMode.value = state.scanMode || "review";
  els.minGap.value = state.minGapSec ?? 30;
  els.maxGap.value = state.maxGapSec ?? 40;
  els.itemDelay.value = state.scanItemDelayMs ?? 350;
  els.maxLeads.value = state.maxLeadsPerRun ?? 0;
  els.runUntil.value = toLocalDateTimeValue(state.runUntilAt || "");
  els.minScore.value = state.minLeadScore ?? 25;
  els.includeFreelance.checked = Boolean(state.includeFreelancePreset);
  els.leadKeywords.value = listToText(state.leadKeywords || []);
  els.blockedKeywords.value = listToText(state.blockedKeywords || []);

  const kb = state.knowledgeBase || {};
  els.companyDescription.value = kb.companyDescription || "";
  els.myService.value = kb.myService || "";
  els.idealCustomerProfile.value = kb.idealCustomerProfile || "";
  els.offer.value = kb.offer || "";
  els.proof.value = kb.proof || "";
  els.cta.value = kb.cta || "";
  els.tone.value = kb.tone || "";
  els.kbBlockedWords.value = kb.blockedWords || "";

  const tpl = state.templates || {};
  els.tplShortDirect.value = tpl.shortDirect || "";
  els.tplFriendly.value = tpl.friendly || "";
  els.tplService.value = tpl.serviceSpecific || "";
  els.tplFollow1.value = tpl.followUp1 || "";
  els.tplFollow2.value = tpl.followUp2 || "";
  els.tplFinal.value = tpl.finalFollowUp || "";
  renderPlatformToggles(state.enabledPlatforms || {});
  formDirty = false;
}

function renderPlatformToggles(enabled = {}) {
  els.platformToggles.innerHTML = "";
  PLATFORMS.forEach(([id, label]) => {
    const wrap = document.createElement("label");
    wrap.className = "checkLine";
    wrap.innerHTML = `<input type="checkbox" data-platform="${id}" ${enabled[id] === false ? "" : "checked"}> ${escapeHtml(label)}`;
    wrap.querySelector("input").addEventListener("change", () => { formDirty = true; });
    els.platformToggles.appendChild(wrap);
  });
}

async function checkPage() {
  const tab = await activeTab();
  const url = tab?.url || "";
  const page = SUPPORTED_PAGES.find(item => item.test(url));
  const ok = Boolean(page);
  els.pageStatus.textContent = ok ? `Ready on ${page.name}` : "Open a supported community page first";
  [els.start, els.scan, els.scanOnlyMode, els.testScroll].forEach(button => { button.disabled = !ok; });
}

async function saveRunSettings(showStatus) {
  const patch = {
    scanMode: els.scanMode.value,
    minGapSec: Math.max(5, Number(els.minGap.value || 30)),
    maxGapSec: Math.max(5, Number(els.maxGap.value || 40)),
    scanItemDelayMs: Math.max(0, Number(els.itemDelay.value || 0)),
    maxLeadsPerRun: Math.max(0, Number(els.maxLeads.value || 0)),
    runUntilAt: fromLocalDateTimeValue(els.runUntil.value),
    enabledPlatforms: collectPlatformToggles()
  };
  patch.maxGapSec = Math.max(patch.minGapSec, patch.maxGapSec);
  if (showStatus) patch.status = "Run settings saved";
  await chrome.storage.local.set(patch);
  formDirty = false;
}

async function saveQualification() {
  await chrome.storage.local.set({
    minLeadScore: Math.min(100, Math.max(0, Number(els.minScore.value || 25))),
    includeFreelancePreset: els.includeFreelance.checked,
    leadKeywords: textToList(els.leadKeywords.value),
    blockedKeywords: textToList(els.blockedKeywords.value),
    status: "Qualification saved"
  });
  formDirty = false;
}

async function saveKnowledgeBase() {
  await chrome.storage.local.set({
    knowledgeBase: {
      companyDescription: els.companyDescription.value,
      myService: els.myService.value,
      idealCustomerProfile: els.idealCustomerProfile.value,
      offer: els.offer.value,
      proof: els.proof.value,
      cta: els.cta.value,
      tone: els.tone.value,
      blockedWords: els.kbBlockedWords.value
    },
    status: "Knowledge base saved"
  });
  formDirty = false;
}

async function saveTemplates() {
  await chrome.storage.local.set({
    templates: {
      shortDirect: els.tplShortDirect.value,
      friendly: els.tplFriendly.value,
      serviceSpecific: els.tplService.value,
      followUp1: els.tplFollow1.value,
      followUp2: els.tplFollow2.value,
      finalFollowUp: els.tplFinal.value
    },
    status: "Templates saved"
  });
  formDirty = false;
}

async function sendContent(message) {
  try {
    await ensure();
    const tab = await activeTab();
    const response = await chrome.tabs.sendMessage(tab.id, message);
    if (!response?.ok) throw new Error(response?.error || "Command failed");
    await refresh(false);
    return response;
  } catch (error) {
    const text = `${error.message}\nTip: refresh the community tab, then try again.`;
    els.error.textContent = text;
    await chrome.storage.local.set({ status: "Error", lastError: text });
    return { ok: false, error: text };
  }
}

async function ensure() {
  const tab = await activeTab();
  if (!tab?.id) throw new Error("No active supported community tab found.");
  const response = await chrome.runtime.sendMessage({ type: "ENSURE_CONTENT_SCRIPT", tabId: tab.id });
  if (!response?.ok) throw new Error(response?.error || "Could not prepare this tab.");
}

function renderQueue(items, mode) {
  const leads = items.map(normalizeLead).sort((a, b) => b.leadScore - a.leadScore || String(b.createdAt).localeCompare(String(a.createdAt)));
  els.queue.innerHTML = leads.length ? "" : "<p>No matched leads yet.</p>";
  leads.slice(0, 50).forEach(lead => {
    const card = document.createElement("div");
    card.className = "item";
    const canOutreach = mode === "review";
    const sourceUrl = lead.sourceUrl || "#";
    card.innerHTML = `
      <div class="itemTop">
        <b>${escapeHtml(lead.authorName)}</b>
        <span class="tier ${escapeAttr(lead.leadTemperature.toLowerCase())}">${escapeHtml(lead.leadTemperature)} ${lead.leadScore}</span>
      </div>
      <small>${escapeHtml([lead.platform, lead.communityName].filter(Boolean).join(" / "))}</small>
      <p>${escapeHtml(lead.postSnippet)}</p>
      <p>Signals: ${escapeHtml((lead.matchedKeywords || []).join(", "))}</p>
      ${lead.negativeSignals.length ? `<p>Negative: ${escapeHtml(lead.negativeSignals.join(", "))}</p>` : ""}
      ${canOutreach ? `<textarea class="draftPreview" readonly rows="4">${escapeHtml(lead.outreachDraft || "")}</textarea>` : ""}
      <div class="actions">
        <a target="_blank" href="${escapeAttr(sourceUrl)}">View source</a>
        ${canOutreach ? "<button data-action='open'>Open outreach</button><button data-action='copy'>Copy opener</button><button data-action='follow1'>Copy follow-up 1</button><button data-action='log'>Log contacted</button>" : ""}
      </div>
      <div class="leadTools">
        <select data-role="status">${STATUSES.map(status => statusOption(status, lead.status)).join("")}</select>
        <input data-role="followUpDate" type="date" value="${escapeAttr(lead.followUpDate || "")}">
        <textarea data-role="notes" rows="2" placeholder="Notes">${escapeHtml(lead.notes || "")}</textarea>
        <button class="muted" data-action="saveLead">Save lead</button>
      </div>`;

    card.querySelector("[data-action='open']")?.addEventListener("click", () => openOutreach(lead));
    card.querySelector("[data-action='copy']")?.addEventListener("click", () => copyDraft(lead, "shortDirect"));
    card.querySelector("[data-action='follow1']")?.addEventListener("click", () => copyDraft(lead, "followUp1"));
    card.querySelector("[data-action='log']")?.addEventListener("click", () => logOutreach(lead));
    card.querySelector("[data-action='saveLead']").addEventListener("click", async () => {
      await chrome.runtime.sendMessage({
        type: "UPDATE_LEAD",
        itemId: lead.id,
        patch: {
          status: card.querySelector("[data-role='status']").value,
          followUpDate: card.querySelector("[data-role='followUpDate']").value,
          notes: card.querySelector("[data-role='notes']").value
        }
      });
      await refresh(false);
    });
    els.queue.appendChild(card);
  });
}

async function openOutreach(lead) {
  if (!window.confirm("Open outreach for manual review? This will copy the draft and open the source/profile page. You must send manually.")) return;
  await copyDraft(lead, "shortDirect", false);
  const response = await chrome.runtime.sendMessage({ type: "OPEN_OUTREACH", itemId: lead.id, templateType: "shortDirect" });
  if (!response?.ok) {
    els.error.textContent = response?.error || "Could not open outreach.";
    return;
  }
  await refresh(false);
}

async function copyDraft(lead, templateType, showStatus = true) {
  const response = await chrome.runtime.sendMessage({ type: "GET_REPLY_DRAFT", itemId: lead.id, templateType });
  if (!response?.ok) {
    els.error.textContent = response?.error || "Could not generate draft.";
    return;
  }
  await navigator.clipboard.writeText(response.text);
  if (showStatus) await chrome.storage.local.set({ status: "Draft copied. Review before sending." });
}

async function logOutreach(lead) {
  await chrome.runtime.sendMessage({ type: "LOG_OUTREACH", itemId: lead.id });
  await refresh(false);
}

function renderLogs(logs) {
  els.logs.innerHTML = logs.length ? "" : "<p>No logs yet.</p>";
  logs.slice(0, 25).forEach(raw => {
    const log = normalizeLead(raw);
    const row = document.createElement("div");
    row.className = "log";
    row.textContent = `${raw.actionAt || log.updatedAt || log.createdAt} | ${raw.action || log.status} | ${log.leadTemperature} ${log.leadScore} | ${log.platform} | ${log.authorName}`;
    els.logs.appendChild(row);
  });
}

async function exportCsv() {
  const response = await chrome.runtime.sendMessage({ type: "PREPARE_CSV_EXPORT" });
  if (!response?.ok) {
    els.error.textContent = response?.error || "Could not prepare CSV.";
    return;
  }
  const url = URL.createObjectURL(new Blob([response.csv], { type: "text/csv" }));
  await chrome.downloads.download({ url, filename: response.filename, saveAs: true });
  await refresh(false);
}

function collectPlatformToggles() {
  const enabled = {};
  els.platformToggles.querySelectorAll("[data-platform]").forEach(input => {
    enabled[input.dataset.platform] = input.checked;
  });
  return enabled;
}

function normalizeLead(item) {
  return {
    id: item.id || "",
    platform: item.platform || "",
    communityName: item.communityName || item.sourceCommunity || "",
    authorName: item.authorName || item.username || "Unknown member",
    authorProfileUrl: item.authorProfileUrl || "",
    sourceUrl: item.sourceUrl || item.postUrl || item.pageUrl || "",
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
    outreachDraft: item.outreachDraft || ""
  };
}

function statusOption(value, selected) {
  return `<option value="${escapeAttr(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`;
}

function listToText(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function textToList(value) {
  return String(value || "").split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

function toLocalDateTimeValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromLocalDateTimeValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

async function activeTab() { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); return tab; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char])); }
function escapeAttr(value) { return escapeHtml(value); }
