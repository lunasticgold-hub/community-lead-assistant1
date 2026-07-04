import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAdminModule } from "./config";
import type { AdminChartPoint, AdminDashboardData, AdminListResult, AdminModuleConfig, AdminModuleSlug, AdminRow } from "./types";
import { csvCell, getPagination, isMissingTableError, sanitizeAdminPayload } from "./validators";

type CountResult = { count: number; missing: boolean };
type SelectResult = { rows: AdminRow[]; missing: boolean };
type CountFilter =
  | { op: "gte"; column: string; value: string }
  | { op: "eq"; column: string; value: string | number | boolean }
  | { op: "in"; column: string; values: Array<string | number | boolean> };

function adminClient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  return supabase;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

async function safeCount(table: string, filters: CountFilter[] = []): Promise<CountResult> {
  const supabase = adminClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const filter of filters) {
    if (filter.op === "gte") query = query.gte(filter.column, filter.value);
    if (filter.op === "eq") query = query.eq(filter.column, filter.value);
    if (filter.op === "in") query = query.in(filter.column, filter.values);
  }
  const { count, error } = await query;
  if (isMissingTableError(error)) return { count: 0, missing: true };
  if (error) throw error;
  return { count: count || 0, missing: false };
}

async function safeSelect(table: string, columns = "*", limit = 500): Promise<SelectResult> {
  const supabase = adminClient();
  const { data, error } = await supabase.from(table).select(columns).order("created_at", { ascending: false }).limit(limit);
  if (isMissingTableError(error)) return { rows: [], missing: true };
  if (error) throw error;
  return { rows: (data || []) as unknown as AdminRow[], missing: false };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const today = startOfToday();
  const month = startOfMonth();

  const [
    totalUsers,
    newUsersToday,
    newUsersMonth,
    activeUsers,
    trialUsers,
    paidUsers,
    cancelledUsers,
    stripeCustomers,
    activeSubscriptions,
    extensionInstalls,
    chromeActiveUsers,
    leadsToday,
    leadsMonth,
    campaignsRunning,
    aiToday,
    failedAi,
    apiRequests,
    systemErrors,
    storageSnapshots
  ] = await Promise.all([
    safeCount("users"),
    safeCount("users", [{ op: "gte", column: "created_at", value: today }]),
    safeCount("users", [{ op: "gte", column: "created_at", value: month }]),
    safeCount("users", [{ op: "gte", column: "last_active_at", value: today }]),
    safeCount("workspaces", [{ op: "eq", column: "plan", value: "trial" }]),
    safeCount("workspaces", [{ op: "in", column: "billing_status", values: ["active", "paid"] }]),
    safeCount("workspaces", [{ op: "eq", column: "billing_status", value: "cancelled" }]),
    safeCount("stripe_customers"),
    safeSelect("stripe_subscriptions", "mrr_cents,status", 1000),
    safeCount("extension_installs"),
    safeCount("extension_installs", [{ op: "gte", column: "last_seen_at", value: today }]),
    safeCount("leads", [{ op: "gte", column: "created_at", value: today }]),
    safeCount("leads", [{ op: "gte", column: "created_at", value: month }]),
    safeCount("campaigns", [{ op: "eq", column: "active", value: true }]),
    safeSelect("ai_usage_events", "tokens_total,cost_cents,latency_ms,status,created_at", 1000),
    safeCount("ai_usage_events", [{ op: "gte", column: "created_at", value: today }, { op: "eq", column: "status", value: "failed" }]),
    safeCount("api_request_logs", [{ op: "gte", column: "created_at", value: today }]),
    safeCount("system_logs", [{ op: "gte", column: "created_at", value: today }, { op: "in", column: "level", values: ["error", "critical"] }]),
    safeSelect("storage_usage_snapshots", "bytes_used,created_at", 1)
  ]);

  const subscriptions = activeSubscriptions.rows.filter(row => row.status === "active");
  const mrrCents = subscriptions.reduce((sum, row) => sum + Number(row.mrr_cents || 0), 0);
  const aiRows = aiToday.rows.filter(row => typeof row.created_at === "string" && String(row.created_at) >= today);
  const tokensUsed = aiRows.reduce((sum, row) => sum + Number(row.tokens_total || 0), 0);
  const aiCostCents = aiRows.reduce((sum, row) => sum + Number(row.cost_cents || 0), 0);
  const averageLatency = aiRows.length ? Math.round(aiRows.reduce((sum, row) => sum + Number(row.latency_ms || 0), 0) / aiRows.length) : 0;
  const storageBytes = Number(storageSnapshots.rows[0]?.bytes_used || 0);

  return {
    metrics: [
      { label: "Total Users", value: totalUsers.count },
      { label: "New Users Today", value: newUsersToday.count, tone: "green" },
      { label: "New Users This Month", value: newUsersMonth.count },
      { label: "Active Users", value: activeUsers.count },
      { label: "Trial Users", value: trialUsers.count, tone: "amber" },
      { label: "Paid Users", value: paidUsers.count, tone: "green" },
      { label: "Cancelled Users", value: cancelledUsers.count, tone: "red" },
      { label: "Monthly Revenue (MRR)", value: `$${(mrrCents / 100).toFixed(2)}`, tone: "green" },
      { label: "Annual Revenue (ARR)", value: `$${((mrrCents * 12) / 100).toFixed(2)}` },
      { label: "Stripe Customers", value: stripeCustomers.count },
      { label: "Active Subscriptions", value: subscriptions.length },
      { label: "Extension Installs", value: extensionInstalls.count },
      { label: "Chrome Active Users", value: chromeActiveUsers.count },
      { label: "Leads Generated Today", value: leadsToday.count },
      { label: "Leads Generated This Month", value: leadsMonth.count },
      { label: "Campaigns Running", value: campaignsRunning.count },
      { label: "AI Requests Today", value: aiRows.length },
      { label: "Gemini Tokens Used", value: tokensUsed },
      { label: "AI Cost Today", value: `$${(aiCostCents / 100).toFixed(4)}` },
      { label: "Average Response Time", value: `${averageLatency} ms` },
      { label: "Failed AI Requests", value: failedAi.count, tone: "red" },
      { label: "System Error Rate", value: `${systemErrors.count} errors`, tone: systemErrors.count ? "red" : "green" },
      { label: "Storage Used", value: `${Math.round(storageBytes / 1024 / 1024)} MB` },
      { label: "Database Size", value: "Supabase managed" },
      { label: "API Requests", value: apiRequests.count },
      { label: "Server Status", value: "Operational", tone: "green" }
    ],
    charts: await getAdminCharts()
  };
}

