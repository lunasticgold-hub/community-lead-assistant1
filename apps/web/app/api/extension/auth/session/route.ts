import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { createExtensionSessionToken } from "@/lib/extension-auth";
import { getExtensionBootstrap } from "@/lib/extension-bootstrap";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  try {
    const session = await createExtensionSessionToken({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      name: "Chrome extension website session"
    });
    const bootstrap = await getExtensionBootstrap(auth.workspace.id);
    return ok({ token: session.token, ...bootstrap });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not connect the website session.", 500);
  }
}
