import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { csvCell, isAdminReadSchemaError } from "@/lib/admin/validators";
import type { ProvisionedWorkspace } from "@/lib/provisioning";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { duration, money } from "./format";
import type {
  CustomerActivityItem,
  CustomerHealthStatus,
  CustomerProgressRow,
  CustomerSuccessChartPoint,
  CustomerSuccessDashboardData,
  CustomerSuccessSummary,
  ProjectStatus,
  SuccessNotification,
  SuccessProject,
  SuccessProjectInput
} from "./types";

type DbRow = Record<string, unknown>;
type SelectRows = { rows: DbRow[]; missing: boolean };

const successTables = [
  "customer_success_projects",
  "customer_usage_sessions",
  "customer_activity_events",
  "customer_daily_progress",
  "customer_success_notifications"
];

function adminClient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  return supabase;
}

export async function getCustomerSuccessDashboardData(): Promise<CustomerSuccessDashboardData> {
  const supabase = adminClient();
  const [
    projectRows,
    userRows,
    workspaceRows,
    sessionRows,
    activityRows,
    progressRows,
    notificationRows
  ] = await Promise.all([
    selectRows(supabase, "customer_success_projects", "*", 2000, "created_at"),
    selectRows(supabase, "users", "id,email,name,last_active_at", 2000, "created_at"),
    selectRows(supabase, "workspaces", "id,name,owner_id,plan,billing_status", 2000, "created_at"),
    selectRows(supabase, "customer_usage_sessions", "*", 5000, "login_at"),
    selectRows(supabase, "customer_activity_events", "*", 5000, "occurred_at"),
    selectRows(supabase, "customer_daily_progress", "*", 5000, "progress_date"),
    selectRows(supabase, "customer_success_notifications", "*", 500, "created_at")
  ]);

  const schemaReady = ![projectRows, sessionRows, activityRows, progressRows, notificationRows].some(result => result.missing);
  const users = new Map(userRows.rows.map(row => [stringValue(row.id), row]));
  const workspaces = new Map(workspaceRows.rows.map(row => [stringValue(row.id), row]));
  const projects = projectRows.rows.map(row => mapProject(row, users, workspaces));
  const customers = buildCustomerSummaries(projects, sessionRows.rows, activityRows.rows, progressRows.rows, users, workspaces);
  const verified = projects.filter(project => project.status === "verified");
  const now = new Date();
  const today = startOfDay(now);
  const week = new Date(now);
  week.setDate(week.getDate() - 7);
  const month = new Date(now);
  month.setDate(1);
  month.setHours(0, 0, 0, 0);

  const totalRevenue = sum(verified.map(project => project.projectValue));
  const highestProject = verified.length ? Math.max(...verified.map(project => project.projectValue)) : 0;
  const lowestProject = verified.length ? Math.min(...verified.map(project => project.projectValue)) : 0;
  const topCustomer = sortBy(customers, customer => customer.totalRevenue)[0];
  const fastestCustomer = sortBy(customers, customer => customer.revenueGrowthPercent)[0];

  return {
    schemaReady,
    metrics: [
      { label: "Total Customer Revenue Generated", value: money(totalRevenue), tone: "green" },
      { label: "Total Verified Projects", value: verified.length, tone: "blue" },
      { label: "Average Project Value", value: money(verified.length ? totalRevenue / verified.length : 0), tone: "green" },
      { label: "Revenue This Month", value: money(sumSince(verified, month)), tone: "green" },
      { label: "Revenue This Week", value: money(sumSince(verified, week)), tone: "blue" },
      { label: "Revenue Today", value: money(sumSince(verified, today)), tone: "blue" },
      { label: "Highest Value Project", value: money(highestProject), tone: "green" },
      { label: "Lowest Value Project", value: money(lowestProject), tone: "slate" },
      { label: "Top Performing Customer", value: topCustomer?.customerName || "-" },
      { label: "Fastest Growing Customer", value: fastestCustomer?.customerName || "-" },
      { label: "Active Users Today", value: activeUsersToday(sessionRows.rows, activityRows.rows) },
      { label: "Total Hours Used Today", value: `${(usageSecondsSince(sessionRows.rows, today) / 3600).toFixed(1)}h`, tone: "blue" },
      { label: "Average Daily Usage", value: `${averageDailyUsage(sessionRows.rows).toFixed(1)}h` },
      { label: "Average Session Duration", value: duration(average(sessionRows.rows.map(sessionDuration))) },
      { label: "Most Active Customer Today", value: mostActiveCustomerToday(sessionRows.rows, users) },
      { label: "Returning Customers", value: returningCustomers(sessionRows.rows) },
      { label: "New Customers", value: newCustomersThisMonth(userRows.rows) },
      { label: "Unread Success Alerts", value: notificationRows.rows.filter(row => stringValue(row.status) === "unread").length, tone: "amber" }
    ],
    charts: {
      monthlyRevenue: groupRevenueByMonth(verified),
      weeklyRevenue: groupRevenueByWeek(verified),
      dailyUsage: groupUsageByDay(sessionRows.rows),
      featureUsage: topValues(activityRows.rows.map(row => stringValue(row.module_key) || stringValue(row.event_type))),
      dailyProgress: groupProgress(progressRows.rows)
    },
    projects,
    customers,
    leaderboard: {
      highestRevenue: sortBy(customers, customer => customer.totalRevenue).slice(0, 8),
      mostProjects: sortBy(customers, customer => customer.verifiedProjects).slice(0, 8),
      highestAverageValue: sortBy(customers, customer => customer.averageProjectValue).slice(0, 8),
      fastestGrowing: sortBy(customers, customer => customer.revenueGrowthPercent).slice(0, 8),
      mostActive: sortBy(customers, customer => customer.totalUsageSeconds).slice(0, 8)
    },
    activityTimeline: activityRows.rows.slice(0, 80).map(row => mapActivity(row, users, workspaces)),
    progressRows: progressRows.rows.slice(0, 120).map(row => mapProgress(row, users)),
    notifications: notificationRows.rows.slice(0, 50).map(mapNotification)
  };
}

