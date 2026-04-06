"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollVideoPlayer } from "@/components/ScrollVideoPlayer";

const FRAME_COUNT = 121;
const FRAMES_PATH = "/frames";

const SCROLL_TEXTS = [
  "Старая обивка? Не проблема.",
  "Разберём до каркаса",
  "Оденем в новую ткань",
  "Как новый. С гарантией.",
];

export function Transformation() {
  const [isMobile, setIsMobile] = useState(false);
  const mobileRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return <MobileTransformation ref={mobileRef} />;
  }

  return <DesktopTransformation />;
}

/* ─── Desktop: Canvas scroll-driven ─── */
function DesktopTransformation() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function setupTextAnimations() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const texts = sectionRef.current?.querySelectorAll("[data-transform-text]");
        texts?.forEach((text, i) => {
          const start = i * 25;
          const end = start + 18;

          gsap.fromTo(
            text,
            { y: 40, opacity: 0 },
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

          if (i < 3) {
            gsap.to(text, {
              opacity: 0,
              y: -30,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `${end + 2}% top`,
                end: `${end + 7}% top`,
                scrub: 1,
              },
            });
          }
        });
      }, sectionRef);

      return () => ctx.revert();
    }

    setupTextAnimations();
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      {/* Canvas scroll player — occupies 400vh */}
      <ScrollVideoPlayer frameCount={FRAME_COUNT} framesPath={FRAMES_PATH} />

      {/* Text overlays — positioned absolutely over the sticky canvas */}
      <div className="pointer-events-none absolute inset-0">
        {SCROLL_TEXTS.map((text, i) => (
          <div
            key={i}
            data-transform-text
            className="sticky top-0 flex h-screen items-center justify-center opacity-0"
          >
            <div className="text-center px-4">
              <div className="mx-auto mb-4 w-16 stitch-divider" />
              <h2 className="font-serif text-3xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-6xl">
                {text}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Mobile: Autoplay video ─── */
import { forwardRef } from "react";

const MobileTransformation = forwardRef<HTMLElement>(function MobileTransformation(_, ref) {
  return (
    <section ref={ref} className="relative aspect-video w-full overflow-hidden">
      <video
        src="/video/sofa-transform.mp4"
        muted
        autoPlay
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/30 via-transparent to-[var(--bg-primary)]/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="mx-auto mb-3 w-12 stitch-divider" />
          <h2 className="font-serif text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
            Как новый.
            <br />
            С гарантией.
          </h2>
        </div>
      </div>
    </section>
  );
});
