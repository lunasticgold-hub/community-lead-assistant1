import { fail, ok } from "@/lib/api-response";

const priceEnvByPlan: Record<string, string> = {
  starter: "STRIPE_STARTER_PRICE_ID",
  pro: "STRIPE_PRO_PRICE_ID",
  agency: "STRIPE_AGENCY_PRICE_ID"
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const plan = String(body.plan || "");
  const priceEnv = priceEnvByPlan[plan];
  if (!priceEnv) return fail("Unsupported billing plan", 400);

  const missing = ["STRIPE_SECRET_KEY", priceEnv].filter(key => !process.env[key]);
  if (missing.length) {
    return fail(`Stripe is not connected. Add ${missing.join(", ")} to environment variables.`, 501);
  }

  return ok({
    checkoutReady: false,
    plan,
    message: "Stripe keys are present. Install the Stripe SDK and create a checkout session when billing is enabled."
  });
}
