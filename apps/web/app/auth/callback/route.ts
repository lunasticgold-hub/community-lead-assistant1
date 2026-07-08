import { NextResponse, type NextRequest } from "next/server";
import { recordCustomerSessionStart } from "@/lib/customer-success/data";
import { ensureUserWorkspace } from "@/lib/provisioning";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/onboarding";
  return value;
}

function splitCodeAndPath(value: string) {
  const pathStart = value.search(/\/(?:admin|dashboard|leads|campaigns|sequences|review-queue|inbox|analytics|platforms)\b/);
  if (pathStart === -1) return { code: value, recoveredNext: "" };
  return {
    code: value.slice(0, pathStart),
    recoveredNext: value.slice(pathStart)
  };
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const rawCode = requestUrl.searchParams.get("code");
  const recovered = rawCode ? splitCodeAndPath(rawCode) : { code: "", recoveredNext: "" };
  const code = recovered.code;
  const error = requestUrl.searchParams.get("error") || requestUrl.searchParams.get("error_description");
  const next = safeNext(requestUrl.searchParams.get("next") || recovered.recoveredNext || "/onboarding");

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
    if (data.user) {
      const workspace = await ensureUserWorkspace(data.user);
      await recordCustomerSessionStart({
        workspaceId: workspace.id,
        userId: data.user.id,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
        userAgent: request.headers.get("user-agent") || "",
        source: "web-oauth"
      });
    }
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (authError) {
    const redirectUrl = new URL("/login", requestUrl.origin);
    redirectUrl.searchParams.set("error", authError instanceof Error ? authError.message : "Could not complete login.");
    return NextResponse.redirect(redirectUrl);
  }
}
