import { AccessDenied } from "@/components/admin/access-denied";
import { EnterpriseWebsiteEditor } from "@/components/cms/enterprise-website-editor";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getWebsiteEditorContent } from "@/lib/cms/website-editor";

export default async function WebsiteEditorPage() {
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, "website-editor", "view")) {
    return <AccessDenied moduleKey="website-editor" permission="view" />;
  }
  const content = await getWebsiteEditorContent();
  return <EnterpriseWebsiteEditor initialContent={content} />;
}
