import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { setDefaultCertificateTemplate, updateCertificateTemplateLayout } from "@/lib/templates";
import { parseCertificateTemplateLayout } from "@/lib/certificate-template-layout";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { templateId } = await params;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body: unknown = await request.json();
      const layout = parseCertificateTemplateLayout(
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>).layout
          : undefined,
      );
      if (!layout.ok) {
        return NextResponse.json({ error: layout.error }, { status: 400 });
      }
      const template = await updateCertificateTemplateLayout(templateId, layout.value);
      if (!template) {
        return NextResponse.json({ error: "Certificate template was not found" }, { status: 404 });
      }
      return NextResponse.json(template);
    }

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