export async function createCustomerSuccessProject(input: SuccessProjectInput, submitterId: string | null) {
  const supabase = adminClient();
  validateProjectInput(input);
  const workspaceId = input.workspaceId || "";
  if (!workspaceId) throw new Error("Workspace is required.");
  const projectValue = Math.max(0, Number(input.projectValue || 0));
  const { data, error } = await supabase.from("customer_success_projects").insert({
    workspace_id: workspaceId,
    user_id: input.userId || null,
    lead_id: input.leadId || null,
    client_name: input.clientName.trim(),
    project_title: input.projectTitle.trim(),
    lead_source: input.leadSource?.trim() || null,
    project_category: input.projectCategory.trim(),
    project_description: input.projectDescription?.trim() || "",
    date_won: input.dateWon,
    currency: input.currency || "USD",
    project_value: projectValue,
    is_recurring_revenue: Boolean(input.isRecurringRevenue),
    notes: input.notes?.trim() || "",
    invoice_url: input.invoiceUrl?.trim() || null,
    submitted_by: submitterId
  }).select("*").single();
  if (error) throw error;
  await createSuccessNotification(supabase, workspaceId, input.userId || null, stringValue(data.id), "project_reported", "New project reported", `${input.projectTitle} was submitted for review.`, "info");
  await recordCustomerActivity({ workspaceId, userId: input.userId || submitterId, eventType: "project_reported", moduleKey: "customer-success", eventLabel: input.projectTitle });
  return data;
}

export async function createCustomerProjectForWorkspace(workspace: ProvisionedWorkspace, userId: string, input: SuccessProjectInput) {
  return createCustomerSuccessProject({ ...input, workspaceId: workspace.id, userId }, userId);
}

