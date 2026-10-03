import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { findAdminByEmail, normalizeEmail } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const user = await findAdminByEmail(email);
    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user._id.toHexString(), email: user.email },
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      await createSessionToken({ userId: user._id.toHexString(), email: user.email }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      },
    );

    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ error: "Authentication service is unavailable" }, { status: 500 });
  }
}
