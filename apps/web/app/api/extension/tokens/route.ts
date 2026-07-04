import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { createExtensionSessionToken } from "@/lib/extension-auth";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "Chrome extension").slice(0, 80);
  try {
    const session = await createExtensionSessionToken({ workspaceId: auth.workspace.id, userId: auth.user.id, name });
    return ok(session);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create extension session.", 500);
  }
}

export async function GET() {
  return fail("Method not allowed", 405);
}
