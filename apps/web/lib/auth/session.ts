import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAdminEmails } from "../env";
import { ensureUserWorkspace } from "../provisioning";
import { checkAccountAccess } from "../security/account-access";
import { createClient } from "../supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const access = await checkAccountAccess(user.id);
  if (!access.allowed) redirect(`/login?error=${encodeURIComponent(access.reason)}`);
  return user;
}

export async function requireWorkspace() {
  const user = await requireCurrentUser();
  const workspace = await ensureUserWorkspace(user);
  return { user, workspace };
}

export function isAdminUser(user: User) {
  const admins = getAdminEmails();
  return admins.length > 0 && Boolean(user.email && admins.includes(user.email.toLowerCase()));
}