async function getAdminCharts() {
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString();
  const [users, leads, ai, extension, traffic, subscriptions] = await Promise.all([
    safeSelect("users", "created_at", 1000),
    safeSelect("leads", "created_at,platform,community_name,matched_keywords", 1000),
    safeSelect("ai_usage_events", "created_at,tokens_total", 1000),
    safeSelect("extension_installs", "created_at", 1000),
    safeSelect("analytics_events", "created_at,event_name", 1000),
    safeSelect("stripe_subscriptions", "created_at,mrr_cents", 1000)
  ]);

  const recent = (rows: AdminRow[]) => rows.filter(row => typeof row.created_at === "string" && String(row.created_at) >= since);

  return {
    dailySignups: groupByDay(recent(users.rows)),
    revenue: groupMoneyByDay(recent(subscriptions.rows), "mrr_cents"),
    activeUsers: groupByDay(recent(traffic.rows)),
    leadGeneration: groupByDay(recent(leads.rows)),
    campaignPerformance: topValues(leads.rows.map(row => row.platform)),
    extensionInstalls: groupByDay(recent(extension.rows)),
    traffic: groupByDay(recent(traffic.rows)),
    aiUsage: groupMoneyByDay(recent(ai.rows), "tokens_total"),
    topCommunities: topValues(leads.rows.map(row => row.community_name)),
    topKeywords: topValues(leads.rows.flatMap(row => Array.isArray(row.matched_keywords) ? row.matched_keywords : []))
  };
}

function groupByDay(rows: AdminRow[]): AdminChartPoint[] {
  const counts = new Map<string, number>();
  rows.forEach(row => {
    const label = typeof row.created_at === "string" ? row.created_at.slice(5, 10) : "unknown";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value })).slice(-14);
}

function groupMoneyByDay(rows: AdminRow[], key: string): AdminChartPoint[] {
  const counts = new Map<string, number>();
  rows.forEach(row => {
    const label = typeof row.created_at === "string" ? row.created_at.slice(5, 10) : "unknown";
    counts.set(label, (counts.get(label) || 0) + Number(row[key] || 0));
  });
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value })).slice(-14);
}

function topValues(values: unknown[]): AdminChartPoint[] {
  const counts = new Map<string, number>();
  values.map(value => String(value || "")).filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value }));
}

export async function listAdminRows(module: AdminModuleConfig, url: URL): Promise<AdminListResult> {
  const supabase = adminClient();
  const { page, pageSize, from, to } = getPagination(url);
  const search = url.searchParams.get("search")?.trim() || "";
  const sort = url.searchParams.get("sort") || module.defaultSort;
  const ascending = url.searchParams.get("direction") === "asc";

  let query = supabase.from(module.table).select("*", { count: "exact" });

  if (search && module.searchable.length) {
    query = query.or(module.searchable.map(column => `${column}.ilike.%${search}%`).join(","));
  }

  for (const column of module.columns.filter(column => column.filterable)) {
    const value = url.searchParams.get(column.key);
    if (value) query = query.eq(column.key, value);
  }

  const { data, count, error } = await query.order(sort, { ascending }).range(from, to);
  if (isMissingTableError(error)) return { rows: [], count: 0, page, pageSize, tableMissing: true };
  if (error) throw error;

  return { rows: (data || []) as unknown as AdminRow[], count: count || 0, page, pageSize };
}

