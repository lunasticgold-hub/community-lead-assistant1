import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { fail } from "@/lib/api-response";
import { getAdminEmails } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { checkAccountAccess } from "@/lib/security/account-access";
import { getEmployeeBySessionToken } from "./iam";
import type { AdminAccess, AdminModulePermission } from "./iam-types";

export const adminEmployeeSessionCookie = "cla_admin_employee_session";

const fullPermission: AdminModulePermission = {
  moduleKey: "*",
  view: true,
  create: true,
  edit: true,
  delete: true,
  fullAccess: true
};

export type AdminActor = {
  id: string;
  email: string;
  name: string;
  type: "super_admin" | "employee";
  access: AdminAccess;
};

export async function getCurrentAdminActor(): Promise<AdminActor | null> {
  const employeeToken = (await cookies()).get(adminEmployeeSessionCookie)?.value || "";
  const employeeSession = await getEmployeeBySessionToken(employeeToken);
  if (employeeSession?.access.canAccessAdmin) {
    return {
      id: employeeSession.employee.id,
      email: employeeSession.employee.loginEmail,
      name: employeeSession.employee.fullName,
      type: "employee",
      access: employeeSession.access
    };
  }

  const user = await getCurrentUser();
  if (!user) return null;
  const accountAccess = await checkAccountAccess(user.id);
  if (!accountAccess.allowed) return null;
  const access = await getAdminAccessForUser(user);
  if (!access.canAccessAdmin) return null;

  return {
    id: user.id,
    email: user.email || "admin",
    name: String(user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Super Admin"),
    type: "super_admin",
    access
  };
}

export async function requireAdminUser(): Promise<AdminActor> {
  const actor = await getCurrentAdminActor();
  if (!actor) redirect("/cms/login");
  return actor;
}

export async function requireAdminApiUser() {
  const actor = await getCurrentAdminActor();
  if (!actor) return { error: fail("Unauthorized", 401) as Response };

  return { user: { id: actor.id, email: actor.email }, actor, access: actor.access };
}

export async function getAdminAccessForUser(user: User): Promise<AdminAccess> {
  const email = user.email?.toLowerCase() || "";
  const admins = getAdminEmails();
  if (email && admins.includes(email)) {
    return {
      actorType: "super_admin",
      actorId: user.id,
      email,
      isSuperAdmin: true,
      canAccessAdmin: true,
      roleName: "Owner",
      modules: { "*": fullPermission }
    };
  }

  return emptyAccess();
}

export function hasAdminModuleAccess(access: AdminAccess, moduleKey: string, action: keyof AdminModulePermission = "view") {
  if (access.isSuperAdmin || access.modules["*"]?.fullAccess) return true;
  const permission = access.modules[moduleKey];
  if (!permission) return false;
  return Boolean(permission.fullAccess || permission[action]);
}

function emptyAccess(): AdminAccess {
  return {
    actorType: "employee",
    actorId: "",
    email: "",
    isSuperAdmin: false,
    canAccessAdmin: false,
    roleName: "",
    modules: {}
  };
}
