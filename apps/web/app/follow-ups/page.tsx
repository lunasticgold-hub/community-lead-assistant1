import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { demoLeads } from "@/lib/mock-data";

export default function FollowUpsPage() {
  return <AppShell title="Follow-ups"><Card><h2 className="font-semibold">Due soon</h2><div className="mt-4 space-y-3">{demoLeads.slice(0, 3).map((lead, i) => <div key={lead.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><div className="font-medium">{lead.authorName}</div><div className="text-sm text-slate-500">Day {[2, 5, 10][i]} manual follow-up draft ready</div></div><div className="flex gap-2"><Badge>{lead.platform}</Badge><Button variant="secondary">Copy draft</Button></div></div>)}</div><p className="mt-5 text-sm text-slate-600">Follow-ups are reminders and drafts only. The user sends manually.</p></Card></AppShell>;
}