export async function createAdminRow(module: AdminModuleConfig, payload: unknown): Promise<AdminRow> {
  if (!module.createEnabled) throw new Error("This module does not allow creating records.");
  const supabase = adminClient();
  const clean = sanitizeAdminPayload(module, payload);
  const { data, error } = await supabase.from(module.table).insert(clean).select("*").single();
  if (isMissingTableError(error)) throw new Error(`${module.title} table is not installed. Run the admin panel migration.`);
  if (error) throw error;
  return data as unknown as AdminRow;
}

export async function updateAdminRow(module: AdminModuleConfig, id: string, payload: unknown): Promise<AdminRow> {
  const supabase = adminClient();
  const clean = sanitizeAdminPayload(module, payload);
  const { data, error } = await supabase.from(module.table).update({ ...clean, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (isMissingTableError(error)) throw new Error(`${module.title} table is not installed. Run the admin panel migration.`);
  if (error) throw error;
  return data as unknown as AdminRow;
}

export async function deleteAdminRow(module: AdminModuleConfig, id: string) {
  const supabase = adminClient();
  const { error } = await supabase.from(module.table).delete().eq("id", id);
  if (isMissingTableError(error)) throw new Error(`${module.title} table is not installed. Run the admin panel migration.`);
  if (error) throw error;
  return { deleted: true };
}

export async function exportAdminRows(module: AdminModuleConfig, url: URL): Promise<string> {
  const exportUrl = new URL(url);
  exportUrl.searchParams.set("page", "1");
  exportUrl.searchParams.set("pageSize", "100");
  const { rows } = await listAdminRows(module, exportUrl);
  const headers = module.columns.map(column => column.key);
  return [headers.join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\n");
}

export async function performAdminAction(input: { moduleSlug: AdminModuleSlug; action: string; id: string; adminUserId: string }) {
  const moduleConfig = getAdminModule(input.moduleSlug);
  if (!moduleConfig) throw new Error("Unknown admin module.");

  const supabase = adminClient();
  await supabase.from("admin_audit_logs").insert({
    admin_user_id: input.adminUserId,
    module: input.moduleSlug,
    action: input.action,
    target_id: input.id
  });

  if (input.moduleSlug === "users") {
    if (input.action === "suspend") return updateAdminRow(moduleConfig, input.id, { account_status: "suspended" });
    if (input.action === "unsuspend") return updateAdminRow(moduleConfig, input.id, { account_status: "active" });
    if (input.action === "resetTrial") return updateOwnerWorkspaces(input.id, { plan: "trial", trial_ends_at: trialDate(7), monthly_leads_used: 0, monthly_ai_drafts_used: 0 });
    if (input.action === "extendTrial") return updateOwnerWorkspaces(input.id, { trial_ends_at: trialDate(7) });
    if (input.action === "upgradePlan") return updateOwnerWorkspaces(input.id, { plan: "pro", billing_status: "active" });
    if (input.action === "downgradePlan") return updateOwnerWorkspaces(input.id, { plan: "starter", billing_status: "active" });
    if (input.action === "impersonate") return createImpersonationLink(input.id);
  }

  if (input.moduleSlug === "campaigns") {
    if (input.action === "pause") return updateAdminRow(moduleConfig, input.id, { active: false });
    if (input.action === "resume") return updateAdminRow(moduleConfig, input.id, { active: true });
  }

  if (input.moduleSlug === "outreach-sequences") {
    if (input.action === "pause") return updateAdminRow(moduleConfig, input.id, { status: "paused" });
    if (input.action === "resume") return updateAdminRow(moduleConfig, input.id, { status: "active" });
  }

  if (input.moduleSlug === "workspaces" && input.action === "disableWorkspace") {
    return updateAdminRow(moduleConfig, input.id, { disabled_at: new Date().toISOString(), billing_status: "disabled" });
  }

  if (["publish", "draft", "schedule"].includes(input.action)) {
    return updateAdminRow(moduleConfig, input.id, { status: input.action === "publish" ? "published" : input.action });
  }

  return { handled: true };
}

async function updateOwnerWorkspaces(ownerId: string, patch: Record<string, unknown>) {
  const supabase = adminClient();
  const { data, error } = await supabase.from("workspaces").update({ ...patch, updated_at: new Date().toISOString() }).eq("owner_id", ownerId).select("*");
  if (error) throw error;
  return data;
}

async function createImpersonationLink(userId: string) {
  const supabase = adminClient();
  const { data: userRow, error: userError } = await supabase.from("users").select("email").eq("id", userId).single();
  if (userError) throw userError;
  const email = String(userRow.email || "");
  const { data, error } = await supabase.auth.admin.generateLink({ type: "magiclink", email });
  if (error) throw error;
  return { actionLink: data.properties?.action_link || null };
}

function trialDate(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}
