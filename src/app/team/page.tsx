import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Camera,
  Megaphone,
  MessagesSquare,
  UsersRound,
} from "lucide-react";
import { listPublicTeamMembers } from "@/lib/public-content";
import { TEAM_CATEGORIES } from "@/lib/team-categories";

export const revalidate = 30;

const categoryIcons = {
  "executive-body": UsersRound,
  "marketing-team": Megaphone,
  "communication-team": MessagesSquare,
  "event-management-team": CalendarCheck2,
  "media-team": Camera,
};

export default async function TeamPage() {
  const members = await listPublicTeamMembers();

  return (
    <main className="innerPage teamLandingPage">
      <section className="teamLandingHero innerContainer">
        <div className="teamLandingCopy">
          <span className="sectionPill">Our Team</span>
          <h1>Meet the people<br />who <em>make it happen.</em></h1>
          <p>A group of passionate students working together to create opportunities, build a stronger community, and drive technological growth at Superior University through IEEE Computer Society.</p>
        </div>
        <div className="teamLandingHeroImage">
          <Image
            src="/team.jpeg"
            alt="IEEE Computer Society Superior University team"
            fill
            priority
            sizes="(max-width: 850px) 100vw, 54vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </section>

      <section className="teamCategorySection innerContainer" aria-labelledby="team-category-title">
        <div className="teamCategoryIntro">
          <span>Explore our departments</span>
          <h2 id="team-category-title">Find the team behind every initiative</h2>
        </div>
        <div className="teamCategoryGrid">
          {TEAM_CATEGORIES.map((category, index) => {
            const Icon = categoryIcons[category.slug];
            const memberCount = members.filter((member) => member.category === category.slug).length;
            return (
              <Link
                key={category.slug}
                href={`/team/${category.slug}`}
                className={`teamCategoryCard${index === 0 ? " featured" : ""}`}
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(max-width: 560px) 100vw, (max-width: 1000px) 33vw, 20vw"
                  className="teamCategoryCardImage"
                />
                <span className="teamCategoryCardOverlay" />
                <span className="teamCategoryCardIcon"><Icon size={24} /></span>
                <span className="teamCategoryCardContent">
                  <strong>{category.cardTitle}</strong>
                  <small>{memberCount} {memberCount === 1 ? "Member" : "Members"}</small>
                </span>
                <span className="teamCategoryCardArrow"><ArrowRight size={22} /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
