import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseBrowserEnv } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserEnv();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Middleware refreshes auth cookies.
        }
      }
    }
  });
}
