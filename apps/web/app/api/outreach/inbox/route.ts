import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { getOutreachActivity, listInbox } from "@/lib/outreach";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  try {
    const [items, activity] = await Promise.all([
      listInbox(auth.workspace.id),
      getOutreachActivity(auth.workspace.id)
    ]);
    return ok({ items, activity });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load inbox.", 500);
  }
}
