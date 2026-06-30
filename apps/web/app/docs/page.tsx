import { MarketingShell } from "@/components/marketing-shell";
import { Card } from "@/components/ui";

export default function DocsPage() {
  return <MarketingShell><main className="mx-auto grid max-w-5xl gap-4 px-6 py-14 md:grid-cols-2">{["Setup Supabase", "Create campaign", "Load extension", "Scan Reddit", "Review drafts", "Export CSV"].map((title, i) => <Card key={title}><div className="text-xs font-semibold text-brand">STEP {i + 1}</div><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Follow the README instructions. The product works with demo data locally and syncs to Supabase once environment variables are configured.</p></Card>)}</main></MarketingShell>;
}
