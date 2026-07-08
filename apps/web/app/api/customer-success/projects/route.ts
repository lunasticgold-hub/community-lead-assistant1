import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { createCustomerProjectForWorkspace, listOwnCustomerProjects } from "@/lib/customer-success/data";
import type { SuccessProjectInput } from "@/lib/customer-success/types";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  try {
    return ok({ projects: await listOwnCustomerProjects(auth.workspace.id) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load project reports.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({})) as SuccessProjectInput;
  try {
    const project = await createCustomerProjectForWorkspace(auth.workspace, auth.user.id, body);
    return ok({ project }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not report project.", 500);
  }
}
