import { ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { leadFromDb } from "@/lib/db-mappers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ leads: [] });
  const { data, error } = await supabase.from("leads").select("*").eq("workspace_id", auth.workspace.id).order("created_at", { ascending: false }).limit(500);
  if (error) return ok({ leads: [], warning: error.message });
  return ok({ leads: (data || []).map(leadFromDb) });
}
