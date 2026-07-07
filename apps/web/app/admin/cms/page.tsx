import { CmsDashboard } from "@/components/cms/cms-dashboard";
import { CmsShell } from "@/components/cms/cms-shell";
import { getCmsDashboard } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export default async function CmsDashboardPage() {
  const counts = await getCmsDashboard().catch(() => []);

  return (
    <CmsShell>
      <CmsDashboard counts={counts} />
    </CmsShell>
  );
}
