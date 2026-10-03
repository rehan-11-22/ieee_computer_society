import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getCurrentSession } from "@/lib/auth";
import {
  createCertificateTemplate,
  listCertificateTemplates,
  type TemplateMimeType,
} from "@/lib/templates";

export const runtime = "nodejs";

const MAX_TEMPLATE_SIZE = 5 * 1024 * 1024;

function detectedMimeType(data: Uint8Array): TemplateMimeType | null {
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return "image/png";
  }
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}

export async function GET() {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await listCertificateTemplates());
  } catch (error) {
    console.error("Certificate template list error:", error);
    return NextResponse.json({ error: "Failed to load certificate templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const nameValue = formData.get("name");
    const imageValue = formData.get("image");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";

    if (!name || name.length > 100) {
      return NextResponse.json({ error: "Template name is required and must be under 100 characters" }, { status: 400 });
    }
    if (!(imageValue instanceof File)) {
      return NextResponse.json({ error: "Select a PNG or JPEG template image" }, { status: 400 });
    }
    if (imageValue.size === 0 || imageValue.size > MAX_TEMPLATE_SIZE) {
      return NextResponse.json({ error: "Template image must be between 1 byte and 5 MB" }, { status: 400 });
    }

    const data = new Uint8Array(await imageValue.arrayBuffer());
    const mimeType = detectedMimeType(data);
    if (!mimeType) {
      return NextResponse.json({ error: "Only valid PNG and JPEG images are supported" }, { status: 400 });
    }
    try {
      const validator = await PDFDocument.create();
      const image = mimeType === "image/png"
        ? await validator.embedPng(data)
        : await validator.embedJpg(data);
      if (image.width < 800 || image.height < 500 || image.width <= image.height) {
        return NextResponse.json(
          { error: "Template must be a landscape image of at least 800 × 500 pixels" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json({ error: "The uploaded image is damaged or unreadable" }, { status: 400 });
    }

    const template = await createCertificateTemplate({
      name,
      mimeType,
      data,
      setAsDefault: formData.get("setAsDefault") === "true",
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Certificate template upload error:", error);
    return NextResponse.json({ error: "Failed to upload certificate template" }, { status: 500 });
  }
}
