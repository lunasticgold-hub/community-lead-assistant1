import { ok } from "@/lib/api-response";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ users: [{ id: "demo-user", email: "founder@example.com", name: "Demo Founder", plan: "trial" }] });
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(200);
  return ok({ users: data || [] });
}
