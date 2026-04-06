"use client";

import { useState } from "react";

interface FocusCardsProps {
  children: React.ReactNode[];
}

export function FocusCards({ children }: FocusCardsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
      {children.map((child, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            filter: hovered !== null && hovered !== i ? "blur(4px)" : "none",
            opacity: hovered !== null && hovered !== i ? 0.5 : 1,
            transform: hovered === i ? "scale(1.02)" : "scale(1)",
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
