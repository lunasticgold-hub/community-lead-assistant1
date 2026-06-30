import { fail, ok } from "@/lib/api-response";
import { demoCampaign } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ campaigns: [demoCampaign] });
  const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return ok({ campaigns: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ campaign: { id: crypto.randomUUID(), ...body }, localOnly: true });
  const { data, error } = await supabase.from("campaigns").insert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ campaign: data });
}
