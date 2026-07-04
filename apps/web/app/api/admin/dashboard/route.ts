import { fail, ok } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/auth";
import { getAdminDashboardData } from "@/lib/admin/data";

export async function GET() {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  try {
    return ok(await getAdminDashboardData());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load admin dashboard.", 500);
  }
}
