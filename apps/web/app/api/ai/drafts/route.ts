import { fail, ok } from "@/lib/api-response";
import { defaultKnowledgeBase, defaultTemplates } from "@/lib/defaults";
import { buildDraftSet } from "@/lib/drafts";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const lead = body.lead || {};
  const workspaceId = body.workspaceId || lead.workspaceId;
  const knowledgeBase = body.knowledgeBase || defaultKnowledgeBase;
  const templates = body.templates || defaultTemplates;
  const fallbackDrafts = buildDraftSet(lead, knowledgeBase, templates);

  if (process.env.AI_DRAFTS_ENABLED === "false") {
    return ok({ provider: "local", drafts: fallbackDrafts, aiUsed: false });
  }

  if ((process.env.AI_PROVIDER || "gemini") !== "gemini") {
    return ok({ provider: "local", drafts: fallbackDrafts, aiUsed: false });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return ok({
      provider: "local",
      drafts: fallbackDrafts,
      aiUsed: false,
      message: "Gemini is not connected. Add GEMINI_API_KEY to enable AI drafts."
    });
  }

  const supabase = getSupabaseAdmin();
  let workspace: any = null;
  if (supabase && workspaceId) {
    const result = await supabase
      .from("workspaces")
      .select("id, plan, monthly_ai_draft_limit, monthly_ai_drafts_used, trial_ends_at")
      .eq("id", workspaceId)
      .maybeSingle();
    workspace = result.data;
    if (workspace?.plan === "trial" && workspace.trial_ends_at && new Date(workspace.trial_ends_at).getTime() < Date.now()) {
      return fail("Trial ended. Upgrade to a paid plan to generate more AI drafts.", 402);
    }
    if ((workspace?.monthly_ai_drafts_used ?? 0) >= (workspace?.monthly_ai_draft_limit ?? 50)) {
      return fail("AI draft limit reached. Upgrade to a paid plan to generate more drafts.", 402);
    }
  }

  const model = process.env.AI_DEFAULT_MODEL || "gemini-2.5-flash";
  const prompt = [
    "Write a short manual outreach opener for a community lead.",
    "Rules: do not imply automation, do not be pushy, do not mention scraping, and require human review before sending.",
    `Service: ${knowledgeBase.myService || ""}`,
    `Offer: ${knowledgeBase.offer || ""}`,
    `ICP: ${knowledgeBase.icp || ""}`,
    `Proof: ${knowledgeBase.proof || ""}`,
    `Tone: ${knowledgeBase.tone || "friendly and concise"}`,
    `CTA: ${knowledgeBase.cta || ""}`,
    `Blocked words: ${(knowledgeBase.blockedWords || []).join(", ")}`,
    `Lead author: ${lead.authorName || "there"}`,
    `Platform: ${lead.platform || ""}`,
    `Community: ${lead.communityName || ""}`,
    `Lead snippet: ${lead.postSnippet || lead.postText || ""}`,
    `Matched signals: ${(lead.matchedKeywords || []).join(", ")}`,
    "Return only the outreach draft text."
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 220 }
    })
  });

  if (!response.ok) {
    return fail(`Gemini draft generation failed with status ${response.status}`, 502);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
  if (text && supabase && workspace?.id) {
    await supabase
      .from("workspaces")
      .update({ monthly_ai_drafts_used: (workspace.monthly_ai_drafts_used ?? 0) + 1 })
      .eq("id", workspace.id);
  }
  return ok({
    provider: "gemini",
    model,
    aiUsed: Boolean(text),
    drafts: {
      ...fallbackDrafts,
      shortDirect: text || fallbackDrafts.shortDirect
    }
  });
}
