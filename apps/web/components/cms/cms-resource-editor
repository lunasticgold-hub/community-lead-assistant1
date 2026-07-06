"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCmsToast } from "@/hooks/cms/use-cms-toast";
import type { CmsField, CmsModule, CmsRow } from "@/lib/cms/types";

type CmsResourceEditorProps = {
  module: CmsModule;
  row?: CmsRow;
  compact?: boolean;
};

export function CmsResourceEditor({ module, row, compact = false }: CmsResourceEditorProps) {
  const router = useRouter();
  const { toast, showToast } = useCmsToast();
  const initial = useMemo(() => buildInitialState(module.fields, row), [module.fields, row]);
  const [values, setValues] = useState<Record<string, string | boolean>>(initial);
  const [saving, setSaving] = useState(false);

  function setValue(key: string, value: string | boolean) {
    setValues(current => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const payload = buildPayload(module.fields, values);
    const endpoint = row?.id ? `/api/cms/${module.slug}/${row.id}` : `/api/cms/${module.slug}`;
    const response = await fetch(endpoint, {
      method: row?.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok || data.ok === false) {
      showToast(data.error || "Could not save CMS item.", "error");
      return;
    }
    showToast(row?.id ? "Saved changes." : "Created CMS item.", "success");
    router.refresh();
  }

  async function remove() {
    if (!row?.id || !confirm("Delete this CMS item?")) return;
    const response = await fetch(`/api/cms/${module.slug}/${row.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      showToast(data.error || "Could not delete CMS item.", "error");
      return;
    }
    showToast("Deleted CMS item.", "success");
    router.refresh();
  }

  return (
    <div className={compact ? "space-y-3" : "rounded-2xl border border-white/10 bg-white/[0.04] p-5"}>
      <div className="grid gap-4 md:grid-cols-2">
        {module.fields.map(field => (
          <FieldControl key={field.key} field={field} value={values[field.key]} onChange={value => setValue(field.key, value)} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={saving} onClick={save} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60">
          {saving ? "Saving..." : row?.id ? "Save changes" : module.createLabel}
        </button>
        {row?.id ? (
          <button type="button" onClick={remove} className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10">
            Delete
          </button>
        ) : null}
      </div>
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

function FieldControl({ field, value, onChange }: { field: CmsField; value: string | boolean | undefined; onChange: (value: string | boolean) => void }) {
  const label = (
    <div className="mb-1 flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-200">{field.label}</span>
      {field.required ? <span className="text-[10px] font-bold uppercase tracking-wide text-blue-200">Required</span> : null}
    </div>
  );

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
        <input type="checkbox" checked={Boolean(value)} onChange={event => onChange(event.target.checked)} />
        <span className="text-sm font-medium text-slate-200">{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea" || field.type === "markdown" || field.type === "json") {
    return (
      <label className="md:col-span-2">
        {label}
        <textarea
          rows={field.type === "json" ? 7 : 5}
          value={typeof value === "string" ? value : ""}
          onChange={event => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
        />
        {field.helper ? <p className="mt-1 text-xs leading-5 text-slate-400">{field.helper}</p> : null}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label>
        {label}
        <select
          value={typeof value === "string" ? value : ""}
          onChange={event => onChange(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
        >
          {(field.options || []).map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label>
      {label}
      <input
        type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : field.type === "email" ? "email" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={event => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
      />
    </label>
  );
}

function buildInitialState(fields: CmsField[], row?: CmsRow) {
  const state: Record<string, string | boolean> = {};
  for (const field of fields) {
    const value = row?.[field.key];
    if (field.type === "boolean") state[field.key] = Boolean(value);
    else if (field.type === "json") state[field.key] = value === undefined ? "{}" : JSON.stringify(value, null, 2);
    else if (field.type === "datetime" && typeof value === "string") state[field.key] = value.slice(0, 16);
    else state[field.key] = value === undefined || value === null ? defaultValue(field) : String(value);
  }
  return state;
}

function buildPayload(fields: CmsField[], values: Record<string, string | boolean>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.key];
    if (field.type === "number") payload[field.key] = Number(value || 0);
    else if (field.type === "boolean") payload[field.key] = Boolean(value);
    else if (field.type === "json") payload[field.key] = parseJson(String(value || "{}"));
    else payload[field.key] = value;
  }
  return payload;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return { raw: value };
  }
}

function defaultValue(field: CmsField) {
  if (field.type === "select") return field.options?.[0] || "";
  if (field.type === "json") return "{}";
  if (field.type === "number") return "0";
  return "";
}
