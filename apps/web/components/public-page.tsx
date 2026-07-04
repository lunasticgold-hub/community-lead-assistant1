import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Button, Card } from "@/components/ui";
import { getMarketingPage } from "@/lib/marketing";

export function PublicPage({ slug }: { slug: string }) {
  const page = getMarketingPage(slug);
  if (!page) return null;
  const Icon = page.icon;

  return (
    <MarketingShell>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <Badge tone="blue">{page.eyebrow}</Badge>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">{page.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">{page.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup"><Button>{page.cta || "Start free trial"}</Button></Link>
              <Link href="/download-extension"><Button variant="secondary">Download extension</Button></Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-white/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-soft">
              <Icon size={30} />
            </div>
            <div className="mt-6 grid gap-3">
              {page.sections.map(section => (
                <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <h2 className="font-semibold text-slate-950 dark:text-white">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-5 md:grid-cols-3">
            {page.sections.map(section => (
              <Card key={section.title} className="dark:border-white/10 dark:bg-white/5">
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.body}</p>
                <div className="mt-5 grid gap-2">
                  {section.points.map(point => (
                    <div key={point} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <Badge tone="green">Next step</Badge>
                <h2 className="mt-3 text-3xl font-semibold">Set up your workspace and scan your first supported community.</h2>
              </div>
              <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
                Read setup guide <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
