"use client";

import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const galleryImages = [
  "/WhatsApp Image 2026-09-30 at 5.14.05 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.40 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.41 PM (1).jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.41 PM (2).jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.41 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.15.16 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.15.17 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.15.57 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.04 PM.jpeg",
];

export function GalleryCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 3200, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="galleryCarousel">
      <div className="galleryViewport" ref={emblaRef}>
        <div className="galleryTrack">
          {galleryImages.map((src, index) => (
            <div className="gallerySlide" key={src}>
              <div className="galleryImage">
                <Image
                  src={src}
                  alt={`IEEE CS Superior University activity ${index + 1}`}
                  fill
                  sizes="(max-width: 700px) 88vw, (max-width: 1050px) 45vw, 31vw"
                  style={{ objectFit: "cover" }}
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="galleryControls">
        <div className="galleryArrows">
          <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous gallery image">
            <ChevronLeft size={19} />
          </button>
          <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Next gallery image">
            <ChevronRight size={19} />
          </button>
        </div>
        <div className="galleryDots" aria-label="Gallery navigation">
          {galleryImages.map((_, index) => (
            <button
              type="button"
              key={index}
              className={index === selectedIndex ? "active" : ""}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to gallery image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
