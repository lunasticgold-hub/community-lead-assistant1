import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { updateQueueAction } from "@/lib/outreach";

const allowedActions = new Set(["approve", "copy", "open_profile", "mark_sent", "mark_replied", "archive", "select_variation"]);

type QueueRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: QueueRouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");
  if (!allowedActions.has(action)) return fail("Invalid queue action.", 400);

  try {
    const item = await updateQueueAction({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      queueItemId: id,
      action: action as "approve" | "copy" | "open_profile" | "mark_sent" | "mark_replied" | "archive" | "select_variation",
      selectedVariationIndex: body.selectedVariationIndex === undefined ? undefined : Number(body.selectedVariationIndex)
    });
    return ok({ item });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update queue item.", 500);
  }
}
