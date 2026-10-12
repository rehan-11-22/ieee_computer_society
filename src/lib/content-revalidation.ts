import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateEventContent() {
  revalidateTag("public-events", { expire: 0 });
  revalidateTag("public-event-gallery", { expire: 0 });
  revalidatePath("/about");
  revalidatePath("/events");
  revalidatePath("/events/[eventId]", "page");
  revalidatePath("/events/category/[status]", "page");
}

export function revalidateTeamContent() {
  revalidateTag("public-team", { expire: 0 });
  revalidatePath("/team");
  revalidatePath("/team/[category]", "page");
}

export function revalidateLeadershipContent() {
  revalidateTag("public-leadership", { expire: 0 });
  revalidatePath("/about");
}

export function revalidateContactSettings() {
  revalidateTag("public-contact-settings", { expire: 0 });
  revalidatePath("/contact");
}

export function revalidateCollaborationContent() {
  revalidateTag("public-collaborations", { expire: 0 });
  revalidatePath("/");
}
