"use client";

import { useEffect, useRef, useState } from "react";

interface OdometerCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

function SingleDigit({ digit, delay }: { digit: number; delay: number }) {
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
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{ height: "1.15em", width: "0.62em" }}
    >
      <div
        className="flex flex-col transition-transform duration-1000"
        style={{
          transform: triggered ? `translateY(-${digit * 10}%)` : "translateY(0%)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: `${delay}ms`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="flex items-center justify-center"
            style={{ height: "1.15em", lineHeight: "1.15em" }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OdometerCounter({ value, prefix = "", suffix = "", label }: OdometerCounterProps) {
  const digits = String(value).split("").map(Number);

  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <div className="flex items-baseline font-serif text-3xl font-bold text-[var(--text-accent)] md:text-4xl">
        {prefix && (
          <span className="mr-1 text-2xl md:text-3xl">{prefix}</span>
        )}
        {digits.map((d, i) => (
          <SingleDigit key={`${i}-${d}`} digit={d} delay={i * 120} />
        ))}
        {suffix && (
          <span className="ml-0.5 text-2xl md:text-3xl">{suffix}</span>
        )}
      </div>
      <span className="text-center text-sm text-[var(--text-secondary)] md:text-base">
        {label}
      </span>
    </div>
  );
}
