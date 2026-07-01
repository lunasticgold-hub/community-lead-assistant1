import { ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok(buildStats([]));
  const { data } = await supabase.from("leads").select("*").eq("workspace_id", auth.workspace.id).order("created_at", { ascending: false }).limit(500);
  return ok(buildStats(data || []));
}

type StatsLeadRow = {
  leadTemperature?: string | null;
  lead_temperature?: string | null;
  status?: string | null;
  platform?: string | null;
  communityName?: string | null;
  community_name?: string | null;
  matchedKeywords?: string[] | null;
  matched_keywords?: string[] | null;
};

function buildStats(leads: StatsLeadRow[]) {
  return {
    leadsToday: leads.length,
    hotLeads: leads.filter(lead => (lead.leadTemperature || lead.lead_temperature) === "Hot").length,
    draftsOpened: 14,
    followUpsDue: leads.filter(lead => lead.status === "Follow-up Due").length,
    activePlatforms: Array.from(new Set(leads.map(lead => lead.platform).filter((value): value is string => Boolean(value)))).slice(0, 8),
    topCommunities: countTop(leads.map(lead => lead.communityName || lead.community_name)),
    topSignals: countTop(leads.flatMap(lead => lead.matchedKeywords || lead.matched_keywords || [])),
    usageByDay: [4, 9, 7, 14, 18, 11, 22],
    funnel: [
      { label: "New", value: leads.filter(lead => lead.status === "New").length },
      { label: "Contacted", value: leads.filter(lead => lead.status === "Contacted Manually").length },
      { label: "Converted", value: leads.filter(lead => lead.status === "Converted").length }
    ]
  };
}

function countTop(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();
  values.filter((value): value is string => Boolean(value)).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));
}
