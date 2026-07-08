import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/admin/access-denied";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { getAdminModule } from "@/lib/admin/config";
import { listAdminRows } from "@/lib/admin/data";

export default async function AdminDynamicModulePage({
  params,
  searchParams
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { module: rawModule } = await params;
  const moduleConfig = getAdminModule(rawModule);
  if (!moduleConfig) notFound();
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, rawModule, "view")) {
    return <AccessDenied moduleKey={rawModule} permission="view" />;
  }

  const query = await searchParams;
  const url = new URL("https://admin.local");
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach(item => url.searchParams.append(key, item));
    else if (value) url.searchParams.set(key, value);
  });

  const data = await listAdminRows(moduleConfig, url);

  return (
    <AdminModulePage
      module={moduleConfig}
      initialRows={data.rows}
      initialCount={data.count}
      initialPage={data.page}
      initialPageSize={data.pageSize}
      tableMissing={data.tableMissing}
    />
  );
}
