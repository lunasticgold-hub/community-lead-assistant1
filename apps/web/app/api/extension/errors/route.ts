import { fail, ok } from "@/lib/api-response";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ saved: true, localOnly: true });
  const { error } = await supabase.from("extension_errors").insert({
    workspace_id: auth.workspaceId,
    user_id: auth.userId,
    extension_version: body.extensionVersion || null,
    platform: body.platform || null,
    error_message: body.errorMessage || body.message || "Unknown extension error",
    stack: body.stack || null,
    metadata: body.metadata || {}
  });
  if (error) return fail(error.message, 500);
  return ok({ saved: true });
}
