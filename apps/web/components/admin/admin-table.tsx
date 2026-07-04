"use client";

import type { AdminAction, AdminModuleConfig, AdminRow } from "@/lib/admin/types";

export function AdminTable({
  module,
  rows,
  loading,
  onEdit,
  onAction
}: {
  module: AdminModuleConfig;
  rows: AdminRow[];
  loading: boolean;
  onEdit: (row: AdminRow) => void;
  onAction: (row: AdminRow, action: AdminAction) => void;
}) {
  if (loading) return <div className="h-72 animate-pulse rounded-xl bg-white/[0.04]" />;

  if (!rows.length) {
    return <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">No records found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {module.columns.map(column => <th key={column.key} className="px-3 py-3">{column.label}</th>)}
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id || index)} className="border-t border-white/10">
              {module.columns.map(column => <td key={column.key} className="max-w-72 truncate px-3 py-3">{formatCell(row[column.key])}</td>)}
              <td className="px-3 py-3 text-right">
                <div className="inline-flex flex-wrap justify-end gap-1">
                  <button onClick={() => onEdit(row)} className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/10">Edit</button>
                  {module.actions.filter(action => action !== "edit" && action !== "view").slice(0, 4).map(action => (
                    <button key={action} onClick={() => onAction(row, action)} className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/10">
                      {label(action)}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") return JSON.stringify(value);
  if (!value) return "-";
  return String(value);
}

function label(action: AdminAction) {
  return action.replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase());
}
