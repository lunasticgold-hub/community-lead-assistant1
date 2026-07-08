import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { CmsField, CmsListResult, CmsModule, CmsRow } from "./types";

function client() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  return supabase;
}

function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || /relation .* does not exist/i.test(error.message || "");
}

export function paginationFromUrl(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get("pageSize") || 20)));
  return { page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1 };
}

export async function listCmsRows(module: CmsModule, url: URL): Promise<CmsListResult> {
  const supabase = client();
  const { page, pageSize, from, to } = paginationFromUrl(url);
  const search = url.searchParams.get("search")?.trim() || "";
  const sort = url.searchParams.get("sort") || module.defaultSort;
  const direction = url.searchParams.get("direction") === "asc";

  let query = supabase.from(module.table).select("*", { count: "exact" });
  if (search && module.searchable.length) {
    query = query.or(module.searchable.map(column => `${column}.ilike.%${search}%`).join(","));
  }
  const { data, count, error } = await query.order(sort, { ascending: direction }).range(from, to);
  if (isMissingTable(error)) return { rows: [], count: 0, page, pageSize, tableMissing: true };
  if (error) throw new Error(cmsErrorMessage("load", module.title, error.message));
  return { rows: (data || []) as CmsRow[], count: count || 0, page, pageSize };
}

export async function getCmsRow(module: CmsModule, id: string): Promise<CmsRow | null> {
  const supabase = client();
  const { data, error } = await supabase.from(module.table).select("*").eq("id", id).maybeSingle();
  if (isMissingTable(error)) return null;
  if (error) throw new Error(cmsErrorMessage("load", module.title, error.message));
  return data as CmsRow | null;
}

export async function createCmsRow(module: CmsModule, payload: unknown, userId: string) {
  const clean = sanitizeCmsPayload(module.fields, payload);
  const supabase = client();
  const { data, error } = await supabase
    .from(module.table)
    .insert({ ...clean, created_by: userId, updated_by: userId })
    .select("*")
    .single();
  if (error) throw new Error(cmsErrorMessage("create", module.title, error.message));
  return data as CmsRow;
}

export async function updateCmsRow(module: CmsModule, id: string, payload: unknown, userId: string) {
  const clean = sanitizeCmsPayload(module.fields, payload);
  const supabase = client();
  await maybeCreateRevision(module, id, userId);
  const { data, error } = await supabase
    .from(module.table)
    .update({ ...clean, updated_at: new Date().toISOString(), updated_by: userId })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(cmsErrorMessage("update", module.title, error.message));
  return data as CmsRow;
}

export async function deleteCmsRow(module: CmsModule, id: string, userId?: string) {
  const supabase = client();
  const { error } = await supabase
    .from(module.table)
    .update({ deleted_at: new Date().toISOString(), status: "archived", updated_by: userId || null })
    .eq("id", id);
  if (error) throw new Error(cmsErrorMessage("archive", module.title, error.message));
  return { deleted: true, archived: true };
}

export async function duplicateCmsRow(module: CmsModule, id: string, userId: string) {
  const current = await getCmsRow(module, id);
  if (!current) throw new Error("CMS record not found.");
  const copy: Record<string, unknown> = { ...current };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  delete copy.deleted_at;
  delete copy.published_at;
  delete copy.scheduled_at;
  copy.created_by = userId;
  copy.updated_by = userId;
  if (typeof copy.slug === "string" && copy.slug.trim()) copy.slug = `${copy.slug}-copy-${Date.now()}`;
  for (const key of ["title", "name", "label", "question"]) {
    if (typeof copy[key] === "string" && copy[key].trim()) {
      copy[key] = `${copy[key]} Copy`;
      break;
    }
  }
  if (typeof copy.status === "string") copy.status = "draft";
  const supabase = client();
  const { data, error } = await supabase.from(module.table).insert(copy).select("*").single();
  if (error) throw new Error(cmsErrorMessage("duplicate", module.title, error.message));
  return data as CmsRow;
}

