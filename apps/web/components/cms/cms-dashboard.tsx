import Link from "next/link";
import { cmsModules } from "@/lib/cms/config";
import type { CmsRow } from "@/lib/cms/types";

type CmsDashboardProps = {
  counts: Array<{ table: string; count: number; missing: boolean }>;
};

export function CmsDashboard({ counts }: CmsDashboardProps) {
  const countMap = new Map(counts.map(item => [item.table, item]));
  const featured = [
    "homepage",
    "media-library",
    "navigation",
    "announcements",
    "landing-pages",
    "newsletter"
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/20 via-white/[0.04] to-cyan-400/10 p-6">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">CMS Dashboard</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">Edit your website without touching code.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Manage pages, blog posts, SEO, media, announcements, navigation, footer, FAQs, testimonials, newsletter subscribers, and landing pages.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Pages", "cms_pages"],
          ["Blog Posts", "cms_posts"],
          ["Media", "cms_media"],
          ["Subscribers", "cms_newsletter_subscribers"]
        ].map(([label, table]) => {
          const stat = countMap.get(table);
          return (
            <div key={table} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-white">{stat?.count ?? 0}</div>
              {stat?.missing ? <div className="mt-2 text-xs text-slate-400">Ready after database sync</div> : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cmsModules.filter(module => featured.includes(module.slug)).map(module => (
          <Link key={module.slug} href={`/admin/cms/${module.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">{module.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
              </div>
              <div className="rounded-xl bg-white text-slate-950 px-2 py-1 text-xs font-bold">{module.icon}</div>
            </div>
            <div className="mt-5 text-sm font-semibold text-blue-200 group-hover:text-blue-100">Open module</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CmsEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <div className="text-lg font-semibold text-white">{title}</div>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

export function cmsPreviewValue(row: CmsRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "Untitled";
}
