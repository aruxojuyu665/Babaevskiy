"use client";

import { useRef, useState } from "react";
import { useIsDesktop } from "@/lib/animations";

interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
}

export function Lens({ children, zoomFactor = 1.8, lensSize = 160 }: LensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const desktop = useIsDesktop();

  function handleMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  if (!desktop) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {/* Lens overlay */}
      {active && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white/40 shadow-2xl"
          style={{
            width: lensSize,
            height: lensSize,
            left: pos.x - lensSize / 2,
            top: pos.y - lensSize / 2,
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: containerRef.current?.offsetWidth || 0,
              height: containerRef.current?.offsetHeight || 0,
              left: -(pos.x * zoomFactor - lensSize / 2),
              top: -(pos.y * zoomFactor - lensSize / 2),
              transform: `scale(${zoomFactor})`,
              transformOrigin: "0 0",
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
