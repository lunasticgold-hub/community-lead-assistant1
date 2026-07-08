import "server-only";
import { addCreatorEmailsToLeadRows } from "./lead-enrichment";
import { leadFromDb } from "../db-mappers";
import { getSupabaseAdmin } from "../supabase-admin";
import type { Lead } from "../types";

type WorkspaceLeadOptions = {
  uniqueOnly?: boolean;
  hideFraud?: boolean;
};

export async function getWorkspaceLeads(workspaceId: string, limit = 500, options: WorkspaceLeadOptions = {}): Promise<Lead[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const enrichedRows = await addCreatorEmailsToLeadRows(supabase, (data || []) as Record<string, unknown>[]);
  const leads = enrichedRows.map(leadFromDb);
  const visibleLeads = options.hideFraud === false ? leads : leads.filter(lead => lead.status !== "Fraud");
  return options.uniqueOnly ? uniqueLeads(visibleLeads) : visibleLeads;
}

function uniqueLeads(leads: Lead[]) {
  const seen = new Set<string>();
  return leads.filter(lead => {
    const key = lead.globalIdentityKey || lead.duplicateKey || `${lead.platform}:${lead.authorProfileUrl || lead.authorName}:${lead.postText.slice(0, 300)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
