import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getEventGallery, addEventGalleryImage } from "@/lib/content";
import { parseImage } from "@/lib/content-input";

export const runtime = "nodejs";

function galleryDescription(form: FormData) {
  const value = form.get("description");
  if (typeof value !== "string") return { ok: true as const, value: undefined };
  const normalized = value.trim();
  if (normalized.length > 240) return { ok: false as const, error: "Description must be 240 characters or fewer" };
  return { ok: true as const, value: normalized || undefined };
}

export async function GET(request: Request, props: { params: Promise<{ eventId: string }> }) {
  try {
    const params = await props.params;
    const gallery = await getEventGallery(params.eventId);
    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Gallery list error:", error);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ eventId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const params = await props.params;

    const form = await request.formData();
    const input = await parseImage(form);
    const description = galleryDescription(form);
    if (!input.ok) return NextResponse.json({ error: input.error }, { status: 400 });
    if (!description.ok) return NextResponse.json({ error: description.error }, { status: 400 });
    if (!input.value) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const imageId = await addEventGalleryImage(params.eventId, input.value, description.value);
    return NextResponse.json({ id: imageId }, { status: 201 });
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
