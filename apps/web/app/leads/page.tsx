import { AppShell } from "@/components/app-shell";
import { LeadTable } from "@/components/lead-table";
import { Button, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";

export default async function LeadsPage() {
  const { workspace } = await requireWorkspace();
  const leads = await getWorkspaceLeads(workspace.id);
  return (
    <AppShell title="Leads">
      <div className="mb-4 flex flex-wrap gap-2">
        {["Update status", "Assign owner", "Export selected", "Add follow-up", "Mark not relevant"].map(action => <Button key={action} variant="secondary">{action}</Button>)}
      </div>
      <LeadTable leads={leads} />
      {!leads.length ? <Card className="mt-4"><p className="text-sm text-slate-600">No leads found yet. Install the extension, sign in from the popup, and scan a supported community.</p></Card> : null}
    </AppShell>
  );
}
