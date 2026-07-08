import { AccessDenied } from "@/components/admin/access-denied";
import { CmsDashboard } from "@/components/cms/cms-dashboard";
import { CmsShell } from "@/components/cms/cms-shell";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getCmsDashboard } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export default async function CmsDashboardPage() {
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, "cms", "view")) {
    return <AccessDenied moduleKey="cms" permission="view" />;
  }
  const counts = await getCmsDashboard().catch(() => []);

  return (
    <CmsShell>
      <CmsDashboard counts={counts} />
    </CmsShell>
  );
}
