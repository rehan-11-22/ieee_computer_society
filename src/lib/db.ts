export interface Certificate {
  id?: string;
  credentialId: string;
  recipientName: string;
  certificateType: string;
  eventName: string;
  issueDate: string;
  issuedBy: string;
  organization: string;
  status: "Valid" | "Revoked";
}

// In-memory fallback if Supabase is not connected yet
let mockCertificates: Certificate[] = [
  {
    id: "1",
    credentialId: "IEECS-SU-2026-0001",
    recipientName: "Muhammad Ahmed",
    certificateType: "Certificate of Appreciation",
    eventName: "CodeX 2.0",
    issueDate: "2026-09-01",
    issuedBy: "President Ahmad Kashif",
    organization: "IEEE Computer Society",
    status: "Valid"
  }
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function supabaseFetch(path: string, method: string = "GET", body?: any) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.statusText}`);
  return await res.json();
}

export async function getCertificates(): Promise<Certificate[]> {
  try {
    const data = await supabaseFetch("certificates?select=*");
    if (data) return data;
  } catch (e) {
    console.error(e);
  }
  return [...mockCertificates];
}

export async function getCertificateById(credentialId: string): Promise<Certificate | null> {
  try {
    const data = await supabaseFetch(`certificates?credentialId=eq.${credentialId}&select=*`);
    if (data && data.length > 0) return data[0];
    if (data && data.length === 0) return null;
  } catch (e) {
    console.error(e);
  }
  return mockCertificates.find(c => c.credentialId === credentialId) || null;
}

export async function createCertificate(cert: Omit<Certificate, "id">): Promise<Certificate> {
  try {
    const data = await supabaseFetch("certificates", "POST", cert);
    if (data && data.length > 0) return data[0];
  } catch (e) {
    console.error(e);
  }
  const newCert = { ...cert, id: Date.now().toString() };
  mockCertificates.push(newCert);
  return newCert;
}

export async function updateCertificateStatus(credentialId: string, status: "Valid" | "Revoked") {
  try {
    const data = await supabaseFetch(`certificates?credentialId=eq.${credentialId}`, "PATCH", { status });
    if (data && data.length > 0) return data[0];
  } catch (e) {
    console.error(e);
  }
  const cert = mockCertificates.find(c => c.credentialId === credentialId);
  if (cert) cert.status = status;
  return cert;
}

export async function deleteCertificate(credentialId: string) {
  try {
    await supabaseFetch(`certificates?credentialId=eq.${credentialId}`, "DELETE");
  } catch (e) {
    console.error(e);
  }
  mockCertificates = mockCertificates.filter(c => c.credentialId !== credentialId);
  return true;
}
