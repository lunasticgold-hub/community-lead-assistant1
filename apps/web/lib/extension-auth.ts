import { createHash } from "crypto";
import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "./supabase-admin";

export function hashExtensionToken(token: string): string {
  const pepper = process.env.EXTENSION_SHARED_SECRET;
  if (!pepper) throw new Error("EXTENSION_SHARED_SECRET is not configured.");
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

export async function createExtensionSessionToken(input: { workspaceId: string; userId: string; name?: string }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  const token = `cla_${randomBytes(32).toString("hex")}`;
  const tokenHash = hashExtensionToken(token);
  const { data, error } = await supabase
    .from("extension_tokens")
    .insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      token_hash: tokenHash,
      name: input.name || "Chrome extension session"
    })
    .select("id, name, created_at")
    .single();

  if (error) throw error;
  return { token, tokenRecord: data };
}

export async function authenticateExtensionToken(token: string) {
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const tokenHash = hashExtensionToken(token);
  const { data, error } = await supabase
    .from("extension_tokens")
    .select("id, workspace_id, user_id, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error || !data || data.revoked_at) return null;
  await supabase.from("extension_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return {
    workspaceId: data.workspace_id as string,
    userId: data.user_id as string,
    bootstrap: null
  };
}

export function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}
