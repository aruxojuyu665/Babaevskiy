"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
}

function AnimatedCounter({ end, suffix = "", label }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 2000;
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 px-4">
      <span className="font-serif text-3xl font-bold text-[var(--color-primary)] md:text-4xl">
        {count}
        {suffix}
      </span>
      <span className="text-center text-sm text-[var(--text-secondary)] md:text-base">
        {label}
      </span>
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="relative border-y border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:gap-8 md:py-14">
        <AnimatedCounter end={30} suffix="+" label="лет опыта мастеров" />
        <AnimatedCounter end={1000} suffix="+" label="перетянутых изделий" />
        <AnimatedCounter end={1} suffix=" мастер" label="= 1 изделие" />
        <AnimatedCounter end={2} suffix=" года" label="гарантия на работы" />
      </div>
    </section>
  );
}