export async function archiveCmsRow(module: CmsModule, id: string, userId: string) {
  const supabase = client();
  const { data, error } = await supabase
    .from(module.table)
    .update({ status: "archived", deleted_at: new Date().toISOString(), updated_by: userId, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(cmsErrorMessage("archive", module.title, error.message));
  return data as CmsRow;
}

export async function restoreCmsRow(module: CmsModule, id: string, userId: string) {
  const supabase = client();
  const { data, error } = await supabase
    .from(module.table)
    .update({ status: "draft", deleted_at: null, updated_by: userId, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(cmsErrorMessage("restore", module.title, error.message));
  return data as CmsRow;
}

export async function bulkDeleteCmsRows(module: CmsModule, ids: string[], userId: string) {
  if (!ids.length) return { count: 0 };
  const supabase = client();
  const { error } = await supabase
    .from(module.table)
    .update({ status: "archived", deleted_at: new Date().toISOString(), updated_by: userId, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(cmsErrorMessage("bulk archive", module.title, error.message));
  return { count: ids.length };
}

export async function bulkUpdateCmsRows(module: CmsModule, ids: string[], payload: unknown, userId: string) {
  if (!ids.length) return { count: 0 };
  const clean = sanitizeCmsPayload(module.fields, payload);
  const supabase = client();
  const { error } = await supabase
    .from(module.table)
    .update({ ...clean, updated_by: userId, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(cmsErrorMessage("bulk update", module.title, error.message));
  return { count: ids.length };
}

export async function importCmsRows(module: CmsModule, rows: unknown[], userId: string) {
  const cleanRows = rows.map(row => ({ ...sanitizeCmsPayload(module.fields, row), created_by: userId, updated_by: userId }));
  if (!cleanRows.length) return { count: 0 };
  const supabase = client();
  const { error } = await supabase.from(module.table).insert(cleanRows);
  if (error) throw new Error(cmsErrorMessage("import", module.title, error.message));
  return { count: cleanRows.length };
}

export async function getCmsDashboard() {
  const supabase = client();
  const tableNames = [
    "cms_pages",
    "cms_posts",
    "cms_media",
    "cms_testimonials",
    "cms_faq",
    "cms_landing_pages",
    "cms_newsletter_subscribers",
    "cms_announcements",
    "cms_navigation",
    "cms_footer",
    "cms_redirects",
    "cms_categories",
    "cms_tags",
    "cms_authors",
    "cms_media_folders",
    "cms_forms",
    "cms_tracking",
    "cms_integrations"
  ];
  const counts = await Promise.all(tableNames.map(async table => {
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    return { table, count: error ? 0 : count || 0, missing: isMissingTable(error) };
  }));
  return counts;
}

export async function exportCmsRows(module: CmsModule, url: URL) {
  const exportUrl = new URL(url);
  exportUrl.searchParams.set("page", "1");
  exportUrl.searchParams.set("pageSize", "100");
  const { rows } = await listCmsRows(module, exportUrl);
  const headers = module.fields.map(field => field.key);
  return [headers.join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\n");
}

export function sanitizeCmsPayload(fields: CmsField[], payload: unknown) {
  const source = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const clean: Record<string, unknown> = {};
  for (const field of fields) {
    if (!(field.key in source)) continue;
    const value = source[field.key];
    if (field.type === "number") clean[field.key] = Number(value || 0);
    else if (field.type === "boolean") clean[field.key] = Boolean(value);
    else if (field.type === "json") clean[field.key] = parseJson(value);
    else if (field.type === "datetime" && value === "") clean[field.key] = null;
    else clean[field.key] = value ?? "";
  }
  for (const field of fields) {
    if (!field.required) continue;
    const value = clean[field.key];
    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`${field.label} is required.`);
    }
  }
  if ("slug" in clean && typeof clean.slug === "string") clean.slug = slugify(clean.slug);
  return clean;
}

async function maybeCreateRevision(module: CmsModule, id: string, userId: string) {
  if (module.table !== "cms_posts") return;
  const supabase = client();
  const current = await getCmsRow(module, id);
  if (!current) return;
  const revision = Number(current.revision || 1);
  await supabase.from("cms_post_revisions").insert({
    post_id: id,
    revision,
    snapshot: current,
    created_by: userId
  });
}

function parseJson(value: unknown) {
  if (typeof value === "string") {
    if (!value.trim()) return {};
    try {
      return JSON.parse(value);
    } catch {
      return { raw: value };
    }
  }
  return value && typeof value === "object" ? value : {};
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function csvCell(value: unknown) {
  const output = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
  return `"${output.replaceAll('"', '""')}"`;
}

function cmsErrorMessage(action: string, moduleTitle: string, detail: string) {
  if (/schema cache|could not find|column/i.test(detail)) {
    return `${moduleTitle} is not available yet. Please refresh after the database sync completes.`;
  }
  if (/duplicate key|unique constraint/i.test(detail)) {
    return `${moduleTitle} already has a record with this unique value.`;
  }
  return `Could not ${action} ${moduleTitle.toLowerCase()}.`;
}
