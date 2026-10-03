import "server-only";

import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Certificate } from "@/lib/types";

interface TemplateImage {
  mimeType: "image/png" | "image/jpeg";
  data: Uint8Array;
}

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const NAVY = rgb(16 / 255, 44 / 255, 80 / 255);
const BLUE = rgb(37 / 255, 99 / 255, 235 / 255);
const MUTED = rgb(87 / 255, 103 / 255, 126 / 255);

function fittedSize(font: PDFFont, text: string, preferred: number, maxWidth: number, minimum = 10) {
  let size = preferred;
  while (size > minimum && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function drawCentered(
  page: PDFPage,
  text: string,
  font: PDFFont,
  preferredSize: number,
  y: number,
  color = NAVY,
  maxWidth = PAGE_WIDTH - 140,
) {
  const size = fittedSize(font, text, preferredSize, maxWidth);
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_WIDTH - width) / 2, y, size, font, color });
  return { x: (PAGE_WIDTH - width) / 2, width, size };
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function addLinkAnnotation(
  pdf: PDFDocument,
  page: PDFPage,
  url: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const annotation = pdf.context.register(
    pdf.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + width, y + height],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(url),
      },
    }),
  );
  page.node.set(PDFName.of("Annots"), pdf.context.obj([annotation]));
}

export async function generateCertificatePdf(
  certificate: Certificate,
  template: TemplateImage | null,
  verificationUrl: string,
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  if (template) {
    const background = template.mimeType === "image/png"
      ? await pdf.embedPng(template.data)
      : await pdf.embedJpg(template.data);
    const scale = Math.max(PAGE_WIDTH / background.width, PAGE_HEIGHT / background.height);
    const width = background.width * scale;
    const height = background.height * scale;
    page.drawImage(background, {
      x: (PAGE_WIDTH - width) / 2,
      y: (PAGE_HEIGHT - height) / 2,
      width,
      height,
    });
    page.drawRectangle({ x: 72, y: 116, width: PAGE_WIDTH - 144, height: 330, color: rgb(1, 1, 1), opacity: 0.88 });
    page.drawRectangle({ x: 72, y: 48, width: PAGE_WIDTH - 144, height: 66, color: rgb(1, 1, 1), opacity: 0.88 });
  } else {
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(0.985, 0.99, 1) });
    page.drawRectangle({ x: 18, y: 18, width: PAGE_WIDTH - 36, height: PAGE_HEIGHT - 36, borderColor: NAVY, borderWidth: 4 });
    page.drawRectangle({ x: 30, y: 30, width: PAGE_WIDTH - 60, height: PAGE_HEIGHT - 60, borderColor: BLUE, borderWidth: 1 });
    page.drawRectangle({ x: 30, y: PAGE_HEIGHT - 102, width: PAGE_WIDTH - 60, height: 72, color: NAVY });
    drawCentered(page, certificate.organization, bold, 19, PAGE_HEIGHT - 73, rgb(1, 1, 1), PAGE_WIDTH - 100);
  }

  drawCentered(page, certificate.certificateType.toUpperCase(), bold, 24, 407, NAVY);
  drawCentered(page, "THIS CERTIFICATE IS PROUDLY PRESENTED TO", regular, 11, 365, MUTED);
  drawCentered(page, certificate.recipientName, bold, 36, 310, BLUE);
  drawCentered(page, `for valuable contribution to ${certificate.eventName}`, regular, 15, 266, NAVY);
  drawCentered(page, `Issued by ${certificate.organization}`, regular, 12, 240, MUTED);

  const credentialLabel = `Credential ID: ${certificate.credentialId}`;
  const link = drawCentered(page, credentialLabel, bold, 12, 185, BLUE, PAGE_WIDTH - 180);
  page.drawLine({ start: { x: link.x, y: 183 }, end: { x: link.x + link.width, y: 183 }, color: BLUE, thickness: 0.7 });
  addLinkAnnotation(pdf, page, verificationUrl, link.x, 180, link.width, link.size + 7);
  drawCentered(page, `Issue Date: ${displayDate(certificate.issueDate)}`, regular, 10, 162, MUTED);

  page.drawLine({ start: { x: 130, y: 105 }, end: { x: 330, y: 105 }, color: NAVY, thickness: 0.8 });
  page.drawLine({ start: { x: 512, y: 105 }, end: { x: 712, y: 105 }, color: NAVY, thickness: 0.8 });
  const issuedBySize = fittedSize(bold, certificate.issuedBy, 12, 200);
  page.drawText(certificate.issuedBy, {
    x: 230 - bold.widthOfTextAtSize(certificate.issuedBy, issuedBySize) / 2,
    y: 84,
    size: issuedBySize,
    font: bold,
    color: NAVY,
  });
  page.drawText("ISSUED BY", { x: 199, y: 65, size: 9, font: regular, color: MUTED });
  const orgSize = fittedSize(bold, certificate.organization, 12, 200);
  page.drawText(certificate.organization, {
    x: 612 - bold.widthOfTextAtSize(certificate.organization, orgSize) / 2,
    y: 84,
    size: orgSize,
    font: bold,
    color: NAVY,
  });
  page.drawText("ISSUING ORGANIZATION", { x: 557, y: 65, size: 9, font: regular, color: MUTED });

  if (certificate.status === "Revoked") {
    page.drawText("REVOKED", {
      x: 257,
      y: 250,
      size: 76,
      font: bold,
      color: rgb(0.86, 0.15, 0.15),
      opacity: 0.35,
      rotate: degrees(25),
    });
  }

  pdf.setTitle(`${certificate.recipientName} - ${certificate.certificateType}`);
  pdf.setSubject(`Certificate ${certificate.credentialId}`);
  pdf.setCreator("IEEE Computer Society Superior University Student Branch");
  pdf.setCreationDate(new Date());
  return pdf.save();
}
