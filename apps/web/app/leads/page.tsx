import { AppShell } from "@/components/app-shell";
import { LeadTable } from "@/components/lead-table";
import { Button, Card } from "@/components/ui";
import { demoLeads } from "@/lib/mock-data";

export default function LeadsPage() {
  return (
    <AppShell title="Leads">
      <div className="mb-4 flex flex-wrap gap-2">
        {["Update status", "Assign owner", "Export selected", "Add follow-up", "Mark not relevant"].map(action => <Button key={action} variant="secondary">{action}</Button>)}
      </div>
      <LeadTable leads={demoLeads} />
      <Card className="mt-4"><p className="text-sm text-slate-600">Empty state: when no leads are found, this table shows setup tips and a button to install the extension.</p></Card>
    </AppShell>
  );
}
