import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { createTeamMember, listTeamMembers } from "@/lib/content";
import { parseTeamMemberForm } from "@/lib/content-input";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listTeamMembers());
  } catch (error) {
    console.error("Team list error:", error);
    return NextResponse.json({ error: "Failed to load team members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseTeamMemberForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    return NextResponse.json(await createTeamMember(input.value), { status: 201 });
  } catch (error) {
    console.error("Team member creation error:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
