import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  const leads = await getWorkspaceLeads(workspace.id, 1000);
  const lead = leads.find(item => item.id === id);
  if (!lead) notFound();

  return (
    <AppShell title="Lead Detail">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl font-semibold">{lead.authorName || "Unknown author"}</h2><p className="text-sm text-slate-500">{lead.platform} / {lead.communityName}</p></div>
            <Badge tone={lead.leadTemperature === "Hot" ? "green" : "orange"}>{lead.leadTemperature} {lead.leadScore}</Badge>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{lead.postText}</div>
          <div className="mt-5 flex flex-wrap gap-2">{lead.matchedKeywords.map(signal => <Badge key={signal}>{signal}</Badge>)}</div>
          <div className="mt-6 flex gap-2">
            {lead.sourceUrl ? <Link href={lead.sourceUrl}><Button variant="secondary">Open source</Button></Link> : null}
            {lead.authorProfileUrl ? <Link href={lead.authorProfileUrl}><Button variant="secondary">Open profile</Button></Link> : null}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">Manual outreach draft</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">{lead.outreachDraft || "No draft generated yet."}</pre>
          <h3 className="mt-6 font-semibold">Follow-up draft</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{lead.followUpDraft || "No follow-up draft generated yet."}</pre>
        </Card>
      </div>
      <Card className="mt-4"><h3 className="font-semibold">Timeline</h3><div className="mt-3 text-sm text-slate-600">Lead found / Draft generated / Waiting for manual review</div></Card>
    </AppShell>
  );
}
