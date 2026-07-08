import { NextResponse } from "next/server";
import { adminEmployeeSessionCookie } from "@/lib/admin/auth";
import { loginAdminEmployee } from "@/lib/admin/iam";
import { fail } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return fail("Enter your admin login email and password.", 400);

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const userAgent = request.headers.get("user-agent") || "";

  try {
    const session = await loginAdminEmployee({ email, password, ipAddress, userAgent });
    const response = NextResponse.json({
      ok: true,
      next: "/admin",
      forcePasswordChange: session.forcePasswordChange
    });
    response.cookies.set(adminEmployeeSessionCookie, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt)
    });
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not complete employee login.", 401);
  }
}
