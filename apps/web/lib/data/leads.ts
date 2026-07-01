import "server-only";
import { leadFromDb } from "../db-mappers";
import { getSupabaseAdmin } from "../supabase-admin";
import type { Lead } from "../types";

export async function getWorkspaceLeads(workspaceId: string, limit = 500): Promise<Lead[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(leadFromDb);
}
