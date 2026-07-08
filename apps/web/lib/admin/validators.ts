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

type AdminDataError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export function formatAdminDataError(error: unknown, fallback = "Could not load admin records.") {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object") {
    const adminError = error as AdminDataError;
    const parts = [adminError.message, adminError.details, adminError.hint, adminError.code]
      .map(value => String(value || "").trim())
      .filter(Boolean);

    if (parts.length) return parts.join(" ");
  }

  return fallback;
}

export function isMissingTableError(error: AdminDataError | null): boolean {
  if (!error) return false;
  const message = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /relation .* does not exist/i.test(message) ||
    /table .* does not exist/i.test(message) ||
    /could not find the table/i.test(message)
  );
}

export function isAdminReadSchemaError(error: AdminDataError | null): boolean {
  if (!error) return false;
  const message = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.trim();

  return (
    isMissingTableError(error) ||
    error.code === "42703" ||
    error.code === "PGRST200" ||
    error.code === "PGRST204" ||
    /column .* does not exist/i.test(message) ||
    /schema cache/i.test(message)
  );
}
