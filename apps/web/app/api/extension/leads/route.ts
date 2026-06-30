import { fail, ok } from "@/lib/api-response";
import { leadToDb } from "@/lib/db-mappers";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => ({}));
  const leads = Array.isArray(body.leads) ? body.leads : [body.lead].filter(Boolean);
  if (!leads.length) return ok({ synced: 0 });

  const rows = leads.map((lead: any) => leadToDb({ ...lead, workspaceId: auth.workspaceId, ownerId: auth.userId }));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ synced: rows.length, localOnly: true });

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, plan, billing_status, monthly_lead_limit, monthly_leads_used, trial_ends_at")
    .eq("id", auth.workspaceId)
    .maybeSingle();

  if (workspace?.plan === "trial" && workspace.trial_ends_at && new Date(workspace.trial_ends_at).getTime() < Date.now()) {
    return fail("Trial ended. Upgrade to a paid plan to sync more leads.", 402);
  }

  const duplicateKeys = rows.map((row: any) => row.duplicate_key).filter(Boolean);
  const { data: existingRows } = duplicateKeys.length
    ? await supabase.from("leads").select("duplicate_key").eq("workspace_id", auth.workspaceId).in("duplicate_key", duplicateKeys)
    : { data: [] as any[] };
  const existing = new Set((existingRows || []).map((row: any) => row.duplicate_key));
  const newRows = rows.filter((row: any) => !existing.has(row.duplicate_key));
  const remaining = Math.max(0, (workspace?.monthly_lead_limit ?? 50) - (workspace?.monthly_leads_used ?? 0));
  const allowedNewKeys = new Set(newRows.slice(0, remaining).map((row: any) => row.duplicate_key));
  const allowedRows = rows.filter((row: any) => existing.has(row.duplicate_key) || allowedNewKeys.has(row.duplicate_key));

  if (!allowedRows.length) {
    return fail("Lead limit reached. Upgrade to a paid plan to sync more leads.", 402);
  }

  const { error } = await supabase.from("leads").upsert(allowedRows, { onConflict: "workspace_id,duplicate_key" });
  if (error) return fail(error.message, 500);
  if (allowedNewKeys.size) {
    await supabase
      .from("workspaces")
      .update({ monthly_leads_used: (workspace?.monthly_leads_used ?? 0) + allowedNewKeys.size })
      .eq("id", auth.workspaceId);
  }
  return ok({ synced: allowedRows.length, limitReached: allowedRows.length < rows.length });
}
