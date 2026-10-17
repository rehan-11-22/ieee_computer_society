import Image from "next/image";
import {
  BarChart3,
  BrainCircuit,
  Cloud,
  Code2,
  Cog,
  HeartHandshake,
  Medal,
  ShieldCheck,
  Target,
  UsersRound,
} from "lucide-react";
import { listPublicLeadershipMembers } from "@/lib/public-content";

export const revalidate = 60;

const values = [
  { icon: Code2, title: "Technical Events", text: "Workshops, talks, and hands-on learning sessions." },
  { icon: UsersRound, title: "Student Leadership", text: "Build leadership skills and work with a passionate team." },
  { icon: Target, title: "Community Impact", text: "Use technology to create a positive change." },
];

const focusAreas = [
  { icon: BrainCircuit, title: "Artificial Intelligence", text: "Machine learning and real-world applications." },
  { icon: ShieldCheck, title: "Cybersecurity", text: "Ethical hacking, security, and awareness." },
  { icon: Code2, title: "Programming", text: "Competitive programming and problem solving." },
  { icon: Cog, title: "Software Development", text: "Web, mobile, and full-stack development." },
  { icon: Cloud, title: "Cloud & Emerging Tech", text: "Cloud computing, IoT, and new technologies." },
  { icon: Target, title: "And Many More", text: "Exploring every evolving field in technology." },
];

export default async function AboutPage() {
  const leadership = await listPublicLeadershipMembers();
  return (
    <main className="innerPage aboutPage">
      <section className="aboutHero innerContainer">
        <div className="innerHeroCopy">
          <span className="sectionPill">About Our Society</span>
          <h1>Learn. Connect. <em>Build.</em></h1>
          <p>
            IEEE Computer Society at Superior University is a student branch that brings together
            technology enthusiasts to learn, share ideas, and create a positive impact through
            events, workshops, and leadership opportunities.
          </p>
        </div>
        <div className="innerHeroImage">
          <Image
            src="/about.jpeg"
            alt="IEEE Computer Society Superior University community"
            fill
            priority
            sizes="(max-width: 850px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </section>

      <section className="valueGrid innerContainer" aria-label="Society values">
        {values.map(({ icon: Icon, title, text }) => (
          <article className="valueCard" key={title}>
            <Icon size={32} />
            <div><h2>{title}</h2><p>{text}</p></div>
          </article>
        ))}
      </section>

      <section className="societyStory innerContainer">
        <div className="journeyCopy">
          <span className="sectionPill">Our Journey</span>
          <h2>A Legacy Since <em>2015</em></h2>
          <p>
            Founded in 2015, our branch has continuously worked to empower students through
            technology, learning, and community engagement. As part of the international IEEE
            Computer Society, we connect students with global opportunities and resources.
          </p>
          <p>
            Through workshops, seminars, coding competitions, mega events, and panel talks, we
            help students grow academically and professionally while building an active campus
            community.
          </p>
        </div>
        <div className="focusArea">
          <span className="sectionPill">Areas We Work In</span>
          <h2>Exploring Every Aspect of Technology</h2>
          <div className="focusGrid">
            {focusAreas.map(({ icon: Icon, title, text }) => (
              <article key={title}><Icon size={25} /><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="leadershipSection innerContainer" id="leadership">
        <span className="sectionPill">Our Leadership</span>
        <h2>Guiding Our Student Community</h2>
        {leadership.length === 0 ? (
          <div className="leadershipEmpty"><UsersRound size={28} /><p>Leadership profiles will be published soon.</p></div>
        ) : (
          <div className="customLeaderGrid">
            {leadership.map((member) => (
              <article className="leaderCard customLeaderCard" key={member.id}>
                <div className={`leadershipPortrait${member.imageUrl ? " hasImage" : ""}`}>
                  {member.imageUrl ? (
                    <Image src={member.imageUrl} alt={`${member.name}, ${member.role}`} fill loading="lazy" sizes="(max-width: 640px) 72vw, 240px" />
                  ) : <UsersRound size={42} />}
                </div>
                <div className="leadershipDetails">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                  <small>{member.tenure}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="societyImpact">
        <div className="innerContainer">
          <span className="sectionPill darkPill">Our Impact</span>
          <h2>Creating Opportunities, Building a Stronger <em>Community</em></h2>
          <p>Learning, leadership, recognition, and meaningful connections that help students move forward.</p>
          <div className="impactBandGrid">
            <article><Medal size={30} /><div><h3>Recognition</h3><p>Certificates and achievements.</p></div></article>
            <article><HeartHandshake size={30} /><div><h3>Community</h3><p>Strong relationships and collaboration.</p></div></article>
            <article><BarChart3 size={30} /><div><h3>Growth</h3><p>Skills for a brighter future.</p></div></article>
          </div>
        </div>
      </section>

      {/* <section className="societyEvents innerContainer" id="events">
        <div className="sectionTitleRow">
          <div><span className="sectionPill">Latest Activities</span><h2>Learning in Action</h2></div>
          <Link href="/events">View All Events <ArrowRight size={15} /></Link>
        </div>
        {featuredEvents.length === 0 ? (
          <div className="inlineComingSoon"><CalendarDays size={25} /><div><strong>Events coming soon</strong><span>New events will appear here after they are published by an admin.</span></div></div>
        ) : (
          <div className="eventPreviewGrid">
            {featuredEvents.map((event) => (
              <article key={event.id}>
                <div>{event.imageUrl ? <Image src={event.imageUrl} alt={event.title} fill loading="lazy" sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} /> : <div className="eventImageFallback"><CalendarDays size={40} /><span>IEEE CS Event</span></div>}</div>
                <section><span>{event.eventDate}</span><h3>{event.title}</h3><p>{event.description}</p></section>
              </article>
            ))}
          </div>
        )}
      </section> */}
    </main>
  );
}
