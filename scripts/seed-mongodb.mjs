import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "ieee_certificate_portal";

if (!uri) {
  throw new Error("MONGODB_URI is required");
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const database = client.db(databaseName);
  const certificates = database.collection("certificates");
  const adminUsers = database.collection("admin_users");

  await certificates.createIndex({ credentialId: 1 }, { unique: true });
  await adminUsers.createIndex({ email: 1 }, { unique: true });

  const now = new Date();
  await certificates.updateOne(
    { credentialId: "IEECS-SU-2026-0001" },
    {
      $set: {
        verificationLink: "/verify/IEECS-SU-2026-0001",
        recipientName: "Muhammad Ahmed",
        certificateType: "Certificate of Appreciation",
        eventName: "CodeX 2.0",
        issueDate: "2026-09-01",
        issuedBy: "President Ahmad Kashif",
        organization: "IEEE Computer Society",
        status: "Valid",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 6) {
      throw new Error("SEED_ADMIN_PASSWORD must be at least 6 characters");
    }
    const passwordHash = await hash(adminPassword, 12);
    await adminUsers.updateOne(
      { email: adminEmail },
      {
        $set: { passwordHash, role: "admin", updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    console.log(`Seeded demo certificate and admin account ${adminEmail}.`);
  } else {
    console.log("Seeded demo certificate. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to seed an admin too.");
  }
} finally {
  await client.close();
}
