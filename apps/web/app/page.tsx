import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Button, Card } from "@/components/ui";
import { landingFeatures } from "@/lib/defaults";

export default function LandingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Badge tone="blue">Lead intelligence, not spam automation</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
              Find high-intent leads inside communities.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Scan communities, qualify buyer intent, generate personalized manual outreach drafts, and manage follow-ups from one polished dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup"><Button>Start 7-day trial</Button></Link>
              <Link href="/download-extension"><Button variant="secondary">Download extension</Button></Link>
            </div>
            <p className="mt-3 text-sm text-slate-500">Includes 50 saved lead credits and 50 Gemini draft credits during trial.</p>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {["No auto-send", "Visible content only", "Manual review required"].map(item => <div key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" />{item}</div>)}
            </div>
          </div>
          <Card className="bg-ink text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Acme Growth Studio</div>
                <div className="text-2xl font-semibold">Today&apos;s lead flow</div>
              </div>
              <Sparkles className="text-sky-300" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["42", "Leads"], ["18", "Hot"], ["9", "Drafts"]].map(([value, label]) => <div key={label} className="rounded-2xl bg-white/8 p-4"><div className="text-3xl font-semibold">{value}</div><div className="text-xs text-slate-300">{label}</div></div>)}
            </div>
            <div className="mt-5 space-y-3">
              {["Reddit founder asks for SDR help", "Facebook group post needs SEO agency", "Slack founder asks for outbound setup"].map((lead, i) => (
                <div key={lead} className="flex items-center justify-between rounded-2xl bg-white/8 p-4">
                  <div><div className="font-medium">{lead}</div><div className="text-xs text-slate-300">Manual draft ready</div></div>
                  <Badge tone={i === 0 ? "green" : "blue"}>{i === 0 ? "Hot 91" : "Warm 72"}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
        <section className="mt-16 grid gap-4 md:grid-cols-5">
          {landingFeatures.map(([title, text]) => <Card key={title}><ShieldCheck className="mb-4 text-brand" /><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card>)}
        </section>
        <Link href="/docs" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold">Read docs <ArrowRight size={16} /></Link>
      </main>
    </MarketingShell>
  );
}
