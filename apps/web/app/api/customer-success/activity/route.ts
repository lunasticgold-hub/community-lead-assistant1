import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { recordCustomerActivity } from "@/lib/customer-success/data";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({})) as {
    eventType?: string;
    moduleKey?: string;
    eventLabel?: string;
    durationSeconds?: number;
    metadata?: Record<string, unknown>;
  };
  if (!body.eventType) return fail("eventType is required.", 400);

  try {
    await recordCustomerActivity({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      eventType: body.eventType,
      moduleKey: body.moduleKey,
      eventLabel: body.eventLabel,
      durationSeconds: body.durationSeconds,
      metadata: body.metadata
    });
    return ok({ tracked: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not track activity.", 500);
  }
}
