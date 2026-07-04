import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser();
  return <AdminShell email={user.email || "admin"}>{children}</AdminShell>;
}
