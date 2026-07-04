"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { sidebarItems } from "@/lib/admin/config";

export function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-slate-950 px-4 py-5 lg:block">
        <div className="px-3">
          <div className="text-lg font-semibold tracking-tight">Community Lead</div>
          <div className="text-xs text-slate-400">Admin Control Center</div>
        </div>

        <nav className="mt-6 space-y-1">
          {sidebarItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-h-9 items-center rounded-lg px-3 text-sm transition",
                  active ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/10 bg-slate-950/85 px-5 backdrop-blur">
          <div>
            <div className="text-sm font-medium">Admin Panel</div>
            <div className="text-xs text-slate-400">Production operations dashboard</div>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{email}</div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
