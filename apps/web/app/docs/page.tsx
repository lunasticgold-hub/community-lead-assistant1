import Link from "next/link";
import { ArrowRight, BookOpen, Chrome, Database, FileText, ScanSearch, Settings, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Card } from "@/components/ui";

const docs = [
  ["Workspace setup", "Create your account, provision a workspace, and confirm your trial limits.", Settings],
  ["Campaign setup", "Choose platforms, minimum score, scan mode, pause limits, and keyword groups.", ScanSearch],
  ["Knowledge base", "Add service details, ICP, proof, CTA, tone, FAQs, objections, and blocked words.", BookOpen],
  ["Extension install", "Download the ZIP, extract it, and load the Extension folder in Chrome.", Chrome],
  ["Lead review", "Review source, score breakdown, matched signals, notes, status, and follow-up dates.", FileText],
  ["Data and security", "Understand what data syncs, how sessions work, and why outreach stays manual.", ShieldCheck]
] as const;

export default function DocsPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-6 py-16">
        <Badge tone="blue">Documentation</Badge>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">Launch and operate Community Lead Assistant safely.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Use these guides to configure the dashboard, install the Chrome extension, scan supported communities, review leads, and export data.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map(([title, body, Icon], index) => (
            <Card key={title} className="dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <Icon className="text-blue-600" />
                <span className="text-xs font-semibold text-slate-400">GUIDE {index + 1}</span>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-8 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <Database className="text-blue-600" />
            <div>
              <h2 className="font-semibold text-slate-950 dark:text-white">Need the admin database tables?</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Run the Supabase migrations included in the repository, including the admin panel migration.</p>
            </div>
            <Link href="/download-extension" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              Install extension <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
