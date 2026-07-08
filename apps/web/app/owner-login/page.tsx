import type { Metadata } from "next";
import { Suspense } from "react";
import { OwnerLoginForm } from "@/components/auth/owner-login-form";

export const metadata: Metadata = {
  title: "Owner Login | Community Lead Assistant",
  robots: {
    index: false,
    follow: false
  }
};

export default function OwnerLoginPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-blue-950/30">
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
              CL
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Owner access</p>
            <h1 className="mt-2 text-2xl font-semibold">Private CMS login</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This page is hidden from public navigation and only admin-approved accounts can open the CMS.
            </p>
          </div>
          <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-slate-100" />}>
            <OwnerLoginForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
