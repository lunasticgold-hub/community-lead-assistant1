import { AppShell } from "@/components/app-shell";
import { CustomerSuccessReport } from "@/components/customer-success-report";
import { listOwnCustomerProjects } from "@/lib/customer-success/data";
import { requireWorkspace } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const { workspace } = await requireWorkspace();
  const projects = await listOwnCustomerProjects(workspace.id);
  return (
    <AppShell title="Success Tracking">
      <CustomerSuccessReport projects={projects} />
    </AppShell>
  );
}
