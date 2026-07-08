"use client";

import { useMemo, useRef, useState } from "react";
import type { AdminModuleConfig, AdminRow } from "@/lib/admin/types";
import { useAdminTable } from "@/hooks/use-admin-table";
import { AdminDrawer } from "./admin-drawer";
import { AdminTable } from "./admin-table";

export function AdminModulePage({
  module,
  initialRows,
  initialCount,
  initialPage,
  initialPageSize,
  tableMissing
}: {
  module: AdminModuleConfig;
  initialRows: AdminRow[];
  initialCount: number;
  initialPage: number;
  initialPageSize: number;
  tableMissing?: boolean;
}) {
  const table = useAdminTable({ module, initialRows, initialCount, initialPage, initialPageSize });
  const [editingRow, setEditingRow] = useState<AdminRow | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const importRef = useRef<HTMLInputElement | null>(null);
  const exportHref = useMemo(() => `/api/admin/${module.slug}?format=csv`, [module.slug]);

  async function importJson() {
    const file = importRef.current?.files?.[0];
    if (!file) {
      setImportError("Choose a JSON file to import.");
      return;
    }
    setImporting(true);
    setImportError("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const rows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "rows" in parsed ? (parsed as { rows: unknown }).rows : [];
      const response = await fetch(`/api/admin/${module.slug}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.ok === false) {
        setImportError(String(json.error || "Import failed."));
        return;
      }
      await table.refresh();
      if (importRef.current) importRef.current.value = "";
    } catch {
      setImportError("Import file must be valid JSON.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{module.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{module.description}</p>
        </div>
        <div className="flex gap-2">
          {module.exportEnabled ? <a className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10" href={exportHref}>Export CSV</a> : null}
          {module.createEnabled ? (
            <div className="flex items-center gap-2">
              <input ref={importRef} type="file" accept="application/json,.json" className="max-w-44 rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-slate-300" />
              <button type="button" disabled={importing} onClick={importJson} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50">
                {importing ? "Importing..." : "Import JSON"}
              </button>
            </div>
          ) : null}
          {module.createEnabled ? <button onClick={() => setEditingRow({})} className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white">Create</button> : null}
        </div>
      </div>

      {tableMissing ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          This module is initializing. Use Create or Import JSON when records are ready to be added.
        </div>
      ) : null}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        {importError ? <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{importError}</div> : null}
        <div className="mb-3 flex flex-col gap-2 md:flex-row">
          <input
            value={table.search}
            onChange={event => table.setSearch(event.target.value)}
            placeholder={`Search ${module.title.toLowerCase()}`}
            className="min-h-10 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm outline-none focus:border-blue-500"
          />
          {module.slug === "leads" ? (
            <button
              type="button"
              onClick={() => {
                table.setPage(1);
                table.setUniqueOnly(!table.uniqueOnly);
              }}
              className={["rounded-lg border px-3 py-2 text-sm font-semibold", table.uniqueOnly ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100" : "border-white/10 hover:bg-white/10"].join(" ")}
            >
              {table.uniqueOnly ? "Unique Leads On" : "Unique Leads"}
            </button>
          ) : null}
          <button onClick={table.refresh} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10">Refresh</button>
        </div>
        {module.slug === "leads" ? (
          <div className="mb-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Total Leads: <span className="font-semibold text-white">{table.totalBeforeDedupe}</span></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Unique Leads: <span className="font-semibold text-white">{table.count}</span></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Duplicates Removed: <span className="font-semibold text-white">{table.duplicatesRemoved}</span></div>
          </div>
        ) : null}

        {table.error ? <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{table.error}</div> : null}

        <AdminTable module={module} rows={table.rows} loading={table.loading} onEdit={setEditingRow} onAction={table.runAction} />

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{table.count} records</span>
          <div className="flex items-center gap-2">
            <button disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)} className="rounded border border-white/10 px-2 py-1 disabled:opacity-40">Prev</button>
            <span>Page {table.page}</span>
            <button disabled={table.page * table.pageSize >= table.count} onClick={() => table.setPage(table.page + 1)} className="rounded border border-white/10 px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      <AdminDrawer
        module={module}
        row={editingRow}
        open={Boolean(editingRow)}
        onClose={() => setEditingRow(null)}
        onSaved={() => {
          setEditingRow(null);
          table.refresh();
        }}
      />
    </div>
  );
}
