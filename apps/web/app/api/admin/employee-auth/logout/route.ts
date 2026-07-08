import { NextResponse } from "next/server";
import { adminEmployeeSessionCookie } from "@/lib/admin/auth";
import { revokeEmployeeSession } from "@/lib/admin/iam";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map(item => item.trim()).find(item => item.startsWith(`${adminEmployeeSessionCookie}=`))?.split("=")[1] || "";
  if (token) await revokeEmployeeSession(decodeURIComponent(token));
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminEmployeeSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
