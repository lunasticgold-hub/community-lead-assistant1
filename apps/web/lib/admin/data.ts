import "server-only";
import { addCreatorEmailsToLeadRows } from "@/lib/data/lead-enrichment";
import { money } from "@/lib/customer-success/format";
import { classifyLead } from "@/lib/lead-categories";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAdminModule } from "./config";
import type { AdminChartPoint, AdminDashboardData, AdminListResult, AdminModuleConfig, AdminModuleSlug, AdminRow } from "./types";
import { csvCell, formatAdminDataError, getPagination, isAdminReadSchemaError, sanitizeAdminPayload } from "./validators";

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
  try {
    const supabase = adminClient();
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    for (const filter of filters) {
      if (filter.op === "gte") query = query.gte(filter.column, filter.value);
      if (filter.op === "eq") query = query.eq(filter.column, filter.value);
      if (filter.op === "in") query = query.in(filter.column, filter.values);
    }
    const { count, error } = await query;
    if (error) return { count: 0, missing: true };
    return { count: count || 0, missing: false };
  } catch {
    return { count: 0, missing: true };
  }
}

async function safeSelect(table: string, columns = "*", limit = 500): Promise<SelectResult> {
  try {
    const supabase = adminClient();
    const { data, error } = await supabase.from(table).select(columns).order("created_at", { ascending: false }).limit(limit);
    if (error) return { rows: [], missing: true };
    return { rows: (data || []) as unknown as AdminRow[], missing: false };
  } catch {
    return { rows: [], missing: true };
  }
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
    storageSnapshots,
    successProjects,
    customerSessions
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
    safeSelect("storage_usage_snapshots", "bytes_used,created_at", 1),
    safeSelect("customer_success_projects", "status,project_value,date_won,user_id,workspace_id,project_title,created_at", 2000),
    safeSelect("customer_usage_sessions", "user_id,login_at,logout_at,duration_seconds", 5000)
  ]);

  const subscriptions = activeSubscriptions.rows.filter(row => row.status === "active");
  const mrrCents = subscriptions.reduce((sum, row) => sum + Number(row.mrr_cents || 0), 0);
  const aiRows = aiToday.rows.filter(row => typeof row.created_at === "string" && String(row.created_at) >= today);
  const tokensUsed = aiRows.reduce((sum, row) => sum + Number(row.tokens_total || 0), 0);
  const aiCostCents = aiRows.reduce((sum, row) => sum + Number(row.cost_cents || 0), 0);
  const averageLatency = aiRows.length ? Math.round(aiRows.reduce((sum, row) => sum + Number(row.latency_ms || 0), 0) / aiRows.length) : 0;
  const storageBytes = Number(storageSnapshots.rows[0]?.bytes_used || 0);
  const verifiedProjects = successProjects.rows.filter(row => row.status === "verified");
  const verifiedRevenue = verifiedProjects.reduce((sum, row) => sum + Number(row.project_value || 0), 0);
  const successRevenueToday = verifiedProjects
    .filter(row => typeof row.date_won === "string" && String(row.date_won) >= today.slice(0, 10))
    .reduce((sum, row) => sum + Number(row.project_value || 0), 0);
  const usageSecondsToday = customerSessions.rows
    .filter(row => typeof row.login_at === "string" && String(row.login_at) >= today)
    .reduce((sum, row) => sum + Number(row.duration_seconds || 0), 0);

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
      ,
      { label: "Customer Revenue Generated", value: money(verifiedRevenue), tone: "green" },
      { label: "Verified Customer Projects", value: verifiedProjects.length, tone: "blue" },
      { label: "Average Work Value", value: money(verifiedProjects.length ? verifiedRevenue / verifiedProjects.length : 0), tone: "green" },
      { label: "Customer Revenue Today", value: money(successRevenueToday), tone: "green" },
      { label: "Customer Hours Used Today", value: `${(usageSecondsToday / 3600).toFixed(1)}h`, tone: "blue" }
    ],
    charts: await getAdminCharts()
  };
}

