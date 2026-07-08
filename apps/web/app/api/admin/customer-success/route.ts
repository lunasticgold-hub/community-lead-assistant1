import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { createCustomerSuccessProject, getCustomerSuccessDashboardData } from "@/lib/customer-success/data";
import type { SuccessProjectInput } from "@/lib/customer-success/types";

export async function GET() {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "customer-success", "view")) return fail("Forbidden", 403);

  try {
    return ok({ data: await getCustomerSuccessDashboardData() });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load customer success data.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "customer-success", "create") && !hasAdminModuleAccess(auth.access, "customer-success", "edit")) return fail("Forbidden", 403);

  const body = await request.json().catch(() => ({})) as SuccessProjectInput;
  try {
    const project = await createCustomerSuccessProject(body, auth.user.id);
    return ok({ project }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create project report.", 500);
  }
}
