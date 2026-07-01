import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseBrowserEnv } from "./env";

const protectedPrefixes = [
  "/admin",
  "/analytics",
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
  "/templates"
];

const authPages = ["/login", "/signup"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthPage(pathname: string) {
  return authPages.includes(pathname);
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
      return NextResponse.redirect(url);
    }
    return response;
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
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
