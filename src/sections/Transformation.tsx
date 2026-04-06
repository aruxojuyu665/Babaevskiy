"use client";

import { useEffect, useRef, useState } from "react";

export function Transformation() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop: scroll-driven video playback
  useEffect(() => {
    if (isMobile) return;

    async function setupScrollVideo() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const video = videoRef.current;
      if (!video) return;

      // Wait for video metadata
      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) {
          resolve();
        } else {
          video.addEventListener("loadedmetadata", () => resolve(), { once: true });
        }
      });

      const ctx = gsap.context(() => {
        // Scroll-driven video playback
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (video.duration) {
              video.currentTime = self.progress * video.duration;
            }
          },
        });

        // Text reveals synced to scroll
        const texts = sectionRef.current?.querySelectorAll("[data-transform-text]");
        texts?.forEach((text, i) => {
          const start = i * 25; // 0%, 25%, 50%, 75%
          const end = start + 20;

          gsap.fromTo(
            text,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `${start}% top`,
                end: `${end}% top`,
                scrub: 1,
              },
            }
          );

          // Fade out
          if (i < 3) {
            gsap.to(text, {
              opacity: 0,
              y: -20,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `${end + 2}% top`,
                end: `${end + 8}% top`,
                scrub: 1,
              },
            });
          }
        });
      }, sectionRef);

      return () => ctx.revert();
    }

    setupScrollVideo();
  }, [isMobile]);

  const SCROLL_TEXTS = [
    "Старая обивка? Не проблема.",
    "Разберём до каркаса",
    "Оденем в новую ткань",
    "Как новый. С гарантией.",
  ];

  return (
    <section
      ref={sectionRef}
      className={isMobile ? "relative" : "relative h-[400vh]"}
    >
      <div className={isMobile ? "relative" : "sticky top-0 h-screen overflow-hidden"}>
        {/* Video */}
        <video
          ref={videoRef}
          src="/video/sofa-transform.mp4"
          muted
          playsInline
          preload="auto"
          {...(isMobile ? { autoPlay: true, loop: true } : {})}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/40 via-transparent to-[var(--bg-primary)]/60" />

        {/* Text overlays */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isMobile ? (
            <div className="text-center px-4">
              <h2 className="font-serif text-3xl font-bold text-white drop-shadow-lg">
                Как новый.
                <br />С гарантией.
              </h2>
            </div>
          ) : (
            SCROLL_TEXTS.map((text, i) => (
              <div
                key={i}
                data-transform-text
                className="absolute inset-0 flex items-center justify-center opacity-0"
              >
                <div className="text-center px-4">
                  {/* Stitch line */}
                  <div className="mx-auto mb-4 w-16 stitch-divider" />
                  <h2 className="font-serif text-3xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-6xl">
                    {text}
                  </h2>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
