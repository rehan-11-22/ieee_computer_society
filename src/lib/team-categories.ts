import type { TeamCategory } from "@/lib/types";

export interface TeamCategoryDefinition {
  slug: TeamCategory;
  name: string;
  cardTitle: string;
  description: string;
  shortDescription: string;
  image: string;
}

export const TEAM_CATEGORIES: TeamCategoryDefinition[] = [
  {
    slug: "executive-body",
    name: "Executive Body",
    cardTitle: "IEEE CS Executive Body",
    description: "The core team responsible for strategic direction, overall management, and successful execution of IEEE CS activities at Superior University.",
    shortDescription: "Leading the chapter with vision, responsibility, and purpose.",
    image: "/team_hero.jpeg",
  },
  {
    slug: "marketing-team",
    name: "Marketing Team",
    cardTitle: "IEEE CS Marketing Team",
    description: "The creative team building awareness, promoting initiatives, and presenting IEEE CS activities across digital and campus platforms.",
    shortDescription: "Sharing our work and growing the IEEE CS community.",
    image: "/new_pic1.jpeg",
  },
  {
    slug: "communication-team",
    name: "Communication Team",
    cardTitle: "IEEE CS Communication Team",
    description: "The team connecting members, partners, and audiences through clear communication, coordination, and community engagement.",
    shortDescription: "Keeping members, partners, and audiences connected.",
    image: "/new_pic2.jpeg",
  },
  {
    slug: "event-management-team",
    name: "Event Management Team",
    cardTitle: "IEEE CS Event Management Team",
    description: "The organizers responsible for planning, coordinating, and delivering smooth workshops, sessions, and society events.",
    shortDescription: "Turning ideas into well-organized experiences.",
    image: "/new_pic3.jpeg",
  },
  {
    slug: "media-team",
    name: "Media Team",
    cardTitle: "IEEE CS Media Team",
    description: "The visual storytellers documenting society activities through photography, video, design, and creative digital content.",
    shortDescription: "Capturing and presenting every important moment.",
    image: "/new_pic4.jpeg",
  },
];

export function getTeamCategory(value: string) {
  return TEAM_CATEGORIES.find((category) => category.slug === value);
}

export function isTeamCategory(value: string): value is TeamCategory {
  return TEAM_CATEGORIES.some((category) => category.slug === value);
}
