globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "producthunt",
  platformName: "Product Hunt",
  matchUrl: url => /producthunt\.com/i.test(url.hostname),
  getCommunityName: () => document.querySelector("h1")?.textContent?.trim() || "Product Hunt",
  getVisibleItems: () => [...document.querySelectorAll("article, div[data-test*='post'], div[data-sentry-component*='Comment']")],
  extractAuthor: item => clean(item.querySelector("a[href*='/@'], [class*='user'], strong")?.textContent || "Product Hunt member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='/@']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='/posts/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /promoted|sponsored|ad by/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).replace(/^@/, "").slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
