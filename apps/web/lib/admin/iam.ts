import "server-only";
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { csvCell, isAdminReadSchemaError } from "./validators";
import type {
  AdminAccess,
  AdminEmployee,
  EmployeeAccessRequest,
  EmployeeActivityLog,
  EmployeeIamActionPayload,
  EmployeeIamData,
  EmployeeRole,
  EmployeeSession,
  IamPermission
} from "./iam-types";

type DbRow = Record<string, unknown>;

const passwordIterations = 210000;
const passwordKeyLength = 32;
const sessionDays = 7;

function adminClient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  return supabase;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function booleanValue(value: unknown) {
  return value === true;
}

function isoValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function selectRows(supabase: SupabaseClient, table: string, columns = "*", limit = 1000) {
  const { data, error } = await supabase.from(table).select(columns).order("created_at", { ascending: false }).limit(limit);
  if (isAdminReadSchemaError(error)) return [] as DbRow[];
  if (error) throw error;
  return (data || []) as unknown as DbRow[];
}

export function generateTemporaryPassword() {
  return randomBytes(12).toString("base64url");
}

export function hashEmployeePassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, passwordIterations, passwordKeyLength, "sha256").toString("hex");
  return { hash, salt, iterations: passwordIterations };
}

export function verifyEmployeePassword(input: string, storedHash: string, salt: string, iterations: number) {
  if (!input || !storedHash || !salt) return false;
  const candidate = pbkdf2Sync(input, salt, iterations || passwordIterations, passwordKeyLength, "sha256");
  const stored = Buffer.from(storedHash, "hex");
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}

export function hashAdminSessionToken(token: string) {
  const secret = process.env.EXTENSION_SHARED_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "local-admin-session-secret";
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

export async function getEmployeeIamData(): Promise<EmployeeIamData> {
  const supabase = adminClient();
  const [employeeRows, roleRows, permissionRows, requestRows, logRows, sessionRows] = await Promise.all([
    selectRows(supabase, "admin_employees", "*", 1000),
    selectRows(supabase, "admin_roles", "*", 200),
    selectRows(supabase, "admin_role_permissions", "*", 5000),
    selectRows(supabase, "admin_employee_access_requests", "*", 1000),
    selectRows(supabase, "admin_employee_activity_logs", "*", 1000),
    selectRows(supabase, "admin_employee_sessions", "*", 1000)
  ]);

  const roles = roleRows.map(role => mapRole(role, permissionRows));
  const roleById = new Map(roles.map(role => [role.id, role]));
  const employeeById = new Map(employeeRows.map(row => [stringValue(row.id), row]));
  const activeSessionsByEmployee = countBy(sessionRows.filter(row => !row.revoked_at && new Date(stringValue(row.expires_at)).getTime() > Date.now()).map(row => stringValue(row.employee_id)));
  const employees = employeeRows.map(row => mapEmployee(row, roleById, activeSessionsByEmployee.get(stringValue(row.id)) || 0));
  const requests = requestRows.map(row => mapAccessRequest(row, employeeById));
  const logs = logRows.map(row => mapActivityLog(row, employeeById));
  const sessions = sessionRows.filter(row => !row.revoked_at).map(row => mapSession(row, employeeById));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    metrics: [
      { label: "Total Employees", value: employees.length, tone: "blue" },
      { label: "Active Employees", value: employees.filter(employee => employee.status === "active").length, tone: "green" },
      { label: "Suspended Employees", value: employees.filter(employee => employee.status === "suspended").length, tone: "amber" },
      { label: "Disabled Employees", value: employees.filter(employee => employee.status === "disabled").length, tone: "red" },
      { label: "Pending Permission Requests", value: requests.filter(request => request.status === "pending").length, tone: "amber" },
      { label: "Total Roles", value: roles.length, tone: "slate" },
      { label: "Failed Login Attempts", value: logs.filter(log => log.action === "failed_login").length, tone: "red" },
      { label: "Recent Logins", value: employees.filter(employee => employee.lastLoginAt && new Date(employee.lastLoginAt) >= today).length, tone: "green" },
      { label: "Active Sessions", value: sessions.filter(session => new Date(session.expiresAt).getTime() > Date.now()).length, tone: "blue" }
    ],
    employees,
    roles,
    requests,
    logs,
    sessions
  };
}

