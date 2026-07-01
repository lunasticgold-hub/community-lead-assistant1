import { requireApiUser } from "@/lib/api-auth";
import { toCsv } from "@/lib/csv";
import { leadFromDb } from "@/lib/db-mappers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  let leads: ReturnType<typeof leadFromDb>[] = [];
  if (supabase) {
    const { data } = await supabase.from("leads").select("*").eq("workspace_id", auth.workspace.id).order("created_at", { ascending: false }).limit(5000);
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
  const csvRows: Record<string, unknown>[] = leads.map(lead => ({ ...lead }));
  return new Response(toCsv(csvRows, headers), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=community-leads.csv"
    }
  });
}
