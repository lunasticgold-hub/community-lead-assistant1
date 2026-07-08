import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminEmployeeLoginForm } from "@/components/auth/admin-employee-login-form";

export const metadata: Metadata = {
  title: "Employee Admin Login | Community Lead Assistant",
  robots: {
    index: false,
    follow: false
  }
};

export default function CmsEmployeeLoginPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-blue-950/30">
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
              CL
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Employee IAM</p>
            <h1 className="mt-2 text-2xl font-semibold">Admin/CMS employee login</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Internal employees use CMS-only credentials created by the Super Admin. These credentials do not work on the customer portal.
            </p>
          </div>
          <Suspense fallback={<div className="h-52 animate-pulse rounded-2xl bg-slate-100" />}>
            <AdminEmployeeLoginForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
