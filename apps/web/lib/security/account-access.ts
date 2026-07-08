import "server-only";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const blockedStatuses = new Set(["suspended", "temporarily_blocked", "permanently_blocked", "deleted", "archived"]);

export type AccountAccessResult =
  | { allowed: true }
  | { allowed: false; reason: string; status: string };

export async function checkAccountAccess(userId: string): Promise<AccountAccessResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { allowed: true };

  const { data, error } = await supabase
    .from("users")
    .select("account_status,suspended_until,blocked_until,deleted_at,archived_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return { allowed: true };

  const status = String(data.account_status || "active");
  if (!blockedStatuses.has(status)) return { allowed: true };

  if (status === "suspended" && isExpired(data.suspended_until)) {
    await supabase.from("users").update({
      account_status: "active",
      suspended_until: null,
      suspension_reason: "",
      suspension_notes: "",
      updated_at: new Date().toISOString()
    }).eq("id", userId);
    return { allowed: true };
  }

  if (status === "temporarily_blocked" && isExpired(data.blocked_until)) {
    await supabase.from("users").update({
      account_status: "active",
      blocked_until: null,
      block_type: "",
      block_reason: "",
      block_notes: "",
      updated_at: new Date().toISOString()
    }).eq("id", userId);
    return { allowed: true };
  }

  return {
    allowed: false,
    status,
    reason: statusMessage(status)
  };
}

export async function assertAccountAccess(user: User) {
  const access = await checkAccountAccess(user.id);
  if (!access.allowed) {
    throw new Error(access.reason);
  }
}

function isExpired(value: unknown) {
  return typeof value === "string" && value ? new Date(value).getTime() <= Date.now() : false;
}

function statusMessage(status: string) {
  if (status === "suspended") return "This account is suspended. Contact support if you believe this is a mistake.";
  if (status === "temporarily_blocked") return "This account is temporarily blocked.";
  if (status === "permanently_blocked") return "This account is permanently blocked.";
  if (status === "deleted") return "This account has been deleted.";
  if (status === "archived") return "This account has been archived.";
  return "This account cannot access the platform right now.";
}
