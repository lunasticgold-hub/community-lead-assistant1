globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "telegram",
  platformName: "Telegram Web",
  matchUrl: url => /^web\.telegram\.org$/i.test(url.hostname),
  getCommunityName: () => document.querySelector(".chat-info .title, .ChatInfo .title, [class*='chat-title']")?.textContent?.trim() || "Telegram chat",
  getVisibleItems: () => [...document.querySelectorAll(".message, .Message, .bubble, [class*='message']")],
  extractAuthor: item => clean(item.querySelector(".sender-title, .message-title, [class*='sender'], strong")?.textContent || "Unknown member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='t.me/']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='t.me/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: () => false,
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
