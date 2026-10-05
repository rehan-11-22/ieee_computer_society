import Image from "next/image";
import { Award, HeartHandshake, Sparkles, UsersRound } from "lucide-react";
import { listTeamMembers } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const team = await listTeamMembers();

  return (
    <main className="innerPage listingPage">
      <section className="listingHero innerContainer">
        <span className="sectionPill">Our Leadership</span>
        <h1>Meet the people who <em>make it happen.</em></h1>
        <p>Student leaders and faculty mentors working together to create valuable opportunities for our community.</p>
      </section>

      {team.length === 0 ? (
        <section className="publicEmptyState innerContainer">
          <span><Sparkles size={34} /></span>
          <h2>Team Announcement Coming Soon</h2>
          <p>Our new executive body will be introduced here soon.</p>
        </section>
      ) : (
        <section className="teamDirectory innerContainer">
          <div className="teamDirectoryHeading">
            <h2>Executive Body 2026</h2>
          </div>
          <div className="teamPageGrid">
            {team.map((member) => (
              <article key={member.id}>
                <span className={`teamMemberPhoto${member.imageUrl ? " hasImage" : ""}`}>
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="108px"
                      style={{ objectFit: "cover", objectPosition: "center top" }}
                    />
                  ) : member.name.slice(0, 2).toUpperCase()}
                </span>
                <h2>{member.name}</h2>
                <p>{member.role}</p>
                {member.bio && <small>{member.bio}</small>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="teamValues innerContainer">
        <article><UsersRound size={28} /><h2>Collaboration</h2><p>Working together with trust and shared purpose.</p></article>
        <article><Award size={28} /><h2>Excellence</h2><p>Leading every activity with quality and responsibility.</p></article>
        <article><HeartHandshake size={28} /><h2>Service</h2><p>Creating opportunities that support the whole community.</p></article>
      </section>
    </main>
  );
}
