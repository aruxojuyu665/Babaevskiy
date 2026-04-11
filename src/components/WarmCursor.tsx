"use client";

import { useEffect, useRef, useState } from "react";

export function WarmCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const hoverScale = useRef(1);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only enable custom cursor on devices with fine pointer AND no reduced-motion preference.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    function onMouseMove(e: MouseEvent) {
      target.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as HTMLElement;
      const interactive = el.closest("a, button, [role='slider'], input, textarea, select");
      hoverScale.current = interactive ? 1.8 : 1;
    }

    function onMouseLeave() {
      target.current = { x: -100, y: -100 };
    }

    let frame: number;

    function animate() {
      // Fast follow — 0.35 lerp (almost immediate)
      pos.current.x += (target.current.x - pos.current.x) * 0.35;
      pos.current.y += (target.current.y - pos.current.y) * 0.35;

      if (dotRef.current) {
        dotRef.current.style.left = `${target.current.x - 4}px`;
        dotRef.current.style.top = `${target.current.y - 4}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${pos.current.x - 18}px`;
        ringRef.current.style.top = `${pos.current.y - 18}px`;
        ringRef.current.style.transform = `scale(${hoverScale.current})`;
      }

      frame = requestAnimationFrame(animate);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeave);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Dot — follows cursor exactly */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9998] h-2 w-2 rounded-full bg-[var(--color-primary)]"
        style={{ left: -100, top: -100 }}
      />
      {/* Ring — follows with slight delay, grows on hover */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[9997] h-9 w-9 rounded-full border-[1.5px] border-[var(--color-primary)]/40"
        style={{ left: -100, top: -100, transition: "transform 0.2s ease" }}
      />
      {/* Hide default cursor */}
      <style jsx global>{`
        @media (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
