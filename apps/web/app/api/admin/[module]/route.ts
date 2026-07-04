import { fail, ok } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/auth";
import { getAdminModule } from "@/lib/admin/config";
import { createAdminRow, exportAdminRows, listAdminRows } from "@/lib/admin/data";

type Context = { params: Promise<{ module: string }> };

export async function GET(request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const { module: rawModule } = await context.params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) return fail("Unknown admin module.", 404);

  const url = new URL(request.url);

  try {
    if (url.searchParams.get("format") === "csv") {
      const csv = await exportAdminRows(moduleConfig, url);
      return new Response(csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename=${moduleConfig.slug}.csv`
        }
      });
    }

    return ok(await listAdminRows(moduleConfig, url));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load admin records.", 500);
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const { module: rawModule } = await context.params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) return fail("Unknown admin module.", 404);

  const body = await request.json().catch(() => ({}));

  try {
    const row = await createAdminRow(moduleConfig, body);
    return Response.json({ ok: true, row }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create admin record.", 500);
  }
}
