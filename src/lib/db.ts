import "server-only";

import type { Collection, WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type { Certificate, CertificateDetails } from "@/lib/types";

interface CertificateDocument extends Omit<Certificate, "id"> {
  createdAt: Date;
  updatedAt: Date;
}

interface CounterDocument {
  _id: string;
  sequence: number;
  updatedAt: Date;
}

export interface CreateCertificateData extends CertificateDetails {
  credentialId?: string;
  templateId?: string;
}

let certificateSetupPromise: Promise<void> | undefined;

async function certificateCollection(): Promise<Collection<CertificateDocument>> {
  const database = await getDatabase();
  const collection = database.collection<CertificateDocument>("certificates");

  certificateSetupPromise ??= Promise.all([
    collection.createIndex({ credentialId: 1 }, { unique: true }),
    collection.updateMany(
      {
        $or: [
          { verificationLink: { $exists: false } },
          { verificationLink: "" },
        ],
      },
      [{ $set: { verificationLink: { $concat: ["/verify/", "$credentialId"] } } }],
    ),
  ])
    .then(() => undefined)
    .catch((error) => {
      certificateSetupPromise = undefined;
      throw error;
    });
  await certificateSetupPromise;

  return collection;
}

function verificationLinkFor(credentialId: string) {
  return `/verify/${encodeURIComponent(credentialId)}`;
}

function serializeCertificate(document: WithId<CertificateDocument>): Certificate {
  return {
    id: document._id.toHexString(),
    credentialId: document.credentialId,
    verificationLink: document.verificationLink || verificationLinkFor(document.credentialId),
    recipientName: document.recipientName,
    certificateType: document.certificateType,
    eventName: document.eventName,
    issueDate: document.issueDate,
    issuedBy: document.issuedBy,
    organization: document.organization,
    status: document.status,
    templateId: document.templateId,
  };
}

async function nextCredentialId(collection: Collection<CertificateDocument>) {
  const year = new Date().getFullYear();
  const prefix = `IEECS-SU-${year}-`;
  const latestSequence = await collection
    .aggregate<{ sequence: number }>([
      { $match: { credentialId: { $regex: `^${prefix}\\d+$` } } },
      {
        $project: {
          sequence: {
            $convert: {
              input: { $arrayElemAt: [{ $split: ["$credentialId", prefix] }, 1] },
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      { $sort: { sequence: -1 } },
    ])
    .limit(1)
    .next();
  const highestExistingSequence = latestSequence?.sequence || 0;

  const database = await getDatabase();
  const counters = database.collection<CounterDocument>("counters");
  const counterId = `certificate:${year}`;

  await counters.updateOne(
    { _id: counterId },
    {
      $max: { sequence: highestExistingSequence },
      $set: { updatedAt: new Date() },
    },
    { upsert: true },
  );
  const counter = await counters.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!counter) throw new Error("Failed to generate a Credential ID");
  return `${prefix}${counter.sequence.toString().padStart(4, "0")}`;
}

export async function getCertificates(): Promise<Certificate[]> {
  const collection = await certificateCollection();
  const documents = await collection.find().sort({ createdAt: -1 }).toArray();
  return documents.map(serializeCertificate);
}

export async function getCertificateById(credentialId: string): Promise<Certificate | null> {
  const collection = await certificateCollection();
  const document = await collection.findOne({ credentialId: normalizeCredentialId(credentialId) });
  return document ? serializeCertificate(document) : null;
}

export async function createCertificate(data: CreateCertificateData): Promise<Certificate> {
  const collection = await certificateCollection();
  const credentialId = data.credentialId
    ? normalizeCredentialId(data.credentialId)
    : await nextCredentialId(collection);
  const now = new Date();
  const document: CertificateDocument = {
    credentialId,
    verificationLink: verificationLinkFor(credentialId),
    recipientName: data.recipientName,
    certificateType: data.certificateType,
    eventName: data.eventName,
    issueDate: data.issueDate,
    issuedBy: data.issuedBy,
    organization: data.organization,
    status: "Valid",
    ...(data.templateId ? { templateId: data.templateId } : {}),
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return serializeCertificate({ ...document, _id: result.insertedId });
}

export async function updateCertificate(
  credentialId: string,
  details: CertificateDetails,
  templateId?: string,
): Promise<Certificate | null> {
  const collection = await certificateCollection();
  const document = await collection.findOneAndUpdate(
    { credentialId: normalizeCredentialId(credentialId) },
    {
      $set: {
        ...details,
        ...(templateId ? { templateId } : {}),
        updatedAt: new Date(),
      },
      ...(!templateId ? { $unset: { templateId: "" } } : {}),
    },
    { returnDocument: "after" },
  );
  return document ? serializeCertificate(document) : null;
}

export async function updateCertificateStatus(
  credentialId: string,
  status: Certificate["status"],
): Promise<Certificate | null> {
  const collection = await certificateCollection();
  const document = await collection.findOneAndUpdate(
    { credentialId: normalizeCredentialId(credentialId) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return document ? serializeCertificate(document) : null;
}

export async function deleteCertificate(credentialId: string): Promise<boolean> {
  const collection = await certificateCollection();
  const result = await collection.deleteOne({
    credentialId: normalizeCredentialId(credentialId),
  });
  return result.deletedCount === 1;
}

export function normalizeCredentialId(credentialId: string) {
  return credentialId.trim().toUpperCase();
}

export function isMongoDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export type { Certificate } from "@/lib/types";
