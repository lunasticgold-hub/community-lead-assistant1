import { fail } from "./api-response";
import { getAdminEmails } from "./env";
import { ensureUserWorkspace } from "./provisioning";
import { checkAccountAccess } from "./security/account-access";
import { createClient } from "./supabase/server";

export async function requireApiUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: fail("Unauthorized", 401) as Response };
  }
  const access = await checkAccountAccess(data.user.id);
  if (!access.allowed) {
    return { error: fail(access.reason, 403) as Response };
  }
  return { user: data.user, workspace: await ensureUserWorkspace(data.user) };
}

export async function requireApiAdmin() {
  const result = await requireApiUser();
  if ("error" in result) return result;
  const admins = getAdminEmails();
  if (!result.user.email || !admins.includes(result.user.email.toLowerCase())) {
    return { error: fail("Forbidden", 403) as Response };
  }
  return result;
}
