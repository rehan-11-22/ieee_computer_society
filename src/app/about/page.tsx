import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Cloud,
  Code2,
  Cog,
  HeartHandshake,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { listEvents, listTeamMembers } from "@/lib/content";

export const dynamic = "force-dynamic";

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
  const [leaders, eventCards] = await Promise.all([listTeamMembers(), listEvents()]);
  const featuredLeaders = leaders.slice(0, 6);
  const featuredEvents = eventCards.slice(0, 3);

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
            src="/WhatsApp Image 2026-09-30 at 5.14.41 PM (2).jpeg"
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

      <section className="leadershipSection innerContainer" id="leadership" style={{ marginTop: '55px' }}>
        <span className="sectionPill" style={{ display: 'inline-block', marginBottom: '15px' }}>Our Leadership</span>
        <div className="customLeaderGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <article className="leaderCard customLeaderCard" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', textAlign: 'left', background: '#f5f8fc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <span style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eaf2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
              <UsersRound size={28} />
            </span>
            <div>
              <h3 style={{ fontSize: '18px', color: '#102c50', marginBottom: '4px' }}>Dr. Hamayun Khan</h3>
              <p style={{ color: '#68778c', fontSize: '13px', margin: 0 }}>Faculty Advisor</p>
              <p style={{ color: '#68778c', fontSize: '13px', margin: 0 }}>Advisor Since 2021</p>
            </div>
          </article>
          <article className="leaderCard customLeaderCard" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', textAlign: 'left', background: '#f5f8fc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <span style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eaf2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
              <UsersRound size={28} />
            </span>
            <div>
              <h3 style={{ fontSize: '18px', color: '#102c50', marginBottom: '4px' }}>M. Ahmad Kashif</h3>
              <p style={{ color: '#68778c', fontSize: '13px', margin: 0 }}>Current President</p>
              <p style={{ color: '#68778c', fontSize: '13px', margin: 0 }}>Leading Since 2025</p>
            </div>
          </article>
        </div>
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
                <div>{event.imageUrl ? <Image src={event.imageUrl} alt={event.title} fill unoptimized loading="lazy" sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} /> : <div className="eventImageFallback"><CalendarDays size={40} /><span>IEEE CS Event</span></div>}</div>
                <section><span>{event.eventDate}</span><h3>{event.title}</h3><p>{event.description}</p></section>
              </article>
            ))}
          </div>
        )}
      </section> */}
    </main>
  );
}
