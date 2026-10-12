import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { deleteLeadershipMember, updateLeadershipMember } from "@/lib/content";
import { parseLeadershipMemberForm } from "@/lib/content-input";
import { revalidateLeadershipContent } from "@/lib/content-revalidation";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseLeadershipMemberForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    const { memberId } = await params;
    const member = await updateLeadershipMember(memberId, input.value);
    if (member) revalidateLeadershipContent();
    return member ? NextResponse.json(member) : NextResponse.json({ error: "Leadership member not found" }, { status: 404 });
  } catch (error) {
    console.error("Leadership member update error:", error);
    return NextResponse.json({ error: "Failed to update leadership member" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { memberId } = await params;
    const deleted = await deleteLeadershipMember(memberId);
    if (!deleted) return NextResponse.json({ error: "Leadership member not found" }, { status: 404 });
    revalidateLeadershipContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leadership member deletion error:", error);
    return NextResponse.json({ error: "Failed to delete leadership member" }, { status: 500 });
  }
}
