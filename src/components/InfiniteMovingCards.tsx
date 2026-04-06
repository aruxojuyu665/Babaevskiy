"use client";

import { useEffect, useRef, useState } from "react";

interface CardItem {
  id: number;
  name: string;
  text: string;
  furniture: string;
}

interface InfiniteMovingCardsProps {
  items: readonly CardItem[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  className = "",
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current) return;

    // Duplicate items for seamless loop
    const scrollContent = scrollRef.current;
    const items = Array.from(scrollContent.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      scrollContent.appendChild(clone);
    });

    setStarted(true);
  }, []);

  const duration = speed === "slow" ? "60s" : speed === "fast" ? "20s" : "35s";
  const dir = direction === "left" ? "normal" : "reverse";

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        ref={scrollRef}
        className="flex w-max gap-4 hover:[animation-play-state:paused]"
        style={{
          animation: started ? `scroll ${duration} linear infinite ${dir}` : "none",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[300px] shrink-0 rounded-2xl border border-[var(--border)] bg-white/50 p-6 backdrop-blur-sm md:w-[350px]"
          >
            {/* Quote mark */}
            <svg className="mb-3 h-6 w-6 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="font-accent text-base italic leading-relaxed text-[var(--text-primary)]">
              {item.text}
            </p>
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.furniture}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
