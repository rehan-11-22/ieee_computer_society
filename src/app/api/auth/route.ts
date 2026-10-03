import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ message: "Admin user created successfully", user: data.user }, { status: 201 });
    }

    // Login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: data.user.id, email: data.user.email },
    });

    // Set JWT as httpOnly cookie for secure server-side auth
    if (data.session) {
      response.cookies.set("admin_token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });

      response.cookies.set("admin_refresh", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (err: any) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
