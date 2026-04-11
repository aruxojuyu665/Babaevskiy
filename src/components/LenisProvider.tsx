"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";

interface LenisProviderProps {
  children: React.ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip smooth scroll on touch devices (perf) and for users who prefer reduced motion.
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarsePointer || prefersReduced) return;

    let disposed = false;
    let tickerFn: ((time: number) => void) | null = null;
    let gsapRef: typeof import("gsap").default | null = null;

    async function init() {
      const [{ default: LenisCtor }, gsapMod, scrollTriggerMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      const gsap = gsapMod.default;
      const { ScrollTrigger } = scrollTriggerMod;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      const lenis = new LenisCtor({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        autoRaf: false,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      tickerFn = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    init();

    return () => {
      disposed = true;
      if (gsapRef && tickerFn) {
        gsapRef.ticker.remove(tickerFn);
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
