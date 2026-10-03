import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "ieee_certificate_portal";
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!mongoUri || !supabaseUrl || !supabaseKey) {
  throw new Error(
    "MONGODB_URI, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), and SUPABASE_SERVICE_ROLE_KEY are required",
  );
}

const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/certificates?select=*`, {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  },
});

if (!response.ok) {
  throw new Error(`Supabase export failed (${response.status}): ${await response.text()}`);
}

const sourceCertificates = await response.json();
if (!Array.isArray(sourceCertificates)) {
  throw new Error("Supabase returned an unexpected response");
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const certificates = client.db(databaseName).collection("certificates");
  await certificates.createIndex({ credentialId: 1 }, { unique: true });

  let migrated = 0;
  for (const source of sourceCertificates) {
    const credentialId = String(source.credentialId || "").trim().toUpperCase();
    if (!credentialId) {
      console.warn("Skipped a certificate with no Credential ID.");
      continue;
    }

    const now = new Date();
    await certificates.updateOne(
      { credentialId },
      {
        $set: {
          verificationLink: `/verify/${encodeURIComponent(credentialId)}`,
          recipientName: String(source.recipientName || ""),
          certificateType: String(source.certificateType || ""),
          eventName: String(source.eventName || ""),
          issueDate: String(source.issueDate || ""),
          issuedBy: String(source.issuedBy || ""),
          organization: String(source.organization || ""),
          status: source.status === "Revoked" ? "Revoked" : "Valid",
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: source.created_at ? new Date(source.created_at) : now,
        },
      },
      { upsert: true },
    );
    migrated += 1;
  }

  console.log(`Migrated ${migrated} certificate(s) to MongoDB.`);
  console.log("Supabase Auth passwords cannot be exported; create or seed MongoDB admin accounts separately.");
} finally {
  await client.close();
}
