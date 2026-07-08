import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseBrowserEnv } from "./env";

const protectedPrefixes = [
  "/admin",
  "/analytics",
  "/app",
  "/account",
  "/billing",
  "/campaigns",
  "/dashboard",
  "/exports",
  "/extension",
  "/follow-ups",
  "/keywords",
  "/knowledge-base",
  "/leads",
  "/onboarding",
  "/platforms",
  "/team",
  "/templates",
  "/settings"
];

const authPages = ["/login", "/signup"];

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return response;
}

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthPage(pathname: string) {
  return authPages.includes(pathname);
}

function getSafeNextUrl(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return new URL("/dashboard", request.nextUrl.origin);
  }

  return new URL(next, request.nextUrl.origin);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  let env: ReturnType<typeof getSupabaseBrowserEnv>;
  try {
    env = getSupabaseBrowserEnv();
  } catch {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "Supabase is not configured.");
      url.searchParams.set("next", request.nextUrl.pathname);
      return withSecurityHeaders(NextResponse.redirect(url));
    }
    return withSecurityHeaders(response);
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (user && isAuthPage(pathname)) {
    return withSecurityHeaders(NextResponse.redirect(getSafeNextUrl(request)));
  }

  return withSecurityHeaders(response);
}
