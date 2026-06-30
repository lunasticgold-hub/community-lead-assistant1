globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "slack",
  platformName: "Slack Web",
  matchUrl: url => /\.slack\.com$/i.test(url.hostname),
  getCommunityName: () => document.querySelector("[data-qa='channel_name'], [data-qa='channel_header_name']")?.textContent?.replace(/^#/, "").trim() || "Slack channel",
  getVisibleItems: () => [...document.querySelectorAll("[data-qa='virtual-list-item'], [data-qa='message_container'], .c-message_kit__gutter, .c-virtual_list__item, [role='listitem']")],
  extractAuthor: item => clean(item.querySelector("[data-qa='message_sender'], [class*='sender'], button[data-qa*='user'], strong")?.textContent || "Unknown member"),
  extractAuthorProfileUrl: item => absolute(item.querySelector("a[href*='/team/'], a[href*='/archives/']")?.getAttribute("href") || ""),
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: item => absolute(item.querySelector("a[href*='/archives/']")?.getAttribute("href") || location.href),
  detectPromotedOrSponsored: item => /sponsored|promoted/i.test(item.innerText || ""),
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.authorProfileUrl || lead.sourceUrl
});
function absolute(href) { try { return href ? new URL(href, location.origin).href : ""; } catch { return ""; } }
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
