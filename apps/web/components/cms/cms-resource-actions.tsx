"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCmsToast } from "@/hooks/cms/use-cms-toast";

type CmsResourceActionsProps = {
  moduleSlug: string;
  rowId: string;
  archived?: boolean;
};

export function CmsResourceActions({ moduleSlug, rowId, archived = false }: CmsResourceActionsProps) {
  const router = useRouter();
  const { toast, showToast } = useCmsToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: "duplicate" | "archive" | "restore") {
    if (action === "archive" && !confirm("Archive this CMS record?")) return;
    setBusy(action);
    const response = await fetch(`/api/cms/${moduleSlug}/${rowId}/${action}`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok || data.ok === false) {
      showToast(data.error || "CMS action failed.", "error");
      return;
    }
    showToast(action === "duplicate" ? "Duplicated record." : action === "archive" ? "Archived record." : "Restored record.", "success");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2" onClick={event => event.stopPropagation()}>
      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() => run("duplicate")}
        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
      >
        {busy === "duplicate" ? "Duplicating..." : "Duplicate"}
      </button>
      {archived ? (
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => run("restore")}
          className="rounded-xl border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60"
        >
          {busy === "restore" ? "Restoring..." : "Restore"}
        </button>
      ) : (
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => run("archive")}
          className="rounded-xl border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 disabled:opacity-60"
        >
          {busy === "archive" ? "Archiving..." : "Archive"}
        </button>
      )}
      {toast ? (
        <div className={[
          "fixed bottom-5 right-5 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl",
          toast.tone === "error" ? "bg-red-500 text-white" : toast.tone === "success" ? "bg-emerald-500 text-white" : "bg-white text-slate-950"
        ].join(" ")}>
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

type CmsImportButtonProps = {
  moduleSlug: string;
};

export function CmsImportButton({ moduleSlug }: CmsImportButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast, showToast } = useCmsToast();
  const [importing, setImporting] = useState(false);

  async function importJson() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      showToast("Choose a JSON file first.", "error");
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const rows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "rows" in parsed ? (parsed as { rows: unknown }).rows : [];
      const response = await fetch(`/api/cms/${moduleSlug}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        showToast(data.error || "Import failed.", "error");
      } else {
        showToast(`Imported ${data.count || data.data?.count || 0} records.`, "success");
        router.refresh();
      }
    } catch {
      showToast("Import file must be valid JSON.", "error");
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input ref={inputRef} type="file" accept="application/json,.json" className="max-w-56 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200" />
      <button
        type="button"
        disabled={importing}
        onClick={importJson}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
      >
        {importing ? "Importing..." : "Import JSON"}
      </button>
      {toast ? (
        <div className={[
          "fixed bottom-5 right-5 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl",
          toast.tone === "error" ? "bg-red-500 text-white" : toast.tone === "success" ? "bg-emerald-500 text-white" : "bg-white text-slate-950"
        ].join(" ")}>
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
