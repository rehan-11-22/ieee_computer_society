import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("admin_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("admin_refresh", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
