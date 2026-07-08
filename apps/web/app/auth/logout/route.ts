import { NextResponse, type NextRequest } from "next/server";
import { recordCustomerSessionEnd } from "@/lib/customer-success/data";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const requestUrl = new URL(request.url);
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) await recordCustomerSessionEnd(data.user.id);
    await supabase.auth.signOut();
  } catch {
    // A logout should still take the user back to login even if Supabase is not configured locally.
  }
  return NextResponse.redirect(new URL("/login", requestUrl.origin), { status: 303 });
}

export async function GET(request: NextRequest) {
  return signOut(request);
}

export async function POST(request: NextRequest) {
  return signOut(request);
}
