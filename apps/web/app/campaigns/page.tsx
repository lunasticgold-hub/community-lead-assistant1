import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export default async function CampaignsPage() {
  const { workspace } = await requireWorkspace();
  const supabase = getSupabaseAdmin();
  const { data: campaigns } = supabase
    ? await supabase.from("campaigns").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <AppShell title="Campaigns">
      <div className="space-y-4">
        {(campaigns || []).map(campaign => (
          <Card key={campaign.id}>
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-semibold">{campaign.name}</h2><p className="text-sm text-slate-500">Platforms: {(campaign.target_platforms || []).join(", ")}</p></div>
              <Badge tone={campaign.active ? "green" : "slate"}>{campaign.active ? "Active" : "Paused"}</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Badge>Min score {campaign.min_score}</Badge>
              <Badge>Mode {campaign.scan_mode}</Badge>
              <Badge>Pause after {campaign.pause_after_leads}</Badge>
              <Badge>Owner team</Badge>
            </div>
          </Card>
        ))}
        {!campaigns?.length ? <Card><p className="text-sm text-slate-600">No campaigns yet. Create one from onboarding or campaign setup.</p><div className="mt-5"><Button>Create campaign</Button></div></Card> : null}
      </div>
    </AppShell>
  );
}
