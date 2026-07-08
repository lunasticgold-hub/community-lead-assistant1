import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getAdminModule } from "@/lib/admin/config";
import { bulkDeleteAdminRows, bulkUpdateAdminRows } from "@/lib/admin/data";

type Context = { params: Promise<{ module: string }> };

export async function PATCH(request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: rawModule } = await context.params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) return fail("Unknown admin module.", 404);
  if (!hasAdminModuleAccess(auth.access, rawModule, "edit")) return fail("Forbidden", 403);

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];

  try {
    return ok(await bulkUpdateAdminRows(moduleConfig, ids, body.values || {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not bulk update admin records.", 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: rawModule } = await context.params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) return fail("Unknown admin module.", 404);
  if (!hasAdminModuleAccess(auth.access, rawModule, "delete")) return fail("Forbidden", 403);

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];

  try {
    return ok(await bulkDeleteAdminRows(moduleConfig, ids));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not bulk delete admin records.", 500);
  }
}
