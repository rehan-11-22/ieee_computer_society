import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import { listEvents } from "@/lib/content";

export const dynamic = "force-dynamic";

type EventStatus = "upcoming" | "latest" | "previous";

const statusContent: Record<EventStatus, { title: string; description: string }> = {
  upcoming: { title: "Upcoming Events", description: "Join us at our next sessions and activities." },
  latest: { title: "Latest Events", description: "Events happening today." },
  previous: { title: "Previous Events", description: "Browse our past events and highlights." },
};

function eventStatus(value: string): EventStatus {
  const eventTime = new Date(`${value}T00:00:00Z`).getTime();
  const today = new Date();
  const todayTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (eventTime > todayTime) return "upcoming";
  if (eventTime === todayTime) return "latest";
  return "previous";
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default async function EventCategoryPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const selectedStatus = status as EventStatus;
  const content = statusContent[selectedStatus];
  if (!content) return <main className="innerPage listingPage"><section className="publicEmptyState innerContainer"><h2>Event category not found</h2><Link href="/events">Back to events</Link></section></main>;

  const events = (await listEvents()).filter((event) => eventStatus(event.eventDate) === selectedStatus);
  return (
    <main className="innerPage listingPage">
      <section className="listingHero innerContainer eventCategoryHero">
        <Link href="/events" className="backToEvents"><ChevronLeft size={16} /> All events</Link>
        <span className="sectionPill">Events & Activities</span>
        <h1>{content.title}.</h1>
        <p>{content.description}</p>
      </section>
      <section className="innerContainer eventCategoryResults">
        <div className="eventCategoryResultsHead"><h2>{content.title}</h2><span>{events.length} events</span></div>
        {events.length === 0 ? <p className="eventStatusEmpty">No {selectedStatus} events right now.</p> : <div className="eventsGrid">
          {events.map((event) => <Link key={event.id} href={`/events/${event.id}`} className="eventCardLink"><article className="eventCard"><div className="eventGridImage">{event.imageUrl ? <Image src={event.imageUrl} alt={event.title} fill unoptimized sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} /> : <div className="eventImageFallback"><CalendarDays size={46} /><span>IEEE CS Event</span></div>}</div><section><span><CalendarDays size={14} /> {displayDate(event.eventDate)}</span><h2>{event.title}</h2><p>{event.description}</p>{event.location && <small className="eventLocation"><MapPin size={13} /> {event.location}</small>}</section></article></Link>)}
        </div>}
      </section>
    </main>
  );
}
