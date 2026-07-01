import { fail, ok } from "@/lib/api-response";
import { authenticateExtensionToken } from "@/lib/extension-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const auth = await authenticateExtensionToken(token);
  if (!auth) return fail("Invalid or revoked extension token", 401);
  return ok({
    workspaceId: auth.workspaceId,
    userId: auth.userId
  });
}
