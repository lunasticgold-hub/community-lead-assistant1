import type { AdminModuleConfig, AdminRow } from "./types";

const lockedFields = new Set(["id", "created_at", "updated_at"]);

export function getPagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get("pageSize") || 25)));
  return { page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1 };
}

export function sanitizeAdminPayload(module: AdminModuleConfig, input: unknown): AdminRow {
  if (!input || typeof input !== "object") return {};

  const allowed = new Set(module.columns.filter(column => column.editable).map(column => column.key));
  const output: AdminRow = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (lockedFields.has(key) || !allowed.has(key)) continue;
    output[key] = normalizeValue(value);
  }

  return output;
}

function normalizeValue(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function csvCell(value: unknown): string {
  if (Array.isArray(value)) return `"${value.map(String).join(" | ").replaceAll('"', '""')}"`;
  if (value && typeof value === "object") return `"${JSON.stringify(value).replaceAll('"', '""')}"`;
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || /relation .* does not exist/i.test(error.message || "");
}
