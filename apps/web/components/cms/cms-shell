"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cmsNav } from "@/lib/cms/config";

export function CmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
      <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
        <div className="px-3 py-2">
          <div className="text-sm font-semibold text-white">Standalone CMS</div>
          <div className="text-xs text-slate-400">Website editing center</div>
        </div>
        <nav className="mt-3 max-h-[calc(100vh-180px)] space-y-1 overflow-auto pr-1">
          {cmsNav.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-h-9 items-center rounded-xl px-3 text-sm transition",
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
