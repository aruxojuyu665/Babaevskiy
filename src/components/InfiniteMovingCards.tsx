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

// Number of times the item list is rendered back-to-back in the track.
// Three copies give a full trackWidth of slack for manual drag in either
// direction beyond the auto-scroll's canonical range, so the user never
// runs out of cards when dragging against the auto-scroll direction.
const COPIES = 3;

function wrapToCanonical(v: number, w: number): number {
  // Canonical range for x: (-2w, 0]. In this range the viewport always
  // renders the middle copy of items. Shifting x by ±w is invisible because
  // all COPIES contain identical cards in identical order.
  if (w <= 0) return v;
  let r = v;
  while (r > 0) r -= w;
  while (r <= -2 * w) r += w;
  return r;
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
  const initializedRef = useRef(false);

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
    const node = trackRef.current;
    if (!node) return;
    const measure = () => {
      const w = node.scrollWidth / COPIES;
      setTrackWidth(w);
      // On first measurement, place x at the middle copy so both
      // directions have a full trackWidth of drag slack.
      if (!initializedRef.current && w > 0) {
        x.set(-w);
        initializedRef.current = true;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [items, x]);

  useAnimationFrame((_, delta) => {
    // Skip entirely while dragging/hovered — writing x during Framer's pointer
    // handling fights the drag and causes visible jitter. Normalization runs
    // on pointer-up instead.
    if (paused || reducedMotion || !trackWidth) return;
    const step = (pxPerSec * delta) / 1000;
    const next = wrapToCanonical(x.get() + step * dir, trackWidth);
    x.set(next);
  });

  function handlePointerRelease() {
    // After drag ends, fold x back into (-2W, 0]. With COPIES=3 this snap
    // is guaranteed invisible because every copy renders identical cards.
    if (trackWidth) {
      const v = x.get();
      const wrapped = wrapToCanonical(v, trackWidth);
      if (wrapped !== v) x.set(wrapped);
    }
    setPaused(false);
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
        onPointerUp={handlePointerRelease}
        onPointerCancel={handlePointerRelease}
        onHoverStart={() => setPaused(true)}
        onHoverEnd={() => setPaused(false)}
      >
        {Array.from({ length: COPIES }).flatMap((_, copyIdx) =>
          items.map((item) => (
            <ReviewCard key={`${item.id}-${copyIdx}`} item={item} />
          ))
        )}
      </motion.div>
    </div>
  );
}
