"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { marketingNav } from "@/lib/marketing";
import { Button } from "./ui";

export function MarketingMobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/55 p-3 backdrop-blur">
          <div className="ml-auto flex h-full max-w-sm flex-col rounded-3xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-950 dark:text-white">Menu</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5">
              <Search size={15} />
              Search docs, features, and guides
            </div>
            <nav className="mt-5 grid gap-1">
              {marketingNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-2">
              <Link href={loggedIn ? "/dashboard" : "/login"} onClick={() => setOpen(false)}>
                <Button variant="secondary" className="w-full">{loggedIn ? "Dashboard" : "Login"}</Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full">Start free trial</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
