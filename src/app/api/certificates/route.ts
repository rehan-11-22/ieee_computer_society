import { NextResponse } from "next/server";
import { getCertificates, createCertificate } from "@/lib/db";

export async function GET() {
  const certs = await getCertificates();
  return NextResponse.json(certs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newCert = await createCertificate(body);
    return NextResponse.json(newCert, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}
