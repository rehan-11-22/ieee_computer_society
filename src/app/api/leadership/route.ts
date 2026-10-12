import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { createLeadershipMember, listLeadershipMembers } from "@/lib/content";
import { parseLeadershipMemberForm } from "@/lib/content-input";
import { revalidateLeadershipContent } from "@/lib/content-revalidation";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listLeadershipMembers());
  } catch (error) {
    console.error("Leadership list error:", error);
    return NextResponse.json({ error: "Failed to load leadership members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await parseLeadershipMemberForm(await request.formData());
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    const member = await createLeadershipMember(input.value);
    revalidateLeadershipContent();
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Leadership member creation error:", error);
    return NextResponse.json({ error: "Failed to create leadership member" }, { status: 500 });
  }
}
