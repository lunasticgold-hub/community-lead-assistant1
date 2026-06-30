globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "discord",
  platformName: "Discord Web",
  matchUrl: url => /discord\.com/i.test(url.hostname),
  getCommunityName: () => document.querySelector("[aria-label*='Channel header'], [class*='title']")?.textContent?.replace(/^#/, "").trim() || "Discord channel",
  getVisibleItems: () => [...document.querySelectorAll("li[id^='chat-messages-'], div[id^='chat-messages-'], [class*='messageListItem'], article")],
  extractAuthor: item => clean(item.querySelector("[class*='username'], h3, strong")?.textContent || "Unknown member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='/users/'], a[href*='/channels/']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='/channels/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /sponsored|promoted/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
