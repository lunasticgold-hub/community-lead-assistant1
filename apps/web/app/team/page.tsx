import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";

export default function TeamPage() {
  return <AppShell title="Team & Workspace"><Card><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Acme Growth Studio</h2><p className="text-sm text-slate-500">Plan: 7-day Trial / 1 user seat</p></div><Button>Invite member</Button></div><div className="mt-5 space-y-3">{["Owner", "SDR", "Researcher"].map(role => <div key={role} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>{role.toLowerCase()}@example.com</span><Badge>{role}</Badge></div>)}</div><p className="mt-5 text-sm text-slate-600">Workspace owners can delete workspace lead data, uploaded knowledge files, and extension tokens.</p></Card></AppShell>;
}
