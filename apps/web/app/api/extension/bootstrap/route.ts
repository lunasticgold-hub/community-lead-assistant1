import { fail, ok } from "@/lib/api-response";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
import { getExtensionBootstrap } from "@/lib/extension-bootstrap";

export async function GET(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);

  try {
    return ok(await getExtensionBootstrap(auth.workspaceId));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load workspace settings.", 500);
  }
}
