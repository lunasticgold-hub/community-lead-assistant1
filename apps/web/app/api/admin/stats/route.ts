import { ok } from "@/lib/api-response";
import { demoLeads } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return ok({
      totalUsers: 12,
      activeToday: 5,
      activeThisMonth: 10,
      workspaces: 7,
      totalLeads: demoLeads.length,
      draftsCopiedOpened: 19,
      exports: 3,
      failedSyncEvents: 1,
      extensionVersions: [{ version: "1.0.0", users: 12 }]
    });
  }
  const [leads, workspaces, errors] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("workspaces").select("id", { count: "exact", head: true }),
    supabase.from("extension_errors").select("id", { count: "exact", head: true })
  ]);
  return ok({
    totalUsers: 0,
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
