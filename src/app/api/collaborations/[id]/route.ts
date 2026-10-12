import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { deleteCollaboration, updateCollaboration } from "@/lib/content";
import { parseCollaborationForm } from "@/lib/content-input";
import { revalidateCollaborationContent } from "@/lib/content-revalidation";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseCollaborationForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    const { id } = await params;
    const collaboration = await updateCollaboration(id, input.value);
    if (collaboration) revalidateCollaborationContent();
    return collaboration
      ? NextResponse.json(collaboration)
      : NextResponse.json({ error: "Collaboration not found" }, { status: 404 });
  } catch (error) {
    console.error("Collaboration update error:", error);
    return NextResponse.json({ error: "Failed to update collaboration" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const deleted = await deleteCollaboration(id);
    if (!deleted) return NextResponse.json({ error: "Collaboration not found" }, { status: 404 });
    revalidateCollaborationContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Collaboration deletion error:", error);
    return NextResponse.json({ error: "Failed to delete collaboration" }, { status: 500 });
  }
}
