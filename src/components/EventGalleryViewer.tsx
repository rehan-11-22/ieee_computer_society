"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { EventGalleryImage } from "@/lib/types";

export function EventGalleryViewer({
  gallery,
  heading,
  layout,
}: {
  gallery: EventGalleryImage[];
  heading: string;
  layout: "grid" | "carousel";
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeImage = activeIndex === null ? null : gallery[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => current === null ? null : (current + 1) % gallery.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, gallery.length]);

  return (
    <article className="eventGallerySection">
      <div className="eventGalleryHeading">
        <span className="sectionPill">Event Moments</span>
        <div>
          <h2>{heading || "Event Gallery"}</h2>
          <p>Highlights and memorable moments from this event. Select an image to view it full size.</p>
        </div>
      </div>

      {gallery.length === 0 ? (
        <div className="eventGalleryEmpty"><ImageIcon size={28} /><p>Gallery images will appear here soon.</p></div>
      ) : (
        <div className={layout === "carousel" ? "eventGalleryCarousel" : "galleryGrid"}>
          {gallery.map((image, index) => (
            <article key={image.id} className="galleryItem">
              <button
                className="galleryImageButton"
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open image ${index + 1}${image.description ? `: ${image.description}` : ""}`}
              >
                <span className="galleryImageFrame">
                  <Image src={image.imageUrl} alt={image.description || "Event gallery image"} fill loading="lazy" sizes="(max-width: 760px) 86vw, 33vw" style={{ objectFit: "cover" }} />
                </span>
                <span className="galleryZoomHint" aria-hidden="true">View image</span>
              </button>
              {image.description && <p className="galleryCaption">{image.description}</p>}
            </article>
          ))}
        </div>
      )}

      {activeImage && activeIndex !== null && (
        <div
          className="eventGalleryLightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery image ${activeIndex + 1} of ${gallery.length}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
        >
          <button ref={closeButtonRef} className="galleryLightboxClose" type="button" onClick={() => setActiveIndex(null)} aria-label="Close image viewer">
            <X size={24} />
          </button>
          {gallery.length > 1 && (
            <button className="galleryLightboxPrevious" type="button" onClick={() => setActiveIndex((activeIndex - 1 + gallery.length) % gallery.length)} aria-label="Previous image">
              <ChevronLeft size={30} />
            </button>
          )}
          <figure className="galleryLightboxFigure">
            <div className="galleryLightboxImage">
              <Image src={activeImage.imageUrl} alt={activeImage.description || "Event gallery image"} fill priority sizes="100vw" style={{ objectFit: "contain" }} />
            </div>
            <figcaption>
              <span>{activeIndex + 1} / {gallery.length}</span>
              {activeImage.description && <p>{activeImage.description}</p>}
            </figcaption>
          </figure>
          {gallery.length > 1 && (
            <button className="galleryLightboxNext" type="button" onClick={() => setActiveIndex((activeIndex + 1) % gallery.length)} aria-label="Next image">
              <ChevronRight size={30} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
