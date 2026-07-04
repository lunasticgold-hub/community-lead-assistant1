import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { OutreachQueueActions } from "@/components/outreach-queue-actions";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Badge, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { listReviewQueue } from "@/lib/outreach";

function dueLabel(value: string) {
  const due = new Date(value).getTime();
  if (Number.isNaN(due)) return "No due date";
  const diffHours = Math.round((due - Date.now()) / 36e5);
  if (diffHours <= 0) return "Ready now";
  if (diffHours < 24) return `Due in ${diffHours}h`;
  return `Due in ${Math.ceil(diffHours / 24)}d`;
}

export default async function ReviewQueuePage() {
  const { workspace } = await requireWorkspace();
  const queue = await listReviewQueue(workspace.id);
  const active = queue.filter(item => ["review", "ready_to_send", "queued"].includes(item.status));

  return (
    <AppShell title="Review Queue">
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {[
          ["Waiting review", queue.filter(item => item.status === "review").length],
          ["Ready to send", queue.filter(item => item.status === "ready_to_send").length],
          ["Sent manually", queue.filter(item => item.status === "sent_manually").length],
          ["Replies", queue.filter(item => item.status === "replied").length]
        ].map(([label, value]) => <Card key={String(label)}><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div></Card>)}
      </div>

      <div className="space-y-4">
        {active.map(item => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <PlatformLogo platform={item.platform} />
                <div>
                  <h2 className="font-semibold">{item.lead?.authorName || "Unknown lead"}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {platformDisplayName(item.platform)} / {item.sequence?.name || "Manual sequence"} / Step {item.stepOrder}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                    {item.lead?.sourceUrl ? <Link className="text-blue-700 hover:text-blue-900" href={item.lead.sourceUrl} target="_blank">Original post</Link> : null}
                    {item.lead?.authorProfileUrl ? <Link className="text-slate-600 hover:text-slate-950" href={item.lead.authorProfileUrl} target="_blank">Profile</Link> : null}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge tone={item.status === "ready_to_send" ? "green" : "orange"}>{item.status.replaceAll("_", " ")}</Badge>
                <Badge>{dueLabel(item.dueAt)}</Badge>
              </div>
            </div>
            <div className="mt-5">
              <OutreachQueueActions item={item} lead={item.lead} />
            </div>
          </Card>
        ))}
        {!active.length ? (
          <Card>
            <h2 className="font-semibold">No drafts need review</h2>
            <p className="mt-2 text-sm text-slate-500">Enroll leads into a sequence from the Leads page or the Chrome extension overlay.</p>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
