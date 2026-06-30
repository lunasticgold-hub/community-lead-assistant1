import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { planLimits } from "@/lib/defaults";

export default function BillingPage() {
  return (
    <AppShell title="Billing">
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="blue">Trial active</Badge>
            <h2 className="mt-3 text-xl font-semibold">7-day trial limits</h2>
            <p className="mt-1 text-sm text-slate-600">50 saved lead credits and 50 Gemini draft credits. After trial, users must upgrade to a paid plan.</p>
          </div>
          <Button>Manage trial</Button>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(planLimits).map(([key, plan]) => (
          <Card key={key}>
            <Badge>{plan.label}</Badge>
            <div className="mt-3 text-sm text-slate-600">{plan.leadsPerMonth.toLocaleString()} saved lead credits</div>
            <div className="mt-1 text-sm text-slate-600">{plan.aiDraftsPerMonth.toLocaleString()} Gemini drafts</div>
            <div className="mt-1 text-sm text-slate-600">{plan.users} users</div>
            <div className="mt-5">
              <Button variant={key === "trial" ? "primary" : "secondary"}>{key === "trial" ? "Current plan" : "Upgrade"}</Button>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <h2 className="font-semibold">Stripe action is prepared</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Checkout and webhook routes are stubbed until you add Stripe keys and price IDs. Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_STARTER_PRICE_ID, STRIPE_PRO_PRICE_ID, STRIPE_AGENCY_PRICE_ID.
        </p>
      </Card>
    </AppShell>
  );
}
