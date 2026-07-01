import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { leadFromDb, leadToDb } from "@/lib/db-mappers";
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
  return ok({ lead: leadFromDb(data) });
}

export async function PATCH(request: Request, context: LeadRouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);
  const { data, error } = await supabase.from("leads").update(leadToDb(body)).eq("workspace_id", auth.workspace.id).eq("id", id).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ lead: leadFromDb(data) });
}
