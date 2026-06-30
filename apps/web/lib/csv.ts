export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: string[]): string {
  return [
    headers.join(","),
    ...rows.map(row => headers.map(header => csvCell(Array.isArray(row[header]) ? (row[header] as unknown[]).join(" | ") : row[header] ?? "")).join(","))
  ].join("\n");
}

function csvCell(value: unknown): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}
