import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { createEvent, listEvents } from "@/lib/content";
import { parseEventForm } from "@/lib/content-input";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listEvents());
  } catch (error) {
    console.error("Event list error:", error);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseEventForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    return NextResponse.json(await createEvent(input.value), { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
