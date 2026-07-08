"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminAction, AdminModuleConfig, AdminRow } from "@/lib/admin/types";

export function useAdminTable({
  module,
  initialRows,
  initialCount,
  initialPage,
  initialPageSize
}: {
  module: AdminModuleConfig;
  initialRows: AdminRow[];
  initialCount: number;
  initialPage: number;
  initialPageSize: number;
}) {
  const [rows, setRows] = useState(initialRows);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [search, setSearch] = useState("");
  const [uniqueOnly, setUniqueOnly] = useState(false);
  const [totalBeforeDedupe, setTotalBeforeDedupe] = useState(initialCount);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), search });
    if (module.slug === "leads" && uniqueOnly) params.set("unique", "1");
    const response = await fetch(`/api/admin/${module.slug}?${params.toString()}`);
    const json = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(String(json.error || "Could not load records."));
      return;
    }

    setRows(Array.isArray(json.rows) ? json.rows : []);
    setCount(Number(json.count || 0));
    setTotalBeforeDedupe(Number(json.totalBeforeDedupe || json.count || 0));
    setDuplicatesRemoved(Number(json.duplicatesRemoved || 0));
  }, [module.slug, page, pageSize, search, uniqueOnly]);

  async function runAction(row: AdminRow, action: AdminAction) {
    if (!row.id) return;
    setError("");
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ module: module.slug, action, id: row.id })
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(String(json.error || "Admin action failed."));
      return;
    }
    if (json.actionLink) window.open(String(json.actionLink), "_blank", "noopener,noreferrer");
    await refresh();
  }

  useEffect(() => {
    const timer = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  return { rows, count, page, pageSize, search, uniqueOnly, totalBeforeDedupe, duplicatesRemoved, loading, error, setPage, setSearch, setUniqueOnly, refresh, runAction };
}
