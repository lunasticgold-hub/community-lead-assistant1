import { notFound } from "next/navigation";
import { AdminModulePage } from "@/components/admin/admin-module-page";
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
