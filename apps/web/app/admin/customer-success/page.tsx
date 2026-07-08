import { AccessDenied } from "@/components/admin/access-denied";
import { CustomerSuccessDashboard } from "@/components/admin/customer-success-dashboard";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getCustomerSuccessDashboardData } from "@/lib/customer-success/data";

export const dynamic = "force-dynamic";

export default async function CustomerSuccessPage() {
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, "customer-success", "view")) {
    return <AccessDenied moduleKey="customer-success" permission="view" />;
  }
  const data = await getCustomerSuccessDashboardData();
  const canManage = hasAdminModuleAccess(actor.access, "customer-success", "edit") || actor.access.isSuperAdmin;
  return <CustomerSuccessDashboard data={data} canManage={canManage} />;
}
