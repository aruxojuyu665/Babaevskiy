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
          className="h-full transition-transform duration-300"
          style={{
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
