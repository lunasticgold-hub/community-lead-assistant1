import { fail, ok } from "@/lib/api-response";

export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return fail("Stripe webhook is not connected. Add STRIPE_WEBHOOK_SECRET when billing is enabled.", 501);
  }

  return ok({
    received: true,
    message: "Webhook placeholder ready. Verify Stripe signatures and update workspace billing fields when Stripe is enabled."
  });
}
