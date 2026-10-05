import { NextResponse } from "next/server";
import { createCertificate, getCertificates, isMongoDuplicateKeyError } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { parseCertificateDetails, parseCertificateEventId, parseRequestedCredentialId, parseTemplateId } from "@/lib/certificate-input";
import { getCertificateTemplate, getDefaultCertificateTemplate } from "@/lib/templates";
import { getEventById } from "@/lib/content";

export async function GET() {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await getCertificates());
  } catch (error) {
    console.error("Certificate list error:", error);
    return NextResponse.json({ error: "Failed to load certificates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const credentialId = parseRequestedCredentialId(
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).credentialId
        : undefined,
    );
    if (!credentialId.ok) {
      return NextResponse.json({ error: credentialId.error }, { status: 400 });
    }
    const rawTemplateId = typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).templateId
      : undefined;
    const templateId = parseTemplateId(rawTemplateId);
    if (!templateId.ok) {
      return NextResponse.json({ error: templateId.error }, { status: 400 });
    }
    const selectedTemplateId = rawTemplateId === null
      ? undefined
      : templateId.value || (await getDefaultCertificateTemplate())?.id;
    const selectedTemplate = selectedTemplateId
      ? await getCertificateTemplate(selectedTemplateId)
      : null;
    if (selectedTemplateId && !selectedTemplate) {
      return NextResponse.json({ error: "Certificate template was not found" }, { status: 400 });
    }

    const newCert = await createCertificate({
      ...details.value,
      ...(selectedEvent ? { eventName: selectedEvent.title, eventId: selectedEvent.id } : {}),
      credentialId: credentialId.value,
      templateId: selectedTemplateId,
      templateLayout: selectedTemplate?.layout,
    });
    return NextResponse.json(newCert, { status: 201 });
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return NextResponse.json({ error: "This Credential ID already exists" }, { status: 409 });
    }
    console.error("Certificate creation error:", error);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}
