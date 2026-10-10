import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { isMongoDuplicateKeyError } from "@/lib/db";
import { deleteAdmin, listAdmins, normalizeEmail, updateAdmin } from "@/lib/users";

export async function PUT(req: Request, { params }: { params: Promise<{ adminId: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId } = await params;
    const body: unknown = await req.json();
    const source = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const email = typeof source.email === "string" ? normalizeEmail(source.email) : "";
    const password = typeof source.password === "string" ? source.password : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (password && password.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters" }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }

    const admin = await updateAdmin(adminId, {
      email,
      ...(password ? { passwordHash: await hash(password, 12) } : {}),
    });
    return admin ? NextResponse.json(admin) : NextResponse.json({ error: "Admin not found" }, { status: 404 });
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
    }
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to update admin account" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ adminId: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admins = await listAdmins();
    if (admins.length <= 1) {
      return NextResponse.json({ error: "At least one admin account must remain" }, { status: 400 });
    }

    const { adminId } = await params;
    if (session.userId === adminId) {
      return NextResponse.json({ error: "You cannot delete your own admin account while signed in" }, { status: 400 });
    }

    return (await deleteAdmin(adminId))
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Admin not found" }, { status: 404 });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ error: "Failed to delete admin account" }, { status: 500 });
  }
}
