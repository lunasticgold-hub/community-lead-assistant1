import { toCsv } from "@/lib/csv";
import { leadFromDb } from "@/lib/db-mappers";
import { demoLeads } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  let leads = demoLeads;
  if (supabase) {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5000);
    leads = (data || []).map(leadFromDb);
  }
  const headers = [
    "id",
    "platform",
    "communityName",
    "authorName",
    "authorProfileUrl",
    "sourceUrl",
    "leadScore",
    "leadTemperature",
    "status",
    "matchedKeywords",
    "negativeSignals",
    "notes",
    "followUpDate",
    "outreachDraft",
    "createdAt"
  ];
  return new Response(toCsv(leads as any[], headers), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=community-leads.csv"
    }
  });
}
