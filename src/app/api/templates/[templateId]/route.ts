import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { setDefaultCertificateTemplate } from "@/lib/templates";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { templateId } = await params;
    const template = await setDefaultCertificateTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: "Certificate template was not found" }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error("Default certificate template error:", error);
    return NextResponse.json({ error: "Failed to set the default template" }, { status: 500 });
  }
}
