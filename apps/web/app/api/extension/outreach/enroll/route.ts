import { fail, ok } from "@/lib/api-response";
import { leadToDb } from "@/lib/db-mappers";
import { defaultSequenceSteps } from "@/lib/outreach";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
<<<<<<< HEAD
=======
import { normalizeLeadPerson } from "@/lib/lead-identity";
>>>>>>> 5584f3d (Prepare production deployment)
import { createSequence, enrollLeadInSequence } from "@/lib/outreach";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Lead } from "@/lib/types";

function duplicateKeyForProfile(lead: Partial<Lead>) {
  if (lead.authorProfileUrl) return `profile:${lead.authorProfileUrl}`;
  if (lead.sourceUrl) return `source:${lead.sourceUrl}`;
  return `profile:${lead.platform}:${lead.authorName || "unknown"}`.toLowerCase();
}

export async function POST(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => ({}));
  const profile = body.profile && typeof body.profile === "object" ? body.profile as Partial<Lead> : {};
  const platform = String(profile.platform || body.platform || "");
  const authorName = String(profile.authorName || body.authorName || "").trim();
  if (!platform || !authorName) return fail("Platform and author name are required.", 400);

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

<<<<<<< HEAD
=======
  const blocked = await isFraudBlocked(supabase, {
    platform,
    authorName,
    authorProfileUrl: String(profile.authorProfileUrl || profile.sourceUrl || "")
  });
  if (blocked) return fail("This profile was marked as fraud and cannot be added to outreach.", 409);

>>>>>>> 5584f3d (Prepare production deployment)
  const leadPayload: Partial<Lead> = {
    workspaceId: auth.workspaceId,
    campaignId: typeof profile.campaignId === "string" ? profile.campaignId : "",
    platform,
    communityName: String(profile.communityName || "Profile"),
    communityUrl: String(profile.communityUrl || ""),
    authorName,
    authorProfileUrl: String(profile.authorProfileUrl || profile.sourceUrl || ""),
    sourceUrl: String(profile.sourceUrl || profile.authorProfileUrl || ""),
    postText: String(profile.postText || profile.postSnippet || `Profile captured for ${authorName}`),
    postSnippet: String(profile.postSnippet || `Profile captured for ${authorName}`),
    matchedKeywords: Array.isArray(profile.matchedKeywords) ? profile.matchedKeywords : ["profile"],
    negativeSignals: [],
    leadScore: Number(profile.leadScore || 50),
    leadTemperature: "Warm",
    status: "Reviewed",
    notes: "Added to outreach sequence from Chrome extension profile overlay.",
    ownerId: auth.userId,
    followUpDate: null,
    outreachDraft: "",
    followUpDraft: "",
    duplicateKey: duplicateKeyForProfile(profile),
    platformUserId: String(profile.platformUserId || ""),
    profileVariables: profile.profileVariables || {}
  };

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .upsert(leadToDb(leadPayload), { onConflict: "workspace_id,duplicate_key" })
    .select("*")
    .single();
  if (leadError) return fail(leadError.message, 500);

  const { data: existingSequence, error: sequenceError } = await supabase
    .from("outreach_sequences")
    .select("id")
    .eq("workspace_id", auth.workspaceId)
    .eq("status", "active")
    .eq("target_platform", platform)
    .limit(1)
    .maybeSingle();
  if (sequenceError) return fail(sequenceError.message, 500);

  let sequence = existingSequence;
  if (!sequence?.id) {
    const created = await createSequence({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      name: `${platform} manual outreach`,
      objective: "Review and send profile-based outreach manually.",
      targetPlatform: platform,
      dailyReviewLimit: 25,
      status: "active",
      steps: defaultSequenceSteps()
    });
    sequence = { id: created.id };
  }

  try {
    const result = await enrollLeadInSequence({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      leadId: String(lead.id),
      sequenceId: String(sequence.id)
    });
    return ok({ leadId: lead.id, sequenceId: sequence.id, ...result }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not add profile to sequence.", 500);
  }
}
<<<<<<< HEAD
=======

async function isFraudBlocked(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  input: { platform: string; authorName: string; authorProfileUrl: string }
) {
  const platform = input.platform.toLowerCase();
  const authorKey = normalizeLeadPerson(input.authorName);
  const profileKey = normalizeLeadPerson(input.authorProfileUrl);
  const checks = [];

  if (authorKey) {
    checks.push(
      supabase
        .from("lead_fraud_profiles")
        .select("id")
        .eq("platform", platform)
        .eq("normalized_author_key", authorKey)
        .limit(1)
    );
  }

  if (profileKey) {
    checks.push(
      supabase
        .from("lead_fraud_profiles")
        .select("id")
        .eq("platform", platform)
        .eq("normalized_profile_key", profileKey)
        .limit(1)
    );
  }

  if (!checks.length) return false;
  const results = await Promise.all(checks);
  return results.some(result => !result.error && Boolean(result.data?.length));
}
>>>>>>> 5584f3d (Prepare production deployment)
