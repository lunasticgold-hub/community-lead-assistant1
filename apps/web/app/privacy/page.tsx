import { MarketingShell } from "@/components/marketing-shell";
import { Card } from "@/components/ui";
import { productConfig } from "@/lib/defaults";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Card>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <p>{productConfig.legalName} operates Community Lead Assistant for visible community lead research and manual outreach drafting.</p>
            <p>The extension scans only visible content on pages the user opens and starts scanning manually.</p>
            <p>When sync is enabled, lead snippets, source URLs, matched signals, scores, status, notes, knowledge-base context, and usage events are sent to the user workspace.</p>
            <p>Uploaded knowledge documents are limited to PDF, DOCX, and TXT files up to {productConfig.maxKnowledgeFileMb} MB per file.</p>
            <p>Default lead retention is 90 days unless the user deletes leads earlier. Users can delete leads and uploaded knowledge files.</p>
            <p>We do not collect platform passwords, do not bypass private access, and do not auto-send outreach.</p>
            <p>Contact: {productConfig.supportEmail}</p>
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
