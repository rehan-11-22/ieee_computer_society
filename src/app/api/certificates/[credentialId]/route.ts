import { NextResponse } from "next/server";
import { deleteCertificate, getCertificateById, updateCertificate, updateCertificateStatus } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { parseCertificateDetails, parseCertificateEventId, parseTemplateId } from "@/lib/certificate-input";
import { getCertificateTemplate } from "@/lib/templates";
import { getEventById } from "@/lib/content";

export async function GET(_req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    const resolvedParams = await params;
    const cert = await getCertificateById(resolvedParams.credentialId);
    if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (cert.templateId && !cert.templateLayout) {
      const template = await getCertificateTemplate(cert.templateId);
      return NextResponse.json({ ...cert, templateLayout: template?.layout });
    }
    return NextResponse.json(cert);
  } catch (error) {
    console.error("Certificate lookup error:", error);
    return NextResponse.json({ error: "Failed to load certificate" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const rawEventId = typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).eventId
      : undefined;
    const eventId = parseCertificateEventId(rawEventId);
    if (!eventId.ok) {
      return NextResponse.json({ error: eventId.error }, { status: 400 });
    }
    const selectedEvent = eventId.value ? await getEventById(eventId.value) : null;
    if (eventId.value && !selectedEvent) {
      return NextResponse.json({ error: "Selected event no longer exists. Refresh the form and choose another event." }, { status: 400 });
    }
    const details = parseCertificateDetails(
      selectedEvent && typeof body === "object" && body !== null
        ? { ...(body as Record<string, unknown>), eventName: selectedEvent.title }
        : body,
    );
    if (!details.ok) {
      return NextResponse.json({ error: details.error }, { status: 400 });
    }
    const templateId = parseTemplateId(
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).templateId
        : undefined,
    );
    if (!templateId.ok) {
      return NextResponse.json({ error: templateId.error }, { status: 400 });
    }
    const selectedTemplate = templateId.value
      ? await getCertificateTemplate(templateId.value)
      : null;
    if (templateId.value && !selectedTemplate) {
      return NextResponse.json({ error: "Certificate template was not found" }, { status: 400 });
    }

    const resolvedParams = await params;
    const certificate = await updateCertificate(
      resolvedParams.credentialId,
      selectedEvent ? { ...details.value, eventName: selectedEvent.title } : details.value,
      templateId.value,
      selectedEvent?.id,
      selectedTemplate?.layout,
    );
    if (!certificate) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Certificate edit error:", error);
    return NextResponse.json({ error: "Failed to edit certificate" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params;
    const { status } = await req.json();
    if (status !== "Valid" && status !== "Revoked") {
      return NextResponse.json({ error: "Invalid certificate status" }, { status: 400 });
    }
    const cert = await updateCertificateStatus(resolvedParams.credentialId, status);
    if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(cert);
  } catch (error) {
    console.error("Certificate update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params;
    const deleted = await deleteCertificate(resolvedParams.credentialId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certificate deletion error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
