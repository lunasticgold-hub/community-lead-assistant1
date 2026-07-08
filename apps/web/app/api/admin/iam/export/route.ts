import { fail } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/auth";
import { exportEmployeeIamCsv } from "@/lib/admin/iam";

export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "employees";

  try {
    const csv = await exportEmployeeIamCsv(type);
    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=iam-${type}.csv`
      }
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not export IAM data.", 500);
  }
}
