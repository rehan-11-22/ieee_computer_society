import "server-only";

import type { CertificateDetails } from "@/lib/types";

const FIELD_LABELS: Record<keyof CertificateDetails, string> = {
  recipientName: "Recipient name",
  certificateType: "Certificate type",
  eventName: "Event name",
  issueDate: "Issue date",
  issuedBy: "Issued by",
  organization: "Organization",
};

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function parseCertificateDetails(body: unknown): ParseResult<CertificateDetails> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid certificate data" };
  }

  const source = body as Record<string, unknown>;
  const details = {} as CertificateDetails;

  for (const field of Object.keys(FIELD_LABELS) as Array<keyof CertificateDetails>) {
    const rawValue = source[field];
    if (typeof rawValue !== "string" || !rawValue.trim()) {
      return { ok: false, error: `${FIELD_LABELS[field]} is required` };
    }

    const value = rawValue.trim();
    if (value.length > 160) {
      return { ok: false, error: `${FIELD_LABELS[field]} is too long` };
    }
    details[field] = value;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(details.issueDate)) {
    return { ok: false, error: "Issue date must use YYYY-MM-DD format" };
  }
  const parsedIssueDate = new Date(`${details.issueDate}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedIssueDate.getTime()) ||
    parsedIssueDate.toISOString().slice(0, 10) !== details.issueDate
  ) {
    return { ok: false, error: "Issue date is not a valid calendar date" };
  }

  return { ok: true, value: details };
}

export function parseRequestedCredentialId(value: unknown): ParseResult<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: undefined };
  }

  if (typeof value !== "string") {
    return { ok: false, error: "Credential ID must be text" };
  }

  const credentialId = value.trim().toUpperCase();
  if (!credentialId) return { ok: true, value: undefined };
  if (credentialId.length > 80 || !/^[A-Z0-9][A-Z0-9-]*$/.test(credentialId)) {
    return {
      ok: false,
      error: "Credential ID may only contain letters, numbers, and hyphens",
    };
  }

  return { ok: true, value: credentialId };
}

export function parseTemplateId(value: unknown): ParseResult<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: undefined };
  }
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value.trim())) {
    return { ok: false, error: "Invalid certificate template" };
  }
  return { ok: true, value: value.trim().toLowerCase() };
}

export function parseCertificateEventId(value: unknown): ParseResult<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: undefined };
  }
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value.trim())) {
    return { ok: false, error: "Invalid certificate event" };
  }
  return { ok: true, value: value.trim().toLowerCase() };
}
