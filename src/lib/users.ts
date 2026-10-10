import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export interface AdminUserDocument {
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

let userIndexesPromise: Promise<string> | undefined;

async function userCollection(): Promise<Collection<AdminUserDocument>> {
  const database = await getDatabase();
  const collection = database.collection<AdminUserDocument>("admin_users");

  userIndexesPromise ??= collection
    .createIndex({ email: 1 }, { unique: true })
    .catch((error) => {
      userIndexesPromise = undefined;
      throw error;
    });
  await userIndexesPromise;

  return collection;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findAdminByEmail(
  email: string,
): Promise<WithId<AdminUserDocument> | null> {
  const collection = await userCollection();
  return collection.findOne({ email: normalizeEmail(email) });
}

export async function createAdmin(email: string, passwordHash: string) {
  const collection = await userCollection();
  const now = new Date();
  const document: AdminUserDocument = {
    email: normalizeEmail(email),
    passwordHash,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function listAdmins() {
  const collection = await userCollection();
  const admins = await collection.find().sort({ createdAt: 1 }).toArray();
  return admins.map((admin) => ({
    id: admin._id.toHexString(),
    email: admin.email,
    role: "admin" as const,
    createdAt: admin.createdAt.toISOString(),
  }));
}

export async function updateAdmin(id: string, input: { email: string; passwordHash?: string }) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await userCollection();
  const $set: Partial<AdminUserDocument> = {
    email: normalizeEmail(input.email),
    updatedAt: new Date(),
  };
  if (input.passwordHash) $set.passwordHash = input.passwordHash;
  const admin = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set },
    { returnDocument: "after" },
  );
  return admin ? {
    id: admin._id.toHexString(),
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt.toISOString(),
  } : null;
}

export async function deleteAdmin(id: string) {
  if (!ObjectId.isValid(id)) return false;
  const collection = await userCollection();
  return (await collection.deleteOne({ _id: new ObjectId(id) })).deletedCount === 1;
}
