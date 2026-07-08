import { fail, ok } from "@/lib/api-response";
import { getCurrentUser, isAdminUser } from "@/lib/auth/session";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  if (!isAdminUser(user)) return fail("Owner access is not allowed for this account.", 403);

  return ok({ userId: user.id, email: user.email });
}

export async function GET() {
  return fail("Method not allowed", 405);
}
