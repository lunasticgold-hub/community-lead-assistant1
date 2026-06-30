import Link from "next/link";
import type { Lead } from "@/lib/types";
import { Badge, Card } from "./ui";

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
              {["Lead", "Platform", "Community", "Score", "Signals", "Status", "Owner", "Created", "Follow-up", "Actions"].map(head => <th key={head} className="px-4 py-3">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{lead.authorName}<div className="max-w-xs truncate text-xs font-normal text-slate-500">{lead.postSnippet}</div></td>
                <td className="px-4 py-3">{lead.platform}</td>
                <td className="px-4 py-3">{lead.communityName}</td>
                <td className="px-4 py-3"><Badge tone={lead.leadTemperature === "Hot" ? "green" : lead.leadTemperature === "Warm" ? "orange" : "blue"}>{lead.leadTemperature} {lead.leadScore}</Badge></td>
                <td className="px-4 py-3"><div className="flex max-w-xs flex-wrap gap-1">{lead.matchedKeywords.slice(0, 3).map(signal => <Badge key={signal}>{signal}</Badge>)}</div></td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">{lead.ownerId || "Unassigned"}</td>
                <td className="px-4 py-3">{lead.createdAt.slice(0, 10)}</td>
                <td className="px-4 py-3">{lead.followUpDate || "-"}</td>
                <td className="px-4 py-3"><Link className="font-semibold text-slate-950" href={`/leads/${lead.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
