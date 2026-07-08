import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getCmsModule } from "@/lib/cms/config";
import { createCmsRow, exportCmsRows, importCmsRows, listCmsRows } from "@/lib/cms/data";

type CmsRouteContext = { params: Promise<{ module: string }> };

export async function GET(request: Request, context: CmsRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "view") && !hasAdminModuleAccess(auth.access, "cms", "view")) return fail("Forbidden", 403);

  try {
    const url = new URL(request.url);
    if (url.searchParams.get("format") === "csv") {
      const csv = await exportCmsRows(cmsModule, url);
      return new NextResponse(csv, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${slug}.csv"`
        }
      });
    }
    return ok(await listCmsRows(cmsModule, url));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load CMS records.", 500);
  }
}

export async function POST(request: Request, context: CmsRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "create") && !hasAdminModuleAccess(auth.access, "cms", "create")) return fail("Forbidden", 403);

  try {
    const payload = await request.json().catch(() => ({}));
    const row = await createCmsRow(cmsModule, payload, auth.user.id);
    return ok({ row }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create CMS record.", 500);
  }
}

export async function PUT(request: Request, context: CmsRouteContext) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const { module: slug } = await context.params;
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) return fail("Unknown CMS module.", 404);
  if (!hasAdminModuleAccess(auth.access, slug, "import") && !hasAdminModuleAccess(auth.access, "cms", "import")) return fail("Forbidden", 403);

  try {
    const payload = await request.json().catch(() => ({}));
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload.rows) ? payload.rows : [];
    return ok(await importCmsRows(cmsModule, rows, auth.user.id), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not import CMS records.", 500);
  }
}
