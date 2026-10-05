import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { deleteEvent, updateEvent } from "@/lib/content";
import { parseEventForm } from "@/lib/content-input";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseEventForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    const { eventId } = await params;
    const event = await updateEvent(eventId, input.value);
    return event ? NextResponse.json(event) : NextResponse.json({ error: "Event not found" }, { status: 404 });
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { eventId } = await params;
    return (await deleteEvent(eventId))
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Event not found" }, { status: 404 });
  } catch (error) {
    console.error("Event deletion error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
