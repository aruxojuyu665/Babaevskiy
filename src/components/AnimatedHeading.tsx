"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/animations";

interface AnimatedHeadingProps {
  children: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  /** "chars" = each letter rises from mask, "words" = each word fades up */
  variant?: "chars" | "words";
}

export function AnimatedHeading({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  variant = "chars",
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;

    let cleanup: (() => void) | undefined;

    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const el = ref.current;
      if (!el) return;

      if (variant === "chars") {
        // Characters rise from behind a mask line.
        // Wrap words around chars so browsers break only at word boundaries
        // (otherwise individual char spans allow mid-word line breaks).
        const split = SplitText.create(el, {
          type: "chars, words",
          mask: "lines",
          autoSplit: true,
          wordsClass: "inline-block align-baseline whitespace-nowrap",
        });

        gsap.from(split.chars, {
          yPercent: 110,
          // Hide chars before animation so translated glyphs can't bleed
          // into the element below when the mask doesn't clip perfectly.
          opacity: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.02,
          delay,
          scrollTrigger: {
            trigger: el,
            // Fire as soon as any part of the heading enters the viewport so
            // chars never sit in their translated "pre-reveal" state on screen.
            start: "top 98%",
            once: true,
          },
        });

        cleanup = () => {
          split.revert();
        };
      } else {
        // Words fade up
        const split = SplitText.create(el, {
          type: "words",
          autoSplit: true,
        });

        gsap.from(split.words, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.04,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 98%",
            once: true,
          },
        });

        cleanup = () => {
          split.revert();
        };
      }
    }

    animate();

    return () => cleanup?.();
  }, [reduced, variant, delay]);

  return (
    <Tag
      ref={ref}
      className={className}
      // Clip any glyph that slips past the line mask so translated chars
      // can't overlap the paragraph that follows the heading.
      style={{ overflow: "clip" }}
    >
      {children}
    </Tag>
  );
}
