import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";

export default function AnalyticsPage() {
  return <AppShell title="Usage Analytics"><div className="grid gap-4 md:grid-cols-3">{["Active users", "Leads found", "Drafts copied", "Manual outreach opened", "Exports", "Sync failures"].map((label, i) => <Card key={label}><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold">{[5, 284, 91, 64, 12, 2][i]}</div></Card>)}</div><Card className="mt-6"><h2 className="font-semibold">Platform usage</h2><div className="mt-5 grid gap-3 md:grid-cols-4">{["Reddit", "Facebook", "Slack", "Discord"].map((p, i) => <div key={p} className="rounded-xl bg-slate-50 p-4"><div className="font-medium">{p}</div><div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-brand" style={{ width: `${[88, 62, 44, 33][i]}%` }} /></div></div>)}</div></Card></AppShell>;
}
