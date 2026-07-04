import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { OutreachQueueActions } from "@/components/outreach-queue-actions";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Badge, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getOutreachActivity, listInbox } from "@/lib/outreach";

export default async function InboxPage() {
  const { workspace } = await requireWorkspace();
  const [items, activity] = await Promise.all([
    listInbox(workspace.id),
    getOutreachActivity(workspace.id)
  ]);

  return (
    <AppShell title="Human Inbox">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <PlatformLogo platform={item.platform} />
                  <div>
                    <h2 className="font-semibold">{item.lead?.authorName || "Unknown lead"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{platformDisplayName(item.platform)} / {item.sequence?.name || "Manual sequence"}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                      {item.lead?.sourceUrl ? <Link className="text-blue-700 hover:text-blue-900" href={item.lead.sourceUrl} target="_blank">Open post</Link> : null}
                      {item.lead?.authorProfileUrl ? <Link className="text-slate-600 hover:text-slate-950" href={item.lead.authorProfileUrl} target="_blank">Open profile</Link> : null}
                    </div>
                  </div>
                </div>
                <Badge tone="green">Needs human reply</Badge>
              </div>
              <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{item.lead?.postSnippet || "Conversation was moved to the human inbox."}</p>
              <div className="mt-4">
                <OutreachQueueActions item={item} lead={item.lead} />
              </div>
            </Card>
          ))}
          {!items.length ? (
            <Card>
              <h2 className="font-semibold">No active replies yet</h2>
              <p className="mt-2 text-sm text-slate-500">When a user marks a lead as replied, the sequence pauses and the conversation appears here.</p>
            </Card>
          ) : null}
        </div>
        <Card>
          <h2 className="font-semibold">Activity timeline</h2>
          <div className="mt-4 space-y-3">
            {activity.slice(0, 30).map(event => (
              <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{event.eventType.replaceAll("_", " ")}</div>
                  <div className="text-xs text-slate-500">{event.createdAt.slice(0, 16).replace("T", " ")}</div>
                </div>
                <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap text-xs text-slate-500">{JSON.stringify(event.metadata, null, 2)}</pre>
              </div>
            ))}
            {!activity.length ? <p className="text-sm text-slate-500">No outreach activity yet.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
