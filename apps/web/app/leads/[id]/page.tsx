import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LeadActions } from "@/components/lead-actions";
import { LeadSequenceEnroll } from "@/components/lead-sequence-enroll";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Badge, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";
import { listSequences } from "@/lib/outreach";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  const [leads, sequences] = await Promise.all([
    getWorkspaceLeads(workspace.id, 1000),
    listSequences(workspace.id)
  ]);
  const lead = leads.find(item => item.id === id);
  if (!lead) notFound();

  return (
    <AppShell title="Lead Detail">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlatformLogo platform={lead.platform} />
              <div>
                <h2 className="text-2xl font-semibold">{lead.authorName || "Unknown author"}</h2>
                <p className="text-sm text-slate-500">{platformDisplayName(lead.platform)} / {lead.communityName}</p>
              </div>
            </div>
            <Badge tone={lead.leadTemperature === "Hot" ? "green" : "orange"}>{lead.leadTemperature} {lead.leadScore}</Badge>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{lead.postText}</div>
          <div className="mt-5 flex flex-wrap gap-2">{lead.matchedKeywords.map(signal => <Badge key={signal}>{signal}</Badge>)}</div>
          <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created by</div>
              <div className="mt-1 font-medium text-slate-900">{lead.creatorEmail || "Unknown"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</div>
              <div className="mt-1 font-medium text-slate-900">{lead.leadCategory}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subcategory</div>
              <div className="mt-1 font-medium text-slate-900">{lead.leadSubcategory} · {lead.categoryConfidence}%</div>
            </div>
          </div>
          <div className="mt-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            {lead.sourceUrl ? <Link className="font-semibold text-blue-700 hover:text-blue-900" href={lead.sourceUrl} target="_blank">Open original post</Link> : null}
            {lead.communityUrl ? <Link className="font-semibold text-slate-700 hover:text-slate-950" href={lead.communityUrl} target="_blank">Open community / group</Link> : null}
            {lead.authorProfileUrl ? <Link className="font-semibold text-slate-700 hover:text-slate-950" href={lead.authorProfileUrl} target="_blank">Open author profile</Link> : null}
          </div>
          <div className="mt-5">
            <LeadSequenceEnroll leadId={lead.id} sequences={sequences} />
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">Manual outreach draft</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">{lead.outreachDraft || "No draft generated yet."}</pre>
          <h3 className="mt-6 font-semibold">Follow-up draft</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{lead.followUpDraft || "No follow-up draft generated yet."}</pre>
          <div className="mt-5">
            <LeadActions lead={lead} />
          </div>
        </Card>
      </div>
      <Card className="mt-4"><h3 className="font-semibold">Timeline</h3><div className="mt-3 text-sm text-slate-600">Lead found / Draft generated / Waiting for manual review</div></Card>
    </AppShell>
  );
}
