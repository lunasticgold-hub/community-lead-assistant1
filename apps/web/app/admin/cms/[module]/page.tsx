import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/admin/access-denied";
import { CmsResourcePage } from "@/components/cms/cms-resource-page";
import { CmsShell } from "@/components/cms/cms-shell";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getCmsModule } from "@/lib/cms/config";

export const dynamic = "force-dynamic";

type CmsModulePageProps = {
  params: Promise<{ module: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CmsModulePage({ params, searchParams }: CmsModulePageProps) {
  const { module: slug } = await params;
  const actor = await requireAdminUser();
  const cmsModule = getCmsModule(slug);
  if (!cmsModule) notFound();
  if (!hasAdminModuleAccess(actor.access, cmsModule.slug, "view") && !hasAdminModuleAccess(actor.access, "cms", "view")) {
    return <AccessDenied moduleKey={cmsModule.slug} permission="view" />;
  }
  const rawSearch = await searchParams;
  const query = new URLSearchParams();
  Object.entries(rawSearch || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach(item => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  });

  return (
    <CmsShell>
      <CmsResourcePage module={cmsModule} searchParams={query} />
    </CmsShell>
  );
}
