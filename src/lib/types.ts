export interface Certificate {
  id?: string;
  credentialId: string;
  verificationLink: string;
  recipientName: string;
  certificateType: string;
  eventId?: string;
  eventName: string;
  issueDate: string;
  issuedBy: string;
  organization: string;
  status: "Valid" | "Revoked";
  templateId?: string;
  templateLayout?: CertificateTemplateLayout;
}

export type CertificateDetails = Pick<
  Certificate,
  | "recipientName"
  | "certificateType"
  | "eventName"
  | "issueDate"
  | "issuedBy"
  | "organization"
>;

export interface AdminAccount {
  id: string;
  email: string;
  role: "admin";
  createdAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  mimeType: "image/png" | "image/jpeg";
  size: number;
  isDefault: boolean;
  imageUrl: string;
  layout: CertificateTemplateLayout;
  createdAt: string;
}

export type CertificateTemplateFieldKey =
  | "certificateType"
  | "presentedTo"
  | "recipientName"
  | "eventName"
  | "organization"
  | "credentialId"
  | "issueDate"
  | "issuedBy"
  | "issuingOrganization";

export interface CertificateTemplateFieldLayout {
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
}

export interface CertificateTemplateLayout {
  showContentPanel: boolean;
  fields: Record<CertificateTemplateFieldKey, CertificateTemplateFieldLayout>;
}

export type EventSection = "upcoming" | "latest" | "previous";

export interface SocietyEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  section: EventSection;
  imageUrl?: string;
  pageSections: EventPageSection[];
  createdAt: string;
}

export type EventPageSection =
  | {
      id: string;
      type: "content";
      heading: string;
      subheading: string;
      body: string;
      align: "left" | "center";
      headingColor: string;
      subheadingColor: string;
      bodyColor: string;
    }
  | {
      id: string;
      type: "gallery";
      heading: string;
      layout: "grid" | "carousel";
    };

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
}

export interface EventGalleryImage {
  id: string;
  eventId: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
}
