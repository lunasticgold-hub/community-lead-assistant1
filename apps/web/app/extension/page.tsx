import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";

export default function ExtensionPage() {
  return (
    <AppShell title="Extension Install & Login">
      <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <Badge tone="blue">Website login</Badge>
          <h2 className="mt-3 text-xl font-semibold">Connect the extension with your account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            V2 removes the visible token workflow from the extension popup. Users sign in with email and password, or open the website Google login and sync the active dashboard session.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Behind the scenes, the server creates a workspace-scoped extension session so campaign settings, keyword rules, templates, and leads can sync securely.
          </div>
          <div className="mt-5">
            <Link href="/download-extension" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Download extension ZIP
            </Link>
          </div>
        </Card>

        <Card>
          <Badge tone="green">Manual outreach only</Badge>
          <h2 className="mt-3 text-xl font-semibold">Install steps</h2>
          <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-800">
            Chrome Load unpacked needs the extracted <strong>Extension</strong> folder. Do not select the ZIP file.
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Download the ZIP from the public download page.</li>
            <li>Extract the ZIP on your computer.</li>
            <li>Open <code>chrome://extensions</code>.</li>
            <li>Enable Developer mode.</li>
            <li>Click Load unpacked and select the extracted <code>Extension</code> folder that contains <code>manifest.json</code>.</li>
            <li>Open the extension popup and connect with website login.</li>
            <li>Open a supported community and click Start Scan.</li>
          </ol>
          <p className="mt-4 text-sm text-slate-600">The popup scans visible content, saves qualified leads, and syncs to the dashboard. It never sends messages automatically.</p>
        </Card>
      </div>
    </AppShell>
  );
}
