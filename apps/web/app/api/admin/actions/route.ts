import { fail, ok } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/auth";
import { getAdminModule, isAdminModuleSlug } from "@/lib/admin/config";
import { performAdminAction } from "@/lib/admin/data";

export async function POST(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const moduleSlug = String(body.module || "");
  const action = String(body.action || "");
  const id = String(body.id || "");

  if (!isAdminModuleSlug(moduleSlug) || !getAdminModule(moduleSlug)) return fail("Unknown admin module.", 404);
  if (!action || !id) return fail("Action and id are required.", 400);

  try {
    return ok(await performAdminAction({ moduleSlug, action, id, adminUserId: auth.user.id }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin action failed.", 500);
  }
}
