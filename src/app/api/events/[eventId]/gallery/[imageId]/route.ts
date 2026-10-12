import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getEventGalleryImageRaw, deleteEventGalleryImage } from "@/lib/content";
import { revalidateEventContent } from "@/lib/content-revalidation";

export const runtime = "nodejs";

export async function GET(request: Request, props: { params: Promise<{ eventId: string; imageId: string }> }) {
  try {
    const { eventId, imageId } = await props.params;
    const image = await getEventGalleryImageRaw(eventId, imageId);
    if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });
    return new Response(image.data, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Content-Length": String(image.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, s-maxage=31536000",
        "Vercel-CDN-Cache-Control": "public, s-maxage=31536000",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Gallery image fetch error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ eventId: string; imageId: string }> }) {
  try {
    if (!(await getCurrentSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { eventId, imageId } = await props.params;
    const success = await deleteEventGalleryImage(eventId, imageId);
    if (!success) return NextResponse.json({ error: "Image not found" }, { status: 404 });
    revalidateEventContent();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Gallery image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
