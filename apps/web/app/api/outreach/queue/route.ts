import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { getReviewQueueCount, listReviewQueue } from "@/lib/outreach";
import type { DraftQueueStatus } from "@/lib/types";

const statuses = new Set(["queued", "review", "ready_to_send", "sent_manually", "replied", "archived", "failed"]);

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status = statusParam && statuses.has(statusParam) ? statusParam as DraftQueueStatus : undefined;

  try {
    const [items, count] = await Promise.all([
      listReviewQueue(auth.workspace.id, status),
      getReviewQueueCount(auth.workspace.id)
    ]);
    return ok({ items, count });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load review queue.", 500);
  }
}
