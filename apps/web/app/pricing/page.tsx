import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Button, Card } from "@/components/ui";
import { planLimits } from "@/lib/defaults";

const shared = ["Manual outreach only", "Chrome extension", "Dashboard sync", "CSV export", "Lead scoring", "Gemini-ready drafts"];

export default function PricingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <Badge tone="blue">7-day trial included</Badge>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">Plans for freelancers, agencies, and growth teams.</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Start with 50 saved lead credits and 50 Gemini draft credits. Paid prices are ready to connect through Stripe price IDs when finalized.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(planLimits).map(([key, plan]) => (
            <Card key={key} className={key === "pro" ? "border-blue-300 shadow-2xl dark:border-blue-500 dark:bg-white/5" : "dark:border-white/10 dark:bg-white/5"}>
              <Badge tone={key === "trial" ? "green" : key === "pro" ? "blue" : "slate"}>{plan.label}</Badge>
              <div className="mt-5 text-3xl font-semibold text-slate-950 dark:text-white">{plan.priceLabel}</div>
              <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>{plan.leadsPerMonth.toLocaleString()} saved lead credits</li>
                <li>{plan.aiDraftsPerMonth.toLocaleString()} Gemini draft credits</li>
                <li>{plan.users} user seat{plan.users > 1 ? "s" : ""}</li>
                <li>{plan.workspaces} workspace limit</li>
              </ul>
              <div className="mt-6">
                <Link href="/signup">
                  <Button variant={key === "trial" || key === "pro" ? "primary" : "secondary"} className="w-full">
                    {key === "trial" ? "Start trial" : `Choose ${plan.label}`}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-8 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Every plan includes the safe workflow foundation</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shared.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
