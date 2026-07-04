import Link from "next/link";
import { LeadActions } from "@/components/lead-actions";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import type { Lead } from "@/lib/types";
import { Badge, Card } from "./ui";

function externalUrl(value?: string | null) {
  if (!value) return "";
  try {
    return new URL(value).toString();
  } catch {
    return "";
  }
}

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          {["Platform", "Score range", "Temperature", "Status", "Date range", "Keyword", "Owner", "Community"].map(filter => (
            <Badge key={filter}>{filter}</Badge>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["Lead", "Platform", "Community", "Score", "Signals", "Status", "Owner", "Created", "Follow-up", "Actions"].map(head => (
                <th key={head} className="px-4 py-3">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map(lead => {
              const sourceUrl = externalUrl(lead.sourceUrl);
              const profileUrl = externalUrl(lead.authorProfileUrl);
              const communityUrl = externalUrl(lead.communityUrl);

              return (
                <tr key={lead.id} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-950">{lead.authorName || "Unknown author"}</div>
                    <div className="mt-1 max-w-sm truncate text-xs text-slate-500">{lead.postSnippet}</div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                      {sourceUrl ? <Link className="text-blue-700 hover:text-blue-900" href={sourceUrl} target="_blank">Open post</Link> : null}
                      {profileUrl ? <Link className="text-slate-600 hover:text-slate-950" href={profileUrl} target="_blank">Profile</Link> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PlatformLogo platform={lead.platform} className="h-7 w-7 rounded-lg" />
                      <span className="font-medium">{platformDisplayName(lead.platform)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {communityUrl ? (
                      <Link className="font-medium text-slate-900 hover:text-blue-700" href={communityUrl} target="_blank">
                        {lead.communityName || "Community"}
                      </Link>
                    ) : (
                      <span>{lead.communityName || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={lead.leadTemperature === "Hot" ? "green" : lead.leadTemperature === "Warm" ? "orange" : "blue"}>
                      {lead.leadTemperature} {lead.leadScore}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {lead.matchedKeywords.slice(0, 3).map(signal => <Badge key={signal}>{signal}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{lead.status}</td>
                  <td className="px-4 py-3">{lead.ownerId || "Unassigned"}</td>
                  <td className="px-4 py-3">{lead.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3">{lead.followUpDate || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-64 flex-col gap-2">
                      <Link className="font-semibold text-slate-950" href={`/leads/${lead.id}`}>View detail</Link>
                      <LeadActions lead={lead} compact />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
