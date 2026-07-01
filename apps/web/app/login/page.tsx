import { Suspense } from "react";
import { MarketingShell } from "@/components/marketing-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui";

export default function LoginPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-md px-6 py-16">
        <Suspense fallback={<Card><div className="h-48 animate-pulse rounded-xl bg-slate-100" /></Card>}>
          <LoginForm />
        </Suspense>
      </main>
    </MarketingShell>
  );
}
