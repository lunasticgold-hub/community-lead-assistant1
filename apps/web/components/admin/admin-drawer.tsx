"use client";

import { useEffect, useState } from "react";
import type { AdminModuleConfig, AdminRow } from "@/lib/admin/types";

export function AdminDrawer({
  module,
  row,
  open,
  onClose,
  onSaved
}: {
  module: AdminModuleConfig;
  row: AdminRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AdminRow>({});

  useEffect(() => {
    setForm(row || {});
    setError("");
  }, [row]);

  if (!open || !row) return null;

  async function save() {
    setSaving(true);
    setError("");
    const method = row?.id ? "PATCH" : "POST";
    const url = row?.id ? `/api/admin/${module.slug}/${row.id}` : `/api/admin/${module.slug}`;
    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(String(json.error || "Could not save record."));
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{row.id ? "Edit" : "Create"} {module.title}</h2>
          <button onClick={onClose} className="rounded border border-white/10 px-2 py-1 text-sm">Close</button>
        </div>

        {error ? <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        <div className="mt-5 space-y-4">
          {module.columns.filter(column => column.editable).map(column => (
            <label key={column.key} className="block">
              <span className="text-xs text-slate-400">{column.label}</span>
              {column.type === "boolean" ? (
                <label className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form[column.key])}
                    onChange={event => setForm(current => ({ ...current, [column.key]: event.target.checked }))}
                    className="h-4 w-4 accent-blue-500"
                  />
                  Enabled
                </label>
              ) : column.type === "textarea" || column.type === "markdown" || column.type === "json" ? (
                <textarea
                  value={formatInputValue(form[column.key])}
                  onChange={event => setForm(current => ({ ...current, [column.key]: event.target.value }))}
                  className="mt-1 min-h-32 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              ) : (
                <input
                  type={inputType(column.type)}
                  value={formatInputValue(form[column.key])}
                  onChange={event => setForm(current => ({ ...current, [column.key]: event.target.value }))}
                  className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-slate-900 px-3 text-sm outline-none focus:border-blue-500"
                />
              )}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Cancel</button>
          <button disabled={saving} onClick={save} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function formatInputValue(value: unknown) {
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function inputType(type?: string) {
  if (type === "number") return "number";
  if (type === "date") return "date";
  if (type === "datetime") return "datetime-local";
  if (type === "email") return "email";
  if (type === "url") return "url";
  return "text";
}
