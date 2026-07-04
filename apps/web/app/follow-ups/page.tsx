import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LeadActions } from "@/components/lead-actions";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Badge, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getWorkspaceLeads } from "@/lib/data/leads";

export default async function FollowUpsPage() {
  const { workspace } = await requireWorkspace();
  const leads = await getWorkspaceLeads(workspace.id);
  const due = leads
    .filter(lead => lead.status === "Follow-up Due" || lead.followUpDate)
    .sort((a, b) => String(a.followUpDate || "9999").localeCompare(String(b.followUpDate || "9999")));

  return (
    <AppShell title="Follow-ups">
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Manual follow-up workflow</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Follow-ups are reminders and drafts only. The app helps you copy the message, open the original post or profile, and mark the lead after you send manually.
          </p>
          <div className="mt-5 grid gap-3 text-sm">
            {["Mark contacted manually", "Pick follow-up date", "Copy follow-up draft", "Open post/profile", "Send manually on the platform"].map(step => (
              <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-medium">{step}</div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Due soon</h2>
          <div className="mt-4 space-y-3">
            {due.slice(0, 20).map(lead => (
              <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <PlatformLogo platform={lead.platform} className="h-9 w-9" />
                    <div>
                      <div className="font-semibold">{lead.authorName || "Unknown author"}</div>
                      <div className="text-sm text-slate-500">{platformDisplayName(lead.platform)} / {lead.communityName || "Community"}</div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                        {lead.sourceUrl ? <Link className="text-blue-700 hover:text-blue-900" href={lead.sourceUrl} target="_blank">Open post</Link> : null}
                        {lead.communityUrl ? <Link className="text-slate-600 hover:text-slate-950" href={lead.communityUrl} target="_blank">Community</Link> : null}
                      </div>
                    </div>
                  </div>
                  <Badge tone={lead.followUpDate ? "orange" : "blue"}>{lead.followUpDate || "No date"}</Badge>
                </div>
                <div className="mt-4">
                  <LeadActions lead={lead} compact />
                </div>
              </div>
            ))}
            {!due.length ? <p className="text-sm text-slate-500">No follow-ups are due.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
