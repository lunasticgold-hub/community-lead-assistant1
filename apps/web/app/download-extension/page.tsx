import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Card } from "@/components/ui";

export default function DownloadExtensionPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Card>
          <Badge tone="blue">Chrome install package</Badge>
          <h1 className="mt-3 text-3xl font-semibold">Install the Chrome extension</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Download <code>CommunityLeadAssistant.zip</code>, extract it first, then load the <code>Extension</code> folder in Chrome.
            Chrome cannot load the ZIP file directly.
          </p>

          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-800">
            If Chrome shows "The folder name is not valid", you selected the ZIP file or the wrong folder. Select the extracted <code>Extension</code> folder.
          </div>

          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
            <li>
              Download <code>CommunityLeadAssistant.zip</code>.
            </li>
            <li>
              Right-click the ZIP and choose <strong>Extract All</strong>.
            </li>
            <li>
              Open <code>chrome://extensions</code>.
            </li>
            <li>Enable Developer mode.</li>
            <li>Click Load unpacked.</li>
            <li>
              Open the extracted package and select <code>Extension</code>, not the ZIP file.
            </li>
            <li>Sign in inside the extension with email/password or open Google login from the popup.</li>
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/downloads/CommunityLeadAssistant.zip"
              download
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download extension ZIP
            </a>
            <Link
              href="/extension"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Open dashboard setup
            </Link>
          </div>
        </Card>
      </main>
    </MarketingShell>
  );
}
