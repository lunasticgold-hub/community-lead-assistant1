import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { enrollLeadInSequence } from "@/lib/outreach";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => ({}));
  const leadId = String(body.leadId || body.lead_id || "");
  const sequenceId = String(body.sequenceId || body.sequence_id || "");
  if (!leadId || !sequenceId) return fail("leadId and sequenceId are required.", 400);

  try {
    return ok(await enrollLeadInSequence({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      leadId,
      sequenceId
    }), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not add lead to sequence.", 500);
  }
}
