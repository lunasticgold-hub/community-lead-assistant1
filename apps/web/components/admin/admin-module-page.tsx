"use client";

import { useMemo, useState } from "react";
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
  const exportHref = useMemo(() => `/api/admin/${module.slug}?format=csv`, [module.slug]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{module.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{module.description}</p>
        </div>
        <div className="flex gap-2">
          {module.exportEnabled ? <a className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10" href={exportHref}>Export CSV</a> : null}
          {module.createEnabled ? <button onClick={() => setEditingRow({})} className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white">Create</button> : null}
        </div>
      </div>

      {tableMissing ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          This admin table is not installed yet. Run the admin panel migration to enable live records for this module.
        </div>
      ) : null}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="mb-3 flex flex-col gap-2 md:flex-row">
          <input
            value={table.search}
            onChange={event => table.setSearch(event.target.value)}
            placeholder={`Search ${module.title.toLowerCase()}`}
            className="min-h-10 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm outline-none focus:border-blue-500"
          />
          <button onClick={table.refresh} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10">Refresh</button>
        </div>

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
