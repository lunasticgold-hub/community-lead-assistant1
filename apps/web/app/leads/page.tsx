import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LeadTable } from "@/components/lead-table";
import { Button, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";

type LeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { workspace } = await requireWorkspace();
  const query = await searchParams;
  const uniqueOnly = query?.unique !== "0";
  const leads = await getWorkspaceLeads(workspace.id, 500, { uniqueOnly });
  return (
    <AppShell title="Leads">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["Update status", "Assign owner", "Export selected", "Add follow-up", "Mark not relevant"].map(action => <Button key={action} variant="secondary">{action}</Button>)}
        </div>
        <div className="flex rounded-2xl border border-slate-200 bg-white p-1 text-sm font-semibold shadow-sm">
          <Link
            href="/leads?unique=1"
            className={`rounded-xl px-3 py-2 ${uniqueOnly ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}
          >
            Unique leads only
          </Link>
          <Link
            href="/leads?unique=0"
            className={`rounded-xl px-3 py-2 ${!uniqueOnly ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}
          >
            All synced leads
          </Link>
        </div>
      </div>
      <LeadTable leads={leads} />
      {!leads.length ? <Card className="mt-4"><p className="text-sm text-slate-600">No leads found yet. Install the extension, sign in from the popup, and scan a supported community.</p></Card> : null}
    </AppShell>
  );
}
