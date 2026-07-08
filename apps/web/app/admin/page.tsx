import { AccessDenied } from "@/components/admin/access-denied";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getAdminDashboardData } from "@/lib/admin/data";

export default async function AdminDashboardPage() {
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, "dashboard", "view")) {
    return <AccessDenied moduleKey="dashboard" permission="view" />;
  }
  const data = await getAdminDashboardData();
  return <AdminDashboard data={data} />;
}
