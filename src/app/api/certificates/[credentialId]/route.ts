import { NextResponse } from "next/server";
import { getCertificateById, updateCertificateStatus, deleteCertificate } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  const resolvedParams = await params;
  const cert = await getCertificateById(resolvedParams.credentialId);
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cert);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json();
    const cert = await updateCertificateStatus(resolvedParams.credentialId, status);
    if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(cert);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ credentialId: string }> }) {
  try {
    const resolvedParams = await params;
    await deleteCertificate(resolvedParams.credentialId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