export async function loginAdminEmployee(input: { email: string; password: string; ipAddress: string; userAgent: string }) {
  const supabase = adminClient();
  const loginEmail = input.email.trim().toLowerCase();
  const { data, error } = await supabase.from("admin_employees").select("*").eq("login_email", loginEmail).maybeSingle();
  const row = data as unknown as DbRow | null;

  if (error || !row) {
    await insertActivity(supabase, null, "failed_login", "employee-auth", input.ipAddress, input.userAgent, { email: loginEmail, reason: "not_found" });
    throw new Error("Email or password is incorrect.");
  }

  const status = stringValue(row.status);
  if (status === "suspended") {
    throw new Error("Your account has been temporarily suspended. Please contact your administrator.");
  }
  if (status === "disabled" || status === "deleted") {
    throw new Error("This admin account is not active. Please contact your administrator.");
  }

  const ok = verifyEmployeePassword(input.password, stringValue(row.password_hash), stringValue(row.password_salt), numberValue(row.password_iterations));
  if (!ok) {
    await supabase.from("admin_employees").update({ failed_login_count: numberValue(row.failed_login_count) + 1, updated_at: new Date().toISOString() }).eq("id", row.id);
    await insertActivity(supabase, stringValue(row.id), "failed_login", "employee-auth", input.ipAddress, input.userAgent, { email: loginEmail, reason: "bad_password" });
    throw new Error("Email or password is incorrect.");
  }

  const token = `cla_admin_${randomBytes(32).toString("hex")}`;
  const tokenHash = hashAdminSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
  const browser = parseBrowser(input.userAgent);
  const device = parseDevice(input.userAgent);

  const { error: sessionError } = await supabase.from("admin_employee_sessions").insert({
    employee_id: row.id,
    token_hash: tokenHash,
    ip_address: input.ipAddress,
    user_agent: input.userAgent,
    browser,
    device,
    expires_at: expiresAt
  });
  if (sessionError) throw sessionError;

  await supabase.from("admin_employees").update({
    last_login_at: new Date().toISOString(),
    login_count: numberValue(row.login_count) + 1,
    failed_login_count: 0,
    last_login_ip: input.ipAddress,
    last_login_browser: browser,
    last_login_device: device,
    updated_at: new Date().toISOString()
  }).eq("id", row.id);
  await insertActivity(supabase, stringValue(row.id), "successful_login", "employee-auth", input.ipAddress, input.userAgent, {});

  return {
    token,
    expiresAt,
    forcePasswordChange: booleanValue(row.force_password_change)
  };
}

export async function getEmployeeBySessionToken(token: string): Promise<{ employee: AdminEmployee; access: AdminAccess } | null> {
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const tokenHash = hashAdminSessionToken(token);
  const { data: session, error } = await supabase
    .from("admin_employee_sessions")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();
  const sessionRow = session as unknown as DbRow | null;
  if (error || !sessionRow || new Date(stringValue(sessionRow.expires_at)).getTime() <= Date.now()) return null;

  const { data: employee, error: employeeError } = await supabase
    .from("admin_employees")
    .select("*")
    .eq("id", sessionRow.employee_id)
    .maybeSingle();
  const employeeRow = employee as unknown as DbRow | null;
  if (employeeError || !employeeRow || stringValue(employeeRow.status) !== "active") return null;

  const roleId = stringValue(employeeRow.role_id);
  const { data: role } = await supabase.from("admin_roles").select("*").eq("id", roleId).maybeSingle();
  const { data: permissions } = await supabase.from("admin_role_permissions").select("*").eq("role_id", roleId);
  await supabase.from("admin_employee_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", sessionRow.id);

  const mappedRole = mapRole((role || {}) as unknown as DbRow, (permissions || []) as unknown as DbRow[]);
  const employeeData = mapEmployee(employeeRow, new Map([[mappedRole.id, mappedRole]]), 1);

  return {
    employee: employeeData,
    access: {
      actorType: "employee",
      actorId: employeeData.id,
      email: employeeData.loginEmail,
      roleName: mappedRole.name || "Employee",
      isSuperAdmin: Boolean(mappedRole.fullAccess || mappedRole.slug === "super-admin"),
      canAccessAdmin: Boolean(mappedRole.fullAccess || mappedRole.permissions.some(permission => permission.view)),
      modules: permissionsToAccess(mappedRole.permissions, mappedRole.fullAccess)
    }
  };
}

