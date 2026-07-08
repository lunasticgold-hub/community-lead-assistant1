import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getCmsModule } from "@/lib/cms/config";
import { deleteCmsRow, getCmsRow, updateCmsRow } from "@/lib/cms/data";

type CmsItemRouteContext = { params: Promise<{ module: string; id: string }> };

export async function GET(_request: Request, context: CmsItemRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug, id } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "view") && !hasAdminModuleAccess(auth.access, "cms", "view")) return fail("Forbidden", 403);

  try {
    const row = await getCmsRow(cmsModule, id);
    if (!row) return fail("CMS record not found.", 404);
    return ok({ row });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load CMS record.", 500);
  }
}

export async function PATCH(request: Request, context: CmsItemRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug, id } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "edit") && !hasAdminModuleAccess(auth.access, "cms", "edit")) return fail("Forbidden", 403);

  try {
    const payload = await request.json().catch(() => ({}));
    const row = await updateCmsRow(cmsModule, id, payload, auth.user.id);
    return ok({ row });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update CMS record.", 500);
  }
}

export async function DELETE(_request: Request, context: CmsItemRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug, id } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "delete") && !hasAdminModuleAccess(auth.access, "cms", "delete")) return fail("Forbidden", 403);

  try {
    return ok(await deleteCmsRow(cmsModule, id, auth.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete CMS record.", 500);
  }
}
