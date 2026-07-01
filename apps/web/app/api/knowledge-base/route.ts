import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { defaultKnowledgeBase } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ knowledgeBase: defaultKnowledgeBase });
  const { data, error } = await supabase.from("knowledge_bases").select("*").eq("workspace_id", auth.workspace.id).limit(1).maybeSingle();
  if (error) return fail(error.message, 500);
  return ok({ knowledgeBase: data || defaultKnowledgeBase });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);
  const { data, error } = await supabase.from("knowledge_bases").upsert({ ...body, workspace_id: auth.workspace.id }).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ knowledgeBase: data });
}
