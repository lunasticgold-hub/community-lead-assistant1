import { fail, ok } from "@/lib/api-response";
import { defaultKnowledgeBase } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ knowledgeBase: defaultKnowledgeBase });
  const { data, error } = await supabase.from("knowledge_bases").select("*").limit(1).maybeSingle();
  if (error) return fail(error.message, 500);
  return ok({ knowledgeBase: data || defaultKnowledgeBase });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ knowledgeBase: body, localOnly: true });
  const { data, error } = await supabase.from("knowledge_bases").upsert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ knowledgeBase: data });
}