export async function reviewCustomerSuccessProject(projectId: string, status: ProjectStatus, reviewerId: string, reviewNotes = "") {
  if (!["verified", "rejected", "pending_review"].includes(status)) throw new Error("Invalid project status.");
  const supabase = adminClient();
  const { data: project, error: loadError } = await supabase.from("customer_success_projects").select("*").eq("id", projectId).single();
  if (loadError) throw loadError;
  const { data, error } = await supabase.from("customer_success_projects").update({
    status,
    review_notes: reviewNotes,
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq("id", projectId).select("*").single();
  if (error) throw error;
  await createSuccessNotification(
    supabase,
    stringValue((project as DbRow).workspace_id),
    stringValue((project as DbRow).user_id) || null,
    projectId,
    status === "verified" ? "project_verified" : "project_rejected",
    status === "verified" ? "Project verified" : "Project rejected",
    `${stringValue((project as DbRow).project_title)} is now ${status.replace("_", " ")}.`,
    status === "verified" ? "success" : "warning"
  );
  return data;
}

export async function deleteCustomerSuccessProject(projectId: string) {
  const supabase = adminClient();
  const { error } = await supabase.from("customer_success_projects").delete().eq("id", projectId);
  if (error) throw error;
  return { deleted: true };
}

export async function listOwnCustomerProjects(workspaceId: string) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("customer_success_projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error && isAdminReadSchemaError(error)) return [];
  if (error) throw error;
  return data || [];
}

export async function recordCustomerSessionStart(input: { workspaceId: string; userId: string; ipAddress?: string; userAgent?: string; source?: string }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await closeOpenSessions(supabase, input.userId);
    await supabase.from("customer_usage_sessions").insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      ip_address: input.ipAddress || "",
      browser: parseBrowser(input.userAgent || ""),
      device: parseDevice(input.userAgent || ""),
      source: input.source || "web"
    });
    await recordCustomerActivity({ workspaceId: input.workspaceId, userId: input.userId, eventType: "login", moduleKey: "auth", eventLabel: "Logged In" });
  } catch {
    // Optional BI tracking must never block login if analytics tables are unavailable.
  }
}

export async function recordCustomerSessionEnd(userId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await closeOpenSessions(supabase, userId);
    const { data: membership } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1).maybeSingle();
    if (membership?.workspace_id) await recordCustomerActivity({ workspaceId: String(membership.workspace_id), userId, eventType: "logout", moduleKey: "auth", eventLabel: "Logged Out" });
  } catch {
    // Optional BI tracking must never block logout.
  }
}

export async function recordCustomerActivity(input: { workspaceId: string; userId?: string | null; eventType: string; moduleKey?: string; eventLabel?: string; durationSeconds?: number; metadata?: Record<string, unknown> }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await supabase.from("customer_activity_events").insert({
      workspace_id: input.workspaceId,
      user_id: input.userId || null,
      event_type: input.eventType,
      module_key: input.moduleKey || "",
      event_label: input.eventLabel || "",
      duration_seconds: Math.max(0, Math.round(input.durationSeconds || 0)),
      metadata: input.metadata || {}
    });
    await updateDailyProgress(supabase, input.workspaceId, input.userId || null, input.eventType, input.moduleKey || "");
  } catch {
    // Optional BI tracking should not break product workflows.
  }
}

export async function exportCustomerSuccessData(format: string) {
  const data = await getCustomerSuccessDashboardData();
  const rows = data.projects.map(project => ({
    customer: project.customerName,
    email: project.customerEmail,
    workspace: project.workspaceName,
    client: project.clientName,
    project: project.projectTitle,
    category: project.projectCategory,
    dateWon: project.dateWon,
    currency: project.currency,
    value: project.projectValue,
    recurring: project.isRecurringRevenue,
    status: project.status
  }));
  const headers = ["customer", "email", "workspace", "client", "project", "category", "dateWon", "currency", "value", "recurring", "status"];
  if (format === "xls") return tableDocument(headers, rows, "Customer Success Report");
  if (format === "pdf") return printableReport(headers, rows, data.metrics);
  return toCsv(headers, rows);
}

