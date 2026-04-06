"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/animations";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

export function TextRevealByWord({ text, className = "" }: TextRevealByWordProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const words = text.split(" ");

  useEffect(() => {
    if (reduced || !containerRef.current) return;

    let cleanup: (() => void) | undefined;

    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const el = containerRef.current;
      if (!el) return;

      const wordEls = el.querySelectorAll("[data-reveal-word]");

      const ctx = gsap.context(() => {
        gsap.to(wordEls, {
          opacity: 1,
          color: "var(--text-primary)",
          stagger: { each: 1 / wordEls.length },
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }, el);

      cleanup = () => ctx.revert();
    }

    animate();
    return () => cleanup?.();
  }, [reduced, words.length]);

  return (
    <div ref={containerRef} className={className}>
      <p className="font-accent text-xl leading-relaxed md:text-2xl lg:text-3xl">
        {words.map((word, i) => (
          <span
            key={i}
            data-reveal-word
            className="inline-block mr-[0.3em] transition-none"
            style={{ opacity: 0.15, color: "var(--text-muted)" }}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}
