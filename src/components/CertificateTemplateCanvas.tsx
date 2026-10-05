"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type {
  Certificate,
  CertificateTemplateFieldKey,
  CertificateTemplateLayout,
} from "@/lib/types";
import { CERTIFICATE_TEMPLATE_FIELD_KEYS } from "@/lib/certificate-template-layout";

type CanvasCertificate = Pick<
  Certificate,
  | "certificateType"
  | "recipientName"
  | "eventName"
  | "organization"
  | "credentialId"
  | "issueDate"
  | "issuedBy"
  | "verificationLink"
>;

interface CertificateTemplateCanvasProps {
  imageUrl: string;
  layout: CertificateTemplateLayout;
  certificate: CanvasCertificate;
  editable?: boolean;
  selectedField?: CertificateTemplateFieldKey;
  onSelectField?: (key: CertificateTemplateFieldKey) => void;
  onMoveField?: (key: CertificateTemplateFieldKey, x: number, y: number) => void;
}

function displayDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}

function fieldText(key: CertificateTemplateFieldKey, certificate: CanvasCertificate) {
  switch (key) {
    case "certificateType":
      return certificate.certificateType.toUpperCase();
    case "presentedTo":
      return "THIS CERTIFICATE IS PROUDLY PRESENTED TO";
    case "recipientName":
      return certificate.recipientName;
    case "eventName":
      return `for valuable contribution to ${certificate.eventName}`;
    case "organization":
      return `Organized by ${certificate.organization}`;
    case "credentialId":
      return `Credential ID: ${certificate.credentialId}`;
    case "issueDate":
      return `Issue Date: ${displayDate(certificate.issueDate)}`;
    case "issuedBy":
      return certificate.issuedBy;
    case "issuingOrganization":
      return certificate.organization;
  }
}

function signatureLabel(key: CertificateTemplateFieldKey) {
  if (key === "issuedBy") return "ISSUED BY";
  if (key === "issuingOrganization") return "ISSUING ORGANIZATION";
  return null;
}

export function CertificateTemplateCanvas({
  imageUrl,
  layout,
  certificate,
  editable = false,
  selectedField,
  onSelectField,
  onMoveField,
}: CertificateTemplateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingField = useRef<CertificateTemplateFieldKey | null>(null);

  function moveField(clientX: number, clientY: number) {
    const key = draggingField.current;
    const rectangle = canvasRef.current?.getBoundingClientRect();
    if (!key || !rectangle || !onMoveField) return;
    const x = Math.max(0, Math.min(100, ((clientX - rectangle.left) / rectangle.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rectangle.top) / rectangle.height) * 100));
    onMoveField(key, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }

  return (
    <div
      className={`templateCanvas${editable ? " templateCanvasEditable" : ""}`}
      ref={canvasRef}
    >
      <Image
        className="templateCanvasBackground"
        src={imageUrl}
        alt="Certificate template background"
        fill
        sizes="(max-width: 850px) 100vw, 1100px"
        unoptimized
        priority={!editable}
      />
      {layout.showContentPanel && <div className="templateCanvasPanel" aria-hidden="true" />}
      {CERTIFICATE_TEMPLATE_FIELD_KEYS.map((key) => {
        const field = layout.fields[key];
        const isSignature = key === "issuedBy" || key === "issuingOrganization";
        const content = (
          <>
            <span>{fieldText(key, certificate)}</span>
            {signatureLabel(key) && <small>{signatureLabel(key)}</small>}
          </>
        );
        const style = {
          left: `${field.x}%`,
          top: `${field.y}%`,
          width: `${field.width}%`,
          color: field.color,
          fontSize: `clamp(5px, ${field.fontSize / 8.42}cqw, ${field.fontSize}px)`,
        };
        const className = [
          "templateCanvasField",
          `templateCanvasField-${key}`,
          isSignature ? "templateCanvasSignature" : "",
          selectedField === key ? "selected" : "",
        ].filter(Boolean).join(" ");

        if (editable) {
          return (
            <button
              type="button"
              className={className}
              style={style}
              key={key}
              onClick={() => onSelectField?.(key)}
              onPointerDown={(event) => {
                draggingField.current = key;
                event.currentTarget.setPointerCapture(event.pointerId);
                onSelectField?.(key);
                moveField(event.clientX, event.clientY);
              }}
              onPointerMove={(event) => {
                if (draggingField.current === key) moveField(event.clientX, event.clientY);
              }}
              onPointerUp={(event) => {
                event.currentTarget.releasePointerCapture(event.pointerId);
                draggingField.current = null;
              }}
              onPointerCancel={() => {
                draggingField.current = null;
              }}
            >
              {content}
            </button>
          );
        }

        if (key === "credentialId") {
          return (
            <Link className={className} style={style} href={certificate.verificationLink} key={key}>
              {content} ↗
            </Link>
          );
        }

        return <div className={className} style={style} key={key}>{content}</div>;
      })}
    </div>
  );
}
