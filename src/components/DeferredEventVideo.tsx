"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type IdleApi = {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function DeferredEventVideo() {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 769px) and (prefers-reduced-motion: no-preference)");
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
    if (!mediaQuery.matches || saveData) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const idleApi = window as unknown as IdleApi;
    const startLoading = () => {
      if (idleApi.requestIdleCallback) {
        idleId = idleApi.requestIdleCallback(() => setShouldLoadVideo(true), { timeout: 3000 });
      } else {
        timeoutId = globalThis.setTimeout(() => setShouldLoadVideo(true), 1500);
      }
    };

    if (document.readyState === "complete") startLoading();
    else window.addEventListener("load", startLoading, { once: true });

    return () => {
      window.removeEventListener("load", startLoading);
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
      if (idleId !== undefined) idleApi.cancelIdleCallback?.(idleId);
    };
  }, []);

  return (
    <>
      <Image
        src="/ieee-technical-event-hero.png"
        alt="IEEE Computer Society technical event"
        fill
        priority
        sizes="(max-width: 850px) 100vw, 50vw"
        style={{ objectFit: "cover" }}
      />
      {shouldLoadVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          className={`innerHeroVideo${videoReady ? " ready" : ""}`}
          onCanPlay={() => setVideoReady(true)}
        >
          <source src="/events-video.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}
