import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";

export default function ExtensionPage() {
  return (
    <AppShell title="Extension Install & Login">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Badge tone="blue">Dashboard login first</Badge>
          <h2 className="mt-3 text-xl font-semibold">Generate extension token</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Users sign into the SaaS dashboard with email/password or Google. Then this page creates a workspace-scoped extension token and stores only its hash.
          </p>
          <pre className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-white">demo-token</pre>
          <div className="mt-4"><Button>Generate new token</Button></div>
          <p className="mt-3 text-xs text-slate-500">Local testing accepts demo-token. Production tokens should be shown once and revocable.</p>
        </Card>

        <Card>
          <Badge tone="green">Manual outreach only</Badge>
          <h2 className="mt-3 text-xl font-semibold">Install steps</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Open chrome://extensions.</li>
            <li>Enable Developer mode.</li>
            <li>Load unpacked from apps/extension.</li>
            <li>Paste the dashboard token in the extension popup.</li>
            <li>Open Reddit or another supported community and click Start Scan.</li>
          </ol>
          <p className="mt-4 text-sm text-slate-600">The popup scans visible content, saves qualified leads, and syncs to the dashboard. It never sends messages automatically.</p>
        </Card>
      </div>
    </AppShell>
  );
}
