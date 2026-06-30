globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "reddit",
  platformName: "Reddit",
  matchUrl: url => /reddit\.com\/r\//i.test(url.href),
  getCommunityName: () => location.pathname.match(/\/r\/([^/]+)/i)?.[1] || "Reddit",
  getVisibleItems: () => [...document.querySelectorAll("shreddit-post, article, div[data-testid='post-container'], div.thing, div[data-click-id='background']")],
  extractAuthor: item => clean(item.getAttribute?.("author") || item.getAttribute?.("data-author") || item.querySelector("a[href*='/user/'], a[href*='/u/'], a.author, [data-click-id='user']")?.textContent || ""),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='/user/'], a[href*='/u/']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.getAttribute?.("permalink") || item.querySelector("a[href*='/comments/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /promoted|sponsored|advertise/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => `https://www.reddit.com/message/compose/?${new URLSearchParams({ to: lead.authorName, message: lead.outreachDraft || "" })}`
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).replace(/^.*\/(user|u)\//i, "").replace(/^u\//i, "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
