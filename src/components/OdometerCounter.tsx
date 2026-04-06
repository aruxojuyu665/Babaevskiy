"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface OdometerCounterProps {
  value: number;
  suffix?: string;
  label: string;
}

function OdometerDigit({ digit, delay }: { digit: number; delay: number }) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setTriggered(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="relative h-[1.2em] w-[0.65em] overflow-hidden">
      <motion.div
        className="flex flex-col"
        initial={{ y: 0 }}
        animate={triggered ? { y: `-${digit * 10}%` } : {}}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0 }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="flex h-[1.2em] items-center justify-center">
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function OdometerCounter({ value, suffix = "", label }: OdometerCounterProps) {
  const digits = String(value).split("").map(Number);

  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <div className="flex items-baseline font-serif text-3xl font-bold text-[var(--color-primary)] md:text-4xl">
        {digits.map((d, i) => (
          <OdometerDigit key={i} digit={d} delay={i * 80} />
        ))}
        {suffix && <span className="ml-0.5 text-2xl md:text-3xl">{suffix}</span>}
      </div>
      <span className="text-center text-sm text-[var(--text-secondary)] md:text-base">
        {label}
      </span>
    </div>
  );
}
