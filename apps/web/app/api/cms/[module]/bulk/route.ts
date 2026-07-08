import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getCmsModule } from "@/lib/cms/config";
import { bulkDeleteCmsRows, bulkUpdateCmsRows } from "@/lib/cms/data";

type CmsBulkRouteContext = { params: Promise<{ module: string }> };

export async function PATCH(request: Request, context: CmsBulkRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "edit") && !hasAdminModuleAccess(auth.access, "cms", "edit")) return fail("Forbidden", 403);

  try {
    const payload = await request.json().catch(() => ({}));
    const ids = Array.isArray(payload.ids) ? payload.ids.map(String).filter(Boolean) : [];
    return ok(await bulkUpdateCmsRows(cmsModule, ids, payload.values || {}, auth.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not bulk update CMS records.", 500);
  }
}

export async function DELETE(request: Request, context: CmsBulkRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "delete") && !hasAdminModuleAccess(auth.access, "cms", "delete")) return fail("Forbidden", 403);

  try {
    const payload = await request.json().catch(() => ({}));
    const ids = Array.isArray(payload.ids) ? payload.ids.map(String).filter(Boolean) : [];
    return ok(await bulkDeleteCmsRows(cmsModule, ids, auth.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not bulk archive CMS records.", 500);
  }
}
