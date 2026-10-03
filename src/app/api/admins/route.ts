import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { isMongoDuplicateKeyError } from "@/lib/db";
import { createAdmin, listAdmins, normalizeEmail } from "@/lib/users";

export async function GET() {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await listAdmins());
  } catch (error) {
    console.error("Admin list error:", error);
    return NextResponse.json({ error: "Failed to load admin accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const source = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const email = typeof source.email === "string" ? normalizeEmail(source.email) : "";
    const password = typeof source.password === "string" ? source.password : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (password.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters" }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }

    const admin = await createAdmin(email, await hash(password, 12));
    return NextResponse.json(
      {
        id: admin._id.toHexString(),
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
    }
    console.error("Admin creation error:", error);
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
  }
}
