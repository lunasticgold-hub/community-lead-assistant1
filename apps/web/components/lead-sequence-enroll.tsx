"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { OutreachSequence } from "@/lib/types";

export function LeadSequenceEnroll({ leadId, sequences }: { leadId: string; sequences: OutreachSequence[] }) {
  const [sequenceId, setSequenceId] = useState(sequences[0]?.id || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function enroll() {
    if (!sequenceId) {
      setMessage("Create a sequence first.");
      return;
    }
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/outreach/enroll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId, sequenceId })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    setMessage(response.ok && data.ok !== false ? "Lead added to review queue." : data.error || "Could not add lead.");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add to outreach sequence</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <select className="min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={sequenceId} onChange={event => setSequenceId(event.target.value)}>
          {sequences.map(sequence => <option key={sequence.id} value={sequence.id}>{sequence.name}</option>)}
        </select>
        <Button type="button" disabled={loading || !sequences.length} onClick={enroll}>{loading ? "Adding" : "Add to Review Queue"}</Button>
      </div>
      {message ? <p className="mt-2 text-xs font-medium text-slate-500">{message}</p> : null}
    </div>
  );
}
