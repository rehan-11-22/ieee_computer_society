import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  // Clear the cookie used by the previous Supabase implementation as well.
  response.cookies.set("admin_refresh", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
