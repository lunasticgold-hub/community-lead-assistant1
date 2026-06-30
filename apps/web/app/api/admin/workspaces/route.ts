import { ok } from "@/lib/api-response";
import { demoWorkspace } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ workspaces: [demoWorkspace] });
  const { data } = await supabase.from("workspaces").select("*").order("created_at", { ascending: false }).limit(200);
  return ok({ workspaces: data || [] });
}
