import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { createCollaboration, listCollaborations } from "@/lib/content";
import { parseCollaborationForm } from "@/lib/content-input";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listCollaborations());
  } catch (error) {
    console.error("Collaborations list error:", error);
    return NextResponse.json({ error: "Failed to load collaborations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseCollaborationForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    return NextResponse.json(await createCollaboration(input.value), { status: 201 });
  } catch (error) {
    console.error("Collaboration creation error:", error);
    return NextResponse.json({ error: "Failed to create collaboration" }, { status: 500 });
  }
}
