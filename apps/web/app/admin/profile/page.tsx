import { AccessDenied } from "@/components/admin/access-denied";
import { IamControlCenter } from "@/components/admin/iam-control-center";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getEmployeeIamData } from "@/lib/admin/iam";

export default async function AdminIamProfilePage() {
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, "profile", "view")) {
    return <AccessDenied moduleKey="profile" permission="view" />;
  }
  const data = await getEmployeeIamData();
  return <IamControlCenter data={data} actor={actor.access} />;
}
