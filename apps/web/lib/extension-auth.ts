import { createHash } from "crypto";
import { demoBootstrap } from "./mock-data";
import { getSupabaseAdmin } from "./supabase-admin";

export function hashExtensionToken(token: string): string {
  const pepper = process.env.EXTENSION_SHARED_SECRET || process.env.EXTENSION_TOKEN_PEPPER || "local-dev-pepper";
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

export async function authenticateExtensionToken(token: string) {
  if (!token) return null;
  if (token === "demo-token") {
    return {
      workspaceId: "demo-workspace",
      userId: "demo-user",
      bootstrap: demoBootstrap
    };
  }

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
