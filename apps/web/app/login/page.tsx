import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Button, Card, Field, TextInput } from "@/components/ui";

export default function LoginPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-md px-6 py-16">
        <Card>
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-sm text-slate-600">Use email/password or Google login through Supabase Auth.</p>
          <div className="mt-6 space-y-4">
            <Button className="w-full" variant="secondary">Continue with Google</Button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
            </div>
            <Field label="Email"><TextInput placeholder="you@example.com" /></Field>
            <Field label="Password"><TextInput type="password" placeholder="Password" /></Field>
            <Button className="w-full">Log in</Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">New here? <Link className="font-semibold text-slate-950" href="/signup">Start trial</Link></p>
        </Card>
      </main>
    </MarketingShell>
  );
}
