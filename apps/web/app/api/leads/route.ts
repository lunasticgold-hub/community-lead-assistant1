import { ok } from "@/lib/api-response";
import { leadFromDb } from "@/lib/db-mappers";
import { demoLeads } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ leads: demoLeads });
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return ok({ leads: demoLeads, warning: error.message });
  return ok({ leads: (data || []).map(leadFromDb) });
}
