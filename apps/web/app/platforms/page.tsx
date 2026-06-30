import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";

const platforms = ["Reddit", "Indie Hackers", "Facebook Groups", "Slack Web", "Discord Web", "Telegram Web", "WhatsApp Web"];

export default function PlatformSettingsPage() {
  return <AppShell title="Platform Settings"><div className="grid gap-4 md:grid-cols-2">{platforms.map(platform => <Card key={platform}><div className="flex items-center justify-between"><h2 className="font-semibold">{platform}</h2><Badge tone="green">Enabled</Badge></div><p className="mt-2 text-sm text-slate-600">Visible scanning only. Selectors are adapter-based and can be maintained independently.</p></Card>)}</div></AppShell>;
}
