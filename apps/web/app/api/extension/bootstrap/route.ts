import { fail, ok } from "@/lib/api-response";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  const [workspace, campaign, knowledgeBase, keywordGroups, templateSet] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", auth.workspaceId).single(),
    supabase.from("campaigns").select("*").eq("workspace_id", auth.workspaceId).eq("active", true).limit(1).maybeSingle(),
    supabase.from("knowledge_bases").select("*").eq("workspace_id", auth.workspaceId).limit(1).maybeSingle(),
    supabase.from("keyword_groups").select("*").eq("workspace_id", auth.workspaceId),
    supabase.from("template_sets").select("*").eq("workspace_id", auth.workspaceId).limit(1).maybeSingle()
  ]);

  return ok({
    workspace: workspace.data,
    campaign: campaign.data,
    knowledgeBase: knowledgeBase.data,
    keywordGroups: keywordGroups.data || [],
    templateSet: templateSet.data
  });
}
