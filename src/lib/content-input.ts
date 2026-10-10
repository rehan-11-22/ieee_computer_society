import "server-only";

import type { ContentImageMimeType, EventInput, TeamMemberInput } from "@/lib/content";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set<ContentImageMimeType>(["image/png", "image/jpeg", "image/webp"]);

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function text(form: FormData, name: string, label: string, maxLength: number, required = true): ParseResult<string> {
  const value = form.get(name);
  if (typeof value !== "string") return { ok: false, error: `${label} is required` };
  const normalized = value.trim();
  if (required && !normalized) return { ok: false, error: `${label} is required` };
  if (normalized.length > maxLength) return { ok: false, error: `${label} is too long` };
  return { ok: true, value: normalized };
}

async function image(form: FormData): Promise<ParseResult<EventInput["image"]>> {
  const value = form.get("image");
  if (!(value instanceof File) || value.size === 0) return { ok: true, value: undefined };
  if (!IMAGE_TYPES.has(value.type as ContentImageMimeType)) {
    return { ok: false, error: "Image must be PNG, JPEG, or WebP" };
  }
  if (value.size > MAX_IMAGE_SIZE) return { ok: false, error: "Image must be 4 MB or smaller" };
  return { ok: true, value: { data: new Uint8Array(await value.arrayBuffer()), mimeType: value.type as ContentImageMimeType } };
}

export async function parseImage(form: FormData): Promise<ParseResult<EventInput["image"]>> {
  return image(form);
}

export async function parseEventForm(form: FormData): Promise<ParseResult<EventInput>> {
  const title = text(form, "title", "Title", 120);
  const description = text(form, "description", "Description", 500);
  const eventDate = text(form, "eventDate", "Event date", 10);
  const section = text(form, "section", "Event section", 10);
  const location = text(form, "location", "Location", 140, false);
  const uploadedImage = await image(form);
  if (!title.ok) return title;
  if (!description.ok) return description;
  if (!eventDate.ok) return eventDate;
  if (!section.ok || !["upcoming", "latest", "previous"].includes(section.value)) return { ok: false, error: "Event section is invalid" };
  if (!location.ok) return location;
  if (!uploadedImage.ok) return uploadedImage;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate.value) || Number.isNaN(new Date(`${eventDate.value}T00:00:00Z`).getTime())) {
    return { ok: false, error: "Event date must be a valid date" };
  }
  return { ok: true, value: { title: title.value, description: description.value, eventDate: eventDate.value, location: location.value, section: section.value as "upcoming" | "latest" | "previous", image: uploadedImage.value } };
}

export async function parseTeamMemberForm(form: FormData): Promise<ParseResult<TeamMemberInput>> {
  const name = text(form, "name", "Name", 100);
  const role = text(form, "role", "Role", 100);
  const bio = text(form, "bio", "Bio", 400, false);
  const rawOrder = text(form, "displayOrder", "Display order", 4);
  const uploadedImage = await image(form);
  if (!name.ok) return name;
  if (!role.ok) return role;
  if (!bio.ok) return bio;
  if (!rawOrder.ok) return rawOrder;
  if (!uploadedImage.ok) return uploadedImage;
  const displayOrder = Number.parseInt(rawOrder.value, 10);
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 999) {
    return { ok: false, error: "Display order must be between 0 and 999" };
  }
  return { ok: true, value: { name: name.value, role: role.value, bio: bio.value, displayOrder, image: uploadedImage.value } };
}
