import type {
  CertificateTemplateFieldKey,
  CertificateTemplateFieldLayout,
  CertificateTemplateLayout,
} from "@/lib/types";

export const CERTIFICATE_TEMPLATE_FIELD_KEYS: CertificateTemplateFieldKey[] = [
  "certificateType",
  "presentedTo",
  "recipientName",
  "eventName",
  "organization",
  "credentialId",
  "issueDate",
  "issuedBy",
  "issuingOrganization",
];

export const CERTIFICATE_TEMPLATE_FIELD_LABELS: Record<CertificateTemplateFieldKey, string> = {
  certificateType: "Certificate type",
  presentedTo: "Presented-to label",
  recipientName: "Recipient name",
  eventName: "Event name",
  organization: "Organizer",
  credentialId: "Credential ID",
  issueDate: "Issue date",
  issuedBy: "Issued by",
  issuingOrganization: "Issuing organization",
};

const field = (
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
): CertificateTemplateFieldLayout => ({ x, y, width, fontSize, color });

export const DEFAULT_CERTIFICATE_TEMPLATE_LAYOUT: CertificateTemplateLayout = {
  showContentPanel: false,
  fields: {
    certificateType: field(50, 30, 76, 22, "#102c50"),
    presentedTo: field(50, 36.5, 68, 10, "#57677e"),
    recipientName: field(50, 44, 72, 36, "#2563eb"),
    eventName: field(50, 53, 74, 14, "#102c50"),
    organization: field(50, 59, 70, 11, "#57677e"),
    credentialId: field(50, 67, 70, 11, "#2563eb"),
    issueDate: field(50, 72, 60, 10, "#57677e"),
    issuedBy: field(28, 85, 30, 12, "#102c50"),
    issuingOrganization: field(72, 85, 30, 12, "#102c50"),
  },
};

export function cloneCertificateTemplateLayout(
  layout: CertificateTemplateLayout = DEFAULT_CERTIFICATE_TEMPLATE_LAYOUT,
): CertificateTemplateLayout {
  return {
    showContentPanel: layout.showContentPanel,
    fields: Object.fromEntries(
      CERTIFICATE_TEMPLATE_FIELD_KEYS.map((key) => [key, { ...layout.fields[key] }]),
    ) as CertificateTemplateLayout["fields"],
  };
}

export function legacyCertificateTemplateLayout(): CertificateTemplateLayout {
  const layout = cloneCertificateTemplateLayout();
  layout.showContentPanel = true;
  return layout;
}

type LayoutParseResult =
  | { ok: true; value: CertificateTemplateLayout }
  | { ok: false; error: string };

function validNumber(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

export function parseCertificateTemplateLayout(value: unknown): LayoutParseResult {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Template layout is required" };
  }
  const record = value as Record<string, unknown>;
  if (typeof record.showContentPanel !== "boolean" || !record.fields || typeof record.fields !== "object") {
    return { ok: false, error: "Invalid template layout" };
  }

  const rawFields = record.fields as Record<string, unknown>;
  const parsedFields = {} as CertificateTemplateLayout["fields"];
  for (const key of CERTIFICATE_TEMPLATE_FIELD_KEYS) {
    const rawField = rawFields[key];
    if (!rawField || typeof rawField !== "object") {
      return { ok: false, error: `Missing layout field: ${CERTIFICATE_TEMPLATE_FIELD_LABELS[key]}` };
    }
    const candidate = rawField as Record<string, unknown>;
    if (
      !validNumber(candidate.x, 0, 100) ||
      !validNumber(candidate.y, 0, 100) ||
      !validNumber(candidate.width, 10, 100) ||
      !validNumber(candidate.fontSize, 6, 60) ||
      typeof candidate.color !== "string" ||
      !/^#[0-9a-f]{6}$/i.test(candidate.color)
    ) {
      return { ok: false, error: `Invalid layout values for ${CERTIFICATE_TEMPLATE_FIELD_LABELS[key]}` };
    }
    parsedFields[key] = {
      x: Number(candidate.x),
      y: Number(candidate.y),
      width: Number(candidate.width),
      fontSize: Number(candidate.fontSize),
      color: candidate.color.toLowerCase(),
    };
  }

  return {
    ok: true,
    value: { showContentPanel: record.showContentPanel, fields: parsedFields },
  };
}
