import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";

export default async function FollowUpsPage() {
  const { workspace } = await requireWorkspace();
  const leads = await getWorkspaceLeads(workspace.id);
  const due = leads.filter(lead => lead.status === "Follow-up Due" || lead.followUpDate);

  return (
    <AppShell title="Follow-ups">
      <Card>
        <h2 className="font-semibold">Due soon</h2>
        <div className="mt-4 space-y-3">
          {due.slice(0, 20).map(lead => (
            <div key={lead.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div><div className="font-medium">{lead.authorName || "Unknown author"}</div><div className="text-sm text-slate-500">{lead.followUpDate || "No date"} manual follow-up draft ready</div></div>
              <div className="flex gap-2"><Badge>{lead.platform}</Badge><Button variant="secondary">Copy draft</Button></div>
            </div>
          ))}
          {!due.length ? <p className="text-sm text-slate-500">No follow-ups are due.</p> : null}
        </div>
        <p className="mt-5 text-sm text-slate-600">Follow-ups are reminders and drafts only. The user sends manually.</p>
      </Card>
    </AppShell>
  );
}
