import { getCertificateTemplate } from "@/lib/templates";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    const { templateId } = await params;
    const template = await getCertificateTemplate(templateId);
    if (!template) return new Response("Not found", { status: 404 });

    return new Response(template.data, {
      headers: {
        "Content-Type": template.mimeType,
        "Content-Length": String(template.size),
        "Cache-Control": "public, max-age=3600, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Certificate template image error:", error);
    return new Response("Failed to load image", { status: 500 });
  }
}
