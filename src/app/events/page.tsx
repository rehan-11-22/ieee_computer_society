import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Sparkles } from "lucide-react";
import { listPublicEvents } from "@/lib/public-content";

export const revalidate = 30;

function eventStatus(value: string) {
  const eventTime = new Date(`${value}T00:00:00Z`).getTime();
  const today = new Date();
  const todayTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (eventTime > todayTime) return "upcoming";
  if (eventTime === todayTime) return "latest";
  return "previous";
}

export default async function EventsPage() {
  const events = await listPublicEvents();
  const groups = [
    { key: "upcoming", title: "Upcoming Events", description: "Join us at our next sessions and activities." },
    { key: "latest", title: "Latest Events", description: "Events happening today." },
    { key: "previous", title: "Previous Events", description: "Browse our past events and highlights." },
  ].map((group) => ({ ...group, events: events.filter((event) => eventStatus(event.eventDate) === group.key) }));

  return (
    <main className="innerPage listingPage">
      <section className="aboutHero innerContainer">
        <div className="innerHeroCopy">
          <span className="sectionPill">Events & Activities</span>
          <h1>Learn through <em>experience.</em></h1>
          <p>Explore technical workshops, expert talks, leadership meetups, and community events by IEEE CS Superior University.</p>
        </div>
        <div className="innerHeroImage">
          <Image
            src="/event.jpeg"
            alt="IEEE Computer Society Superior University events"
            fill
            priority
            sizes="(max-width: 850px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </section>

      {events.length === 0 ? (
        <section className="publicEmptyState innerContainer">
          <span><Sparkles size={34} /></span>
          <h2>Events Coming Soon</h2>
          <p>We are preparing new technical sessions and community activities. Check back soon for updates.</p>
        </section>
      ) : (
        <div className="eventStatusSections innerContainer">
          <div className="eventCategoryCards">
            {groups.map((group) => (
              <Link key={group.key} href={`/events/category/${group.key}`} className="eventCategoryCard">
                <span className="eventCategoryIcon"><CalendarDays size={21} /></span>
                <span className="sectionPill">{group.title}</span>
                <strong>{group.events.length} events</strong>
                <p>{group.description}</p>
                <span className="eventCategoryLink">View all events <ChevronRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
