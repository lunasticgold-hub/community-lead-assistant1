import Link from "next/link";
import { BarChart3, BookOpen, CreditCard, Download, FileText, Gauge, Inbox, KeyRound, LayoutDashboard, Megaphone, Settings, Shield, Users } from "lucide-react";
import { BrandLockup } from "./brand";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Leads", "/leads", Inbox],
  ["Campaigns", "/campaigns", Megaphone],
  ["Knowledge Base", "/knowledge-base", BookOpen],
  ["Keywords", "/keywords", KeyRound],
  ["Templates", "/templates", FileText],
  ["Follow-ups", "/follow-ups", Gauge],
  ["Platforms", "/platforms", Settings],
  ["Team", "/team", Users],
  ["Analytics", "/analytics", BarChart3],
  ["Exports", "/exports", Download],
  ["Billing", "/billing", CreditCard],
  ["Admin", "/admin/users", Shield]
] as const;

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-7 flex items-center gap-3 font-semibold">
          <BrandLockup compact />
        </div>
        <nav className="space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-slate-500">Find, qualify, draft, and follow up without auto-sending.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">Synced</div>
              <form action="/auth/logout" method="post">
                <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200">Logout</button>
              </form>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
