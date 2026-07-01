import { ok } from "@/lib/api-response";
import { requireApiAdmin } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ workspaces: [] });
  const { data } = await supabase.from("workspaces").select("*").order("created_at", { ascending: false }).limit(200);
  return ok({ workspaces: data || [] });
}
