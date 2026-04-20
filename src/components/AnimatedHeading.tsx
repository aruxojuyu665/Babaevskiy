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
    const el = ref.current;
    if (reduced || !el) return;

    let played = false;
    let cleanup: (() => void) | undefined;

    async function play() {
      if (played) return;
      played = true;

      const [{ default: gsap }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/SplitText"),
      ]);
      gsap.registerPlugin(SplitText);

      if (!el) return;

      if (variant === "chars") {
        // No `mask: "lines"` — SplitText's line mask uses overflow:hidden,
        // which clips font descenders ("у", "р", "д") in serif fonts even
        // after animation ends. Instead, fade chars in (opacity 0 → 1) so
        // they're invisible while translating, and never bleed above either.
        const split = SplitText.create(el, {
          type: "chars, words",
          autoSplit: true,
          wordsClass: "inline-block align-baseline whitespace-nowrap",
        });
        gsap.from(split.chars, {
          yPercent: 40,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.02,
          delay,
        });
        cleanup = () => split.revert();
      } else {
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
        });
        cleanup = () => split.revert();
      }
    }

    // IntersectionObserver fires reliably on any scroll mechanism (manual,
    // Lenis smooth, Lenis immediate jump). ScrollTrigger depends on scroll
    // events that Lenis's `immediate: true` does not always emit.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px -2% 0px", threshold: 0.01 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cleanup?.();
    };
  }, [reduced, variant, delay]);

  return (
    <Tag
      ref={ref}
      className={className}
      // `line-height: 1.15` reserves enough vertical space for serif descenders
      // (у, р, д, ц, щ) without growing the block visually much. Default
      // Tailwind text-* utilities pair a 1.2 line-height with serif fonts,
      // which clips descenders in Playfair Display.
      style={{ lineHeight: 1.15, paddingBottom: "0.1em" }}
    >
      {children}
    </Tag>
  );
}
