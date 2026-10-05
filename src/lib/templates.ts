import "server-only";

import { Binary, ObjectId, type Collection, type WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type { CertificateTemplate, CertificateTemplateLayout } from "@/lib/types";
import {
  cloneCertificateTemplateLayout,
  DEFAULT_CERTIFICATE_TEMPLATE_LAYOUT,
  legacyCertificateTemplateLayout,
} from "@/lib/certificate-template-layout";

export type TemplateMimeType = "image/png" | "image/jpeg";

interface CertificateTemplateDocument {
  name: string;
  mimeType: TemplateMimeType;
  size: number;
  data: Binary;
  isDefault: boolean;
  layout?: CertificateTemplateLayout;
  createdAt: Date;
  updatedAt: Date;
}

let templateSetupPromise: Promise<void> | undefined;

async function templateCollection(): Promise<Collection<CertificateTemplateDocument>> {
  const database = await getDatabase();
  const collection = database.collection<CertificateTemplateDocument>("certificate_templates");

  templateSetupPromise ??= collection
    .createIndex({ createdAt: -1 })
    .then(() => undefined)
    .catch((error) => {
      templateSetupPromise = undefined;
      throw error;
    });
  await templateSetupPromise;
  return collection;
}

function serializeTemplate(document: WithId<CertificateTemplateDocument>): CertificateTemplate {
  const id = document._id.toHexString();
  return {
    id,
    name: document.name,
    mimeType: document.mimeType,
    size: document.size,
    isDefault: document.isDefault,
    imageUrl: `/api/templates/${id}/image`,
    layout: document.layout
      ? cloneCertificateTemplateLayout(document.layout)
      : legacyCertificateTemplateLayout(),
    createdAt: document.createdAt.toISOString(),
  };
}

function templateObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function listCertificateTemplates(): Promise<CertificateTemplate[]> {
  const collection = await templateCollection();
  const documents = await collection
    .find({}, { projection: { data: 0 } })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();
  return documents.map((document) => serializeTemplate(document as WithId<CertificateTemplateDocument>));
}

export async function createCertificateTemplate(input: {
  name: string;
  mimeType: TemplateMimeType;
  data: Uint8Array;
  setAsDefault: boolean;
  layout?: CertificateTemplateLayout;
}): Promise<CertificateTemplate> {
  const collection = await templateCollection();
  const now = new Date();
  const shouldBeDefault = input.setAsDefault || (await collection.countDocuments()) === 0;

  if (shouldBeDefault) {
    await collection.updateMany({ isDefault: true }, { $set: { isDefault: false, updatedAt: now } });
  }

  const document: CertificateTemplateDocument = {
    name: input.name,
    mimeType: input.mimeType,
    size: input.data.byteLength,
    data: new Binary(input.data),
    isDefault: shouldBeDefault,
    layout: cloneCertificateTemplateLayout(input.layout || DEFAULT_CERTIFICATE_TEMPLATE_LAYOUT),
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return serializeTemplate({ ...document, _id: result.insertedId });
}

export async function getCertificateTemplate(id: string) {
  const objectId = templateObjectId(id);
  if (!objectId) return null;
  const collection = await templateCollection();
  const document = await collection.findOne({ _id: objectId });
  if (!document) return null;
  return {
    ...serializeTemplate(document),
    data: new Uint8Array(document.data.buffer),
  };
}

export async function getDefaultCertificateTemplate() {
  const collection = await templateCollection();
  const document = await collection.findOne({ isDefault: true });
  return document ? serializeTemplate(document) : null;
}

export async function setDefaultCertificateTemplate(id: string) {
  const objectId = templateObjectId(id);
  if (!objectId) return null;
  const collection = await templateCollection();
  const existing = await collection.findOne({ _id: objectId });
  if (!existing) return null;

  const now = new Date();
  await collection.updateMany({ isDefault: true }, { $set: { isDefault: false, updatedAt: now } });
  const document = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: { isDefault: true, updatedAt: now } },
    { returnDocument: "after" },
  );
  return document ? serializeTemplate(document) : null;
}

export async function updateCertificateTemplateLayout(
  id: string,
  layout: CertificateTemplateLayout,
) {
  const objectId = templateObjectId(id);
  if (!objectId) return null;
  const collection = await templateCollection();
  const document = await collection.findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        layout: cloneCertificateTemplateLayout(layout),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
  return document ? serializeTemplate(document) : null;
}

export async function certificateTemplateExists(id: string) {
  const objectId = templateObjectId(id);
  if (!objectId) return false;
  const collection = await templateCollection();
  return (await collection.countDocuments({ _id: objectId }, { limit: 1 })) === 1;
}
