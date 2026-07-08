import { NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/auth";
import { getCmsModule } from "@/lib/cms/config";
import { exportCmsRows } from "@/lib/cms/data";

export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  const cmsModule = getCmsModule("newsletter");
  if (!cmsModule) return fail("Newsletter CMS module is not configured.", 500);
  try {
    const csv = await exportCmsRows(cmsModule, new URL(request.url));
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=\"newsletter-subscribers.csv\""
      }
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not export subscribers.", 500);
  }
}
