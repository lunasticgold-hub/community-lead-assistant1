import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { normalizeLeadPerson } from "@/lib/lead-identity";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type FraudRouteContext = { params: Promise<{ id: string }> };

type LeadFraudRow = {
  id: string;
  workspace_id: string;
  platform: string;
  author_name: string | null;
  author_profile_url: string | null;
};

export async function POST(request: Request, context: FraudRouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "Marked as fraud by workspace user";
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, workspace_id, platform, author_name, author_profile_url")
    .eq("workspace_id", auth.workspace.id)
    .eq("id", id)
    .maybeSingle();

  if (leadError) return fail(leadError.message, 500);
  if (!lead) return fail("Lead not found.", 404);

  const row = lead as LeadFraudRow;
  const platform = String(row.platform || "").toLowerCase();
  const normalizedAuthorKey = normalizeLeadPerson(row.author_name);
  const normalizedProfileKey = normalizeLeadPerson(row.author_profile_url);

  if (!platform || (!normalizedAuthorKey && !normalizedProfileKey)) {
    return fail("This lead does not include enough identity data to block.", 400);
  }

  const { error: insertError } = await supabase
    .from("lead_fraud_profiles")
    .upsert({
      platform,
      author_name: row.author_name || "",
      author_profile_url: row.author_profile_url || "",
      normalized_author_key: normalizedAuthorKey || null,
      normalized_profile_key: normalizedProfileKey || null,
      reason,
      reported_by_user_id: auth.user.id,
      workspace_id: auth.workspace.id,
      lead_id: row.id
    }, { onConflict: normalizedAuthorKey ? "platform,normalized_author_key" : "platform,normalized_profile_key" });

  if (insertError && insertError.code !== "23505") return fail(insertError.message, 500);

  const { error: updateError } = await supabase
    .from("leads")
    .update({ status: "Fraud", updated_at: new Date().toISOString() })
    .eq("workspace_id", auth.workspace.id)
    .eq("id", row.id);

  if (updateError) return fail(updateError.message, 500);

  await supabase.from("lead_events").insert({
    workspace_id: auth.workspace.id,
    lead_id: row.id,
    user_id: auth.user.id,
    event_type: "lead_marked_fraud",
    metadata: { platform, normalizedAuthorKey, normalizedProfileKey, reason }
  }).then(() => undefined);

  return ok({ blocked: true });
}
