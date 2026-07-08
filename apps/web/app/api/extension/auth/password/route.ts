import { createClient } from "@supabase/supabase-js";
import { fail, ok } from "@/lib/api-response";
import { ensureUserWorkspace } from "@/lib/provisioning";
import { checkAccountAccess } from "@/lib/security/account-access";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createExtensionSessionToken } from "@/lib/extension-auth";
import { getExtensionBootstrap } from "@/lib/extension-bootstrap";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) return fail("Enter your email and password.", 400);

  try {
    const { url, anonKey } = getSupabaseBrowserEnv();
    const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return fail(error?.message || "Invalid email or password.", 401);
    const accountAccess = await checkAccountAccess(data.user.id);
    if (!accountAccess.allowed) return fail(accountAccess.reason, 403);

    const workspace = await ensureUserWorkspace(data.user);
    const session = await createExtensionSessionToken({
      workspaceId: workspace.id,
      userId: data.user.id,
      name: "Chrome extension email login"
    });
    const bootstrap = await getExtensionBootstrap(workspace.id);

    return ok({ token: session.token, ...bootstrap });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not sign in to the extension.", 500);
  }
}
