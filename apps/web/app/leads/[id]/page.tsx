import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { demoLeads } from "@/lib/mock-data";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = demoLeads.find(item => item.id === params.id) || demoLeads[0];
  return (
    <AppShell title="Lead Detail">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl font-semibold">{lead.authorName}</h2><p className="text-sm text-slate-500">{lead.platform} / {lead.communityName}</p></div>
            <Badge tone={lead.leadTemperature === "Hot" ? "green" : "orange"}>{lead.leadTemperature} {lead.leadScore}</Badge>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{lead.postText}</div>
          <div className="mt-5 flex flex-wrap gap-2">{lead.matchedKeywords.map(signal => <Badge key={signal}>{signal}</Badge>)}</div>
          <div className="mt-6 flex gap-2"><Link href={lead.sourceUrl}><Button variant="secondary">Open source</Button></Link><Link href={lead.authorProfileUrl}><Button variant="secondary">Open profile</Button></Link></div>
        </Card>
        <Card>
          <h3 className="font-semibold">Manual outreach draft</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">{lead.outreachDraft}</pre>
          <h3 className="mt-6 font-semibold">Follow-up draft</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{lead.followUpDraft}</pre>
        </Card>
      </div>
      <Card className="mt-4"><h3 className="font-semibold">Timeline</h3><div className="mt-3 text-sm text-slate-600">Lead found → Draft generated → Waiting for manual review</div></Card>
    </AppShell>
  );
}
