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

  detectPlatform().then(status => {
    chrome.runtime.sendMessage({ type: "PLATFORM_STATUS", status }).catch(() => {});
    installProfileOverlay(status).catch(() => {});
  });

  async function handle(message) {
    if (message.type === "PING") return { ok: true, running, status: await detectPlatform() };
    if (message.type === "DETECT_PLATFORM") {
      const status = await detectPlatform();
      await installProfileOverlay(status);
      return { ok: true, status };
    }
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
    await chrome.runtime.sendMessage({ type: "SCAN_EVENT", eventType: mode === "scan_only" ? "scan_only_started" : "scan_started", metadata: await pageMetadata() }).catch(() => {});
    await scanLoop(mode || state.campaign?.scanMode || state.campaign?.scan_mode || "review_leads");
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
    await chrome.runtime.sendMessage({ type: "SCAN_CYCLE_COMPLETE", summary: result }).catch(() => {});
    if (!running || result.ok === false) return;
    await autoScrollForMore();
    const min = campaignNumber(state.campaign, "minGapSec", "min_gap_sec", 7) * 1000;
    const max = campaignNumber(state.campaign, "maxGapSec", "max_gap_sec", 10) * 1000;
    await chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", progress: { running: true, current: result.scanned || 0, total: result.scanned || 0, activity: "Waiting for more visible posts" } });
    timer = setTimeout(() => scanLoop(mode), Number.isFinite(min + max) ? randomInt(min, Math.max(min, max)) : randomInt(7000, 10000));
  }

  async function scanVisible(mode) {
    const adapter = currentAdapter();
    if (!adapter) return { ok: false, error: "Unsupported page" };
    const state = await chrome.storage.local.get(["campaign", "knowledgeBase", "keywordGroups", "templateSet", "workspace"]);
    const campaign = state.campaign || {};
    const targetPlatforms = campaignPlatforms(campaign);
    if (targetPlatforms.length && !targetPlatforms.includes(adapter.id)) {
      const activity = `${adapter.platformName} is disabled in this campaign`;
      running = false;
      await chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", progress: { running: false, current: 0, total: 0, activity } });
      return { ok: true, scanned: 0, found: 0, skipped: true, stopped: true };
    }
    const minScore = campaignNumber(campaign, "minScore", "min_score", 25);
    const pauseAfter = campaignNumber(campaign, "pauseAfterLeads", "pause_after_leads", 0);
    const communityName = adapter.getCommunityName();
    const communityUrl = adapter.extractCommunityUrl?.() || inferredCommunityUrl(adapter.id);
    const items = getScanItems(adapter).slice(0, 100);
    await chrome.runtime.sendMessage({
      type: "PLATFORM_STATUS",
      status: { supported: true, platform: adapter.platformName, platformId: adapter.id, communityName, communityUrl, sourceUrl: location.href }
    });
    await chrome.runtime.sendMessage({
      type: "SCAN_EVENT",
      eventType: "scan_visible",
      metadata: { platform: adapter.id, platformName: adapter.platformName, communityName, communityUrl, sourceUrl: location.href, visibleItems: items.length }
    }).catch(() => {});

    let scanned = 0;
    let found = 0;
    if (!items.length) {
      await chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", progress: { running, current: 0, total: 0, activity: "No visible posts found on this page" } });
      return { ok: true, scanned: 0, found: 0 };
    }
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
        communityUrl,
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
      await chrome.runtime.sendMessage({
        type: "SCAN_EVENT",
        eventType: "lead_found",
        metadata: { platform: adapter.id, communityName, communityUrl, sourceUrl: lead.sourceUrl, authorName: lead.authorName, score: lead.leadScore, temperature: lead.leadTemperature }
      }).catch(() => {});
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

  function campaignPlatforms(campaign) {
    const platforms = campaign?.targetPlatforms || campaign?.target_platforms || [];
    return Array.isArray(platforms) ? platforms.map(String) : [];
  }

  function campaignNumber(campaign, camelKey, snakeKey, fallback) {
    const value = Number(campaign?.[camelKey] ?? campaign?.[snakeKey] ?? fallback);
    return Number.isFinite(value) ? value : fallback;
  }

  async function autoScrollForMore() {
    const before = window.scrollY;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (before >= maxScroll - 80) {
      window.scrollTo({ top: maxScroll, behavior: "smooth" });
    } else {
      window.scrollBy({ top: Math.max(420, Math.floor(window.innerHeight * 0.72)), behavior: "smooth" });
    }
    await sleep(1400);
  }

  function getScanItems(adapter) {
    const items = [];
    const push = item => {
      if (!item || item.nodeType !== 1 || !isVisible(item)) return;
      const text = adapter.extractText(item);
      if (!text || text.length < 20) return;
      if (items.some(existing => existing === item || existing.contains(item))) return;
      if (items.some(existing => similar(adapter.extractText(existing), text))) return;
      items.push(item);
    };
    (adapter.getVisibleItems() || []).forEach(push);
    fallbackVisibleItems().forEach(push);
    return items;
  }

  function fallbackVisibleItems() {
    const selectors = [
      "shreddit-post",
      "shreddit-comment",
      "article",
      "[role='article']",
      "div[data-testid='post-container']",
      "div[data-click-id='background']",
      "div.feed-shared-update-v2",
      "div.occludable-update",
      "div[data-urn*='activity']",
      "div[data-id*='urn:li:activity']",
      "div.comments-comment-item",
      "div[data-testid='tweet']",
      "div[role='listitem']",
      "li"
    ];
    return [...document.querySelectorAll(selectors.join(","))];
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 20 && rect.height > 12 && rect.bottom >= 0 && rect.top <= window.innerHeight + 800 && style.display !== "none" && style.visibility !== "hidden";
  }

  function similar(a, b) {
    if (!a || !b) return false;
    const left = a.slice(0, 240);
    const right = b.slice(0, 240);
    return left === right || left.includes(right) || right.includes(left);
  }

  async function pageMetadata() {
    const adapter = currentAdapter();
    if (!adapter) return { platform: "", communityName: "", communityUrl: "", sourceUrl: location.href };
    return {
      platform: adapter.id,
      platformName: adapter.platformName,
      communityName: adapter.getCommunityName(),
      communityUrl: adapter.extractCommunityUrl?.() || inferredCommunityUrl(adapter.id),
      sourceUrl: location.href
    };
  }

  function inferredCommunityUrl(platformId) {
    const url = new URL(location.href);
    if (platformId === "reddit") {
      const community = location.pathname.match(/\/r\/([^/]+)/i)?.[1];
      return community ? `${location.origin}/r/${community}/` : location.origin;
    }
    if (platformId === "linkedin") {
      const group = location.pathname.match(/\/groups\/([^/]+)/i)?.[1];
      return group ? `${location.origin}/groups/${group}/` : location.origin;
    }
    if (platformId === "facebook") {
      const group = location.pathname.match(/\/groups\/([^/]+)/i)?.[1];
      return group ? `${location.origin}/groups/${group}/` : location.origin;
    }
    return url.origin;
  }

  async function installProfileOverlay(status) {
    const existing = document.getElementById("cla-profile-overlay");
    const profile = getProfileLead(status);
    if (!status.supported || !profile) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const overlay = document.createElement("div");
    overlay.id = "cla-profile-overlay";
    overlay.innerHTML = `
      <div class="cla-profile-card">
        <div>
          <strong>Community Lead</strong>
          <span>${escapeHtml(status.platform)}</span>
        </div>
        <button type="button">Add to Outreach Sequence</button>
      </div>
    `;
    const style = document.createElement("style");
    style.textContent = `
      #cla-profile-overlay{position:fixed;right:18px;bottom:88px;z-index:2147483647;font-family:Inter,Arial,sans-serif}
      #cla-profile-overlay .cla-profile-card{display:flex;align-items:center;gap:12px;max-width:340px;border:1px solid rgba(148,163,184,.35);border-radius:18px;background:#020617;color:#fff;box-shadow:0 20px 60px rgba(2,6,23,.35);padding:12px}
      #cla-profile-overlay strong{display:block;font-size:13px;line-height:1}
      #cla-profile-overlay span{display:block;margin-top:4px;color:#bfdbfe;font-size:12px}
      #cla-profile-overlay button{border:0;border-radius:12px;background:#2563eb;color:#fff;font-weight:800;font-size:12px;padding:10px 12px;cursor:pointer}
      #cla-profile-overlay button[disabled]{cursor:not-allowed;opacity:.7}
    `;
    overlay.appendChild(style);
    overlay.querySelector("button")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      if (!(button instanceof HTMLButtonElement)) return;
      button.disabled = true;
      button.textContent = "Adding...";
      try {
        const response = await chrome.runtime.sendMessage({ type: "ADD_PROFILE_TO_SEQUENCE", profile });
        if (!response?.ok) throw new Error(response?.error || "Could not add profile");
        button.textContent = "Added to Queue";
      } catch (error) {
        button.disabled = false;
        button.textContent = error instanceof Error ? "Retry Add" : "Retry Add";
      }
    });
    document.documentElement.appendChild(overlay);
  }

  function getProfileLead(status) {
    const adapter = currentAdapter();
    if (!adapter || !isProfilePage(adapter.id)) return null;
    const name = profileName(adapter.id);
    if (!name) return null;
    const snippet = profileSnippet();
    return {
      platform: adapter.id,
      communityName: status.communityName || adapter.platformName,
      communityUrl: adapter.extractCommunityUrl?.() || inferredCommunityUrl(adapter.id),
      authorName: name,
      authorProfileUrl: location.href,
      sourceUrl: location.href,
      postText: snippet || `Profile page for ${name}`,
      postSnippet: truncate(snippet || `Profile page for ${name}`, 220),
      matchedKeywords: ["profile"],
      leadScore: 50,
      profileVariables: {
        first_name: name.split(/\s+/)[0] || name,
        recent_post_topic: snippet.slice(0, 90)
      }
    };
  }

  function isProfilePage(platformId) {
    if (platformId === "linkedin") return /\/in\/|\/company\//i.test(location.pathname);
    if (platformId === "reddit") return /\/(user|u)\//i.test(location.pathname);
    if (platformId === "x") return /^\/[A-Za-z0-9_]{1,20}\/?$/i.test(location.pathname);
    if (platformId === "producthunt") return /\/@/i.test(location.pathname);
    return false;
  }

  function profileName(platformId) {
    const heading = cleanText(document.querySelector("h1, [data-testid='UserName'], .text-heading-xlarge, .top-card-layout__title")?.textContent || "");
    if (heading) return heading.slice(0, 80);
    if (platformId === "reddit") return location.pathname.match(/\/(?:user|u)\/([^/]+)/i)?.[1] || "";
    if (platformId === "x") return location.pathname.split("/").filter(Boolean)[0] || "";
    if (platformId === "producthunt") return location.pathname.match(/@([^/]+)/)?.[1] || "";
    return "";
  }

  function profileSnippet() {
    const description =
      document.querySelector("meta[name='description']")?.getAttribute("content") ||
      document.querySelector("[data-testid='UserDescription'], .text-body-medium, .pv-text-details__left-panel")?.textContent ||
      document.body.innerText.slice(0, 350);
    return cleanText(description || "");
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
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
