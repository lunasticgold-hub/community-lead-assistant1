import { NextResponse, type NextRequest } from "next/server";
import { ensureUserWorkspace } from "@/lib/provisioning";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error") || requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/onboarding";

  if (error) {
    const redirectUrl = new URL("/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", "OAuth callback did not include a code.");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    const { data } = await supabase.auth.getUser();
    if (data.user) await ensureUserWorkspace(data.user);
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (authError) {
    const redirectUrl = new URL("/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", authError instanceof Error ? authError.message : "Could not complete login.");
    return NextResponse.redirect(redirectUrl);
  }
}
