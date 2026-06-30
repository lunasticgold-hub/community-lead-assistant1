import { ok } from "@/lib/api-response";
import { demoLeads } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok(buildStats(demoLeads));
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  return ok(buildStats(data || []));
}

function buildStats(leads: any[]) {
  return {
    leadsToday: leads.length,
    hotLeads: leads.filter(lead => (lead.leadTemperature || lead.lead_temperature) === "Hot").length,
    draftsOpened: 14,
    followUpsDue: leads.filter(lead => lead.status === "Follow-up Due").length,
    activePlatforms: Array.from(new Set(leads.map(lead => lead.platform))).slice(0, 8),
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

function countTop(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));
}
