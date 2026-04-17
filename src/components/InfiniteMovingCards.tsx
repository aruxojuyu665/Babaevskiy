"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface CardItem {
  id: number;
  name: string;
  text: string;
  furniture: string;
}

// Map review ID → avatar file number (gender-matched)
const AVATAR_MAP: Record<number, number> = {
  1: 1,   // Анна (Ж) → avatar-1 (Ж)
  2: 3,   // Михаил (М) → avatar-3 (М)
  3: 2,   // Елена (Ж) → avatar-2 (Ж)
  4: 25,  // Дмитрий (М) → avatar-25 (М)
  5: 5,   // Ольга (Ж) → avatar-5 (Ж)
  6: 26,  // Александр (М) → avatar-26 (М)
  7: 29,  // Ринат (М) → avatar-29 (М)
  8: 8,   // Лев (М) → avatar-8 (М)
  9: 9,   // Айгуль (Ж) → avatar-9 (Ж)
  10: 35, // Карен (М) → avatar-35 (М)
  11: 11, // Ирина (Ж) → avatar-11 (Ж)
  12: 12, // Нино (Ж) → avatar-12 (Ж)
  13: 44, // Руслан (М) → avatar-44 (М)
  14: 14, // Марина (Ж) → avatar-14 (Ж)
  15: 16, // Георгий (М) → avatar-16 (М)
  16: 17, // Эльдар (М) → avatar-17 (М)
  17: 4,  // Оксана (Ж) → avatar-4 (Ж)
  18: 18, // Данияр (М) → avatar-18 (М)
  19: 43, // Алсу (Ж) → avatar-43 (Ж)
  20: 19, // Семён (М) → avatar-19 (М)
  21: 21, // Зарина (Ж) → avatar-21 (Ж)
  22: 58, // Борис (М) → avatar-58 (М)
};

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
  const [duration, setDuration] = useState("60s");

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current) return;

    // Measure one copy of the track before duplicating so duration scales
    // with total content width — otherwise adding cards speeds things up.
    const scrollContent = scrollRef.current;
    const originalWidth = scrollContent.scrollWidth;

    // Duplicate items for seamless loop
    const items = Array.from(scrollContent.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      scrollContent.appendChild(clone);
    });

    const pxPerSec = speed === "slow" ? 25 : speed === "fast" ? 90 : 50;
    setDuration(`${Math.round(originalWidth / pxPerSec)}s`);
    setStarted(true);
  }, [speed]);

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
        {items.map((item) => {
          const avatarPhoto = `/avatars/avatar-${AVATAR_MAP[item.id] ?? item.id}.jpg`;
          return (
            <div
              key={item.id}
              className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-warm-sm)] transition-shadow hover:shadow-[var(--shadow-warm)] md:w-[360px]"
            >
              {/* Body */}
              <div className="flex flex-1 flex-col p-6">
                {/* Quote mark */}
                <svg className="mb-3 h-6 w-6 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="flex-1 font-accent text-base italic leading-relaxed text-[var(--text-primary)]">
                  {item.text}
                </p>

                {/* Author row */}
                <div className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-4">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-[var(--shadow-warm-sm)]">
                    <Image
                      src={avatarPhoto}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {item.furniture}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#f5b800]">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
