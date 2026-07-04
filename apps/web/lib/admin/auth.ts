import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { fail } from "@/lib/api-response";
import { getAdminEmails } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireAdminUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const admins = getAdminEmails();
  if (!user.email || !admins.includes(user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireAdminApiUser() {
  const user = await getCurrentUser();
  if (!user) return { error: fail("Unauthorized", 401) as Response };

  const admins = getAdminEmails();
  if (!user.email || !admins.includes(user.email.toLowerCase())) {
    return { error: fail("Forbidden", 403) as Response };
  }

  return { user };
}
