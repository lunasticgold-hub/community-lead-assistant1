import { MarketingShell } from "@/components/marketing-shell";
import { Card } from "@/components/ui";
import { productConfig } from "@/lib/defaults";

export default function TermsPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Card>
          <h1 className="text-3xl font-semibold">Terms</h1>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <p>{productConfig.legalName} provides Community Lead Assistant for compliant lead research, lead qualification, knowledge-base assisted drafting, and manual outreach workflows.</p>
            <p>The 7-day trial includes 50 saved lead credits and 50 Gemini draft credits. After trial, access requires a paid plan when billing is enabled.</p>
            <p>Users are responsible for platform terms, community rules, consent requirements, and applicable privacy laws.</p>
            <p>Automatic DM sending, automatic comments, automatic replies, automatic posts, auto-follow-up blasting, scraping hidden data, and evasion behavior are not part of this product.</p>
            <p>Contact: {productConfig.supportEmail}</p>
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
