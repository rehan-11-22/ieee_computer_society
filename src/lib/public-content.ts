import "server-only";

import { unstable_cache } from "next/cache";
import {
  getEventById,
  getEventGallery,
  getContactSettings,
  listCollaborations,
  listEvents,
  listLeadershipMembers,
  listTeamMembers,
} from "@/lib/content";

const PUBLIC_CONTENT_REVALIDATE_SECONDS = 60;

async function safelyLoad<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`Public ${label} load error:`, error);
    return fallback;
  }
}

export const listPublicEvents = unstable_cache(
  async () => safelyLoad("events", listEvents, []),
  ["public-events"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-events"] },
);

export const listPublicTeamMembers = unstable_cache(
  async () => safelyLoad("team", listTeamMembers, []),
  ["public-team"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-team"] },
);

export const listPublicLeadershipMembers = unstable_cache(
  async () => safelyLoad("leadership", listLeadershipMembers, []),
  ["public-leadership"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-leadership"] },
);

export const getPublicContactSettings = unstable_cache(
  async () => safelyLoad("contact settings", getContactSettings, { phoneNumber: "+92 300 1234567", whatsappUrl: "https://wa.me/923001234567" }),
  ["public-contact-settings"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-contact-settings"] },
);

export const listPublicCollaborations = unstable_cache(
  async () => safelyLoad("collaborations", () => listCollaborations(24), []),
  ["public-collaborations"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-collaborations"] },
);

export const getPublicEventById = unstable_cache(
  async (eventId: string) => safelyLoad("event", () => getEventById(eventId), null),
  ["public-event"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-events"] },
);

export const getPublicEventGallery = unstable_cache(
  async (eventId: string) => safelyLoad("event gallery", () => getEventGallery(eventId, 100), []),
  ["public-event-gallery"],
  { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS, tags: ["public-event-gallery"] },
);
