export const IAM_MODULES = [
  "dashboard",
  "website-editor",
  "cms",
  "qa",
  "analytics",
  "users",
  "workspaces",
  "campaigns",
  "customer-success",
  "outreach-queue",
  "leads",
  "knowledge-base",
  "marketing",
  "billing",
  "extension",
  "outreach-activity",
  "system-logs",
  "profile",
  "media",
  "forms",
  "integrations"
] as const;

export const IAM_ACTIONS = ["view", "create", "edit", "delete", "publish", "export", "import", "approve", "manageSettings"] as const;

export const EMPLOYEE_STATUSES = ["active", "suspended", "disabled", "deleted"] as const;

export const DEFAULT_EMPLOYEE_ROLES = [
  "Owner",
  "Super Admin",
  "Administrator",
  "Manager",
  "Marketing",
  "Sales",
  "SEO",
  "Developer",
  "Designer",
  "Content Writer",
  "SEO Executive",
  "Graphic Designer",
  "Video Editor",
  "Marketing Executive",
  "Sales Executive",
  "Support",
  "QA",
  "Finance",
  "HR",
  "Intern",
  "Viewer",
  "Custom",
  "Admin"
] as const;

export type IamModuleKey = (typeof IAM_MODULES)[number];
export type IamActionKey = (typeof IAM_ACTIONS)[number];
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type IamPermission = {
  moduleKey: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  publish?: boolean;
  export?: boolean;
  import?: boolean;
  approve?: boolean;
  manageSettings?: boolean;
};

export type AdminModulePermission = IamPermission & {
  publish?: boolean;
  export?: boolean;
  import?: boolean;
  approve?: boolean;
  manageSettings?: boolean;
  fullAccess?: boolean;
};

export type AdminAccess = {
  actorType: "super_admin" | "employee";
  actorId: string;
  email: string;
  roleName: string;
  isSuperAdmin: boolean;
  canAccessAdmin: boolean;
  modules: Record<string, AdminModulePermission>;
};

export type EmployeeRole = {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullAccess: boolean;
  locked: boolean;
  permissions: IamPermission[];
};

export type AdminEmployee = {
  id: string;
  employeeId: string;
  fullName: string;
  companyEmail: string;
  phoneNumber: string;
  profilePictureUrl: string;
  position: string;
  department: string;
  reportingManager: string;
  joiningDate: string;
  loginEmail: string;
  forcePasswordChange: boolean;
  sendCredentialsByEmail: boolean;
  roleId: string;
  roleName: string;
  status: EmployeeStatus | string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  loginCount: number;
  failedLoginCount: number;
  lastLoginIp: string;
  lastLoginBrowser: string;
  lastLoginDevice: string;
  activeSessions: number;
  assignedPermissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type EmployeeAccessRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  position: string;
  requestedModule: string;
  requestedPermission: string;
  reason: string;
  status: string;
  managerNotes: string;
  requestedAt: string;
};

export type EmployeeActivityLog = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  actor: string;
  action: string;
  module: string;
  ipAddress: string;
  browser: string;
  createdAt: string;
};

export type EmployeeSession = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  ipAddress: string;
  browser: string;
  device: string;
  lastSeenAt: string;
  expiresAt: string;
};

export type EmployeeIamMetric = {
  label: string;
  value: string | number;
  tone: "blue" | "green" | "amber" | "red" | "slate";
};

export type EmployeeIamData = {
  metrics: EmployeeIamMetric[];
  employees: AdminEmployee[];
  roles: EmployeeRole[];
  requests: EmployeeAccessRequest[];
  logs: EmployeeActivityLog[];
  sessions: EmployeeSession[];
};

export type EmployeeIamActionPayload =
  | {
      action: "createEmployee";
      employee: {
        fullName: string;
        companyEmail: string;
        phoneNumber: string;
        profilePictureUrl: string;
        position: string;
        department: string;
        reportingManager: string;
        joiningDate: string;
        loginEmail: string;
        temporaryPassword: string;
        forcePasswordChange: boolean;
        sendCredentialsByEmail: boolean;
        roleId: string;
      };
    }
  | {
      action: "updateEmployee";
      employeeId: string;
      patch: Partial<Pick<AdminEmployee, "fullName" | "companyEmail" | "phoneNumber" | "profilePictureUrl" | "position" | "department" | "reportingManager" | "joiningDate" | "loginEmail" | "roleId" | "status" | "forcePasswordChange" | "twoFactorEnabled">>;
    }
  | { action: "resetEmployeePassword"; employeeId: string; temporaryPassword: string; forcePasswordChange: boolean; sendCredentialsByEmail: boolean }
  | { action: "suspendEmployee" | "activateEmployee" | "disableEmployee" | "deleteEmployee"; employeeId: string; reason?: string }
  | { action: "updateRolePermissions"; roleId: string; permissions: IamPermission[] }
  | { action: "approveEmployeeAccessRequest" | "rejectEmployeeAccessRequest"; requestId: string; notes: string }
  | { action: "submitEmployeeAccessRequest"; requestedModule: string; requestedPermission: string; reason: string };
