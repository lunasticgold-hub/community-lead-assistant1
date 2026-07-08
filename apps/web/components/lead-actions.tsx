"use client";

import { useState } from "react";
import { Button, TextInput } from "@/components/ui";
import type { Lead } from "@/lib/types";

type LeadActionsProps = {
  lead: Lead;
  compact?: boolean;
};

async function updateLead(id: string, patch: Record<string, unknown>) {
  const response = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || "Could not update lead.");
  return data;
}

async function markLeadFraud(id: string) {
  const response = await fetch(`/api/leads/${id}/fraud`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ reason: "Marked as fraud from lead dashboard" })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || "Could not mark lead as fraud.");
  return data;
}

export function LeadActions({ lead, compact = false }: LeadActionsProps) {
  const [message, setMessage] = useState("");
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate || "");
  const [loading, setLoading] = useState("");

  async function run(label: string, action: () => Promise<void>) {
    setLoading(label);
    setMessage("");
    try {
      await action();
      setMessage(`${label} done`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setLoading("");
    }
  }

  function manualOutreachUrl() {
    if (lead.platform === "reddit" && lead.authorName) {
      return `https://www.reddit.com/message/compose/?${new URLSearchParams({ to: lead.authorName, message: lead.outreachDraft || "" })}`;
    }
    return lead.authorProfileUrl || lead.sourceUrl || "";
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(loading)}
          onClick={() => run("Copy opener", async () => navigator.clipboard.writeText(lead.outreachDraft || ""))}
        >
          Copy opener
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(loading)}
          onClick={() => run("Copy follow-up", async () => navigator.clipboard.writeText(lead.followUpDraft || ""))}
        >
          Copy follow-up
        </Button>
        {lead.sourceUrl ? (
          <Button type="button" variant="secondary" onClick={() => window.open(lead.sourceUrl, "_blank", "noopener,noreferrer")}>
            Open post
          </Button>
        ) : null}
        {lead.authorProfileUrl ? (
          <Button type="button" variant="secondary" onClick={() => window.open(lead.authorProfileUrl, "_blank", "noopener,noreferrer")}>
            Open profile
          </Button>
        ) : null}
        {manualOutreachUrl() ? (
          <Button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => run("Manual outreach opened", async () => {
              if (lead.outreachDraft) await navigator.clipboard.writeText(lead.outreachDraft);
              window.open(manualOutreachUrl(), "_blank", "noopener,noreferrer");
              await updateLead(lead.id, { status: "Draft Opened" });
            })}
          >
            Open manual outreach
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => run("Marked contacted", async () => updateLead(lead.id, { status: "Contacted Manually" }))}
        >
          Mark contacted
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(loading)}
          onClick={() => run("Fraud blocked", async () => {
            if (!window.confirm("Mark this lead source as fraud? Future leads from this person will be blocked.")) return;
            await markLeadFraud(lead.id);
            window.location.reload();
          })}
        >
          Mark fraud
        </Button>
      </div>

      {!compact ? (
        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Follow-up reminder</label>
          <div className="flex gap-2">
            <TextInput type="date" value={followUpDate} onChange={event => setFollowUpDate(event.target.value)} />
            <Button
              type="button"
              disabled={Boolean(loading)}
              onClick={() => run("Follow-up scheduled", async () => updateLead(lead.id, { followUpDate, status: "Follow-up Due" }))}
            >
              Save
            </Button>
          </div>
        </div>
      ) : null}

      {message ? <p className="text-xs font-medium text-slate-500">{message}</p> : null}
    </div>
  );
}
