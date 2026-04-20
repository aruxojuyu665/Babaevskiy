"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";

interface CardItem {
  id: number;
  name: string;
  text: string;
  furniture: string;
}

const AVATAR_MAP: Record<number, number> = {
  1: 1, 2: 3, 3: 2, 4: 25, 5: 5, 6: 26, 7: 29, 8: 8, 9: 9, 10: 35, 11: 11,
  12: 12, 13: 44, 14: 14, 15: 16, 16: 17, 17: 4, 18: 18, 19: 43, 20: 19,
  21: 21, 22: 58,
};

interface InfiniteMovingCardsProps {
  items: readonly CardItem[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

function ReviewCard({ item }: { item: CardItem }) {
  const avatarPhoto = `/avatars/avatar-${AVATAR_MAP[item.id] ?? item.id}.jpg`;
  return (
    <div
      className="pointer-events-auto flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-warm-sm)] md:w-[360px]"
      // prevent native image drag interfering with pan gesture
      draggable={false}
    >
      <div className="flex flex-1 flex-col p-6">
        <svg
          className="mb-3 h-6 w-6 text-[var(--color-accent)]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="flex-1 font-accent text-base italic leading-relaxed text-[var(--text-primary)]">
          {item.text}
        </p>
        <div className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-4">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-[var(--shadow-warm-sm)]">
            <Image
              src={avatarPhoto}
              alt={item.name}
              fill
              className="object-cover"
              sizes="44px"
              draggable={false}
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
                <svg
                  key={i}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-[#f5b800]"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  className = "",
}: InfiniteMovingCardsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const x = useMotionValue(0);

  const pxPerSec = speed === "slow" ? 25 : speed === "fast" ? 90 : 50;
  const dir = direction === "left" ? -1 : 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!trackRef.current) return;
    // Track holds items rendered twice (see JSX). One copy's width = half.
    const measure = () => {
      if (!trackRef.current) return;
      setTrackWidth(trackRef.current.scrollWidth / 2);
    };
    measure();
    // Re-measure on resize (card widths respond to md: breakpoint)
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [items]);

  useAnimationFrame((_, delta) => {
    if (paused || reducedMotion || !trackWidth) return;
    const step = (pxPerSec * delta) / 1000;
    let next = x.get() + step * dir;
    // seamless wrap — x lives in (-trackWidth, 0] when dir=-1, [0, trackWidth) when dir=1
    if (next <= -trackWidth) next += trackWidth;
    if (next >= trackWidth) next -= trackWidth;
    x.set(next);
  });

  function normalize() {
    // clamp x back into [-trackWidth, trackWidth] so auto-scroll wraps cleanly
    if (!trackWidth) return;
    const v = x.get();
    if (v <= -trackWidth) x.set(v + trackWidth);
    else if (v >= trackWidth) x.set(v - trackWidth);
  }

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <motion.div
        ref={trackRef}
        className="flex w-max cursor-grab gap-4 select-none active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragElastic={0}
        dragMomentum={true}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => {
          normalize();
          setPaused(false);
        }}
        onPointerCancel={() => setPaused(false)}
        onHoverStart={() => setPaused(true)}
        onHoverEnd={() => setPaused(false)}
      >
        {[...items, ...items].map((item, i) => (
          <ReviewCard key={`${item.id}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
