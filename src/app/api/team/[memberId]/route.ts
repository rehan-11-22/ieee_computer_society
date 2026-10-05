import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { deleteTeamMember, updateTeamMember } from "@/lib/content";
import { parseTeamMemberForm } from "@/lib/content-input";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseTeamMemberForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    const { memberId } = await params;
    const member = await updateTeamMember(memberId, input.value);
    return member ? NextResponse.json(member) : NextResponse.json({ error: "Team member not found" }, { status: 404 });
  } catch (error) {
    console.error("Team member update error:", error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { memberId } = await params;
    return (await deleteTeamMember(memberId))
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Team member not found" }, { status: 404 });
  } catch (error) {
    console.error("Team member deletion error:", error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