async function getAdminCharts() {
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString();
  const [users, leads, ai, extension, traffic, subscriptions, successProjects, customerSessions] = await Promise.all([
    safeSelect("users", "created_at", 1000),
    safeSelect("leads", "created_at,platform,community_name,matched_keywords", 1000),
    safeSelect("ai_usage_events", "created_at,tokens_total", 1000),
    safeSelect("extension_installs", "created_at", 1000),
    safeSelect("analytics_events", "created_at,event_name", 1000),
    safeSelect("stripe_subscriptions", "created_at,mrr_cents", 1000),
    safeSelect("customer_success_projects", "created_at,date_won,project_value,status", 2000),
    safeSelect("customer_usage_sessions", "login_at,duration_seconds,created_at", 2000)
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
    customerRevenue: groupMoneyByDay(successProjects.rows.filter(row => row.status === "verified").map(row => ({ ...row, created_at: row.date_won || row.created_at })), "project_value"),
    customerUsage: groupMoneyByDay(customerSessions.rows.map(row => ({ ...row, created_at: row.login_at || row.created_at })), "duration_seconds"),
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
  const uniqueOnly = module.slug === "leads" && url.searchParams.get("unique") === "1";

  let query = supabase.from(module.table).select("*", { count: "exact" });

  if (search && module.searchable.length) {
    query = query.or(module.searchable.map(column => `${column}.ilike.%${search}%`).join(","));
  }

  for (const column of module.columns.filter(column => column.filterable)) {
    const value = url.searchParams.get(column.key);
    if (value) query = query.eq(column.key, value);
  }

  const rangeFrom = uniqueOnly ? 0 : from;
  const rangeTo = uniqueOnly ? Math.max(1999, to) : to;
  const { data, count, error } = await query.order(sort, { ascending }).range(rangeFrom, rangeTo);
  if (isAdminReadSchemaError(error) || (module.optionalTable && error)) {
    return { rows: [], count: 0, page, pageSize, tableMissing: true };
  }
  if (error) throw new Error(formatAdminDataError(error, `Could not load ${module.title}.`));

  const baseRows = (data || []) as unknown as AdminRow[];
  const enrichedRows = module.slug === "leads"
    ? await enrichAdminLeadRows(supabase, baseRows)
    : module.slug === "extension"
      ? await enrichUsageEventUserEmails(supabase, baseRows)
      : baseRows;

  if (uniqueOnly && module.slug === "leads") {
    const unique = dedupeLeadRows(enrichedRows);
    const pagedRows = unique.rows.slice(from, to + 1);
    return {
      rows: pagedRows,
      count: unique.rows.length,
      page,
      pageSize,
      totalBeforeDedupe: count || enrichedRows.length,
      uniqueCount: unique.rows.length,
      duplicatesRemoved: Math.max(0, (count || enrichedRows.length) - unique.rows.length)
    };
  }

  return { rows: enrichedRows, count: count || 0, page, pageSize, totalBeforeDedupe: count || 0 };
}

async function enrichAdminLeadRows(supabase: ReturnType<typeof adminClient>, rows: AdminRow[]) {
  const rowsWithEmails = await addCreatorEmailsToLeadRows(supabase, rows);
  return rowsWithEmails.map(row => {
    const classification = classifyLead({
      platform: String(row.platform || ""),
      communityName: String(row.community_name || ""),
      authorName: String(row.author_name || ""),
      postText: String(row.post_text || ""),
      postSnippet: String(row.post_snippet || ""),
      matchedKeywords: Array.isArray(row.matched_keywords) ? row.matched_keywords.map(String) : []
    });

    return {
      ...row,
      creator_email: row.creator_email || "",
      lead_category: row.lead_category || classification.category,
      lead_subcategory: row.lead_subcategory || classification.subcategory,
      category_confidence: row.category_confidence || classification.confidence
    };
  });
}

async function enrichUsageEventUserEmails(supabase: ReturnType<typeof adminClient>, rows: AdminRow[]) {
  const userIds = Array.from(new Set(rows.map(row => String(row.user_id || "")).filter(Boolean)));
  const emailByUserId = new Map<string, string>();

  if (userIds.length) {
    const { data, error } = await supabase.from("users").select("id,email").in("id", userIds);
    if (!error) {
      (data || []).forEach(row => {
        emailByUserId.set(String(row.id), String(row.email || ""));
      });
    }
  }

  return rows.map(row => {
    const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {};
    const email =
      emailByUserId.get(String(row.user_id || "")) ||
      String(metadata.user_email || metadata.email || metadata.userEmail || "");

    return {
      ...row,
      user_email: email || "Unknown user"
    };
  });
}

export async function createAdminRow(module: AdminModuleConfig, payload: unknown): Promise<AdminRow> {
  if (!module.createEnabled) throw new Error("This module does not allow creating records.");
  const supabase = adminClient();
  const clean = sanitizeAdminPayload(module, payload);
  const { data, error } = await supabase.from(module.table).insert(clean).select("*").single();
  if (isAdminReadSchemaError(error)) throw new Error(`${module.title} is not available yet. Please refresh after the database sync completes.`);
  if (error) throw new Error(formatAdminDataError(error, `Could not create ${module.title} record.`));
  return data as unknown as AdminRow;
}

export async function importAdminRows(module: AdminModuleConfig, rows: unknown[]): Promise<{ count: number }> {
  if (!module.createEnabled) throw new Error("This module does not allow importing records.");
  const cleanRows = rows.map(row => sanitizeAdminPayload(module, row)).filter(row => Object.keys(row).length > 0);
  if (!cleanRows.length) return { count: 0 };
  const supabase = adminClient();
  const { error } = await supabase.from(module.table).insert(cleanRows);
  if (isAdminReadSchemaError(error)) throw new Error(`${module.title} is not available yet. Please refresh after the database sync completes.`);
  if (error) throw new Error(formatAdminDataError(error, `Could not import ${module.title} records.`));
  return { count: cleanRows.length };
}

export async function updateAdminRow(module: AdminModuleConfig, id: string, payload: unknown): Promise<AdminRow> {
  const supabase = adminClient();
  const clean = sanitizeAdminPayload(module, payload);
  const { data, error } = await supabase.from(module.table).update({ ...clean, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (isAdminReadSchemaError(error)) throw new Error(`${module.title} is not available yet. Please refresh after the database sync completes.`);
  if (error) throw new Error(formatAdminDataError(error, `Could not update ${module.title} record.`));
  return data as unknown as AdminRow;
}

export async function deleteAdminRow(module: AdminModuleConfig, id: string) {
  const supabase = adminClient();
  const { error } = await supabase.from(module.table).delete().eq("id", id);
  if (isAdminReadSchemaError(error)) throw new Error(`${module.title} is not available yet. Please refresh after the database sync completes.`);
  if (error) throw new Error(formatAdminDataError(error, `Could not delete ${module.title} record.`));
  return { deleted: true };
}

export async function bulkUpdateAdminRows(module: AdminModuleConfig, ids: string[], payload: unknown) {
  if (!ids.length) return { count: 0 };
  const supabase = adminClient();
  const clean = sanitizeAdminPayload(module, payload);
  const { error } = await supabase.from(module.table).update({ ...clean, updated_at: new Date().toISOString() }).in("id", ids);
  if (isAdminReadSchemaError(error)) throw new Error(`${module.title} is not available yet. Please refresh after the database sync completes.`);
  if (error) throw new Error(formatAdminDataError(error, `Could not bulk update ${module.title}.`));
  return { count: ids.length };
}

export async function bulkDeleteAdminRows(module: AdminModuleConfig, ids: string[]) {
  if (!ids.length) return { count: 0 };
  const supabase = adminClient();
  const { error } = await supabase.from(module.table).delete().in("id", ids);
  if (isAdminReadSchemaError(error)) throw new Error(`${module.title} is not available yet. Please refresh after the database sync completes.`);
  if (error) throw new Error(formatAdminDataError(error, `Could not bulk delete ${module.title}.`));
  return { count: ids.length };
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

function dedupeLeadRows(rows: AdminRow[]) {
  const winners: AdminRow[] = [];
  const clusters: Array<{ row: AdminRow; tokens: Set<string>; sourceKey: string; contentKey: string }> = [];

  for (const row of rows) {
    const candidate = {
      row,
      tokens: leadTokens(row),
      sourceKey: normalizedSourceKey(row),
      contentKey: normalizedContentKey(row)
    };
    const matchIndex = clusters.findIndex(cluster => areDuplicateLeads(cluster, candidate));
    if (matchIndex === -1) {
      clusters.push(candidate);
      winners.push(row);
      continue;
    }
    const current = winners[matchIndex];
    if (leadQualityScore(row) > leadQualityScore(current)) {
      clusters[matchIndex] = candidate;
      winners[matchIndex] = row;
    }
  }

  return { rows: winners };
}

function areDuplicateLeads(
  existing: { row: AdminRow; tokens: Set<string>; sourceKey: string; contentKey: string },
  candidate: { row: AdminRow; tokens: Set<string>; sourceKey: string; contentKey: string }
) {
  if (existing.sourceKey && candidate.sourceKey && existing.sourceKey === candidate.sourceKey) return true;
  if (existing.contentKey && candidate.contentKey && existing.contentKey === candidate.contentKey) return true;

  const samePlatform = normalizeText(existing.row.platform) === normalizeText(candidate.row.platform);
  const sameCommunity = normalizeText(existing.row.community_name) === normalizeText(candidate.row.community_name);
  const sameCategory = normalizeText(existing.row.lead_category) === normalizeText(candidate.row.lead_category);
  const similarity = jaccard(existing.tokens, candidate.tokens);
  const strongContext = samePlatform && (sameCommunity || sameCategory);

  return strongContext && similarity >= 0.72;
}

function leadQualityScore(row: AdminRow) {
  const temperature = String(row.lead_temperature || "").toLowerCase();
  const status = String(row.status || "").toLowerCase();
  const content = leadContent(row);
  let score = Number(row.lead_score || 0);
  if (temperature === "hot") score += 30;
  if (temperature === "warm") score += 15;
  if (status === "converted") score += 25;
  if (row.source_url) score += 10;
  if (row.community_url) score += 5;
  score += Math.min(20, content.length / 120);
  return score;
}

function normalizedSourceKey(row: AdminRow) {
  const source = normalizeUrl(row.source_url);
  if (!source) return "";
  return `${normalizeText(row.platform)}|${source}`;
}

function normalizedContentKey(row: AdminRow) {
  const text = normalizeText(`${row.platform || ""} ${row.community_name || ""} ${row.lead_category || ""} ${leadContent(row)}`);
  return text.length > 40 ? text : "";
}

function leadTokens(row: AdminRow) {
  const stop = new Set(["the", "and", "for", "with", "that", "this", "from", "are", "you", "your", "our", "need", "looking", "help"]);
  return new Set(leadContent(row)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2 && !stop.has(token)));
}

function leadContent(row: AdminRow) {
  return [
    row.title,
    row.lead_title,
    row.post_title,
    row.post_text,
    row.post_snippet,
    row.description,
    row.community_name,
    row.platform,
    row.lead_category,
    row.lead_subcategory,
    Array.isArray(row.matched_keywords) ? row.matched_keywords.join(" ") : ""
  ].map(value => String(value || "")).join(" ");
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach(value => {
    if (b.has(value)) intersection += 1;
  });
  const union = new Set([...Array.from(a), ...Array.from(b)]).size;
  return union ? intersection / union : 0;
}

function normalizeUrl(value: unknown) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  try {
    const url = new URL(text);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return text.replace(/[?#].*$/, "").replace(/\/$/, "");
  }
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
