"use client";

import { useEffect, useRef, useState } from "react";

export function WarmCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function onMouseMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as HTMLElement;
      const isInteractive = el.closest("a, button, [role='slider'], input, textarea, select, [data-magnetic]");
      setHovering(!!isInteractive);
    }

    function onMouseLeave() {
      setVisible(false);
    }

    function animate() {
      // Smooth follow
      pos.x += (target.x - pos.x) * 0.15;
      pos.y += (target.y - pos.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.x - 4}px, ${target.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.x - 20}px, ${pos.y - 20}px) scale(${hovering ? 1.5 : 1})`;
      }

      requestAnimationFrame(animate);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeave);
    animate();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [visible, hovering]);

  // Don't render on mobile/touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Small dot — follows exactly */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-2 w-2 rounded-full bg-[var(--color-primary)] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />
      {/* Outer ring — follows with delay */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] h-10 w-10 rounded-full border border-[var(--color-primary)]/30 transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Hide default cursor */}
      <style jsx global>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
