globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "indiehackers",
  platformName: "Indie Hackers",
  matchUrl: url => /indiehackers\.com/i.test(url.hostname),
  getCommunityName: () => location.pathname.split("/").filter(Boolean)[0] || "Indie Hackers",
  getVisibleItems: () => [...document.querySelectorAll("article, [data-test*='post'], [data-testid*='post'], main section, div[class*='post']")],
  extractAuthor: item => clean(item.querySelector("a[href*='/@'], a[href*='/user'], [class*='author'], h3, strong")?.textContent || "Unknown member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='/@'], a[href*='/user']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='/post/'], a[href*='/p/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /sponsored|promoted/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
