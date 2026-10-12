import { getTeamMemberImage } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params;
    const image = await getTeamMemberImage(memberId);
    if (!image) return new Response("Not found", { status: 404 });
    return new Response(image.data, { headers: { "Content-Type": image.mimeType, "Content-Length": String(image.size), "Cache-Control": "public, max-age=31536000, immutable", "CDN-Cache-Control": "public, s-maxage=31536000", "Vercel-CDN-Cache-Control": "public, s-maxage=31536000", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("Team member image error:", error);
    return new Response("Failed to load image", { status: 500 });
  }
}
