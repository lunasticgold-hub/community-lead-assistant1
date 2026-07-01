import { fail, ok } from "@/lib/api-response";
import { requireApiAdmin } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  const [leads, workspaces, users, errors] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("workspaces").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("extension_errors").select("id", { count: "exact", head: true })
  ]);

  return ok({
    totalUsers: users.count || 0,
    activeToday: 0,
    activeThisMonth: 0,
    workspaces: workspaces.count || 0,
    totalLeads: leads.count || 0,
    draftsCopiedOpened: 0,
    exports: 0,
    failedSyncEvents: errors.count || 0,
    extensionVersions: []
  });
}
