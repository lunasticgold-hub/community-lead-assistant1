import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button, Card } from "@/components/ui";

export default function ExportsPage() {
  return <AppShell title="Exports"><Card><h2 className="text-xl font-semibold">CSV exports</h2><p className="mt-2 text-sm text-slate-600">Export all leads or use table filters on the Leads page.</p><div className="mt-5"><Link href="/api/exports/leads.csv"><Button>Download leads CSV</Button></Link></div></Card></AppShell>;
}
