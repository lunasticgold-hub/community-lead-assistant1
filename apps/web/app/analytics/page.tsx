import { AppShell } from "@/components/app-shell";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";
import { getOutreachFunnel, listSequences } from "@/lib/outreach";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type UsageEvent = {
  user_id: string | null;
  event_type: string | null;
  platform: string | null;
  created_at: string | null;
};

function sameMonth(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
}

function groupCounts(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

async function getUsageEvents(workspaceId: string): Promise<UsageEvent[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("usage_events")
    .select("user_id,event_type,platform,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) return [];
  return (data || []) as UsageEvent[];
}

export default async function AnalyticsPage() {
  const { workspace } = await requireWorkspace();
  const [leads, events, funnel, sequences] = await Promise.all([
    getWorkspaceLeads(workspace.id),
    getUsageEvents(workspace.id),
    getOutreachFunnel(workspace.id),
    listSequences(workspace.id)
  ]);
  const monthlyLeads = leads.filter(lead => lead.createdAt && sameMonth(lead.createdAt)).length;
  const activeUsers = new Set(events.filter(event => event.user_id).map(event => event.user_id)).size;
  const draftEvents = events.filter(event => event.event_type === "draft_copied").length;
  const outreachEvents = events.filter(event => event.event_type === "manual_outreach_opened").length;
  const exports = events.filter(event => event.event_type === "export_created").length;
  const syncFailures = events.filter(event => event.event_type === "sync_failed").length;
  const platformCounts = groupCounts(leads.map(lead => lead.platform));
  const maxPlatform = Math.max(1, ...platformCounts.map(([, count]) => count));

  return (
    <AppShell title="Usage Analytics">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Active users", activeUsers],
          ["Leads found", leads.length],
          ["Leads this month", monthlyLeads],
          ["Drafts copied", draftEvents],
          ["Manual outreach opened", outreachEvents],
          ["Exports", exports],
          ["Sync failures", syncFailures]
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Platform usage</h2>
            <p className="mt-1 text-sm text-slate-500">Grouped by saved lead source.</p>
          </div>
          <div className="text-sm font-medium text-slate-500">{platformCounts.length} active platforms</div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {platformCounts.map(([platform, count]) => (
            <div key={platform} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PlatformLogo platform={platform} className="h-8 w-8 rounded-lg" />
                  <div className="font-semibold">{platformDisplayName(platform)}</div>
                </div>
                <div className="text-sm font-semibold text-slate-500">{count}</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(8, Math.round((count / maxPlatform) * 100))}%` }} />
              </div>
            </div>
          ))}
          {!platformCounts.length ? <p className="text-sm text-slate-500">No platform activity yet. Start a scan from the extension.</p> : null}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <h2 className="font-semibold">Manual outreach funnel</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Total Leads", funnel.totalLeads],
              ["Drafts Generated", funnel.draftsGenerated],
              ["Messages Sent Manually", funnel.sentManually],
              ["Replies Received", funnel.repliesReceived]
            ].map(([label, value], index) => {
              const base = index === 0 ? Math.max(1, Number(value)) : Math.max(1, funnel.totalLeads);
              const width = Math.max(8, Math.round((Number(value) / base) * 100));
              return (
                <div key={String(label)}>
                  <div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{value}</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${width}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Sequence performance</h2>
          <div className="mt-4 space-y-3">
            {sequences.map(sequence => (
              <div key={sequence.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{sequence.name}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{sequence.status}</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">{sequence.steps.length} steps / {sequence.dailyReviewLimit} daily reviews</div>
              </div>
            ))}
            {!sequences.length ? <p className="text-sm text-slate-500">Create a sequence to start tracking step-level performance.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
