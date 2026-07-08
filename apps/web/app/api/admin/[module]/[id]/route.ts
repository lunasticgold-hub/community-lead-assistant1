import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getAdminModule } from "@/lib/admin/config";
import { deleteAdminRow, updateAdminRow } from "@/lib/admin/data";

type Context = { params: Promise<{ module: string; id: string }> };

export async function PATCH(request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const { module: rawModule, id } = await context.params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) return fail("Unknown admin module.", 404);
  if (!hasAdminModuleAccess(auth.access, rawModule, "edit")) return fail("Forbidden", 403);

  const body = await request.json().catch(() => ({}));

  try {
    return ok({ row: await updateAdminRow(moduleConfig, id, body) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update admin record.", 500);
  }
}

export async function DELETE(_request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const { module: rawModule, id } = await context.params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) return fail("Unknown admin module.", 404);
  if (!hasAdminModuleAccess(auth.access, rawModule, "delete")) return fail("Forbidden", 403);

  try {
    return ok(await deleteAdminRow(moduleConfig, id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete admin record.", 500);
  }
}
