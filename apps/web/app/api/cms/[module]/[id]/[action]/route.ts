import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getCmsModule } from "@/lib/cms/config";
import { archiveCmsRow, duplicateCmsRow, restoreCmsRow } from "@/lib/cms/data";

type CmsActionRouteContext = { params: Promise<{ module: string; id: string; action: string }> };

const actionPermission = {
  duplicate: "create",
  archive: "delete",
  restore: "edit"
} as const;

export async function POST(_request: Request, context: CmsActionRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug, id, action } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!isCmsAction(action)) return fail("Unknown CMS action.", 404);
  const permission = actionPermission[action];
  if (!hasAdminModuleAccess(auth.access, slug, permission) && !hasAdminModuleAccess(auth.access, "cms", permission)) return fail("Forbidden", 403);

  try {
    if (action === "duplicate") return ok({ row: await duplicateCmsRow(cmsModule, id, auth.user.id) }, { status: 201 });
    if (action === "archive") return ok({ row: await archiveCmsRow(cmsModule, id, auth.user.id) });
    return ok({ row: await restoreCmsRow(cmsModule, id, auth.user.id) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not run CMS action.", 500);
  }
}

function isCmsAction(action: string): action is keyof typeof actionPermission {
  return action in actionPermission;
}
