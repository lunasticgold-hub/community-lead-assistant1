"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  KeyRound,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import {
  EMPLOYEE_STATUSES,
  IAM_ACTIONS,
  IAM_MODULES,
  type AdminAccess,
  type AdminEmployee,
  type EmployeeAccessRequest,
  type EmployeeIamActionPayload,
  type EmployeeIamData,
  type EmployeeRole,
  type IamPermission
} from "@/lib/admin/iam-types";

type TabKey = "employees" | "roles" | "requests" | "sessions" | "activity";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "employees", label: "Employees" },
  { key: "roles", label: "Roles & Permissions" },
  { key: "requests", label: "Pending Permission Requests" },
  { key: "sessions", label: "Active Sessions" },
  { key: "activity", label: "Activity Logs" }
];

const emptyEmployeeForm = {
  fullName: "",
  companyEmail: "",
  phoneNumber: "",
  profilePictureUrl: "",
  position: "",
  department: "",
  reportingManager: "",
  joiningDate: "",
  loginEmail: "",
  temporaryPassword: "",
  forcePasswordChange: true,
  sendCredentialsByEmail: false,
  roleId: ""
};

export function IamControlCenter({ data, actor }: { data: EmployeeIamData; actor: AdminAccess }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("employees");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AdminEmployee | null>(null);
  const [resetEmployee, setResetEmployee] = useState<AdminEmployee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({ ...emptyEmployeeForm, roleId: data.roles[0]?.id || "" });
  const [selectedRoleId, setSelectedRoleId] = useState(data.roles[0]?.id || "");
  const selectedRole = data.roles.find(role => role.id === selectedRoleId) || data.roles[0];
  const [rolePermissions, setRolePermissions] = useState<IamPermission[]>(selectedRole?.permissions || []);

  const canManage = actor.isSuperAdmin || actor.roleName === "Super Admin";

  const employees = useMemo(() => {
    const term = search.toLowerCase();
    return data.employees.filter(employee => {
      const matchesSearch = [employee.fullName, employee.companyEmail, employee.loginEmail, employee.position, employee.department, employee.employeeId, employee.roleName]
        .join(" ")
        .toLowerCase()
        .includes(term);
      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.employees, search, statusFilter]);

  async function runAction(payload: EmployeeIamActionPayload) {
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/iam", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(String(json.error || "Action failed."));
      return false;
    }
    const passwordNote = json.temporaryPassword ? ` Temporary password: ${json.temporaryPassword}` : "";
    setMessage(`${String(json.message || "Saved.")}${passwordNote}`);
    startTransition(() => router.refresh());
    return true;
  }

  function openCreate() {
    setEmployeeForm({ ...emptyEmployeeForm, roleId: data.roles[0]?.id || "", temporaryPassword: generatePassword() });
    setCreateOpen(true);
  }

  async function saveCreate() {
    const validation = validateEmployeeForm(employeeForm);
    if (validation) {
      setError(validation);
      return;
    }
    const saved = await runAction({ action: "createEmployee", employee: employeeForm });
    if (saved) setCreateOpen(false);
  }

  function updateEmployee(employee: AdminEmployee, patch: Partial<AdminEmployee>) {
    void runAction({ action: "updateEmployee", employeeId: employee.id, patch });
    setEditingEmployee(null);
  }

  function resetPassword(employee: AdminEmployee, password: string, forcePasswordChange: boolean, sendCredentialsByEmail: boolean) {
    void runAction({ action: "resetEmployeePassword", employeeId: employee.id, temporaryPassword: password, forcePasswordChange, sendCredentialsByEmail });
    setResetEmployee(null);
  }

  function selectRole(role: EmployeeRole) {
    setSelectedRoleId(role.id);
    setRolePermissions(role.permissions);
  }

  function permissionFor(moduleKey: string) {
    return rolePermissions.find(permission => permission.moduleKey === moduleKey) || {
      moduleKey,
      view: false,
      create: false,
      edit: false,
      delete: false
    };
  }

  function togglePermission(moduleKey: string, action: keyof Omit<IamPermission, "moduleKey">) {
    setRolePermissions(current => {
      const existing = permissionFor(moduleKey);
      const next = { ...existing, [action]: !existing[action] };
      const without = current.filter(permission => permission.moduleKey !== moduleKey);
      return [...without, next].sort((a, b) => a.moduleKey.localeCompare(b.moduleKey));
    });
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 shadow-2xl shadow-blue-950/20">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
                <ShieldCheck size={16} />
                Internal Employee IAM
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Admin Users & Permissions</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Create employee-only Admin/CMS login credentials, assign roles, control module permissions, review access requests, and audit internal activity. This page does not manage customers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => downloadCsv("employees")} className="studio-button">
                <Download size={16} /> Export Employees
              </button>
              {canManage ? (
                <button type="button" onClick={openCreate} className="studio-button bg-blue-500 text-white hover:bg-blue-400">
                  <UserPlus size={16} /> Create Employee
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
          {data.metrics.map(metric => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="text-xs text-slate-400">{metric.label}</div>
              <div className={`mt-2 text-2xl font-semibold ${metricTone(metric.tone)}`}>{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {!canManage ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          You can view this module because permission was granted, but only the Super Admin can create employees, reset passwords, assign permissions, approve requests, suspend, activate, or delete employees.
        </div>
      ) : null}
      {message ? <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}

      <div className="rounded-2xl border border-white/10 bg-slate-950 p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={["inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition", tab === item.key ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10"].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "employees" ? (
        <EmployeesTab
          employees={employees}
          search={search}
          statusFilter={statusFilter}
          loading={isPending}
          canManage={canManage}
          onSearch={setSearch}
          onStatusFilter={setStatusFilter}
          onCreate={openCreate}
          onEdit={setEditingEmployee}
          onReset={setResetEmployee}
          onAction={runAction}
        />
      ) : null}

      {tab === "roles" && selectedRole ? (
        <RolesTab
          roles={data.roles}
          selectedRole={selectedRole}
          permissions={rolePermissions}
          canManage={canManage}
          onSelectRole={selectRole}
          onToggle={togglePermission}
          onSave={() => runAction({ action: "updateRolePermissions", roleId: selectedRole.id, permissions: rolePermissions })}
        />
      ) : null}

      {tab === "requests" ? <RequestsTab requests={data.requests} canManage={canManage} onAction={runAction} /> : null}
      {tab === "sessions" ? <SessionsTab sessions={data.sessions} /> : null}
      {tab === "activity" ? <ActivityTab logs={data.logs} /> : null}

      {createOpen ? (
        <EmployeeFormDrawer
          title="Create Employee"
          form={employeeForm}
          roles={data.roles}
          onChange={setEmployeeForm}
          onClose={() => setCreateOpen(false)}
          onSubmit={saveCreate}
        />
      ) : null}
      {editingEmployee ? (
        <EditEmployeeDrawer
          employee={editingEmployee}
          roles={data.roles}
          onClose={() => setEditingEmployee(null)}
          onSubmit={patch => updateEmployee(editingEmployee, patch)}
        />
      ) : null}
      {resetEmployee ? <ResetPasswordModal employee={resetEmployee} onClose={() => setResetEmployee(null)} onSubmit={resetPassword} /> : null}
    </div>
  );
}

function EmployeesTab({
  employees,
  search,
  statusFilter,
  loading,
  canManage,
  onSearch,
  onStatusFilter,
  onCreate,
  onEdit,
  onReset,
  onAction
}: {
  employees: AdminEmployee[];
  search: string;
  statusFilter: string;
  loading: boolean;
  canManage: boolean;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onCreate: () => void;
  onEdit: (employee: AdminEmployee) => void;
  onReset: (employee: AdminEmployee) => void;
  onAction: (payload: EmployeeIamActionPayload) => Promise<boolean | void>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <PanelHeader title="Employee Access Management" description="Internal employees with Admin/CMS-only credentials and RBAC permissions." />
        {canManage ? <button type="button" onClick={onCreate} className="studio-button bg-blue-500 text-white hover:bg-blue-400"><UserPlus size={16} /> Create Employee</button> : null}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
        <input value={search} onChange={event => onSearch(event.target.value)} placeholder="Search employee, email, position, department, role..." className="studio-input" />
        <select value={statusFilter} onChange={event => onStatusFilter(event.target.value)} className="studio-input">
          <option value="all">All statuses</option>
          {EMPLOYEE_STATUSES.map(status => <option key={status} value={status}>{readable(status)}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>{["Employee", "Email", "Position", "Department", "Joining Date", "Status", "Last Login", "Assigned Permissions", "Actions"].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="border-t border-white/10 align-top">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar employee={employee} />
                    <div>
                      <div className="font-semibold text-white">{employee.fullName}</div>
                      <div className="text-xs text-slate-500">{employee.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-slate-200">{employee.companyEmail}</div>
                  <div className="text-xs text-slate-500">Login: {employee.loginEmail}</div>
                </td>
                <td className="px-3 py-3">{employee.position || "-"}</td>
                <td className="px-3 py-3">{employee.department || "-"}</td>
                <td className="px-3 py-3">{formatDate(employee.joiningDate)}</td>
                <td className="px-3 py-3"><StatusBadge tone={employee.status === "active" ? "green" : employee.status === "suspended" ? "amber" : "red"}>{readable(employee.status)}</StatusBadge></td>
                <td className="px-3 py-3">
                  <div>{formatDate(employee.lastLoginAt)}</div>
                  <div className="text-xs text-slate-500">{employee.lastLoginBrowser || "No browser"} / {employee.activeSessions} active sessions</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex max-w-sm flex-wrap gap-1">
                    {employee.assignedPermissions.slice(0, 5).map(permission => <Badge key={permission}>{readable(permission)}</Badge>)}
                    {employee.assignedPermissions.length > 5 ? <Badge>+{employee.assignedPermissions.length - 5}</Badge> : null}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <ActionButton onClick={() => onEdit(employee)}>View/Edit</ActionButton>
                    <ActionButton disabled={!canManage} onClick={() => onReset(employee)}>Reset Password</ActionButton>
                    {employee.status === "active" ? (
                      <ActionButton disabled={!canManage} onClick={() => onAction({ action: "suspendEmployee", employeeId: employee.id, reason: "Manual suspension" })}>Suspend</ActionButton>
                    ) : (
                      <ActionButton disabled={!canManage} onClick={() => onAction({ action: "activateEmployee", employeeId: employee.id })}>Activate</ActionButton>
                    )}
                    <ActionButton disabled={!canManage} onClick={() => onAction({ action: "disableEmployee", employeeId: employee.id })}>Deactivate</ActionButton>
                    <ActionButton danger disabled={!canManage} onClick={() => onAction({ action: "deleteEmployee", employeeId: employee.id })}>Delete</ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {!employees.length ? <EmptyRow colSpan={9} text={loading ? "Refreshing employees..." : "No employees found. Create an internal Admin/CMS employee account."} /> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RolesTab({
  roles,
  selectedRole,
  permissions,
  canManage,
  onSelectRole,
  onToggle,
  onSave
}: {
  roles: EmployeeRole[];
  selectedRole: EmployeeRole;
  permissions: IamPermission[];
  canManage: boolean;
  onSelectRole: (role: EmployeeRole) => void;
  onToggle: (moduleKey: string, action: keyof Omit<IamPermission, "moduleKey">) => void;
  onSave: () => void;
}) {
  const permissionFor = (moduleKey: string) => permissions.find(permission => permission.moduleKey === moduleKey);
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <PanelHeader title="Role-Based Access Control" description="Every Admin/CMS module supports View, Create, Edit, and Delete permissions." />
        <button type="button" disabled={!canManage || selectedRole.locked} onClick={onSave} className="studio-button bg-blue-500 text-white hover:bg-blue-400">
          <ShieldCheck size={16} /> Save Permissions
        </button>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[270px_1fr]">
        <div className="space-y-2">
          {roles.map(role => (
            <button key={role.id} type="button" onClick={() => onSelectRole(role)} className={`w-full rounded-xl border px-3 py-3 text-left transition ${role.id === selectedRole.id ? "border-blue-400 bg-blue-500/15 text-white" : "border-white/10 text-slate-300 hover:bg-white/10"}`}>
              <div className="font-semibold">{role.name}</div>
              <div className="mt-1 line-clamp-2 text-xs text-slate-500">{role.description}</div>
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-3">Module</th>
                {IAM_ACTIONS.map(action => <th key={action} className="px-3 py-3 text-center">{readable(action)}</th>)}
              </tr>
            </thead>
            <tbody>
              {IAM_MODULES.map(moduleKey => {
                const permission = permissionFor(moduleKey);
                return (
                  <tr key={moduleKey} className="border-t border-white/10">
                    <td className="px-3 py-3 font-medium text-white">{readable(moduleKey)}</td>
                    {IAM_ACTIONS.map(action => (
                      <td key={action} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(permission?.[action])}
                          disabled={!canManage || selectedRole.locked}
                          onChange={() => onToggle(moduleKey, action)}
                          className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-blue-500"
                          aria-label={`${selectedRole.name} ${moduleKey} ${action}`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function RequestsTab({ requests, canManage, onAction }: { requests: EmployeeAccessRequest[]; canManage: boolean; onAction: (payload: EmployeeIamActionPayload) => Promise<boolean | void> }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <PanelHeader title="Pending Permission Requests" description="Employees can request access when a route denies them. Super Admin approval updates access immediately." />
      <div className="mt-4 grid gap-3">
        {requests.map(request => (
          <div key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-white">{request.employeeName || request.employeeEmail}</div>
                  <Badge>{request.department || "No department"}</Badge>
                  <StatusBadge tone={request.status === "approved" ? "green" : request.status === "rejected" ? "red" : "amber"}>{readable(request.status)}</StatusBadge>
                </div>
                <div className="mt-2 text-sm text-slate-300">Requested <strong>{readable(request.requestedPermission)}</strong> access to <strong>{readable(request.requestedModule)}</strong></div>
                <div className="mt-1 text-xs text-slate-500">{request.position || "No position"} / {formatDate(request.requestedAt)}</div>
                {request.reason ? <div className="mt-2 rounded-xl bg-slate-900 p-3 text-sm text-slate-300">{request.reason}</div> : null}
              </div>
              <div className="min-w-72 space-y-2">
                <textarea value={notes[request.id] || ""} onChange={event => setNotes(current => ({ ...current, [request.id]: event.target.value }))} placeholder="Manager notes" className="studio-textarea min-h-20" />
                <div className="flex gap-2">
                  <ActionButton disabled={!canManage} onClick={() => onAction({ action: "approveEmployeeAccessRequest", requestId: request.id, notes: notes[request.id] || "" })}>Approve</ActionButton>
                  <ActionButton danger disabled={!canManage} onClick={() => onAction({ action: "rejectEmployeeAccessRequest", requestId: request.id, notes: notes[request.id] || "" })}>Reject</ActionButton>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!requests.length ? <EmptyState title="No permission requests" body="Restricted employees can request access from the 403 access-denied page." /> : null}
      </div>
    </section>
  );
}

function SessionsTab({ sessions }: { sessions: EmployeeIamData["sessions"] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <PanelHeader title="Active Sessions" description="Current employee Admin/CMS sessions. Suspensions, disables, and password resets terminate sessions." />
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>{["Employee", "IP Address", "Browser", "Device", "Last Seen", "Expires"].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.id} className="border-t border-white/10">
                <td className="px-3 py-3"><div className="font-semibold text-white">{session.employeeName}</div><div className="text-xs text-slate-500">{session.employeeEmail}</div></td>
                <td className="px-3 py-3">{session.ipAddress || "-"}</td>
                <td className="px-3 py-3">{session.browser || "-"}</td>
                <td className="px-3 py-3">{session.device || "-"}</td>
                <td className="px-3 py-3">{formatDate(session.lastSeenAt)}</td>
                <td className="px-3 py-3">{formatDate(session.expiresAt)}</td>
              </tr>
            ))}
            {!sessions.length ? <EmptyRow colSpan={6} text="No active employee sessions." /> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActivityTab({ logs }: { logs: EmployeeIamData["logs"] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <PanelHeader title="Activity Logs" description="Employee created, edited, login, logout, password reset, suspension, permission, and access-request events." />
      <div className="mt-4 space-y-2">
        {logs.slice(0, 80).map(log => (
          <div key={log.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{readable(log.action)}</div>
                <div className="text-xs text-slate-500">{log.employeeName || "System"} / {log.module} / {formatDate(log.createdAt)}</div>
              </div>
              <Badge>{log.ipAddress || log.browser || "No device data"}</Badge>
            </div>
          </div>
        ))}
        {!logs.length ? <EmptyState title="No employee activity yet" body="Admin/CMS employee actions will appear here." /> : null}
      </div>
    </section>
  );
}

function EmployeeFormDrawer({
  title,
  form,
  roles,
  onChange,
  onClose,
  onSubmit
}: {
  title: string;
  form: typeof emptyEmployeeForm;
  roles: EmployeeRole[];
  onChange: (value: typeof emptyEmployeeForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70">
      <aside className="ml-auto h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-slate-950 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="studio-button">Close</button>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <FormSection title="Personal Information">
            <Input label="Full Name" value={form.fullName} onChange={value => onChange({ ...form, fullName: value })} />
            <Input label="Company Email (Required)" value={form.companyEmail} onChange={value => onChange({ ...form, companyEmail: value, loginEmail: form.loginEmail || value })} />
            <Input label="Phone Number" value={form.phoneNumber} onChange={value => onChange({ ...form, phoneNumber: value })} />
            <Input label="Profile Picture" value={form.profilePictureUrl} onChange={value => onChange({ ...form, profilePictureUrl: value })} />
          </FormSection>
          <FormSection title="Employment Information">
            <Input label="Position" value={form.position} onChange={value => onChange({ ...form, position: value })} />
            <Input label="Department" value={form.department} onChange={value => onChange({ ...form, department: value })} />
            <Input label="Reporting Manager" value={form.reportingManager} onChange={value => onChange({ ...form, reportingManager: value })} />
            <Input label="Joining Date" value={form.joiningDate} onChange={value => onChange({ ...form, joiningDate: value })} type="date" />
          </FormSection>
          <FormSection title="Login Credentials">
            <Input label="Login Email" value={form.loginEmail} onChange={value => onChange({ ...form, loginEmail: value })} />
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Temporary Password</span>
                <button type="button" onClick={() => onChange({ ...form, temporaryPassword: generatePassword() })} className="text-xs font-semibold text-blue-300">Generate Secure Password</button>
              </div>
              <input value={form.temporaryPassword} onChange={event => onChange({ ...form, temporaryPassword: event.target.value })} className="studio-input" />
            </div>
            <Toggle label="Force Password Change on First Login" checked={form.forcePasswordChange} onChange={value => onChange({ ...form, forcePasswordChange: value })} />
            <Toggle label="Send Credentials by Email" checked={form.sendCredentialsByEmail} onChange={value => onChange({ ...form, sendCredentialsByEmail: value })} />
          </FormSection>
          <FormSection title="Role">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Role</span>
              <select value={form.roleId} onChange={event => onChange({ ...form, roleId: event.target.value })} className="studio-input mt-1">
                {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </label>
            <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100">
              Credentials created here are Admin/CMS-only and are accepted only at <strong>/cms/login</strong>.
            </div>
          </FormSection>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="studio-button">Cancel</button>
          <button onClick={onSubmit} disabled={!roles.length} className="studio-button bg-blue-500 text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50">Create Employee</button>
        </div>
      </aside>
    </div>
  );
}

function EditEmployeeDrawer({ employee, roles, onClose, onSubmit }: { employee: AdminEmployee; roles: EmployeeRole[]; onClose: () => void; onSubmit: (patch: Partial<AdminEmployee>) => void }) {
  const [form, setForm] = useState({
    fullName: employee.fullName,
    companyEmail: employee.companyEmail,
    phoneNumber: employee.phoneNumber,
    profilePictureUrl: employee.profilePictureUrl,
    position: employee.position,
    department: employee.department,
    reportingManager: employee.reportingManager,
    joiningDate: employee.joiningDate,
    loginEmail: employee.loginEmail,
    roleId: employee.roleId,
    status: String(employee.status),
    forcePasswordChange: employee.forcePasswordChange,
    twoFactorEnabled: employee.twoFactorEnabled
  });
  return (
    <div className="fixed inset-0 z-50 bg-black/70">
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-slate-950 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Employee Profile</h2>
          <button onClick={onClose} className="studio-button">Close</button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Input label="Full Name" value={form.fullName} onChange={value => setForm({ ...form, fullName: value })} />
          <Input label="Company Email" value={form.companyEmail} onChange={value => setForm({ ...form, companyEmail: value })} />
          <Input label="Phone Number" value={form.phoneNumber} onChange={value => setForm({ ...form, phoneNumber: value })} />
          <Input label="Position" value={form.position} onChange={value => setForm({ ...form, position: value })} />
          <Input label="Department" value={form.department} onChange={value => setForm({ ...form, department: value })} />
          <Input label="Reporting Manager" value={form.reportingManager} onChange={value => setForm({ ...form, reportingManager: value })} />
          <Input label="Joining Date" value={form.joiningDate} onChange={value => setForm({ ...form, joiningDate: value })} type="date" />
          <Input label="Login Email" value={form.loginEmail} onChange={value => setForm({ ...form, loginEmail: value })} />
          <label className="block">
            <span className="text-xs font-medium text-slate-400">Role</span>
            <select value={form.roleId} onChange={event => setForm({ ...form, roleId: event.target.value })} className="studio-input mt-1">
              {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-400">Status</span>
            <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })} className="studio-input mt-1">
              {EMPLOYEE_STATUSES.map(status => <option key={status} value={status}>{readable(status)}</option>)}
            </select>
          </label>
          <Toggle label="Force Password Change" checked={form.forcePasswordChange} onChange={value => setForm({ ...form, forcePasswordChange: value })} />
          <Toggle label="Two-Factor Authentication (future-ready)" checked={form.twoFactorEnabled} onChange={value => setForm({ ...form, twoFactorEnabled: value })} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="studio-button">Cancel</button>
          <button onClick={() => onSubmit(form)} className="studio-button bg-blue-500 text-white hover:bg-blue-400">Save Employee</button>
        </div>
      </aside>
    </div>
  );
}

function ResetPasswordModal({ employee, onClose, onSubmit }: { employee: AdminEmployee; onClose: () => void; onSubmit: (employee: AdminEmployee, password: string, forcePasswordChange: boolean, sendCredentialsByEmail: boolean) => void }) {
  const [password, setPassword] = useState(generatePassword());
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [sendCredentialsByEmail, setSendCredentialsByEmail] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-200"><KeyRound size={22} /></div>
          <div>
            <h2 className="text-xl font-semibold text-white">Reset Employee Password</h2>
            <p className="mt-1 text-sm text-slate-400">{employee.fullName} will be logged out of active Admin/CMS sessions.</p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">New Temporary Password</span>
              <button type="button" onClick={() => setPassword(generatePassword())} className="text-xs font-semibold text-blue-300">Generate</button>
            </div>
            <input value={password} onChange={event => setPassword(event.target.value)} className="studio-input" />
          </div>
          <Toggle label="Force Password Change" checked={forcePasswordChange} onChange={setForcePasswordChange} />
          <Toggle label="Send Password Reset Email" checked={sendCredentialsByEmail} onChange={setSendCredentialsByEmail} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="studio-button">Cancel</button>
          <button onClick={() => onSubmit(employee, password, forcePasswordChange, sendCredentialsByEmail)} className="studio-button bg-blue-500 text-white hover:bg-blue-400">Reset Password</button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h3 className="font-semibold text-white">{title}</h3>{children}</div>;
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-xl font-semibold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block"><span className="text-xs font-medium text-slate-400">{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} className="studio-input mt-1" /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-blue-500" />{label}</label>;
}

function Avatar({ employee }: { employee: AdminEmployee }) {
  return employee.profilePictureUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={employee.profilePictureUrl} alt={`${employee.fullName} profile`} className="h-10 w-10 rounded-2xl object-cover" />
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-sm font-semibold text-white">{initials(employee.fullName)}</div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">{children}</span>;
}

function StatusBadge({ children, tone }: { children: ReactNode; tone: "green" | "amber" | "red" | "slate" }) {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20",
    amber: "bg-amber-500/10 text-amber-200 ring-amber-400/20",
    red: "bg-red-500/10 text-red-200 ring-red-400/20",
    slate: "bg-slate-500/10 text-slate-300 ring-slate-400/20"
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${colors[tone]}`}>{children}</span>;
}

function ActionButton({ children, onClick, danger = false, disabled = false }: { children: ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-lg border px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${danger ? "border-red-500/30 text-red-200 hover:bg-red-500/10" : "border-white/10 text-slate-200 hover:bg-white/10"}`}>{children}</button>;
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return <tr><td colSpan={colSpan} className="h-40 text-center text-sm text-slate-500">{text}</td></tr>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><div className="font-semibold text-white">{title}</div><div className="mt-2 text-sm text-slate-500">{body}</div></div>;
}

function readable(value: string) {
  return value.replace(/_/g, " ").replace(/-/g, " ").replace(/([A-Z])/g, " $1").replace(/\s+/g, " ").trim().replace(/^./, letter => letter.toUpperCase());
}

function metricTone(tone: "blue" | "green" | "amber" | "red" | "slate") {
  if (tone === "green") return "text-emerald-200";
  if (tone === "amber") return "text-amber-200";
  if (tone === "red") return "text-red-200";
  if (tone === "blue") return "text-blue-200";
  return "text-slate-100";
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "E";
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const cryptoObject = globalThis.crypto;
  const values = new Uint32Array(18);
  cryptoObject.getRandomValues(values);
  return Array.from(values).map(value => alphabet[value % alphabet.length]).join("");
}

function validateEmployeeForm(form: typeof emptyEmployeeForm) {
  if (!form.fullName.trim()) return "Full name is required.";
  if (!form.companyEmail.trim() || !form.companyEmail.includes("@")) return "A valid company email is required.";
  if (!form.position.trim()) return "Position is required.";
  if (!form.department.trim()) return "Department is required.";
  if (!form.joiningDate.trim()) return "Joining date is required.";
  if (Number.isNaN(new Date(form.joiningDate).getTime())) return "Joining date must be valid.";
  if (!form.loginEmail.trim() || !form.loginEmail.includes("@")) return "A valid login email is required.";
  if (!form.temporaryPassword.trim() || form.temporaryPassword.length < 8) return "Temporary password must be at least 8 characters.";
  if (!form.roleId.trim()) return "Role is required. Create or sync at least one admin role first.";
  return "";
}

function downloadCsv(type: "employees" | "roles" | "requests" | "logs") {
  window.location.assign(`/api/admin/iam/export?type=${type}`);
}
