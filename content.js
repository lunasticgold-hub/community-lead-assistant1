(() => {
  if (window.__COMMUNITY_LEAD_ASSISTANT_V7__) return;
  window.__COMMUNITY_LEAD_ASSISTANT_V7__ = true;

  const ADAPTERS = [
    {
      id: "reddit",
      name: "Reddit",
      hosts: [/(\.|^)reddit\.com$/i],
      isReady: () => /reddit\.com\/r\//i.test(location.href),
      itemSelectors: ["shreddit-post", "article", "div[data-testid='post-container']", "div.thing", "div[data-click-id='background']"],
      authorSelectors: ["a[href*='/user/']", "a[href*='/u/']", "a.author", "[data-click-id='user']"],
      profileSelectors: ["a[href*='/user/']", "a[href*='/u/']"],
      timestampSelectors: ["time", "a[data-click-id='timestamp']"],
      community: () => location.pathname.match(/\/r\/([^/]+)/i)?.[1] || "",
      manualOutreach: "prefilledRedditDraft",
      promoted: el => /promoted|sponsored|advertise/i.test(el.innerText || "")
    },
    {
      id: "indiehackers",
      name: "Indie Hackers",
      hosts: [/(\.|^)indiehackers\.com$/i],
      itemSelectors: ["article", "[data-test*='post']", "[data-testid*='post']", "main section", "div[class*='post']"],
      authorSelectors: ["a[href*='/@']", "a[href*='/user']", "[class*='author']", "h3", "strong"],
      profileSelectors: ["a[href*='/@']", "a[href*='/user']"],
      timestampSelectors: ["time", "[datetime]"],
      community: () => sectionFromPath(["discussions", "growth", "marketing", "sales", "launches"]),
      manualOutreach: "copyDraftAndOpenSource",
      promoted: el => /sponsored|promoted/i.test(el.innerText || "")
    },
    {
      id: "startupschool",
      name: "Startup School",
      hosts: [/(\.|^)startupschool\.org$/i],
      itemSelectors: ["article", "[role='article']", "[data-testid*='post']", "main section", "div[class*='post']", "div[class*='discussion']"],
      authorSelectors: ["[class*='author']", "[class*='user']", "h3", "strong"],
      profileSelectors: ["a[href*='/users/']", "a[href*='/profile']"],
      timestampSelectors: ["time", "[datetime]"],
      community: () => sectionFromPath(["forum", "community", "discussions", "groups"]),
      manualOutreach: "copyDraftAndOpenSource",
      promoted: el => /sponsored|promoted/i.test(el.innerText || "")
    },
    {
      id: "microconf",
      name: "MicroConf Connect",
      hosts: [/(\.|^)microconf\.com$/i, /(\.|^)microconfconnect\.com$/i],
      itemSelectors: ["article", "[role='article']", "[data-testid*='post']", "main section", "div[class*='post']", "div[class*='discussion']"],
      authorSelectors: ["[class*='author']", "[class*='user']", "h3", "strong"],
      profileSelectors: ["a[href*='/members/']", "a[href*='/profile']", "a[href*='/users/']"],
      timestampSelectors: ["time", "[datetime]"],
      community: () => sectionFromPath(["discussions", "community", "connect", "topics"]),
      manualOutreach: "copyDraftAndOpenSource",
      promoted: el => /sponsored|promoted/i.test(el.innerText || "")
    },
    {
      id: "slack",
      name: "Slack",
      hosts: [/\.slack\.com$/i],
      itemSelectors: ["[data-qa='virtual-list-item']", "[data-qa='message_container']", ".c-message_kit__gutter", ".c-virtual_list__item", "[role='listitem']"],
      authorSelectors: ["[data-qa='message_sender']", "[class*='sender']", "button[data-qa*='user']", "strong"],
      profileSelectors: ["a[href*='/team/']", "a[href*='/archives/']"],
      timestampSelectors: ["time", "a[href*='/archives/']"],
      community: () => document.querySelector("[data-qa='channel_name'], [data-qa='channel_header_name']")?.textContent?.replace(/^#/, "").trim() || "",
      manualOutreach: "copyDraftAndOpenSource",
      promoted: el => /sponsored|promoted/i.test(el.innerText || "")
    },
    {
      id: "discord",
      name: "Discord",
      hosts: [/(\.|^)discord\.com$/i],
      itemSelectors: ["li[id^='chat-messages-']", "div[id^='chat-messages-']", "[class*='messageListItem']", "article"],
      authorSelectors: ["[class*='username']", "h3", "strong"],
      profileSelectors: ["a[href*='/users/']", "a[href*='/channels/']"],
      timestampSelectors: ["time", "[datetime]"],
      community: () => document.querySelector("[aria-label*='Channel header'], [class*='title']")?.textContent?.replace(/^#/, "").trim() || "",
      manualOutreach: "copyDraftAndOpenSource",
      promoted: el => /sponsored|promoted/i.test(el.innerText || "")
    },
    {
      id: "facebook",
      name: "Facebook Groups",
      hosts: [/(\.|^)facebook\.com$/i],
      isReady: () => /facebook\.com\/groups\//i.test(location.href),
      itemSelectors: ["div[role='article']", "[data-pagelet*='FeedUnit']", "[data-ad-preview='message']"],
      authorSelectors: ["h2 a", "h3 a", "strong a", "span[dir='auto'] a"],
      profileSelectors: ["h2 a[href]", "h3 a[href]", "strong a[href]"],
      timestampSelectors: ["a[href*='/posts/']", "a[aria-label*='ago']", "span[aria-labelledby]"],
      community: () => document.querySelector("h1, [role='main'] h2")?.textContent?.trim() || "Facebook group",
      manualOutreach: "copyDraftAndOpenSource",
      promoted: el => /sponsored|paid partnership|suggested for you/i.test(el.innerText || "")
    },
    {
      id: "whatsapp",
      name: "WhatsApp Web",
      hosts: [/^web\.whatsapp\.com$/i],
      itemSelectors: ["div.copyable-text", "[data-testid='msg-container']", ".message-in", ".message-out"],
      authorSelectors: ["span[dir='auto']", "[data-pre-plain-text]"],
      profileSelectors: [],
      timestampSelectors: ["[data-pre-plain-text]"],
      community: () => document.querySelector("header span[title]")?.getAttribute("title") || "WhatsApp chat",
      manualOutreach: "copyDraftAndOpenSource",
      promoted: () => false
    },
    {
      id: "telegram",
      name: "Telegram Web",
      hosts: [/^web\.telegram\.org$/i],
      itemSelectors: [".message", ".Message", ".bubble", "[class*='message']"],
      authorSelectors: [".sender-title", ".message-title", "[class*='sender']", "strong"],
      profileSelectors: ["a[href*='t.me/']"],
      timestampSelectors: ["time", ".time", "[datetime]"],
      community: () => document.querySelector(".chat-info .title, .ChatInfo .title, [class*='chat-title']")?.textContent?.trim() || "Telegram chat",
      manualOutreach: "copyDraftAndOpenSource",
      promoted: () => false
    }
  ];

  const DEFAULT_TEMPLATES = {
    shortDirect: "Hi {author}, saw your post in {community} about {matched_keywords}.\n\nI help with {my_service}. {cta}\n\nPost: {post_snippet}",
    followUp1: "Hi {author}, just following up on your post about {matched_keywords}.\n\nIf this is still a priority, happy to share a few ideas around {my_service}."
  };

  let running = false;
  let timer = null;
  let runLeadCount = 0;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handle(message).then(sendResponse).catch(async error => {
      const text = error.message || String(error);
      console.error("Community Lead Assistant content error", error);
      await chrome.storage.local.set({ status: "Content error", lastError: text });
      sendResponse({ ok: false, error: text });
    });
    return true;
  });

  async function handle(message) {
    if (message.type === "PING") return { ok: true, running, platform: getAdapter().name };
    if (message.type === "START") return start();
    if (message.type === "STOP") return stop();
    if (message.type === "SCAN_NOW") return scanAndStore();
    if (message.type === "DEBUG_SCROLL") { doScroll(); return { ok: true, y: getScrollY() }; }
    return { ok: false, error: "Unknown content command" };
  }

  async function start() {
    const adapter = getAdapter();
    const state = await chrome.storage.local.get(["enabledPlatforms"]);
    if (!adapter) throw new Error("Open a supported community page first.");
    if (adapter.isReady && !adapter.isReady()) throw new Error(`Open a ${adapter.name} community/channel/group page first.`);
    if (state.enabledPlatforms && state.enabledPlatforms[adapter.id] === false) throw new Error(`${adapter.name} scanning is disabled in platform toggles.`);
    if (running) {
      await chrome.storage.local.set({ status: `Already running on ${adapter.name}`, lastError: "" });
      return { ok: true, alreadyRunning: true };
    }
    running = true;
    runLeadCount = 0;
    await chrome.storage.local.set({ status: `Running on ${adapter.name}`, lastError: "" });
    await runCycle();
    return { ok: true };
  }

  async function stop(reason = "Stopped") {
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    await chrome.storage.local.set({ status: reason });
    return { ok: true };
  }

  async function runCycle() {
    if (!running) return;
    if (await shouldStopForSchedule()) return stop("Stopped: scheduled time reached");
    const result = await scanAndStore();
    if (result.stopped) return;
    if (await shouldStopForSchedule()) return stop("Stopped: scheduled time reached");
    doScroll();
    const state = await chrome.storage.local.get(["minGapSec", "maxGapSec"]);
    const min = Math.max(5, Number(state.minGapSec || 30));
    const max = Math.max(min, Number(state.maxGapSec || 40));
    const gap = randomInt(min * 1000, max * 1000);
    await chrome.storage.local.set({ status: `Running. Next scan in ${Math.round(gap / 1000)}s` });
    timer = setTimeout(runCycle, gap);
  }

  async function shouldStopForSchedule() {
    const state = await chrome.storage.local.get(["runUntilAt"]);
    if (!state.runUntilAt) return false;
    const stopAt = Date.parse(state.runUntilAt);
    return Number.isFinite(stopAt) && Date.now() >= stopAt;
  }

  async function scanAndStore() {
    const adapter = getAdapter();
    const state = await chrome.storage.local.get(null);
    const communityName = safeText(adapter.community?.()) || adapter.name;
    const queue = Array.isArray(state.matchedQueue) ? state.matchedQueue : [];
    const processedKeys = new Set(state.processedKeys || []);
    const candidates = extractCandidates(adapter);
    const itemDelay = Math.max(0, Number(state.scanItemDelayMs ?? 350));
    const minScore = Math.max(0, Number(state.minLeadScore ?? 25));
    const maxLeads = Math.max(0, Number(state.maxLeadsPerRun || 0));
    let scanned = 0;
    let found = 0;

    for (const candidate of candidates) {
      if (running && maxLeads && runLeadCount >= maxLeads) {
        await chrome.storage.local.set({ matchedQueue: queue.slice(0, 500), processedKeys: [...processedKeys].slice(-4000) });
        await stop(`Stopped: pause after ${maxLeads} leads`);
        return { ok: true, scanned, found, stopped: true };
      }

      scanned += 1;
      if (candidate.promoted) {
        mark(candidate.el, "skipped", adapter.name, "Promoted/skipped");
        await sleep(itemDelay);
        continue;
      }

      const keys = duplicateKeys(adapter, communityName, candidate);
      if (keys.some(key => processedKeys.has(key))) {
        mark(candidate.el, "checked", adapter.name, "Duplicate checked");
        await sleep(itemDelay);
        continue;
      }
      keys.forEach(key => processedKeys.add(key));

      const qualification = qualify(candidate.text, {
        leadKeywords: state.leadKeywords,
        blockedKeywords: mergeLists(state.blockedKeywords, state.knowledgeBase?.blockedWords),
        includeFreelancePreset: state.includeFreelancePreset
      });

      if (!qualification.qualified || qualification.score < minScore) {
        mark(candidate.el, "checked", adapter.name, "Checked/no match");
        await sleep(itemDelay);
        continue;
      }

      const now = new Date().toISOString();
      const lead = buildLead({
        adapter,
        candidate,
        communityName,
        qualification,
        state,
        createdAt: now
      });
      queue.unshift(lead);
      found += 1;
      runLeadCount += 1;
      mark(candidate.el, qualification.temperature === "Hot" ? "hot" : "match", adapter.name, `${qualification.temperature} lead (${qualification.score})`);
      await sleep(itemDelay);
    }

    await chrome.storage.local.set({
      matchedQueue: queue.slice(0, 500),
      processedKeys: [...processedKeys].slice(-4000),
      scannedCount: Number(state.scannedCount || 0) + scanned,
      foundCount: Number(state.foundCount || 0) + found,
      status: running ? `Running on ${adapter.name}. Scanned ${scanned}, found ${found}.` : `Scanned ${scanned}, found ${found} on ${adapter.name}.`,
      lastError: ""
    });
    return { ok: true, scanned, found, totalQueue: queue.length, platform: adapter.name };
  }

  function extractCandidates(adapter) {
    const nodes = new Set();
    adapter.itemSelectors.forEach(selector => {
      try { document.querySelectorAll(selector).forEach(node => nodes.add(node)); } catch {}
    });
    if (!nodes.size) {
      document.querySelectorAll("a[href*='/comments/'], a[href*='/post/'], a[href*='/p/'], a[href*='/posts/']").forEach(link => {
        const parent = link.closest("article, [role='article'], section, li, div") || link.parentElement;
        if (parent) nodes.add(parent);
      });
    }
    return [...nodes]
      .map(el => parseCandidate(el, adapter))
      .filter(Boolean)
      .filter((item, index, all) => all.findIndex(other => other.text === item.text) === index)
      .slice(0, 120);
  }

  function parseCandidate(el, adapter) {
    const text = normalize(el.innerText || el.textContent || "");
    if (text.length < 20) return null;
    const authorName = getAuthorName(el, adapter);
    return {
      el,
      text,
      authorName,
      authorProfileUrl: getAuthorProfileUrl(el, adapter),
      sourceUrl: getSourceUrl(el),
      timestampText: getTimestamp(el, adapter),
      promoted: Boolean(adapter.promoted?.(el))
    };
  }

  function buildLead({ adapter, candidate, communityName, qualification, state, createdAt }) {
    const baseLead = {
      id: crypto.randomUUID(),
      platform: adapter.name,
      platformId: adapter.id,
      communityName,
      authorName: candidate.authorName || "Unknown member",
      authorProfileUrl: candidate.authorProfileUrl,
      sourceUrl: candidate.sourceUrl || location.href,
      postText: candidate.text,
      postSnippet: truncate(candidate.text, 360),
      matchedKeywords: qualification.matchedKeywords,
      negativeSignals: qualification.negativeSignals,
      leadScore: qualification.score,
      leadTemperature: qualification.temperature,
      status: "New",
      notes: "",
      followUpDate: "",
      createdAt,
      updatedAt: createdAt,
      outreachDraft: "",
      followUpDraft: "",
      scanMode: state.scanMode || "review",
      timestampText: candidate.timestampText,
      intentSummary: qualification.intentSummary,
      canOpenDmDraft: adapter.id === "reddit" && Boolean(candidate.authorName)
    };
    baseLead.outreachDraft = buildDraft(baseLead, state, "shortDirect");
    baseLead.followUpDraft = buildDraft(baseLead, state, "followUp1");
    return baseLead;
  }

  function qualify(text, options) {
    const t = text.toLowerCase();
    const leadKeywords = normalizeList(options.leadKeywords);
    const blockedKeywords = normalizeList(options.blockedKeywords);
    const matchedKeywords = [];
    const negativeSignals = [];
    let score = 0;

    const addIf = (points, terms) => {
      const hits = terms.filter(term => t.includes(term));
      if (hits.length) {
        score += points;
        matchedKeywords.push(...hits);
      }
    };

    leadKeywords.forEach(term => {
      const clean = term.toLowerCase();
      if (clean && t.includes(clean)) {
        score += 20;
        matchedKeywords.push(clean);
      }
    });

    addIf(30, ["looking for", "need help"]);
    addIf(25, ["hiring"]);
    addIf(25, ["paid", "budget"]);
    addIf(20, ["b2b", "founder", "startup"]);
    addIf(20, ["lead generation", "outbound", "cold email"]);
    addIf(15, ["remote", "work from home", "wfh", "anywhere", "remotely", "fully remote"]);
    addIf(15, ["freelance", "freelancer", "contract", "contractor", "gig", "part-time", "project-based"]);
    addIf(10, ["asap", "immediately", "this week", "urgent"]);

    const negativeMap = [
      { points: 30, terms: ["unpaid", "volunteer only", "free work"] },
      { points: 50, terms: ["job seeker", "looking for work", "student looking for internship", "internship"] },
      { points: 25, terms: blockedKeywords }
    ];
    negativeMap.forEach(group => {
      group.terms.filter(Boolean).forEach(term => {
        if (t.includes(term)) {
          score -= group.points;
          negativeSignals.push(term);
        }
      });
    });
    ["scam", "not hiring", "avoid this", "warning"].forEach(term => {
      if (t.includes(term)) {
        score -= 30;
        negativeSignals.push(term);
      }
    });

    if (options.includeFreelancePreset && isFreelanceRemoteLead(t)) {
      score += 35;
      matchedKeywords.push("freelance remote preset");
    }

    score = Math.max(0, Math.min(100, score));
    const temperature = score >= 80 ? "Hot" : score >= 50 ? "Warm" : score >= 25 ? "Review" : "Ignore";
    return {
      qualified: temperature !== "Ignore",
      score,
      temperature,
      matchedKeywords: [...new Set(matchedKeywords)].slice(0, 14),
      negativeSignals: [...new Set(negativeSignals)].slice(0, 8),
      intentSummary: [...new Set(matchedKeywords)].slice(0, 3).join(" / ")
    };
  }

  function isFreelanceRemoteLead(t) {
    const remote = ["remote", "work from home", "wfh", "anywhere", "remotely", "fully remote"].some(term => t.includes(term));
    const freelance = ["freelance", "freelancer", "contract", "contractor", "gig", "part-time", "project-based"].some(term => t.includes(term));
    const work = ["hiring", "looking for", "need someone", "paid", "project", "role", "opportunity", "client"].some(term => t.includes(term));
    return remote && freelance && work;
  }

  function duplicateKeys(adapter, communityName, candidate) {
    const keys = [];
    if (candidate.sourceUrl && candidate.sourceUrl !== location.href) keys.push(`source:${candidate.sourceUrl}`);
    if (candidate.authorProfileUrl) keys.push(`profile:${candidate.authorProfileUrl}`);
    if (candidate.authorName) keys.push(`author:${adapter.id}:${candidate.authorName.toLowerCase()}`);
    if (candidate.authorName && communityName) keys.push(`community-author:${adapter.id}:${communityName.toLowerCase()}:${candidate.authorName.toLowerCase()}`);
    keys.push(`text:${adapter.id}:${stableHash(candidate.text.slice(0, 500))}`);
    return keys;
  }

  function mark(el, kind, platformName, label) {
    if (!el || el.dataset.claMarked) return;
    el.dataset.claMarked = kind;
    const colors = {
      hot: "#22c55e",
      match: "#ff7a1a",
      checked: "#9ca3af",
      skipped: "#a855f7"
    };
    const color = colors[kind] || colors.checked;
    el.style.outline = `3px solid ${color}`;
    el.style.outlineOffset = "4px";
    const badge = document.createElement("div");
    badge.textContent = `${platformName}: ${label}`;
    badge.style.cssText = `position:sticky;top:0;z-index:999999;background:${color};color:#08111f;padding:6px 10px;border-radius:8px;font:12px system-ui;margin:6px;display:inline-block`;
    el.prepend(badge);
  }

  function getAdapter() {
    const host = location.hostname.toLowerCase();
    return ADAPTERS.find(adapter => adapter.hosts.some(pattern => pattern.test(host)));
  }

  function getAuthorName(el, adapter) {
    const attr = el.getAttribute?.("author") || el.getAttribute?.("data-author") || el.getAttribute?.("data-sender");
    if (attr) return cleanDisplayName(cleanRedditUser(attr));
    const node = firstMatching(el, adapter.authorSelectors);
    const raw = node?.getAttribute?.("aria-label") || node?.getAttribute?.("title") || node?.getAttribute?.("data-pre-plain-text") || node?.textContent || "";
    const fromHref = node?.getAttribute?.("href")?.match(/\/(?:user|u)\/([^/?#]+)/i)?.[1];
    return cleanDisplayName(fromHref || raw);
  }

  function getAuthorProfileUrl(el, adapter) {
    const node = firstMatching(el, adapter.profileSelectors);
    const href = node?.getAttribute?.("href") || "";
    try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; }
  }

  function getSourceUrl(el) {
    const href = el.getAttribute?.("permalink")
      || el.querySelector("a[href*='/comments/'], a[href*='/post/'], a[href*='/p/'], a[href*='/posts/'], a[href*='/archives/']")?.getAttribute("href")
      || "";
    try { return href ? new URL(href, location.origin).href : location.href; } catch { return location.href; }
  }

  function getTimestamp(el, adapter) {
    const node = firstMatching(el, adapter.timestampSelectors);
    return node?.getAttribute?.("datetime") || node?.getAttribute?.("aria-label") || node?.textContent?.trim() || "";
  }

  function firstMatching(el, selectors = []) {
    for (const selector of selectors) {
      try {
        const node = el.querySelector(selector);
        if (node) return node;
      } catch {}
    }
    return null;
  }

  function buildDraft(lead, state, templateKey) {
    const templates = { ...DEFAULT_TEMPLATES, ...(state.templates || {}) };
    const template = templates[templateKey] || templates.shortDirect;
    const kb = state.knowledgeBase || {};
    const values = {
      author: lead.authorName || "",
      platform: lead.platform || "",
      community: lead.communityName || "",
      post_snippet: lead.postSnippet || "",
      matched_keywords: (lead.matchedKeywords || []).join(", "),
      my_service: kb.myService || "",
      offer: kb.offer || "",
      cta: kb.cta || "",
      proof: kb.proof || "",
      ideal_customer_profile: kb.idealCustomerProfile || "",
      intent_summary: lead.intentSummary || ""
    };
    let draft = Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), String(template || ""));
    normalizeList(kb.blockedWords).forEach(word => {
      draft = draft.replace(new RegExp(escapeRegExp(word), "gi"), "");
    });
    return draft.replace(/\n{3,}/g, "\n\n").trim();
  }

  function mergeLists(...values) {
    return values.flatMap(value => normalizeList(value));
  }

  function normalizeList(value) {
    if (Array.isArray(value)) return value.map(String).map(item => item.trim().toLowerCase()).filter(Boolean);
    return String(value || "").split(/\r?\n|,/).map(item => item.trim().toLowerCase()).filter(Boolean);
  }

  function sectionFromPath(names) {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.find(part => names.includes(part.toLowerCase())) || parts[0] || "";
  }

  function doScroll() {
    const root = document.scrollingElement || document.documentElement || document.body;
    const distance = Math.floor(Math.max(window.innerHeight * 0.75, 500));
    try { window.scrollBy({ top: distance, behavior: "smooth" }); } catch { window.scrollBy(0, distance); }
    if (root) root.scrollTop += Math.floor(distance / 4);
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function safeText(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
  function truncate(value, n) { value = String(value || ""); return value.length > n ? value.slice(0, n - 3) + "..." : value; }
  function cleanRedditUser(value) { return String(value || "").replace(/^.*\/(user|u)\//i, "").replace(/^u\//i, ""); }
  function cleanDisplayName(value) { return normalize(value).replace(/\b(today|yesterday|edited|bot|app)\b/gi, "").replace(/[<>]/g, "").slice(0, 80); }
  function stableHash(value) { let h = 0; for (let i = 0; i < value.length; i++) h = ((h << 5) - h + value.charCodeAt(i)) | 0; return `h_${Math.abs(h)}`; }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function getScrollY() { return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0; }
  function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
})();
