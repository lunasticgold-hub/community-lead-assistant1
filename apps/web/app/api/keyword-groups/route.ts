import { fail, ok } from "@/lib/api-response";
import { defaultKeywordGroups } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ keywordGroups: defaultKeywordGroups });
  const { data, error } = await supabase.from("keyword_groups").select("*").order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return ok({ keywordGroups: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ keywordGroup: { id: crypto.randomUUID(), ...body }, localOnly: true });
  const { data, error } = await supabase.from("keyword_groups").insert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ keywordGroup: data });
}
