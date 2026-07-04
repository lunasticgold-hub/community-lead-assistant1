import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Badge, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";

function countTop(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export default async function DashboardPage() {
  const { workspace } = await requireWorkspace();
  const leads = await getWorkspaceLeads(workspace.id);
  const hot = leads.filter(lead => lead.leadTemperature === "Hot").length;
  const followUpsDue = leads.filter(lead => lead.status === "Follow-up Due").length;
  const topSignals = countTop(leads.flatMap(lead => lead.matchedKeywords));
  const platformCounts = countTop(leads.map(lead => lead.platform));
  const maxPlatform = Math.max(1, ...platformCounts.map(([, count]) => count));

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {[["Leads found", leads.length], ["Hot leads", hot], ["Drafts ready", leads.filter(lead => lead.outreachDraft).length], ["Follow-ups due", followUpsDue]].map(([label, value]) => (
          <Card key={label as string}><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div></Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <Card>
          <h2 className="font-semibold">Lead volume</h2>
          <div className="mt-6 flex h-52 items-end gap-3">
            {[...Array(7)].map((_, i) => {
              const height = Math.max(8, Math.min(100, (leads.length / 7) * (i + 1) * 8));
              return <div key={i} className="flex-1 rounded-t-xl bg-slate-900" style={{ height: `${height}%` }} />;
            })}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Platform performance</h2>
          <div className="mt-4 space-y-3">
            {platformCounts.length ? platformCounts.map(([platform, count]) => (
              <div key={platform}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <PlatformLogo platform={platform} className="h-7 w-7 rounded-lg" />
                    <span>{platformDisplayName(platform)}</span>
                  </div>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(8, Math.round((count / maxPlatform) * 100))}%` }} /></div>
              </div>
            )) : <p className="text-sm text-slate-500">No platform data yet.</p>}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Card>
          <h2 className="font-semibold">Recent lead activity</h2>
          <div className="mt-4 space-y-3">
            {leads.slice(0, 8).map(lead => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <PlatformLogo platform={lead.platform} className="h-9 w-9" />
                  <div>
                    <div className="font-medium">{lead.authorName || "Unknown author"}</div>
                    <div className="text-sm text-slate-500">{platformDisplayName(lead.platform)} / {lead.communityName}</div>
                    {lead.sourceUrl ? <Link className="text-xs font-semibold text-blue-700 hover:text-blue-900" href={lead.sourceUrl} target="_blank">Open post</Link> : null}
                  </div>
                </div>
                <Badge tone={lead.leadTemperature === "Hot" ? "green" : "orange"}>{lead.leadTemperature} {lead.leadScore}</Badge>
              </div>
            ))}
            {!leads.length ? <p className="text-sm text-slate-500">No leads synced yet. Install the extension and start a scan.</p> : null}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Top signals</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topSignals.length ? topSignals.map(([signal]) => <Badge key={signal}>{signal}</Badge>) : <p className="text-sm text-slate-500">No lead signals yet.</p>}
          </div>
          <h2 className="mt-8 font-semibold">Conversion funnel</h2>
          <div className="mt-4 space-y-3">
            {["New", "Contacted Manually", "Converted"].map(label => {
              const value = leads.filter(lead => lead.status === label).length;
              const width = leads.length ? Math.max(8, Math.round((value / leads.length) * 100)) : 8;
              return <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${width}%` }} /></div></div>;
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
