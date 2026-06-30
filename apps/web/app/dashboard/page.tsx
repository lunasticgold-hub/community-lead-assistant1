import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { demoLeads } from "@/lib/mock-data";

export default function DashboardPage() {
  const hot = demoLeads.filter(lead => lead.leadTemperature === "Hot").length;
  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {[["Leads today", demoLeads.length], ["Hot leads", hot], ["Drafts copied", 12], ["Follow-ups due", 3]].map(([label, value]) => <Card key={label as string}><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div></Card>)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <Card>
          <h2 className="font-semibold">Usage by day</h2>
          <div className="mt-6 flex h-52 items-end gap-3">
            {[34, 58, 44, 82, 64, 96, 78].map((height, i) => <div key={i} className="flex-1 rounded-t-xl bg-slate-900" style={{ height: `${height}%` }} />)}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Top signals</h2>
          <div className="mt-4 flex flex-wrap gap-2">{["lead generation", "looking for", "outbound", "budget", "seo"].map(signal => <Badge key={signal}>{signal}</Badge>)}</div>
          <h2 className="mt-8 font-semibold">Conversion funnel</h2>
          <div className="mt-4 space-y-3">{["New", "Contacted", "Converted"].map((label, i) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{[42, 11, 2][i]}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${[90, 42, 12][i]}%` }} /></div></div>)}</div>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="font-semibold">Recent lead activity</h2>
        <div className="mt-4 space-y-3">{demoLeads.map(lead => <div key={lead.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><div className="font-medium">{lead.authorName}</div><div className="text-sm text-slate-500">{lead.platform} / {lead.communityName}</div></div><Badge tone={lead.leadTemperature === "Hot" ? "green" : "orange"}>{lead.leadTemperature} {lead.leadScore}</Badge></div>)}</div>
      </Card>
    </AppShell>
  );
}
