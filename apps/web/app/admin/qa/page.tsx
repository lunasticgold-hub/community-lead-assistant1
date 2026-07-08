import Link from "next/link";
import { AccessDenied } from "@/components/admin/access-denied";
import { hasAdminModuleAccess, requireAdminUser } from "@/lib/admin/auth";
import { adminModules } from "@/lib/admin/config";
import { isMissingTableError } from "@/lib/admin/validators";
import { cmsModules } from "@/lib/cms/config";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const publicRoutes = [
  "/", "/features", "/solutions", "/pricing", "/resources", "/blog", "/docs", "/download-extension", "/contact", "/about",
  "/privacy", "/terms", "/cookie-policy", "/security", "/status"
];

const apiRoutes = [
  "/api/dashboard/stats",
  "/api/leads",
  "/api/exports/leads.csv",
  "/api/extension/bootstrap",
  "/api/extension/leads",
  "/api/cms/website-editor"
];

const requiredTables = [
  "users",
  "workspaces",
  "workspace_members",
  "campaigns",
  "leads",
  "usage_events",
  "extension_errors",
  "cms_pages",
  "cms_settings",
  "cms_posts",
  "cms_media"
];

export default async function QaCenterPage() {
  const actor = await requireAdminUser();
  if (!hasAdminModuleAccess(actor.access, "qa", "view")) {
    return <AccessDenied moduleKey="qa" permission="view" />;
  }
  const tableChecks = await checkTables();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">QA Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Review public pages, admin modules, CMS modules, APIs, and database readiness before pushing changes live.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QaCard title="Public Pages" value={publicRoutes.length} tone="blue" />
        <QaCard title="Admin Modules" value={adminModules.length} tone="green" />
        <QaCard title="CMS Modules" value={cmsModules.length + 1} tone="amber" />
      </div>

      <QaSection title="Database Tables">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tableChecks.map(check => (
            <div key={check.table} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-white">{check.table}</div>
                <StatusPill ok={check.ok} />
              </div>
              <div className="mt-2 text-xs text-slate-400">{check.message}</div>
            </div>
          ))}
        </div>
      </QaSection>

      <QaSection title="Public Route Checklist">
        <RouteGrid routes={publicRoutes} />
      </QaSection>

      <QaSection title="Admin Module Checklist">
        <RouteGrid routes={["/admin", "/admin/cms/website-editor", "/admin/cms", "/admin/qa", ...adminModules.map(module => `/admin/${module.slug}`)]} />
      </QaSection>

      <QaSection title="CMS Module Checklist">
        <RouteGrid routes={["/admin/cms/website-editor", ...cmsModules.map(module => `/admin/cms/${module.slug}`)]} />
      </QaSection>

      <QaSection title="API Checklist">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {apiRoutes.map(route => (
            <div key={route} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300">{route}</div>
          ))}
        </div>
      </QaSection>
    </div>
  );
}

async function checkTables() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return requiredTables.map(table => ({ table, ok: false, message: "Supabase admin client is not configured." }));
  }

  return Promise.all(requiredTables.map(async table => {
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) {
      return {
        table,
        ok: false,
        message: isMissingTableError(error) ? "Waiting for database sync." : error.message
      };
    }
    return { table, ok: true, message: `${count || 0} records` };
  }));
}

function QaCard({ title, value, tone }: { title: string; value: number; tone: "blue" | "green" | "amber" }) {
  const tones = {
    blue: "from-blue-500/25 to-sky-400/10",
    green: "from-emerald-500/25 to-green-400/10",
    amber: "from-amber-500/25 to-orange-400/10"
  };
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tones[tone]} p-5`}>
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function QaSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function RouteGrid({ routes }: { routes: string[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {routes.map(route => (
        <Link key={route} href={route} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300 transition hover:border-blue-400 hover:text-white">
          {route}
        </Link>
      ))}
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? "rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200" : "rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-200"}>
      {ok ? "Ready" : "Needs setup"}
    </span>
  );
}
