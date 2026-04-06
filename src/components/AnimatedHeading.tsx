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
        // Characters rise from behind a mask line
        const split = SplitText.create(el, {
          type: "chars",
          mask: "lines",
          autoSplit: true,
        });

        gsap.from(split.chars, {
          yPercent: 110,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.02,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
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
            start: "top 85%",
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
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
