import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { createSequence, defaultSequenceSteps, listSequences } from "@/lib/outreach";

function cleanStep(value: unknown) {
  const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    name: String(row.name || "Sequence step"),
    delayHours: Math.max(0, Number(row.delayHours || row.delay_hours || 0)),
    template: String(row.template || ""),
    variationCount: Math.min(5, Math.max(3, Number(row.variationCount || row.variation_count || 3)))
  };
}

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  try {
    return ok({ sequences: await listSequences(auth.workspace.id) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load sequences.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return fail("Sequence name is required.", 400);

  try {
    const sequence = await createSequence({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      name,
      objective: String(body.objective || ""),
      targetPlatform: String(body.targetPlatform || body.target_platform || "reddit"),
      dailyReviewLimit: Math.max(1, Number(body.dailyReviewLimit || body.daily_review_limit || 25)),
      status: body.status === "draft" || body.status === "paused" || body.status === "completed" ? body.status : "active",
      steps: Array.isArray(body.steps) ? body.steps.map(cleanStep) : defaultSequenceSteps()
    });
    return ok({ sequence }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create sequence.", 500);
  }
}
