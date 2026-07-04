globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "x",
  platformName: "X (Twitter)",
  matchUrl: url => /(^|\.)x\.com$/i.test(url.hostname) || /(^|\.)twitter\.com$/i.test(url.hostname),
  getCommunityName: () => location.pathname.startsWith("/search") ? "X Search" : "X",
  getVisibleItems: () => [...document.querySelectorAll("article[data-testid='tweet'], article")],
  extractAuthor: item => clean(item.querySelector("div[data-testid='User-Name'] a[href^='/'] span, a[href^='/'] span")?.textContent || "X user"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("div[data-testid='User-Name'] a[href^='/'], a[href^='/']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='/status/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /promoted|ad$/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).replace(/^@/, "").slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
