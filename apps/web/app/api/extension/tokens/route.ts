import { randomBytes } from "crypto";
import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { hashExtensionToken } from "@/lib/extension-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "Chrome extension").slice(0, 80);
  const token = `cla_${randomBytes(32).toString("hex")}`;
  const tokenHash = hashExtensionToken(token);

  const { data, error } = await supabase
    .from("extension_tokens")
    .insert({
      workspace_id: auth.workspace.id,
      user_id: auth.user.id,
      token_hash: tokenHash,
      name
    })
    .select("id, name, created_at")
    .single();

  if (error) return fail(error.message, 500);
  return ok({ token, tokenRecord: data });
}

export async function GET() {
  return fail("Method not allowed", 405);
}
