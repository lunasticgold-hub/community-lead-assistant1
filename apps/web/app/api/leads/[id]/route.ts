import { fail, ok } from "@/lib/api-response";
import { leadFromDb, leadToDb } from "@/lib/db-mappers";
import { demoLeads } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ lead: demoLeads.find(lead => lead.id === params.id) || demoLeads[0] });
  const { data, error } = await supabase.from("leads").select("*").eq("id", params.id).single();
  if (error) return fail(error.message, 404);
  return ok({ lead: leadFromDb(data) });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ lead: { id: params.id, ...body }, localOnly: true });
  const { data, error } = await supabase.from("leads").update(leadToDb(body)).eq("id", params.id).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ lead: leadFromDb(data) });
}
