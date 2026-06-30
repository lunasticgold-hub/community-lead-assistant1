globalThis.CLA_ADAPTERS = globalThis.CLA_ADAPTERS || [];
globalThis.CLA_ADAPTERS.push({
  id: "whatsapp",
  platformName: "WhatsApp Web",
  matchUrl: url => /^web\.whatsapp\.com$/i.test(url.hostname),
  getCommunityName: () => document.querySelector("header span[title]")?.getAttribute("title") || "WhatsApp chat",
  getVisibleItems: () => [...document.querySelectorAll("div.copyable-text, [data-testid='msg-container'], .message-in, .message-out")],
  extractAuthor: item => clean(item.getAttribute("data-pre-plain-text") || item.querySelector("span[dir='auto']")?.textContent || "Unknown member"),
  extractAuthorProfileUrl: () => "",
  extractText: item => normalize(item.innerText || item.textContent || ""),
  extractSourceUrl: () => location.href,
  detectPromotedOrSponsored: () => false,
  highlightItem: (item, status) => highlight(item, status),
  openManualOutreachTarget: lead => lead.sourceUrl
});
function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function clean(value) { return normalize(value).replace(/^\[[^\]]+\]\s*/, "").replace(/:.*$/, "").slice(0, 80); }
function highlight(item, status) { const color = { hot: "#22c55e", match: "#ff7a1a", checked: "#9ca3af", skipped: "#a855f7" }[status] || "#9ca3af"; item.style.outline = `3px solid ${color}`; item.style.outlineOffset = "4px"; }
