"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/animations";

const LEFT_IMAGES = [
  "/cases/case-1-before.jpg",
  "/process/workshop-wide.jpg",
  "/cases/case-3-after.jpg",
  "/process/craftsman-hands.jpg",
];

const RIGHT_IMAGES = [
  "/cases/case-2-after.jpg",
  "/process/craftsman-working.jpg",
  "/cases/case-4-before.jpg",
  "/textures/fabric-swatches.jpg",
];

export function ParallaxGallery() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;

    let cleanup: (() => void) | undefined;

    async function setup() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.to("[data-parallax-left]", {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to("[data-parallax-right]", {
          y: 80,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }, ref);

      cleanup = () => ctx.revert();
    }

    setup();
    return () => cleanup?.();
  }, [reduced]);

  return (
    <section ref={ref} className="overflow-hidden bg-[var(--bg-surface)] py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* Left column — scrolls up */}
          <div data-parallax-left className="flex flex-col gap-4 md:gap-6">
            {LEFT_IMAGES.map((src, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 40vw"
                />
              </div>
            ))}
          </div>
          {/* Right column — scrolls down */}
          <div data-parallax-right className="flex flex-col gap-4 pt-12 md:gap-6 md:pt-20">
            {RIGHT_IMAGES.map((src, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 40vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
