globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "linkedin",
  platformName: "LinkedIn",
  matchUrl: url => /linkedin\.com$/i.test(url.hostname) || /linkedin\.com/i.test(url.hostname),
  getCommunityName: () => clean(document.querySelector("h1, .groups-details-top-card__name, [data-test-group-name]")?.textContent || location.pathname.match(/\/groups\/([^/]+)/i)?.[1] || "LinkedIn"),
  getVisibleItems: () => [...document.querySelectorAll("div.feed-shared-update-v2, div.occludable-update, div[data-urn*='activity'], div[data-id*='urn:li:activity'], article, div.comments-comment-item, div.feed-shared-inline-show-more-text")],
  extractCommunityUrl: () => {
    const group = location.pathname.match(/\/groups\/([^/]+)/i)?.[1];
    return group ? `${location.origin}/groups/${group}/` : location.origin;
  },
  extractAuthor: item => clean(item.querySelector(".update-components-actor__title, .feed-shared-actor__title, .comments-comment-meta__description-title, span[dir='ltr'], a[href*='/in/']")?.textContent || "LinkedIn member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='/in/'], a[href*='/company/']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='activity'], a[href*='posts'], a[href*='feed/update']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /promoted|sponsored/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).replace(/\s+(1st|2nd|3rd).*$/i, "").slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
