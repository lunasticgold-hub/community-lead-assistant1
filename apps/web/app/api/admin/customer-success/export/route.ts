import { fail } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { exportCustomerSuccessData } from "@/lib/customer-success/data";

export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "customer-success", "view")) return fail("Forbidden", 403);

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "csv";
  try {
    const body = await exportCustomerSuccessData(format);
    if (format === "xls") {
      return new Response(body, {
        headers: {
          "content-type": "application/vnd.ms-excel; charset=utf-8",
          "content-disposition": "attachment; filename=customer-success-report.xls"
        }
      });
    }
    if (format === "pdf") {
      return new Response(body, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-disposition": "attachment; filename=customer-success-report.html"
        }
      });
    }
    return new Response(body, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=customer-success-report.csv"
      }
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not export customer success report.", 500);
  }
}
