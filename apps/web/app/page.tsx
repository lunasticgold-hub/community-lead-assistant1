import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Chrome,
  Database,
  Filter,
  LockKeyhole,
  MessageSquareText,
  MousePointerClick,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap
} from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Button, Card } from "@/components/ui";
import { homepageSections, supportedPlatforms } from "@/lib/marketing";
import { planLimits } from "@/lib/defaults";

const previewLeads = [
  ["Founder asking for SDR help", "Reddit / r/SaaS", "Hot", 91],
  ["Agency owner needs SEO lead gen", "Facebook Groups", "Warm", 74],
  ["Startup team needs outbound setup", "Slack", "Warm", 69]
] as const;

const faq = [
  ["Does it send DMs automatically?", "No. The product can draft, copy, and open source pages, but every outreach action requires human review and manual send."],
  ["What does the extension scan?", "Only visible content on supported community platforms. Unsupported websites show a friendly unsupported-platform state."],
  ["Can agencies use it?", "Yes. Campaigns, workspace sync, CSV export, admin analytics, and future billing tiers are designed for agencies and growth teams."]
] as const;

export default function LandingPage() {
  return (
    <MarketingShell>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1.02fr_.98fr] lg:pb-24 lg:pt-20">
          <div>
            <Badge tone="blue">Lead intelligence, not spam automation</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl dark:text-white">
              Find high-intent leads inside communities.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Community Lead Assistant helps freelancers, agencies, founders, and growth teams scan visible community posts, score buyer intent,
              generate reviewed outreach drafts, and manage follow-ups from one polished dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup"><Button>Start 7-day trial</Button></Link>
              <Link href="/download-extension"><Button variant="secondary">Download extension</Button></Link>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Includes 50 saved leads and 50 Gemini draft credits during trial.</p>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-300">
              {homepageSections.trustSignals.slice(0, 3).map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Live workspace</p>
                  <h2 className="mt-1 text-lg font-semibold dark:text-white">Community Lead Pipeline</h2>
                </div>
                <Badge tone="green">Operational</Badge>
              </div>
              <div className="grid gap-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {homepageSections.metrics.slice(0, 3).map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white dark:border-white/10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold">Lead scoring activity</div>
                    <Sparkles size={18} className="text-sky-300" />
                  </div>
                  <div className="flex h-32 items-end gap-2">
                    {[40, 64, 35, 82, 58, 76, 92, 68].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-600 to-emerald-400" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3">
                  {previewLeads.map(([title, source, temp, score]) => (
                    <div key={title} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-950 dark:text-white">{title}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{source} / manual draft ready</div>
                      </div>
                      <Badge tone={temp === "Hot" ? "green" : "blue"}>{temp} {score}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/70 py-6 dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 text-sm font-medium text-slate-500 dark:text-slate-300">
            <span>Built for freelancers</span>
            <span>Small agencies</span>
            <span>Founder-led teams</span>
            <span>Growth consultants</span>
            <span>SDR teams</span>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <Badge tone="blue">Product preview</Badge>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">One workflow from community signal to qualified lead.</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                V2 focuses on trust, speed, and usability: fewer cluttered controls, stronger dashboards, clearer extension states, and safe manual outreach.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                [ScanSearch, "Visible scanning", "Read supported community pages and highlight matches without hidden scraping."],
                [Filter, "Smart qualification", "Use positive signals, negative signals, required combinations, and score thresholds."],
                [MessageSquareText, "Draft generation", "Create short, friendly, service-specific, and follow-up drafts for manual sending."],
                [BarChart3, "Workspace analytics", "Track leads, sources, communities, AI usage, campaigns, exports, and follow-up work."]
              ].map(([Icon, title, body]) => (
                <Card key={String(title)} className="dark:border-white/10 dark:bg-white/5">
                  <Icon className="text-blue-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body as string}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <Badge tone="green">Chrome extension</Badge>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight">A compact extension that only works where it should.</h2>
                <p className="mt-4 text-slate-300">
                  Unsupported websites show a friendly message. Supported communities unlock scanning, lead review, sync status, and source actions.
                </p>
                <div className="mt-6 flex gap-3">
                  <Chrome className="text-sky-300" />
                  <span className="text-sm text-slate-300">No automatic DMs, comments, posts, or follow-up blasting.</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {supportedPlatforms.map(platform => (
                  <div key={platform.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{platform.name}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-300">{platform.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{platform.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <Badge tone="blue">How it works</Badge>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">A clean lead discovery workflow from setup to follow-up.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {homepageSections.workflow.map(([title, body], index) => (
              <Card key={title} className="relative dark:border-white/10 dark:bg-white/5">
                <div className="mb-5 inline-grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-sm font-semibold text-white">{index + 1}</div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Workflow className="text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">AI workflow with a manual safety boundary</h2>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-4">
                {[
                  [Database, "Knowledge base"],
                  [Zap, "Gemini draft"],
                  [MousePointerClick, "Copy/open source"],
                  [LockKeyhole, "Manual send"]
                ].map(([Icon, label]) => (
                  <div key={String(label)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <Icon className="text-blue-600" />
                    <div className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{label as string}</div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Gemini can help produce opener and follow-up drafts, but the extension never clicks send. This protects community quality and keeps users in control.
              </p>
            </Card>
            <Card className="dark:border-white/10 dark:bg-white/5">
              <Badge tone="orange">Compliance-first</Badge>
              <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">What the product will not do</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                {["No auto-DM sending", "No automatic comments", "No stealth automation", "No rate-limit evasion"].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/70 py-20 dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <Badge tone="blue">Pricing preview</Badge>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Start with a 7-day trial.</h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">Paid prices can be finalized when Stripe price IDs are connected.</p>
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                View pricing <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {Object.entries(planLimits).map(([key, plan]) => (
                <Card key={key} className={key === "pro" ? "border-blue-300 shadow-2xl dark:border-blue-500" : "dark:border-white/10 dark:bg-white/5"}>
                  <Badge tone={key === "trial" ? "green" : key === "pro" ? "blue" : "slate"}>{plan.label}</Badge>
                  <div className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{plan.priceLabel}</div>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">{plan.description}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>{plan.leadsPerMonth.toLocaleString()} saved leads/month</span>
                    <span>{plan.aiDraftsPerMonth.toLocaleString()} AI drafts/month</span>
                    <span>{plan.users} user seat{plan.users > 1 ? "s" : ""}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <Badge tone="blue">FAQ</Badge>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Questions before launch.</h2>
            </div>
            <div className="grid gap-4">
              {faq.map(([question, answer]) => (
                <Card key={question} className="dark:border-white/10 dark:bg-white/5">
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <Badge tone="green">Ready for public launch</Badge>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight">Turn community conversations into a managed lead pipeline.</h2>
                <p className="mt-4 max-w-2xl text-slate-300">Install the extension, configure your workspace, scan supported communities, and review every outreach draft before sending.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup"><Button>Start free trial</Button></Link>
                <Link href="/docs"><Button variant="secondary">Read docs</Button></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
