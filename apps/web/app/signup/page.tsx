import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Button, Card, Field, TextInput } from "@/components/ui";

export default function SignupPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-md px-6 py-16">
        <Card>
          <h1 className="text-2xl font-semibold">Start your 7-day trial</h1>
          <p className="mt-2 text-sm text-slate-600">Includes 50 saved lead credits and 50 Gemini draft credits. No free plan after trial.</p>
          <div className="mt-6 space-y-4">
            <Button className="w-full" variant="secondary">Continue with Google</Button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
            </div>
            <Field label="Name"><TextInput placeholder="Ava Founder" /></Field>
            <Field label="Email"><TextInput placeholder="you@example.com" /></Field>
            <Field label="Password"><TextInput type="password" placeholder="Create a password" /></Field>
            <Link href="/onboarding"><Button className="w-full">Continue</Button></Link>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Google OAuth is enabled through Supabase Auth once the Google client ID and secret are added in the Supabase dashboard.</p>
        </Card>
      </main>
    </MarketingShell>
  );
}
