import { useEffect, useState } from "react";

/**
 * Create a GSAP context with ScrollTrigger, auto-cleanup on unmount.
 * Eliminates the repeated boilerplate of dynamic-importing gsap + registering plugins.
 */
export async function setupGsap() {
  const gsap = (await import("gsap")).default;
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

/**
 * Hook: returns true if user prefers reduced motion.
 * All animations should check this and skip/simplify accordingly.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/**
 * Hook: returns true only on desktop (fine pointer, no touch).
 */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    setDesktop(window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768);
  }, []);

  return desktop;
}