export async function revokeEmployeeSession(token: string) {
  const supabase = adminClient();
  if (!token) return;
  await supabase.from("admin_employee_sessions").update({ revoked_at: new Date().toISOString() }).eq("token_hash", hashAdminSessionToken(token));
}

export async function performEmployeeIamAction(payload: EmployeeIamActionPayload, actor: AdminAccess) {
  const supabase = adminClient();
  const isPrivileged = actor.isSuperAdmin || actor.roleName === "Super Admin";

  if (!isPrivileged && payload.action !== "submitEmployeeAccessRequest") {
    throw new Error("Only the Super Admin can manage employee credentials and permissions.");
  }

  if (payload.action === "createEmployee") {
    validateEmployeeCreatePayload(payload.employee);
    const password = payload.employee.temporaryPassword || generateTemporaryPassword();
    const passwordData = hashEmployeePassword(password);
    const roleId = payload.employee.roleId || await getDefaultEmployeeRoleId(supabase);
    const employeeId = await nextEmployeeId(supabase);
    const { data, error } = await supabase.from("admin_employees").insert({
      employee_id: employeeId,
      full_name: payload.employee.fullName,
      company_email: payload.employee.companyEmail.toLowerCase(),
      phone_number: payload.employee.phoneNumber,
      profile_picture_url: payload.employee.profilePictureUrl,
      position: payload.employee.position,
      department: payload.employee.department,
      reporting_manager: payload.employee.reportingManager,
      joining_date: payload.employee.joiningDate || null,
      login_email: payload.employee.loginEmail.toLowerCase(),
      password_hash: passwordData.hash,
      password_salt: passwordData.salt,
      password_iterations: passwordData.iterations,
      force_password_change: payload.employee.forcePasswordChange,
      send_credentials_by_email: payload.employee.sendCredentialsByEmail,
      role_id: roleId,
      status: "active",
      created_by: actor.actorId
    }).select("*").single();
    if (error) throw error;
    await insertActivity(supabase, stringValue((data as DbRow).id), "employee_created", "profile", "", "", { by: actor.email, employeeId });
    return { message: "Employee admin account created.", temporaryPassword: password };
  }

  if (payload.action === "updateEmployee") {
    const patch = mapEmployeePatch(payload.patch);
    const { error } = await supabase.from("admin_employees").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", payload.employeeId);
    if (error) throw error;
    await insertActivity(supabase, payload.employeeId, "employee_edited", "profile", "", "", { by: actor.email, patch });
    return { message: "Employee updated." };
  }

  if (payload.action === "resetEmployeePassword") {
    const password = payload.temporaryPassword || generateTemporaryPassword();
    const passwordData = hashEmployeePassword(password);
    const { error } = await supabase.from("admin_employees").update({
      password_hash: passwordData.hash,
      password_salt: passwordData.salt,
      password_iterations: passwordData.iterations,
      force_password_change: payload.forcePasswordChange,
      send_credentials_by_email: payload.sendCredentialsByEmail,
      updated_at: new Date().toISOString()
    }).eq("id", payload.employeeId);
    if (error) throw error;
    await revokeEmployeeSessions(supabase, payload.employeeId);
    await insertActivity(supabase, payload.employeeId, "password_reset", "profile", "", "", { by: actor.email });
    return { message: "Employee password reset and active sessions terminated.", temporaryPassword: password };
  }

  if (
    payload.action === "suspendEmployee" ||
    payload.action === "activateEmployee" ||
    payload.action === "disableEmployee" ||
    payload.action === "deleteEmployee"
  ) {
    const status = payload.action === "activateEmployee" ? "active" : payload.action === "suspendEmployee" ? "suspended" : payload.action === "disableEmployee" ? "disabled" : "deleted";
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "suspended") patch.suspended_at = new Date().toISOString();
    if (status === "disabled") patch.disabled_at = new Date().toISOString();
    if (status === "deleted") patch.deleted_at = new Date().toISOString();
    const { error } = await supabase.from("admin_employees").update(patch).eq("id", payload.employeeId);
    if (error) throw error;
    if (status !== "active") await revokeEmployeeSessions(supabase, payload.employeeId);
    await insertActivity(supabase, payload.employeeId, `employee_${status}`, "profile", "", "", { by: actor.email, reason: "reason" in payload ? payload.reason : "" });
    return { message: `Employee ${status}.` };
  }

  if (payload.action === "updateRolePermissions") {
    const rows = payload.permissions.map(permission => ({
      role_id: payload.roleId,
      module_key: permission.moduleKey,
      can_view: permission.view,
      can_create: permission.create,
      can_edit: permission.edit,
      can_delete: permission.delete,
      can_publish: Boolean(permission.publish),
      can_export: Boolean(permission.export),
      can_import: Boolean(permission.import),
      can_approve: Boolean(permission.approve),
      can_manage_settings: Boolean(permission.manageSettings),
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from("admin_role_permissions").upsert(rows, { onConflict: "role_id,module_key" });
    if (error) throw error;
    await insertActivity(supabase, null, "role_updated", "profile", "", "", { by: actor.email, roleId: payload.roleId });
    return { message: "Role permissions updated." };
  }

  if (payload.action === "approveEmployeeAccessRequest" || payload.action === "rejectEmployeeAccessRequest") {
    const status = payload.action === "approveEmployeeAccessRequest" ? "approved" : "rejected";
    const { data: requestRow, error: loadError } = await supabase.from("admin_employee_access_requests").select("*").eq("id", payload.requestId).single();
    if (loadError) throw loadError;
    const request = requestRow as unknown as DbRow;
    const { error } = await supabase.from("admin_employee_access_requests").update({
      status,
      manager_notes: payload.notes,
      resolved_by: actor.actorId,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", payload.requestId);
    if (error) throw error;
    if (status === "approved") await grantPermissionToEmployeeRole(supabase, stringValue(request.employee_id), stringValue(request.requested_module), stringValue(request.requested_permission));
    await insertActivity(supabase, stringValue(request.employee_id), `access_${status}`, "profile", "", "", { by: actor.email, requestId: payload.requestId });
    return { message: `Permission request ${status}.` };
  }

  if (payload.action === "submitEmployeeAccessRequest") {
    if (actor.actorType !== "employee") throw new Error("Only employees can request access.");
    const employee = await getEmployeeRow(supabase, actor.actorId);
    const { error } = await supabase.from("admin_employee_access_requests").insert({
      employee_id: actor.actorId,
      requested_module: payload.requestedModule,
      requested_permission: payload.requestedPermission,
      reason: payload.reason,
      status: "pending"
    });
    if (error) throw error;
    await insertActivity(supabase, actor.actorId, "access_request_submitted", "profile", "", "", { by: actor.email, module: payload.requestedModule });
    return { message: `Access request submitted for ${employee.full_name || actor.email}.` };
  }

  return { message: "Action ignored." };
}

export async function exportEmployeeIamCsv(type: string) {
  const data = await getEmployeeIamData();
  if (type === "roles") return toCsv(["name", "slug", "description", "fullAccess"], data.roles);
  if (type === "requests") return toCsv(["employeeName", "department", "requestedModule", "requestedPermission", "status", "requestedAt"], data.requests);
  if (type === "logs") return toCsv(["employeeName", "actor", "action", "module", "ipAddress", "browser", "createdAt"], data.logs);
  return toCsv(["employeeId", "fullName", "companyEmail", "position", "department", "joiningDate", "status", "lastLoginAt", "roleName"], data.employees);
}

function mapRole(row: DbRow, permissionRows: DbRow[]): EmployeeRole {
  const roleId = stringValue(row.id);
  return {
    id: roleId,
    name: stringValue(row.name),
    slug: stringValue(row.slug),
    description: stringValue(row.description),
    fullAccess: booleanValue(row.full_access),
    locked: booleanValue(row.locked),
    permissions: permissionRows.filter(permission => stringValue(permission.role_id) === roleId).map(mapPermission)
  };
}

function mapPermission(row: DbRow): IamPermission {
  return {
    moduleKey: stringValue(row.module_key),
    view: booleanValue(row.can_view),
    create: booleanValue(row.can_create),
    edit: booleanValue(row.can_edit),
    delete: booleanValue(row.can_delete),
    publish: booleanValue(row.can_publish),
    export: booleanValue(row.can_export),
    import: booleanValue(row.can_import),
    approve: booleanValue(row.can_approve),
    manageSettings: booleanValue(row.can_manage_settings)
  };
}

function mapEmployee(row: DbRow, roleById: Map<string, EmployeeRole>, activeSessions: number): AdminEmployee {
  const role = roleById.get(stringValue(row.role_id));
  return {
    id: stringValue(row.id),
    employeeId: stringValue(row.employee_id),
    fullName: stringValue(row.full_name),
    companyEmail: stringValue(row.company_email),
    phoneNumber: stringValue(row.phone_number),
    profilePictureUrl: stringValue(row.profile_picture_url),
    position: stringValue(row.position),
    department: stringValue(row.department),
    reportingManager: stringValue(row.reporting_manager),
    joiningDate: isoValue(row.joining_date),
    loginEmail: stringValue(row.login_email),
    forcePasswordChange: booleanValue(row.force_password_change),
    sendCredentialsByEmail: booleanValue(row.send_credentials_by_email),
    roleId: stringValue(row.role_id),
    roleName: role?.name || "No role",
    status: stringValue(row.status) || "active",
    twoFactorEnabled: booleanValue(row.two_factor_enabled),
    lastLoginAt: isoValue(row.last_login_at),
    loginCount: numberValue(row.login_count),
    failedLoginCount: numberValue(row.failed_login_count),
    lastLoginIp: stringValue(row.last_login_ip),
    lastLoginBrowser: stringValue(row.last_login_browser),
    lastLoginDevice: stringValue(row.last_login_device),
    activeSessions,
    assignedPermissions: role?.permissions.filter(permission => permission.view || permission.create || permission.edit || permission.delete).map(permission => permission.moduleKey) || [],
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at)
  };
}

function mapAccessRequest(row: DbRow, employeeById: Map<string, DbRow>): EmployeeAccessRequest {
  const employee = employeeById.get(stringValue(row.employee_id)) || {};
  return {
    id: stringValue(row.id),
    employeeId: stringValue(row.employee_id),
    employeeName: stringValue(employee.full_name),
    employeeEmail: stringValue(employee.company_email),
    department: stringValue(employee.department),
    position: stringValue(employee.position),
    requestedModule: stringValue(row.requested_module),
    requestedPermission: stringValue(row.requested_permission),
    reason: stringValue(row.reason),
    status: stringValue(row.status),
    managerNotes: stringValue(row.manager_notes),
    requestedAt: isoValue(row.created_at)
  };
}

function mapActivityLog(row: DbRow, employeeById: Map<string, DbRow>): EmployeeActivityLog {
  const employee = employeeById.get(stringValue(row.employee_id)) || {};
  return {
    id: stringValue(row.id),
    employeeName: stringValue(employee.full_name) || "System",
    employeeEmail: stringValue(employee.company_email),
    actor: stringValue(row.actor_type),
    action: stringValue(row.action),
    module: stringValue(row.module),
    ipAddress: stringValue(row.ip_address),
    browser: parseBrowser(stringValue(row.user_agent)),
    createdAt: isoValue(row.created_at)
  };
}

function mapSession(row: DbRow, employeeById: Map<string, DbRow>): EmployeeSession {
  const employee = employeeById.get(stringValue(row.employee_id)) || {};
  return {
    id: stringValue(row.id),
    employeeName: stringValue(employee.full_name),
    employeeEmail: stringValue(employee.company_email),
    ipAddress: stringValue(row.ip_address),
    browser: stringValue(row.browser),
    device: stringValue(row.device),
    lastSeenAt: isoValue(row.last_seen_at),
    expiresAt: isoValue(row.expires_at)
  };
}

function permissionsToAccess(permissions: IamPermission[], fullAccess: boolean) {
  if (fullAccess) return Object.fromEntries(permissions.map(permission => [permission.moduleKey, { ...permission, fullAccess: true }]));
  return Object.fromEntries(permissions.map(permission => [permission.moduleKey, permission]));
}

async function getDefaultEmployeeRoleId(supabase: SupabaseClient) {
  const { data } = await supabase.from("admin_roles").select("id").eq("slug", "content-writer").maybeSingle();
  return String(data?.id || "");
}

async function nextEmployeeId(supabase: SupabaseClient) {
  const { count } = await supabase.from("admin_employees").select("id", { count: "exact", head: true });
  return `EMP-${String((count || 0) + 1).padStart(4, "0")}`;
}

async function revokeEmployeeSessions(supabase: SupabaseClient, employeeId: string) {
  const { error } = await supabase.from("admin_employee_sessions").update({ revoked_at: new Date().toISOString() }).eq("employee_id", employeeId).is("revoked_at", null);
  if (error && !isAdminReadSchemaError(error)) throw error;
}

async function grantPermissionToEmployeeRole(supabase: SupabaseClient, employeeId: string, moduleKey: string, permission: string) {
  const employee = await getEmployeeRow(supabase, employeeId);
  const roleId = stringValue(employee.role_id);
  if (!roleId) return;
  const patch: Record<string, unknown> = {
    role_id: roleId,
    module_key: moduleKey,
    can_view: true,
    updated_at: new Date().toISOString()
  };
  if (permission === "create") patch.can_create = true;
  if (permission === "edit") patch.can_edit = true;
  if (permission === "delete") patch.can_delete = true;
  if (permission === "publish") patch.can_publish = true;
  if (permission === "export") patch.can_export = true;
  if (permission === "import") patch.can_import = true;
  if (permission === "approve") patch.can_approve = true;
  if (permission === "manageSettings") patch.can_manage_settings = true;
  const { error } = await supabase.from("admin_role_permissions").upsert(patch, { onConflict: "role_id,module_key" });
  if (error) throw error;
}

function validateEmployeeCreatePayload(employee: {
  fullName: string;
  companyEmail: string;
  position: string;
  department: string;
  joiningDate: string;
  loginEmail: string;
  temporaryPassword: string;
  roleId: string;
}) {
  if (!employee.fullName?.trim()) throw new Error("Full name is required.");
  if (!employee.companyEmail?.trim() || !employee.companyEmail.includes("@")) throw new Error("A valid company email is required.");
  if (!employee.position?.trim()) throw new Error("Position is required.");
  if (!employee.department?.trim()) throw new Error("Department is required.");
  if (!employee.joiningDate?.trim()) throw new Error("Joining date is required.");
  if (Number.isNaN(new Date(employee.joiningDate).getTime())) throw new Error("Joining date must be a valid date.");
  if (!employee.loginEmail?.trim() || !employee.loginEmail.includes("@")) throw new Error("A valid login email is required.");
  if (!employee.temporaryPassword?.trim() || employee.temporaryPassword.length < 8) throw new Error("Temporary password must be at least 8 characters.");
  if (!employee.roleId?.trim()) throw new Error("Role is required.");
}

async function getEmployeeRow(supabase: SupabaseClient, employeeId: string) {
  const { data, error } = await supabase.from("admin_employees").select("*").eq("id", employeeId).single();
  if (error) throw error;
  return data as unknown as DbRow;
}

function mapEmployeePatch(patch: Partial<Pick<AdminEmployee, "fullName" | "companyEmail" | "phoneNumber" | "profilePictureUrl" | "position" | "department" | "reportingManager" | "joiningDate" | "loginEmail" | "roleId" | "status" | "forcePasswordChange" | "twoFactorEnabled">>) {
  return {
    full_name: patch.fullName,
    company_email: patch.companyEmail?.toLowerCase(),
    phone_number: patch.phoneNumber,
    profile_picture_url: patch.profilePictureUrl,
    position: patch.position,
    department: patch.department,
    reporting_manager: patch.reportingManager,
    joining_date: patch.joiningDate || null,
    login_email: patch.loginEmail?.toLowerCase(),
    role_id: patch.roleId,
    status: patch.status,
    force_password_change: patch.forcePasswordChange,
    two_factor_enabled: patch.twoFactorEnabled
  };
}

async function insertActivity(supabase: SupabaseClient, employeeId: string | null, action: string, module: string, ipAddress: string, userAgent: string, metadata: Record<string, unknown>) {
  await supabase.from("admin_employee_activity_logs").insert({
    employee_id: employeeId,
    action,
    module,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata
  });
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return counts;
}

function parseBrowser(userAgent: string) {
  if (userAgent.includes("Edg")) return "Edge";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  return userAgent ? "Other" : "";
}

function parseDevice(userAgent: string) {
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  return userAgent ? "Desktop" : "";
}

function toCsv<T extends Record<string, unknown>>(headers: string[], rows: T[]) {
  return [headers.join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\n");
}
