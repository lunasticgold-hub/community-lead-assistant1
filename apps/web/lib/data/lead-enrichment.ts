import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

type LeadRow = Record<string, unknown>;

export async function addCreatorEmailsToLeadRows(supabase: SupabaseClient, rows: LeadRow[]) {
  const missingOwnerIds = Array.from(new Set(
    rows
      .filter(row => !row.creator_email && typeof row.owner_id === "string")
      .map(row => String(row.owner_id))
  ));

  if (!missingOwnerIds.length) return rows;

  const { data, error } = await supabase
    .from("users")
    .select("id,email")
    .in("id", missingOwnerIds);

  if (error) return rows;

  const emails = new Map((data || []).map(user => [String(user.id), String(user.email || "")]));

  return rows.map(row => {
    if (row.creator_email || typeof row.owner_id !== "string") return row;
    return { ...row, creator_email: emails.get(row.owner_id) || "" };
  });
}
