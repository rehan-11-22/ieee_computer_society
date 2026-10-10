import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { listEvents } from "@/lib/content";

export const dynamic = "force-dynamic";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function eventStatus(value: string) {
  const eventTime = new Date(`${value}T00:00:00Z`).getTime();
  const today = new Date();
  const todayTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (eventTime > todayTime) return "upcoming";
  if (eventTime === todayTime) return "latest";
  return "previous";
}

function EventCards({ events }: { events: Awaited<ReturnType<typeof listEvents>> }) {
  return (
    <div className="eventsGrid">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`} className="eventCardLink">
          <article className="eventCard">
            <div className="eventGridImage">
              {event.imageUrl ? (
                <Image src={event.imageUrl} alt={event.title} fill unoptimized loading="lazy" sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} />
              ) : (
                <div className="eventImageFallback"><CalendarDays size={46} /><span>IEEE CS Event</span></div>
              )}
            </div>
            <section>
              <span><CalendarDays size={14} /> {displayDate(event.eventDate)}</span>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              {event.location && <small className="eventLocation"><MapPin size={13} /> {event.location}</small>}
            </section>
          </article>
        </Link>
      ))}
    </div>
  );
}

export default async function EventsPage() {
  const events = await listEvents();
  const groups = [
    { key: "upcoming", title: "Upcoming Events", description: "Join us at our next sessions and activities." },
    { key: "latest", title: "Latest Events", description: "Events happening today." },
    { key: "previous", title: "Previous Events", description: "Browse our past events and highlights." },
  ].map((group) => ({ ...group, events: events.filter((event) => eventStatus(event.eventDate) === group.key) }));

  return (
    <main className="innerPage listingPage">
      <section className="listingHero innerContainer">
        <span className="sectionPill">Events & Activities</span>
        <h1>Learn through <em>experience.</em></h1>
        <p>Explore technical workshops, expert talks, leadership meetups, and community events by IEEE CS Superior University.</p>
      </section>

      {events.length === 0 ? (
        <section className="publicEmptyState innerContainer">
          <span><Sparkles size={34} /></span>
          <h2>Events Coming Soon</h2>
          <p>We are preparing new technical sessions and community activities. Check back soon for updates.</p>
        </section>
      ) : (
        <div className="eventStatusSections innerContainer">
          {groups.map((group) => (
            <section key={group.key} className="eventStatusSection">
              <div className="eventStatusHeading"><div><span className="sectionPill">{group.title}</span><p>{group.description}</p></div><strong>{group.events.length}</strong></div>
              {group.events.length > 0 ? <EventCards events={group.events} /> : <p className="eventStatusEmpty">No {group.key} events right now.</p>}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
