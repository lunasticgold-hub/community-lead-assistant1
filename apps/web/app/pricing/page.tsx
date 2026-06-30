import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Button, Card } from "@/components/ui";
import { planLimits } from "@/lib/defaults";

export default function PricingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-6xl px-6 py-14">
        <Badge tone="blue">7-day trial included</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Plans built for careful community-led growth.</h1>
        <p className="mt-3 text-slate-600">Start with 50 saved lead credits and 50 Gemini draft credits. Paid plan prices can be finalized when Stripe is connected.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Object.entries(planLimits).map(([key, plan]) => (
            <Card key={key}>
              <Badge>{plan.label}</Badge>
              <div className="mt-5 text-3xl font-semibold">{plan.priceLabel}</div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                <li>{plan.leadsPerMonth.toLocaleString()} saved lead credits</li>
                <li>{plan.aiDraftsPerMonth.toLocaleString()} Gemini draft credits</li>
                <li>{plan.users} user seats</li>
                <li>{plan.workspaces} workspace limit</li>
                <li>Dashboard sync + CSV export</li>
              </ul>
              <div className="mt-6"><Button variant={key === "trial" || key === "pro" ? "primary" : "secondary"}>{key === "trial" ? "Start trial" : "Choose " + plan.label}</Button></div>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">No free plan after the 7-day trial. Stripe checkout is prepared as a stub until your Stripe account and price IDs are added.</p>
      </main>
    </MarketingShell>
  );
}
