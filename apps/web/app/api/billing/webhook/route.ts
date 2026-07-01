import { fail, ok } from "@/lib/api-response";

export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return fail("Stripe webhook is not connected. Add STRIPE_WEBHOOK_SECRET when billing is enabled.", 501);
  }

  return ok({
    received: true,
    message: "Stripe webhook endpoint is inactive until billing keys are configured. Verify Stripe signatures and update workspace billing fields when billing is enabled."
  });
}
