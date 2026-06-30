(() => {
  if (window.__CLA_CONTENT__) return;
  window.__CLA_CONTENT__ = true;

  let running = false;
  let timer = null;
  let seenKeys = new Set();
  let runFound = 0;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handle(message).then(sendResponse).catch(error => sendResponse({ ok: false, error: error.message || String(error) }));
    return true;
  });

  detectPlatform().then(status => chrome.runtime.sendMessage({ type: "PLATFORM_STATUS", status }).catch(() => {}));

  async function handle(message) {
    if (message.type === "PING") return { ok: true, running };
    if (message.type === "START_SCAN") return startScan(message.mode);
    if (message.type === "STOP_SCAN") return stopScan("Stopped");
    if (message.type === "SCAN_VISIBLE") return scanVisible(message.mode || "review_leads");
    return { ok: false, error: "Unknown content command" };
  }

  async function startScan(mode) {
    const state = await chrome.storage.local.get(["campaign"]);
    running = true;
    runFound = 0;
    await chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", progress: { running: true, current: 0, total: 0, activity: "Starting scan" } });
    await scanLoop(mode || state.campaign?.scanMode || "review_leads");
    return { ok: true };
  }

  async function stopScan(reason) {
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    await chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", progress: { running: false, current: 0, total: 0, activity: reason || "Stopped" } });
    return { ok: true };
  }

  async function scanLoop(mode) {
    if (!running) return;
    const result = await scanVisible(mode);
    if (result.stopped) return;
    const state = await chrome.storage.local.get(["campaign"]);
    const gap = randomInt(30000, 40000);
    const min = Number(state.campaign?.minGapSec || 30) * 1000;
    const max = Number(state.campaign?.maxGapSec || 40) * 1000;
    timer = setTimeout(() => scanLoop(mode), Number.isFinite(min + max) ? randomInt(min, Math.max(min, max)) : gap);
  }

  async function scanVisible(mode) {
    const adapter = currentAdapter();
    if (!adapter) return { ok: false, error: "Unsupported page" };
    const state = await chrome.storage.local.get(["campaign", "knowledgeBase", "keywordGroups", "templateSet", "workspace"]);
    const campaign = state.campaign || {};
    const minScore = Number(campaign.minScore ?? 25);
    const pauseAfter = Number(campaign.pauseAfterLeads || 0);
    const communityName = adapter.getCommunityName();
    const items = adapter.getVisibleItems().filter(Boolean).slice(0, 80);
    await chrome.runtime.sendMessage({ type: "PLATFORM_STATUS", status: { supported: true, platform: adapter.platformName, platformId: adapter.id, communityName } });

    let scanned = 0;
    let found = 0;
    for (const item of items) {
      scanned += 1;
      await chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", progress: { running, current: scanned, total: items.length, activity: `Reading post ${scanned} of ${items.length}` } });
      if (pauseAfter && runFound >= pauseAfter) {
        await stopScan(`Paused after ${pauseAfter} leads`);
        return { ok: true, scanned, found, stopped: true };
      }

      const text = adapter.extractText(item);
      if (!text || text.length < 20) {
        adapter.highlightItem(item, "checked");
        await sleep(220);
        continue;
      }
      if (adapter.detectPromotedOrSponsored(item)) {
        adapter.highlightItem(item, "skipped");
        await sleep(220);
        continue;
      }

      const leadBase = {
        workspaceId: state.workspace?.id || "local",
        campaignId: campaign.id || "local-campaign",
        platform: adapter.id,
        communityName,
        authorName: adapter.extractAuthor(item) || "Unknown member",
        authorProfileUrl: adapter.extractAuthorProfileUrl(item) || "",
        sourceUrl: adapter.extractSourceUrl(item) || location.href,
        postText: text,
        postSnippet: truncate(text, 220),
        scanMode: mode
      };
      const duplicateKey = primaryDuplicateKey(leadBase);
      if (seenKeys.has(duplicateKey)) {
        adapter.highlightItem(item, "checked");
        await sleep(220);
        continue;
      }
      seenKeys.add(duplicateKey);

      const score = scoreLead(text, state.keywordGroups || []);
      if (score.temperature === "Ignore" || score.score < minScore) {
        adapter.highlightItem(item, "checked");
        await sleep(220);
        continue;
      }

      const createdAt = new Date().toISOString();
      const lead = {
        id: crypto.randomUUID(),
        ...leadBase,
        matchedKeywords: score.matchedKeywords,
        negativeSignals: score.negativeSignals,
        leadScore: score.score,
        leadTemperature: score.temperature,
        status: "New",
        notes: "",
        followUpDate: null,
        createdAt,
        updatedAt: createdAt,
        duplicateKey,
        synced: false
      };
      const drafts = buildDrafts(lead, state.knowledgeBase || {}, state.templateSet || {});
      lead.outreachDraft = drafts.shortDirect;
      lead.followUpDraft = drafts.followUp1;
      lead.drafts = drafts;
      adapter.highlightItem(item, score.temperature === "Hot" ? "hot" : "match");
      await chrome.runtime.sendMessage({ type: "LEAD_FOUND", lead });
      found += 1;
      runFound += 1;
      await sleep(350);
    }
    return { ok: true, scanned, found };
  }

  async function detectPlatform() {
    const adapter = currentAdapter();
    return adapter ? { supported: true, platform: adapter.platformName, platformId: adapter.id, communityName: adapter.getCommunityName() } : { supported: false, platform: "", platformId: "", communityName: "" };
  }

  function currentAdapter() {
    const url = new URL(location.href);
    return (globalThis.CLA_ADAPTERS || []).find(adapter => adapter.matchUrl(url));
  }

  function scoreLead(text, groups) {
    const source = text.toLowerCase();
    const matched = new Set();
    const negative = new Set();
    let score = 0;
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
    add(15, ["freelance", "freelancer", "contract", "contractor", "gig", "part-time", "project-based"]);
    add(10, ["asap", "immediately", "this week"]);
    groups.flatMap(group => group.positiveKeywords || group.positive_keywords || []).forEach(term => {
      if (source.includes(String(term).toLowerCase())) {
        score += 10;
        matched.add(String(term).toLowerCase());
      }
    });
    const negatives = ["unpaid", "volunteer only", "free work", "scam", "not hiring", "avoid this", "warning", "job seeker", "looking for work", "student looking for internship", "internship"];
    negatives.forEach(term => {
      if (source.includes(term)) {
        score -= term.includes("job seeker") || term.includes("internship") ? 50 : 30;
        negative.add(term);
      }
    });
    score = Math.max(0, Math.min(100, score));
    return {
      score,
      temperature: score >= 80 ? "Hot" : score >= 50 ? "Warm" : score >= 25 ? "Review" : "Ignore",
      matchedKeywords: Array.from(matched).slice(0, 16),
      negativeSignals: Array.from(negative).slice(0, 12)
    };
  }

  function buildDrafts(lead, kb, templateSet) {
    const templates = {
      shortDirect: templateSet.shortDirect || templateSet.short_direct || "Hi {author}, saw your post in {community} about {matched_keywords}. I help with {my_service}. {cta}",
      followUp1: templateSet.followUp1 || templateSet.follow_up_1 || "Hi {author}, just following up on your post about {matched_keywords}."
    };
    return {
      shortDirect: render(templates.shortDirect, lead, kb),
      followUp1: render(templates.followUp1, lead, kb)
    };
  }

  function render(template, lead, kb) {
    const values = {
      author: lead.authorName,
      platform: lead.platform,
      community: lead.communityName,
      post_snippet: lead.postSnippet,
      matched_keywords: lead.matchedKeywords.join(", "),
      my_service: kb.myService || kb.my_service || "",
      offer: kb.offer || "",
      cta: kb.cta || "",
      proof: kb.proof || "",
      icp: kb.icp || ""
    };
    return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template).trim();
  }

  function primaryDuplicateKey(lead) {
    if (lead.sourceUrl && lead.sourceUrl !== location.href) return `source:${lead.sourceUrl}`;
    if (lead.authorProfileUrl) return `profile:${lead.authorProfileUrl}`;
    if (lead.authorName) return `author:${lead.platform}:${lead.authorName.toLowerCase()}`;
    return `text:${lead.platform}:${stableHash(lead.postText.slice(0, 600))}`;
  }

  function stableHash(value) { let hash = 0; for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0; return `h_${Math.abs(hash)}`; }
  function truncate(value, n) { return value.length > n ? `${value.slice(0, n - 3)}...` : value; }
  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
})();
