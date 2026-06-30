import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { demoCampaign } from "@/lib/defaults";

export default function CampaignsPage() {
  return <AppShell title="Campaigns"><Card><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">{demoCampaign.name}</h2><p className="text-sm text-slate-500">Platforms: {demoCampaign.targetPlatforms.join(", ")}</p></div><Badge tone="green">Active</Badge></div><div className="mt-4 grid gap-3 md:grid-cols-4"><Badge>Min score {demoCampaign.minScore}</Badge><Badge>Mode {demoCampaign.scanMode}</Badge><Badge>Pause after {demoCampaign.pauseAfterLeads}</Badge><Badge>Owner team</Badge></div><div className="mt-5"><Button>Create campaign</Button></div></Card></AppShell>;
}
