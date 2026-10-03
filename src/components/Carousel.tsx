"use client";
import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

const images = [
  "/WhatsApp Image 2026-09-30 at 5.14.04 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.05 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.40 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.41 PM (1).jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.41 PM (2).jpeg",
  "/WhatsApp Image 2026-09-30 at 5.14.41 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.15.16 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.15.17 PM.jpeg",
  "/WhatsApp Image 2026-09-30 at 5.15.57 PM.jpeg"
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3500, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="embla" ref={emblaRef} style={{ height: '100%' }}>
        <div className="embla__container" style={{ display: 'flex', height: '100%' }}>
          {images.map((src, index) => (
            <div className="embla__slide" key={index} style={{ flex: '0 0 100%', minWidth: 0, height: '100%', position: 'relative' }}>
              <Image
                src={src}
                alt={`Event ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="carouselDots" style={{ position: 'absolute', bottom: '20px', right: '50%', transform: 'translateX(50%)', zIndex: 4, display: 'flex', gap: '8px' }}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`carouselDot ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
