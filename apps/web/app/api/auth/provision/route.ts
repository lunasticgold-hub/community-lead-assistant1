import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";

export async function POST() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  return ok({ userId: auth.user.id, workspace: auth.workspace });
}

export async function GET() {
  return fail("Method not allowed", 405);
}