function buildCustomerSummaries(projects: SuccessProject[], sessions: DbRow[], activities: DbRow[], progress: DbRow[], users: Map<string, DbRow>, workspaces: Map<string, DbRow>): CustomerSuccessSummary[] {
  const keys = new Set<string>();
  projects.forEach(project => keys.add(customerKey(project.userId, project.workspaceId)));
  sessions.forEach(row => keys.add(customerKey(stringValue(row.user_id), stringValue(row.workspace_id))));
  activities.forEach(row => keys.add(customerKey(stringValue(row.user_id), stringValue(row.workspace_id))));

  return Array.from(keys).filter(Boolean).map(key => {
    const [userId, workspaceId] = key.split(":");
    const user = users.get(userId) || {};
    const workspace = workspaces.get(workspaceId) || {};
    const customerProjects = projects.filter(project => project.userId === userId && project.workspaceId === workspaceId);
    const verified = customerProjects.filter(project => project.status === "verified");
    const customerSessions = sessions.filter(row => stringValue(row.user_id) === userId && stringValue(row.workspace_id) === workspaceId);
    const customerActivities = activities.filter(row => stringValue(row.user_id) === userId && stringValue(row.workspace_id) === workspaceId);
    const customerProgress = progress.filter(row => stringValue(row.user_id) === userId && stringValue(row.workspace_id) === workspaceId);
    const totalRevenue = sum(verified.map(project => project.projectValue));
    const last30Revenue = sum(verified.filter(project => new Date(project.dateWon) >= daysAgo(30)).map(project => project.projectValue));
    const previous30Revenue = sum(verified.filter(project => {
      const date = new Date(project.dateWon);
      return date >= daysAgo(60) && date < daysAgo(30);
    }).map(project => project.projectValue));
    const totalUsageSeconds = sum(customerSessions.map(sessionDuration));
    const healthScore = calculateHealthScore(customerSessions, customerActivities, verified, customerProgress);
    const healthStatus: CustomerHealthStatus = healthScore >= 75 ? "Healthy" : healthScore >= 45 ? "Moderate" : "At Risk";
    const moduleCounts = countBy(customerActivities.map(row => stringValue(row.module_key)).filter(Boolean));
    return {
      key,
      userId,
      workspaceId,
      customerName: stringValue(user.name) || stringValue(user.email) || stringValue(workspace.name) || "Unknown customer",
      customerEmail: stringValue(user.email),
      workspaceName: stringValue(workspace.name) || "Workspace",
      totalRevenue,
      verifiedProjects: verified.length,
      pendingProjects: customerProjects.filter(project => project.status === "pending_review").length,
      rejectedProjects: customerProjects.filter(project => project.status === "rejected").length,
      averageProjectValue: verified.length ? totalRevenue / verified.length : 0,
      largestProject: verified.length ? Math.max(...verified.map(project => project.projectValue)) : 0,
      smallestProject: verified.length ? Math.min(...verified.map(project => project.projectValue)) : 0,
      lastProjectWon: verified.sort((a, b) => b.dateWon.localeCompare(a.dateWon))[0]?.dateWon || "",
      revenueGrowthPercent: previous30Revenue > 0 ? ((last30Revenue - previous30Revenue) / previous30Revenue) * 100 : last30Revenue > 0 ? 100 : 0,
      sessions: customerSessions.length,
      totalUsageSeconds,
      averageSessionSeconds: customerSessions.length ? totalUsageSeconds / customerSessions.length : 0,
      lastActiveAt: latestDate([...customerSessions.map(row => stringValue(row.login_at)), ...customerActivities.map(row => stringValue(row.occurred_at))]),
      healthScore,
      healthStatus,
      mostUsedModule: Array.from(moduleCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-",
      projects: customerProjects
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

function mapProject(row: DbRow, users: Map<string, DbRow>, workspaces: Map<string, DbRow>): SuccessProject {
  const user = users.get(stringValue(row.user_id)) || {};
  const workspace = workspaces.get(stringValue(row.workspace_id)) || {};
  return {
    id: stringValue(row.id),
    workspaceId: stringValue(row.workspace_id),
    userId: stringValue(row.user_id),
    customerName: stringValue(user.name) || stringValue(user.email) || "Unknown customer",
    customerEmail: stringValue(user.email),
    workspaceName: stringValue(workspace.name) || "Workspace",
    clientName: stringValue(row.client_name),
    projectTitle: stringValue(row.project_title),
    leadSource: stringValue(row.lead_source),
    projectCategory: stringValue(row.project_category),
    projectDescription: stringValue(row.project_description),
    dateWon: stringValue(row.date_won),
    currency: stringValue(row.currency) || "USD",
    projectValue: numberValue(row.project_value),
    isRecurringRevenue: booleanValue(row.is_recurring_revenue),
    notes: stringValue(row.notes),
    invoiceUrl: stringValue(row.invoice_url),
    status: (stringValue(row.status) || "pending_review") as ProjectStatus,
    reviewNotes: stringValue(row.review_notes),
    createdAt: stringValue(row.created_at),
    updatedAt: stringValue(row.updated_at)
  };
}

function mapActivity(row: DbRow, users: Map<string, DbRow>, workspaces: Map<string, DbRow>): CustomerActivityItem {
  const user = users.get(stringValue(row.user_id)) || {};
  const workspace = workspaces.get(stringValue(row.workspace_id)) || {};
  return {
    id: stringValue(row.id),
    customerName: stringValue(user.name) || stringValue(user.email) || "Unknown customer",
    customerEmail: stringValue(user.email),
    workspaceName: stringValue(workspace.name),
    eventType: stringValue(row.event_type),
    moduleKey: stringValue(row.module_key),
    eventLabel: stringValue(row.event_label),
    occurredAt: stringValue(row.occurred_at)
  };
}

function mapProgress(row: DbRow, users: Map<string, DbRow>): CustomerProgressRow {
  const user = users.get(stringValue(row.user_id)) || {};
  return {
    id: stringValue(row.id),
    customerName: stringValue(user.name) || stringValue(user.email) || "Unknown customer",
    customerEmail: stringValue(user.email),
    progressDate: stringValue(row.progress_date),
    blogsPublished: numberValue(row.blogs_published),
    pagesEdited: numberValue(row.pages_edited),
    campaignsCreated: numberValue(row.campaigns_created),
    aiCreditsUsed: numberValue(row.ai_credits_used),
    leadsAdded: numberValue(row.leads_added),
    knowledgeUpdates: numberValue(row.knowledge_updates),
    seoTasksCompleted: numberValue(row.seo_tasks_completed),
    outreachActivities: numberValue(row.outreach_activities),
    filesUploaded: numberValue(row.files_uploaded),
    productivityScore: numberValue(row.productivity_score)
  };
}

function mapNotification(row: DbRow): SuccessNotification {
  return {
    id: stringValue(row.id),
    title: stringValue(row.title),
    body: stringValue(row.body),
    severity: stringValue(row.severity),
    status: stringValue(row.status),
    createdAt: stringValue(row.created_at)
  };
}

async function selectRows(supabase: SupabaseClient, table: string, columns = "*", limit = 1000, order = "created_at"): Promise<SelectRows> {
  try {
    const { data, error } = await supabase.from(table).select(columns).order(order, { ascending: false }).limit(limit);
    if (error) return { rows: [], missing: successTables.includes(table) || isAdminReadSchemaError(error) };
    return { rows: (data || []) as unknown as DbRow[], missing: false };
  } catch {
    return { rows: [], missing: successTables.includes(table) };
  }
}

async function closeOpenSessions(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("customer_usage_sessions")
    .select("id,login_at")
    .eq("user_id", userId)
    .is("logout_at", null)
    .order("login_at", { ascending: false })
    .limit(5);
  const now = new Date();
  await Promise.all(((data || []) as DbRow[]).map(row => {
    const login = new Date(stringValue(row.login_at));
    const durationSeconds = Number.isNaN(login.getTime()) ? 0 : Math.max(0, Math.round((now.getTime() - login.getTime()) / 1000));
    return supabase.from("customer_usage_sessions").update({
      logout_at: now.toISOString(),
      duration_seconds: durationSeconds,
      updated_at: now.toISOString()
    }).eq("id", stringValue(row.id));
  }));
}

async function updateDailyProgress(supabase: SupabaseClient, workspaceId: string, userId: string | null, eventType: string, moduleKey: string) {
  if (!userId) return;
  const date = new Date().toISOString().slice(0, 10);
  const columns = progressColumns(eventType, moduleKey);
  const { data: existing } = await supabase
    .from("customer_daily_progress")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("progress_date", date)
    .maybeSingle();
  const row = (existing || {}) as DbRow;
  const patch: DbRow = {
    workspace_id: workspaceId,
    user_id: userId,
    progress_date: date,
    updated_at: new Date().toISOString()
  };
  columns.forEach(column => {
    patch[column] = numberValue(row[column]) + 1;
  });
  patch.productivity_score = calculateProductivity({ ...row, ...patch });
  await supabase.from("customer_daily_progress").upsert(patch, { onConflict: "workspace_id,user_id,progress_date" });
}

function progressColumns(eventType: string, moduleKey: string) {
  const text = `${eventType} ${moduleKey}`.toLowerCase();
  const columns: string[] = [];
  if (text.includes("blog") && (text.includes("publish") || text.includes("created"))) columns.push("blogs_published");
  if (text.includes("page") || text.includes("website-editor") || text.includes("cms")) columns.push("pages_edited");
  if (text.includes("campaign") && text.includes("created")) columns.push("campaigns_created");
  if (text.includes("ai") || text.includes("draft")) columns.push("ai_credits_used");
  if (text.includes("lead")) columns.push("leads_added");
  if (text.includes("knowledge")) columns.push("knowledge_updates");
  if (text.includes("seo")) columns.push("seo_tasks_completed");
  if (text.includes("outreach") || text.includes("copy") || text.includes("profile")) columns.push("outreach_activities");
  if (text.includes("upload") || text.includes("media") || text.includes("file")) columns.push("files_uploaded");
  return columns.length ? columns : ["pages_edited"];
}

function calculateProductivity(row: DbRow) {
  return Math.min(100, Math.round(
    numberValue(row.blogs_published) * 12 +
    numberValue(row.pages_edited) * 5 +
    numberValue(row.campaigns_created) * 10 +
    numberValue(row.ai_credits_used) * 1 +
    numberValue(row.leads_added) * 3 +
    numberValue(row.knowledge_updates) * 8 +
    numberValue(row.seo_tasks_completed) * 7 +
    numberValue(row.outreach_activities) * 4 +
    numberValue(row.files_uploaded) * 3
  ));
}

async function createSuccessNotification(supabase: SupabaseClient, workspaceId: string, userId: string | null, projectId: string | null, type: string, title: string, body: string, severity: string) {
  await supabase.from("customer_success_notifications").insert({
    workspace_id: workspaceId,
    user_id: userId,
    project_id: projectId,
    type,
    title,
    body,
    severity
  });
}

function validateProjectInput(input: SuccessProjectInput) {
  if (!input.clientName?.trim()) throw new Error("Client name is required.");
  if (!input.projectTitle?.trim()) throw new Error("Project title is required.");
  if (!input.projectCategory?.trim()) throw new Error("Project category is required.");
  if (!input.dateWon) throw new Error("Date won is required.");
  if (!Number.isFinite(Number(input.projectValue)) || Number(input.projectValue) < 0) throw new Error("Project value must be zero or more.");
}

function sumSince(projects: SuccessProject[], since: Date) {
  return sum(projects.filter(project => new Date(project.dateWon) >= since).map(project => project.projectValue));
}

function usageSecondsSince(sessions: DbRow[], since: Date) {
  return sum(sessions.filter(row => new Date(stringValue(row.login_at)) >= since).map(sessionDuration));
}

function activeUsersToday(sessions: DbRow[], activities: DbRow[]) {
  const today = startOfDay(new Date());
  const ids = new Set<string>();
  sessions.filter(row => new Date(stringValue(row.login_at)) >= today).forEach(row => ids.add(stringValue(row.user_id)));
  activities.filter(row => new Date(stringValue(row.occurred_at)) >= today).forEach(row => ids.add(stringValue(row.user_id)));
  ids.delete("");
  return ids.size;
}

function averageDailyUsage(sessions: DbRow[]) {
  const points = groupUsageByDay(sessions);
  if (!points.length) return 0;
  return average(points.map(point => point.value)) / 3600;
}

function mostActiveCustomerToday(sessions: DbRow[], users: Map<string, DbRow>) {
  const today = startOfDay(new Date());
  const counts = new Map<string, number>();
  sessions.filter(row => new Date(stringValue(row.login_at)) >= today).forEach(row => counts.set(stringValue(row.user_id), (counts.get(stringValue(row.user_id)) || 0) + sessionDuration(row)));
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (!top) return "-";
  const user = users.get(top[0]) || {};
  return stringValue(user.name) || stringValue(user.email) || "-";
}

function returningCustomers(sessions: DbRow[]) {
  const counts = countBy(sessions.map(row => stringValue(row.user_id)));
  return Array.from(counts.values()).filter(count => count > 1).length;
}

function newCustomersThisMonth(users: DbRow[]) {
  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);
  return users.filter(row => new Date(stringValue(row.created_at)) >= month).length;
}

function calculateHealthScore(sessions: DbRow[], activities: DbRow[], verifiedProjects: SuccessProject[], progress: DbRow[]) {
  const recentSessions = sessions.filter(row => new Date(stringValue(row.login_at)) >= daysAgo(14)).length;
  const recentActivities = activities.filter(row => new Date(stringValue(row.occurred_at)) >= daysAgo(14)).length;
  const recentProjects = verifiedProjects.filter(project => new Date(project.dateWon) >= daysAgo(90)).length;
  const recentProgress = progress.filter(row => new Date(stringValue(row.progress_date)) >= daysAgo(14)).reduce((total, row) => total + numberValue(row.productivity_score), 0);
  return Math.min(100, Math.round(recentSessions * 8 + recentActivities * 2 + recentProjects * 15 + recentProgress / 10));
}

function groupRevenueByMonth(projects: SuccessProject[]): CustomerSuccessChartPoint[] {
  const map = new Map<string, number>();
  projects.forEach(project => {
    const label = project.dateWon ? project.dateWon.slice(0, 7) : "Unknown";
    map.set(label, (map.get(label) || 0) + project.projectValue);
  });
  return Array.from(map.entries()).sort().slice(-12).map(([label, value]) => ({ label, value }));
}

function groupRevenueByWeek(projects: SuccessProject[]): CustomerSuccessChartPoint[] {
  const map = new Map<string, number>();
  projects.forEach(project => {
    const date = new Date(project.dateWon);
    const label = Number.isNaN(date.getTime()) ? "Unknown" : `${date.getFullYear()} W${Math.ceil((((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7)}`;
    map.set(label, (map.get(label) || 0) + project.projectValue);
  });
  return Array.from(map.entries()).slice(-12).map(([label, value]) => ({ label, value }));
}

function groupUsageByDay(sessions: DbRow[]): CustomerSuccessChartPoint[] {
  const map = new Map<string, number>();
  sessions.forEach(row => {
    const label = stringValue(row.login_at).slice(5, 10) || "Unknown";
    map.set(label, (map.get(label) || 0) + sessionDuration(row));
  });
  return Array.from(map.entries()).slice(-14).map(([label, value]) => ({ label, value }));
}

function groupProgress(rows: DbRow[]): CustomerSuccessChartPoint[] {
  const map = new Map<string, number>();
  rows.forEach(row => {
    const label = stringValue(row.progress_date).slice(5, 10) || "Unknown";
    map.set(label, (map.get(label) || 0) + numberValue(row.productivity_score));
  });
  return Array.from(map.entries()).slice(-14).map(([label, value]) => ({ label, value }));
}

function topValues(values: string[]): CustomerSuccessChartPoint[] {
  return Array.from(countBy(values).entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value }));
}

function sessionDuration(row: DbRow) {
  const saved = numberValue(row.duration_seconds);
  if (saved) return saved;
  const login = new Date(stringValue(row.login_at));
  const logout = new Date(stringValue(row.logout_at));
  if (!Number.isNaN(login.getTime()) && !Number.isNaN(logout.getTime())) return Math.max(0, Math.round((logout.getTime() - login.getTime()) / 1000));
  return 0;
}

function customerKey(userId: string, workspaceId: string) {
  return `${userId}:${workspaceId}`;
}

function sortBy<T>(values: T[], selector: (value: T) => number) {
  return [...values].sort((a, b) => selector(b) - selector(a));
}

function countBy(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach(value => map.set(value, (map.get(value) || 0) + 1));
  return map;
}

function latestDate(values: string[]) {
  return values.filter(Boolean).sort().at(-1) || "";
}

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return values.length ? sum(values) / values.length : 0;
}

function parseBrowser(userAgent: string) {
  if (userAgent.includes("Edg")) return "Edge";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  return userAgent ? "Browser" : "";
}

function parseDevice(userAgent: string) {
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  return userAgent ? "Desktop" : "";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function numberValue(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function booleanValue(value: unknown) {
  return value === true || value === "true";
}

function toCsv(headers: string[], rows: Array<Record<string, unknown>>) {
  return [headers.map(csvCell).join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\n");
}

function tableDocument(headers: string[], rows: Array<Record<string, unknown>>, title: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><table><thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${String(row[header] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
}

function printableReport(headers: string[], rows: Array<Record<string, unknown>>, metrics: Array<{ label: string; value: string | number }>) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Customer Success Report</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827}h1{font-size:28px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.metric{border:1px solid #e5e7eb;border-radius:12px;padding:12px}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left;font-size:12px}</style></head><body><h1>Customer Success Report</h1><div class="metrics">${metrics.map(metric => `<div class="metric"><strong>${metric.label}</strong><br>${metric.value}</div>`).join("")}</div><table><thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${String(row[header] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table><script>window.print()</script></body></html>`;
}
