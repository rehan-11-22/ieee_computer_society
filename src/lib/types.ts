export interface Certificate {
  id?: string;
  credentialId: string;
  verificationLink: string;
  recipientName: string;
  certificateType: string;
  eventName: string;
  issueDate: string;
  issuedBy: string;
  organization: string;
  status: "Valid" | "Revoked";
  templateId?: string;
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
  createdAt: string;
}
