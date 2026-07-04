"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { Lead, OutreachDraftQueueItem } from "@/lib/types";

type OutreachQueueActionsProps = {
  item: OutreachDraftQueueItem;
  lead: Lead | null;
};

async function queueAction(id: string, action: string, selectedVariationIndex?: number) {
  const response = await fetch(`/api/outreach/queue/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, selectedVariationIndex })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || "Could not update review item.");
  return data;
}

export function OutreachQueueActions({ item, lead }: OutreachQueueActionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(item.selectedVariationIndex || 0);
  const [draft, setDraft] = useState(item.draftVariations[selectedIndex] || item.draftText);
  const [message, setMessage] = useState("");
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

  function selectVariation(index: number) {
    setSelectedIndex(index);
    setDraft(item.draftVariations[index] || item.draftText);
    void queueAction(item.id, "select_variation", index).catch(error => setMessage(error instanceof Error ? error.message : "Could not select variation."));
  }

  return (
    <div className="space-y-3">
      {item.draftVariations.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {item.draftVariations.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${selectedIndex === index ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-600 ring-slate-200"}`}
              onClick={() => selectVariation(index)}
            >
              Variation {index + 1}
            </button>
          ))}
        </div>
      ) : null}
      <textarea
        className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-slate-400"
        value={draft}
        onChange={event => setDraft(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={Boolean(loading)} onClick={() => run("Approved", async () => queueAction(item.id, "approve"))}>Approve</Button>
        <Button type="button" disabled={Boolean(loading)} onClick={() => run("Copied", async () => {
          await navigator.clipboard.writeText(draft);
          await queueAction(item.id, "copy");
        })}>Copy Message</Button>
        {lead?.authorProfileUrl || lead?.sourceUrl ? (
          <Button type="button" variant="secondary" disabled={Boolean(loading)} onClick={() => run("Profile opened", async () => {
            window.open(lead.authorProfileUrl || lead.sourceUrl, "_blank", "noopener,noreferrer");
            await queueAction(item.id, "open_profile");
          })}>Open Profile</Button>
        ) : null}
        <Button type="button" variant="secondary" disabled={Boolean(loading)} onClick={() => run("Marked sent", async () => queueAction(item.id, "mark_sent"))}>Mark Sent Manually</Button>
        <Button type="button" variant="secondary" disabled={Boolean(loading)} onClick={() => run("Marked replied", async () => queueAction(item.id, "mark_replied"))}>Mark Replied</Button>
        <Button type="button" variant="ghost" disabled={Boolean(loading)} onClick={() => run("Archived", async () => queueAction(item.id, "archive"))}>Archive</Button>
      </div>
      {message ? <p className="text-xs font-medium text-slate-500">{message}</p> : null}
    </div>
  );
}
