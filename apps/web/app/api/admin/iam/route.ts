import { fail, ok } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/auth";
import { getEmployeeIamData, performEmployeeIamAction } from "@/lib/admin/iam";
import type { EmployeeIamActionPayload } from "@/lib/admin/iam-types";

export async function GET() {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  try {
    return ok(await getEmployeeIamData());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load IAM data.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({})) as EmployeeIamActionPayload;
  if (!body || typeof body !== "object" || !("action" in body)) {
    return fail("IAM action is required.", 400);
  }

  try {
    return ok(await performEmployeeIamAction(body, auth.access));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "IAM action failed.", 500);
  }
}
