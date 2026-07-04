import { AppShell } from "@/components/app-shell";
import { PlatformSettingsClient, type PlatformSetting } from "@/components/platform-settings-client";
import { requireWorkspace } from "@/lib/auth/session";
import { defaultCampaign } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Platform } from "@/lib/types";

const platforms: PlatformSetting[] = [
  { id: "reddit", label: "Reddit", description: "Scan visible posts and comments in subreddit communities and save source links." },
  { id: "linkedin", label: "LinkedIn Groups", description: "Scan visible group posts and profile/source links where LinkedIn exposes them." },
  { id: "facebook", label: "Facebook Groups", description: "Scan visible group posts with adapter-based extraction for author and group links." },
  { id: "slack", label: "Slack Web", description: "Scan visible channel messages in Slack workspaces you already have access to." },
  { id: "discord", label: "Discord Web", description: "Scan visible server/channel messages and open source context for manual review." },
  { id: "telegram", label: "Telegram Web", description: "Scan visible chat/channel messages and keep outreach manual." },
  { id: "whatsapp", label: "WhatsApp Web", description: "Scan visible community/chat messages. Outreach remains copy/open/manual only." },
  { id: "indiehackers", label: "Indie Hackers", description: "Scan visible discussions and founder posts for buyer-intent signals." },
  { id: "producthunt", label: "Product Hunt", description: "Scan visible launches and comments for founder and growth intent." },
  { id: "x", label: "X / Twitter", description: "Scan visible posts/search results and keep source links for review." }
];

async function getEnabledPlatforms(workspaceId: string): Promise<Platform[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultCampaign.targetPlatforms;
  const { data, error } = await supabase
    .from("campaigns")
    .select("target_platforms")
    .eq("workspace_id", workspaceId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error || !Array.isArray(data?.target_platforms)) return defaultCampaign.targetPlatforms;
  return data.target_platforms as Platform[];
}

export default async function PlatformSettingsPage() {
  const { workspace } = await requireWorkspace();
  const enabled = await getEnabledPlatforms(workspace.id);

  return (
    <AppShell title="Platform Settings">
      <div className="mb-5 max-w-3xl">
        <p className="text-sm leading-6 text-slate-600">
          Enable only the communities your team wants to scan. The extension reads this from the active campaign and will stop before scanning a disabled platform.
        </p>
      </div>
      <PlatformSettingsClient platforms={platforms} enabled={enabled} />
    </AppShell>
  );
}
