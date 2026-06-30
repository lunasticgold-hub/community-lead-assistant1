import { MarketingShell } from "@/components/marketing-shell";
import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function DownloadExtensionPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Card>
          <h1 className="text-3xl font-semibold">Install the Chrome extension</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Sign into the dashboard with email/password or Google, then generate a workspace token for the extension.</p>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm text-slate-600">
            <li>Open <code>chrome://extensions</code>.</li>
            <li>Enable Developer mode.</li>
            <li>Click Load unpacked.</li>
            <li>Select <code>apps/extension</code> from this repository.</li>
            <li>Generate an extension token from the dashboard and paste it into the popup.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/downloads/community-lead-assistant-extension.zip"
              download
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download extension ZIP
            </a>
            <Link href="/extension"><Button variant="secondary">Open dashboard setup</Button></Link>
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
