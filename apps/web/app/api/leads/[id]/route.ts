import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { addCreatorEmailsToLeadRows } from "@/lib/data/lead-enrichment";
import { leadFromDb, leadPatchToDb } from "@/lib/db-mappers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type LeadRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: LeadRouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);
  const { data, error } = await supabase.from("leads").select("*").eq("workspace_id", auth.workspace.id).eq("id", id).single();
  if (error) return fail(error.message, 404);
  const [enrichedRow] = await addCreatorEmailsToLeadRows(supabase, [data as Record<string, unknown>]);
  return ok({ lead: leadFromDb(enrichedRow) });
}

export async function PATCH(request: Request, context: LeadRouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);
  const { data, error } = await supabase.from("leads").update(leadPatchToDb(body)).eq("workspace_id", auth.workspace.id).eq("id", id).select("*").single();
  if (error) return fail(error.message, 500);
  const [enrichedRow] = await addCreatorEmailsToLeadRows(supabase, [data as Record<string, unknown>]);
  return ok({ lead: leadFromDb(enrichedRow) });
}
