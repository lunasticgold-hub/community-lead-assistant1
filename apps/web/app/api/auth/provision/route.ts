import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { recordCustomerSessionStart } from "@/lib/customer-success/data";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  await recordCustomerSessionStart({
    workspaceId: auth.workspace.id,
    userId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    userAgent: request.headers.get("user-agent") || "",
    source: "web"
  });
  return ok({ userId: auth.user.id, workspace: auth.workspace });
}

export async function GET() {
  return fail("Method not allowed", 405);
}
