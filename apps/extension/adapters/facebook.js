globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "facebook",
  platformName: "Facebook Groups",
  matchUrl: url => /facebook\.com/i.test(url.hostname) && /\/groups\//i.test(url.pathname),
  getCommunityName: () => document.querySelector("h1, [role='main'] h2")?.textContent?.trim() || "Facebook group",
  getVisibleItems: () => [...document.querySelectorAll("div[role='article'], [data-pagelet*='FeedUnit'], [data-ad-preview='message']")],
  extractAuthor: item => clean(item.querySelector("h2 a, h3 a, strong a, span[dir='auto'] a")?.textContent || "Unknown member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("h2 a[href], h3 a[href], strong a[href]")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='/posts/'], a[href*='permalink']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /sponsored|paid partnership|suggested for you/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
