import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { deleteCustomerSuccessProject, reviewCustomerSuccessProject } from "@/lib/customer-success/data";
import type { ProjectStatus } from "@/lib/customer-success/types";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "customer-success", "edit")) return fail("Forbidden", 403);

  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { status?: ProjectStatus; reviewNotes?: string };
  if (!body.status) return fail("Project status is required.", 400);

  try {
    return ok({ project: await reviewCustomerSuccessProject(id, body.status, auth.user.id, body.reviewNotes || "") });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update project.", 500);
  }
}

export async function DELETE(_request: Request, context: Context) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "customer-success", "delete")) return fail("Forbidden", 403);

  const { id } = await context.params;
  try {
    return ok(await deleteCustomerSuccessProject(id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete project.", 500);
  }
}
