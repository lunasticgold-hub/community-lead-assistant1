import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { defaultCampaign } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Platform } from "@/lib/types";

const allowedPlatforms: Platform[] = ["reddit", "linkedin", "facebook", "slack", "discord", "telegram", "whatsapp", "indiehackers", "producthunt", "x"];

function parsePlatforms(value: unknown): Platform[] | null {
  if (!Array.isArray(value)) return null;
  const unique = Array.from(new Set(value.map(String))) as Platform[];
  if (!unique.every(platform => allowedPlatforms.includes(platform))) return null;
  return unique;
}

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  const { data, error } = await supabase
    .from("campaigns")
    .select("id,target_platforms")
    .eq("workspace_id", auth.workspace.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) return fail(error.message, 500);
  return ok({ targetPlatforms: Array.isArray(data?.target_platforms) ? data.target_platforms : defaultCampaign.targetPlatforms });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => ({}));
  const targetPlatforms = parsePlatforms(body.targetPlatforms);
  if (!targetPlatforms) return fail("Invalid platform settings.", 400);

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("workspace_id", auth.workspace.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (campaignError) return fail(campaignError.message, 500);

  if (!campaign?.id) {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        workspace_id: auth.workspace.id,
        name: defaultCampaign.name,
        active: true,
        target_platforms: targetPlatforms,
        min_score: defaultCampaign.minScore,
        scan_mode: defaultCampaign.scanMode,
        pause_after_leads: defaultCampaign.pauseAfterLeads,
        keyword_group_ids: [],
        template_set_id: null,
        knowledge_base_id: null
      })
      .select("*")
      .single();

    if (error) return fail(error.message, 500);
    return ok({ campaign: data, targetPlatforms });
  }

  const { data, error } = await supabase
    .from("campaigns")
    .update({ target_platforms: targetPlatforms, updated_at: new Date().toISOString() })
    .eq("workspace_id", auth.workspace.id)
    .eq("id", campaign.id)
    .select("*")
    .single();

  if (error) return fail(error.message, 500);
  return ok({ campaign: data, targetPlatforms });
}
