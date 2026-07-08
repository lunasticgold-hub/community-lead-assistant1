"use client";

import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <Card className="max-w-xl border-white/10 bg-white p-8 text-slate-950">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-semibold">We could not load this page.</h1>
        <p className="mt-3 text-sm text-slate-600">
          {error.message || "The app hit an unexpected error. Try again or return to the dashboard."}
        </p>
        {error.digest ? <p className="mt-3 text-xs text-slate-400">Error reference: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>Try again</Button>
          <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
        </div>
      </Card>
    </main>
  );
}
