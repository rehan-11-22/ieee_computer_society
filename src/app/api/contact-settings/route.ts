import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getContactSettings, updateContactSettings } from "@/lib/content";
import { parseContactSettingsForm } from "@/lib/content-input";
import { revalidateContactSettings } from "@/lib/content-revalidation";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getContactSettings());
  } catch (error) {
    console.error("Contact settings load error:", error);
    return NextResponse.json({ error: "Failed to load contact settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = parseContactSettingsForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    const settings = await updateContactSettings(input.value.phoneNumber);
    revalidateContactSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Contact settings update error:", error);
    return NextResponse.json({ error: "Failed to update contact settings" }, { status: 500 });
  }
}
