import { getCertificateById } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { getCertificateTemplate } from "@/lib/templates";

export const runtime = "nodejs";

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ credentialId: string }> },
) {
  try {
    const { credentialId } = await params;
    const certificate = await getCertificateById(credentialId);
    if (!certificate) return new Response("Certificate not found", { status: 404 });

    const storedTemplate = certificate.templateId
      ? await getCertificateTemplate(certificate.templateId)
      : null;
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const verificationUrl = `${origin}${certificate.verificationLink}`;
    const pdf = await generateCertificatePdf(certificate, storedTemplate, verificationUrl);
    const filename = safeFilename(`${certificate.recipientName}-${certificate.credentialId}`) || certificate.credentialId;

    return new Response(Uint8Array.from(pdf).buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Certificate PDF generation error:", error);
    return new Response("Failed to generate certificate PDF", { status: 500 });
  }
}
