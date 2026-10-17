import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, ImageIcon, MapPin } from "lucide-react";
import { getPublicEventById, getPublicEventGallery } from "@/lib/public-content";
import { renderInlineFormattedText } from "@/components/InlineFormattedText";
import { EventGalleryViewer } from "@/components/EventGalleryViewer";

export const runtime = "nodejs";
export const revalidate = 60;

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function contentHeading(value: string) {
  const heading = value.trim();
  return !heading || heading.toLowerCase() === "section heading"
    ? "About the Event"
    : heading;
}

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const [event, gallery] = await Promise.all([
    getPublicEventById(eventId),
    getPublicEventGallery(eventId),
  ]);
  if (!event) {
    notFound();
    return null;
  }
  const sections = event.pageSections.length > 0
    ? event.pageSections
    : gallery.length > 0
      ? [{ id: "default-gallery", type: "gallery" as const, heading: "Event Gallery", layout: "grid" as const }]
      : [];

  return (
    <main className="innerPage eventDetailPage">
      <section className="eventDetailHero">
        <div className="eventDetailHeroInner innerContainer">
          <div className="eventDetailHeroCopy">
            <Link href="/events" className="eventDetailBack"><ChevronLeft size={16} /> All Events</Link>
            <span className="sectionPill">IEEE CS Event</span>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <div className="eventDetailMeta" aria-label="Event information">
              <span><CalendarDays size={17} /> {displayDate(event.eventDate)}</span>
              {event.location && <span><MapPin size={17} /> {event.location}</span>}
            </div>
          </div>
          <div className={`eventDetailHeroMedia${event.imageUrl ? "" : " empty"}`}>
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                preload
                sizes="(max-width: 850px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="eventDetailImageFallback">
                <CalendarDays size={58} />
                <span>IEEE Computer Society Event</span>
              </div>
            )}
            <span className="eventDetailMediaBadge">Superior University</span>
          </div>
        </div>
      </section>

      <section className="eventPageSections innerContainer">
        {sections.length === 0 ? (
          <div className="eventPageEmpty">
            <ImageIcon size={30} />
            <div><h2>More event details coming soon</h2><p>This page will be updated with highlights and event moments.</p></div>
          </div>
        ) : sections.map((section) => (
          section.type === "content" ? (
            <article className={`eventContentSection ${section.align === "center" ? "center" : ""}`} key={section.id}>
              <div className="eventContentAccent" aria-hidden="true" />
              {section.subheading && <span style={{ color: section.subheadingColor || "#2563eb" }}>{section.subheading}</span>}
              <h2 style={{ color: section.headingColor || "#0f2f57" }}>{contentHeading(section.heading)}</h2>
              {section.body && <p style={{ color: section.bodyColor || "#64748b" }}>{renderInlineFormattedText(section.body)}</p>}
            </article>
          ) : (
            <EventGalleryViewer key={section.id} gallery={gallery} heading={section.heading} layout={section.layout} />
          )
        ))}
      </section>
    </main>
  );
}
