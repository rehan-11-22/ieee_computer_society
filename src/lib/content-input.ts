import "server-only";

import type { ContentImageMimeType, EventInput, TeamMemberInput } from "@/lib/content";
import type { EventPageSection } from "@/lib/types";

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

function pageSections(form: FormData): ParseResult<EventPageSection[]> {
  const value = form.get("pageSections");
  if (typeof value !== "string" || !value.trim()) return { ok: true, value: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { ok: false, error: "Page sections must be valid JSON" };
  }
  if (!Array.isArray(parsed) || parsed.length > 12) return { ok: false, error: "Page sections are invalid" };
  const sections: EventPageSection[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") return { ok: false, error: "Page sections are invalid" };
    const section = item as Record<string, unknown>;
    const id = typeof section.id === "string" && section.id.length <= 80 ? section.id : `section-${sections.length + 1}`;
    if (section.type === "content") {
      const heading = typeof section.heading === "string" ? section.heading.trim() : "";
      const subheading = typeof section.subheading === "string" ? section.subheading.trim() : "";
      const body = typeof section.body === "string" ? section.body.trim() : "";
      const align = section.align === "center" ? "center" : "left";
      const headingColor = color(section.headingColor, "#0f2f57");
      const subheadingColor = color(section.subheadingColor, "#2563eb");
      const bodyColor = color(section.bodyColor, "#64748b");
      if (heading.length > 140 || subheading.length > 180 || body.length > 1200) return { ok: false, error: "Content block is too long" };
      sections.push({ id, type: "content", heading, subheading, body, align, headingColor, subheadingColor, bodyColor });
    } else if (section.type === "gallery") {
      const heading = typeof section.heading === "string" ? section.heading.trim() : "Event Gallery";
      const layout = section.layout === "carousel" ? "carousel" : "grid";
      if (heading.length > 140) return { ok: false, error: "Gallery heading is too long" };
      sections.push({ id, type: "gallery", heading, layout });
    } else {
      return { ok: false, error: "Page section type is invalid" };
    }
  }
  return { ok: true, value: sections };
}

function color(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export async function parseImage(form: FormData): Promise<ParseResult<EventInput["image"]>> {
  const value = form.get("image");
  if (!(value instanceof File) || value.size === 0) return { ok: true, value: undefined };
  if (!IMAGE_TYPES.has(value.type as ContentImageMimeType)) {
    return { ok: false, error: "Image must be PNG, JPEG, or WebP" };
  }
  if (value.size > MAX_IMAGE_SIZE) return { ok: false, error: "Image must be 4 MB or smaller" };
  return { ok: true, value: { data: new Uint8Array(await value.arrayBuffer()), mimeType: value.type as ContentImageMimeType } };
}

export async function parseEventForm(form: FormData): Promise<ParseResult<EventInput>> {
  const title = text(form, "title", "Title", 120);
  const description = text(form, "description", "Description", 500);
  const eventDate = text(form, "eventDate", "Event date", 10);
  const location = text(form, "location", "Location", 140, false);
  const sections = pageSections(form);
  const uploadedImage = await parseImage(form);
  if (!title.ok) return title;
  if (!description.ok) return description;
  if (!eventDate.ok) return eventDate;
  if (!location.ok) return location;
  if (!sections.ok) return sections;
  if (!uploadedImage.ok) return uploadedImage;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate.value) || Number.isNaN(new Date(`${eventDate.value}T00:00:00Z`).getTime())) {
    return { ok: false, error: "Event date must be a valid date" };
  }
  return { ok: true, value: { title: title.value, description: description.value, eventDate: eventDate.value, location: location.value, pageSections: sections.value, image: uploadedImage.value } };
}

export async function parseTeamMemberForm(form: FormData): Promise<ParseResult<TeamMemberInput>> {
  const name = text(form, "name", "Name", 100);
  const role = text(form, "role", "Role", 100);
  const bio = text(form, "bio", "Bio", 400, false);
  const rawOrder = text(form, "displayOrder", "Display order", 4);
  const uploadedImage = await parseImage(form);
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
