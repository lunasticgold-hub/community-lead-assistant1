import { ok } from "@/lib/api-response";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ errors: [{ id: "demo-error", platform: "facebook", error_message: "Selector changed", created_at: new Date().toISOString() }] });
  const { data } = await supabase.from("extension_errors").select("*").order("created_at", { ascending: false }).limit(200);
  return ok({ errors: data || [] });
}
