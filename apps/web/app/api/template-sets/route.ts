import { fail, ok } from "@/lib/api-response";
import { defaultTemplates } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ templateSets: [{ id: "demo-templates", name: "Default", ...defaultTemplates }] });
  const { data, error } = await supabase.from("template_sets").select("*").order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return ok({ templateSets: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ templateSet: { id: crypto.randomUUID(), ...body }, localOnly: true });
  const { data, error } = await supabase.from("template_sets").insert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ templateSet: data });
}
