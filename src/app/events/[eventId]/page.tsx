import Image from "next/image";
import { notFound } from "next/navigation";
import { getEventById, getEventGallery } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) {
    notFound();
    return null;
  }
  const gallery = await getEventGallery(eventId);
  const sections = event.pageSections.length > 0
    ? event.pageSections
    : gallery.length > 0
      ? [{ id: "default-gallery", type: "gallery" as const, heading: "Event Gallery", layout: "grid" as const }]
      : [];

  return (
    <main className="innerPage eventDetailPage">
      <section className="eventHero innerContainer">
        <div className="innerHeroCopy">
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <span className="eventMeta">
            {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${event.eventDate}T00:00:00Z`))}
            {event.location && <> - {event.location}</>}
          </span>
        </div>
        {event.imageUrl && (
          <div className="innerHeroImage">
            <Image src={event.imageUrl} alt={event.title} fill unoptimized loading="lazy" sizes="(max-width: 800px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          </div>
        )}
      </section>

      <section className="eventPageSections innerContainer">
        {sections.length === 0 ? (
          <div className="eventPageEmpty">No event page sections added yet.</div>
        ) : sections.map((section) => (
          section.type === "content" ? (
            <article className={`eventContentSection ${section.align === "center" ? "center" : ""}`} key={section.id}>
              {section.subheading && <span style={{ color: section.subheadingColor || "#2563eb" }}>{section.subheading}</span>}
              {section.heading && <h2 style={{ color: section.headingColor || "#0f2f57" }}>{section.heading}</h2>}
              {section.body && <p style={{ color: section.bodyColor || "#64748b" }}>{section.body}</p>}
            </article>
          ) : (
            <article className="eventGallerySection" key={section.id}>
              <h2>{section.heading || "Event Gallery"}</h2>
              {gallery.length === 0 ? (
                <p>No gallery images added yet.</p>
              ) : (
                <div className={section.layout === "carousel" ? "eventGalleryCarousel" : "galleryGrid"}>
                  {gallery.map((img) => (
                    <article key={img.id} className="galleryItem">
                      <div className="galleryImageFrame">
                        <Image src={img.imageUrl} alt={img.description || "Event gallery image"} fill unoptimized loading="lazy" sizes="(max-width: 760px) 86vw, 33vw" style={{ objectFit: "cover" }} />
                      </div>
                      {img.description && <p className="galleryCaption">{img.description}</p>}
                    </article>
                  ))}
                </div>
              )}
            </article>
          )
        ))}
      </section>
    </main>
  );
}
