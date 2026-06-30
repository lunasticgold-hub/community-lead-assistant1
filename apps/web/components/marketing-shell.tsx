import Link from "next/link";
import { BrandLockup } from "./brand";
import { Button } from "./ui";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_30%),#f7f8fb]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950">
          <BrandLockup />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/pricing">Pricing</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/download-extension">Extension</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup"><Button>Start 7-day trial</Button></Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
