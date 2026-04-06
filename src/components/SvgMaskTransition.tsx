"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/animations";

interface SvgMaskTransitionProps {
  children: React.ReactNode;
  /** "weave" = fabric threads spread apart, "circle" = expanding circle */
  variant?: "weave" | "circle";
}

export function SvgMaskTransition({ children, variant = "weave" }: SvgMaskTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !containerRef.current) return;

    let cleanup: (() => void) | undefined;

    async function setup() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      if (!container) return;

      const mask = container.querySelector("[data-mask-reveal]");
      if (!mask) return;

      const ctx = gsap.context(() => {
        if (variant === "weave") {
          // Animate horizontal lines spreading apart
          const lines = mask.querySelectorAll("rect");
          gsap.to(lines, {
            scaleY: 0,
            stagger: { each: 0.02, from: "center" },
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              end: "top 30%",
              scrub: 1,
            },
          });
        } else {
          // Circle expanding reveal
          const circle = mask.querySelector("circle");
          if (circle) {
            gsap.to(circle, {
              attr: { r: 1200 },
              ease: "power2.out",
              scrollTrigger: {
                trigger: container,
                start: "top 80%",
                end: "top 20%",
                scrub: 1,
              },
            });
          }
        }
      }, container);

      cleanup = () => ctx.revert();
    }

    setup();
    return () => cleanup?.();
  }, [reduced, variant]);

  const maskId = `mask-${variant}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div ref={containerRef} className="relative">
      {/* SVG mask definition */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          {variant === "weave" ? (
            <clipPath id={maskId} data-mask-reveal>
              {/* Horizontal lines that will scale to 0 to reveal content */}
              {Array.from({ length: 20 }, (_, i) => (
                <rect
                  key={i}
                  x="0"
                  y={`${i * 5}%`}
                  width="100%"
                  height="5%"
                  fill="white"
                />
              ))}
            </clipPath>
          ) : (
            <clipPath id={maskId} data-mask-reveal>
              <circle cx="50%" cy="50%" r="0" fill="white" />
            </clipPath>
          )}
        </defs>
      </svg>

      {/* Content with mask applied */}
      <div style={{ clipPath: reduced ? "none" : `url(#${maskId})` }}>
        {children}
      </div>
    </div>
  );
}
