import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Button, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <MarketingShell>
      <main className="mx-auto flex min-h-[72vh] max-w-3xl items-center px-6 py-20">
        <Card className="w-full p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Page not found</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            This page may have moved, been unpublished, or never existed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/"><Button>Go home</Button></Link>
            <Link href="/dashboard"><Button variant="secondary">Open dashboard</Button></Link>
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
