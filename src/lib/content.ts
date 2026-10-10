import "server-only";

import { Binary, ObjectId, type Collection, type WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type { EventSection, SocietyEvent, TeamMember } from "@/lib/types";

export type ContentImageMimeType = "image/png" | "image/jpeg" | "image/webp";

interface EventDocument {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  section?: EventSection;
  image?: Binary;
  imageMimeType?: ContentImageMimeType;
  imageSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMemberDocument {
  name: string;
  role: string;
  bio: string;
  displayOrder: number;
  image?: Binary;
  imageMimeType?: ContentImageMimeType;
  imageSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventInput {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  section: EventSection;
  image?: { data: Uint8Array; mimeType: ContentImageMimeType };
}

export interface TeamMemberInput {
  name: string;
  role: string;
  bio: string;
  displayOrder: number;
  image?: { data: Uint8Array; mimeType: ContentImageMimeType };
}

async function eventCollection(): Promise<Collection<EventDocument>> {
  const database = await getDatabase();
  const collection = database.collection<EventDocument>("society_events");
  await collection.createIndex({ eventDate: -1, createdAt: -1 });
  return collection;
}

async function teamCollection(): Promise<Collection<TeamMemberDocument>> {
  const database = await getDatabase();
  const collection = database.collection<TeamMemberDocument>("team_members");
  await collection.createIndex({ displayOrder: 1, createdAt: 1 });
  return collection;
}

function objectId(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function serializeEvent(document: WithId<EventDocument>): SocietyEvent {
  const id = document._id.toHexString();
  const hasImage = Boolean(document.image || (document.imageMimeType && document.imageSize));
  return {
    id,
    title: document.title,
    description: document.description,
    eventDate: document.eventDate,
    location: document.location,
    section: document.section || "upcoming",
    ...(hasImage ? { imageUrl: `/api/events/${id}/image?v=${document.updatedAt.getTime()}` } : {}),
    createdAt: document.createdAt.toISOString(),
  };
}

function serializeTeamMember(document: WithId<TeamMemberDocument>): TeamMember {
  const id = document._id.toHexString();
  const hasImage = Boolean(document.image || (document.imageMimeType && document.imageSize));
  return {
    id,
    name: document.name,
    role: document.role,
    bio: document.bio,
    displayOrder: document.displayOrder,
    ...(hasImage ? { imageUrl: `/api/team/${id}/image?v=${document.updatedAt.getTime()}` } : {}),
    createdAt: document.createdAt.toISOString(),
  };
}

function imageFields(image: EventInput["image"] | TeamMemberInput["image"]) {
  return image
    ? {
        image: new Binary(image.data),
        imageMimeType: image.mimeType,
        imageSize: image.data.byteLength,
      }
    : {};
}

export async function listEvents(): Promise<SocietyEvent[]> {
  const collection = await eventCollection();
  const documents = await collection.find({}, { projection: { image: 0 } }).sort({ eventDate: -1, createdAt: -1 }).toArray();
  return documents.map((document) => serializeEvent(document as WithId<EventDocument>));
}

export async function getEventById(id: string): Promise<SocietyEvent | null> {
  const _id = objectId(id);
  if (!_id) return null;
  const document = await (await eventCollection()).findOne(
    { _id },
    { projection: { image: 0 } },
  );
  return document ? serializeEvent(document as WithId<EventDocument>) : null;
}

export async function createEvent(input: EventInput): Promise<SocietyEvent> {
  const collection = await eventCollection();
  const now = new Date();
  const document: EventDocument = {
    title: input.title,
    description: input.description,
    eventDate: input.eventDate,
    location: input.location,
    section: input.section,
    ...imageFields(input.image),
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return serializeEvent({ ...document, _id: result.insertedId });
}

export async function updateEvent(id: string, input: EventInput): Promise<SocietyEvent | null> {
  const _id = objectId(id);
  if (!_id) return null;
  const collection = await eventCollection();
  const document = await collection.findOneAndUpdate(
    { _id },
    { $set: { title: input.title, description: input.description, eventDate: input.eventDate, location: input.location, section: input.section, ...imageFields(input.image), updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return document ? serializeEvent(document) : null;
}

export async function deleteEvent(id: string) {
  const _id = objectId(id);
  if (!_id) return false;
  return (await (await eventCollection()).deleteOne({ _id })).deletedCount === 1;
}

export async function getEventImage(id: string) {
  const _id = objectId(id);
  if (!_id) return null;
  const document = await (await eventCollection()).findOne({ _id }, { projection: { image: 1, imageMimeType: 1, imageSize: 1 } });
  if (!document?.image || !document.imageMimeType || !document.imageSize) return null;
  return { data: new Uint8Array(document.image.value()), mimeType: document.imageMimeType, size: document.imageSize };
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const collection = await teamCollection();
  const documents = await collection.find({}, { projection: { image: 0 } }).sort({ displayOrder: 1, createdAt: 1 }).toArray();
  return documents.map((document) => serializeTeamMember(document as WithId<TeamMemberDocument>));
}

export async function createTeamMember(input: TeamMemberInput): Promise<TeamMember> {
  const collection = await teamCollection();
  const now = new Date();
  const document: TeamMemberDocument = {
    name: input.name,
    role: input.role,
    bio: input.bio,
    displayOrder: input.displayOrder,
    ...imageFields(input.image),
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return serializeTeamMember({ ...document, _id: result.insertedId });
}

export async function updateTeamMember(id: string, input: TeamMemberInput): Promise<TeamMember | null> {
  const _id = objectId(id);
  if (!_id) return null;
  const collection = await teamCollection();
  const document = await collection.findOneAndUpdate(
    { _id },
    { $set: { name: input.name, role: input.role, bio: input.bio, displayOrder: input.displayOrder, ...imageFields(input.image), updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return document ? serializeTeamMember(document) : null;
}

export async function deleteTeamMember(id: string) {
  const _id = objectId(id);
  if (!_id) return false;
  return (await (await teamCollection()).deleteOne({ _id })).deletedCount === 1;
}

export async function getTeamMemberImage(id: string) {
  const _id = objectId(id);
  if (!_id) return null;
  const document = await (await teamCollection()).findOne({ _id }, { projection: { image: 1, imageMimeType: 1, imageSize: 1 } });
  if (!document?.image || !document.imageMimeType || !document.imageSize) return null;
  return { data: new Uint8Array(document.image.value()), mimeType: document.imageMimeType, size: document.imageSize };
}
