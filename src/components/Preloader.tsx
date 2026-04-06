"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Animate progress 0 → 100 over 2.5s
    const duration = 2500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - p) * (1 - p);
      setProgress(eased * 100);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        // Fade out after complete
        setTimeout(() => setHidden(true), 400);
      }
    }

    requestAnimationFrame(tick);
  }, []);

  if (hidden) return null;

  const fadeOut = progress >= 100;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? "none" : "auto" }}
    >
      {/* Needle + thread SVG animation */}
      <div className="relative mb-8 h-16 w-64">
        <svg viewBox="0 0 260 60" fill="none" className="h-full w-full">
          {/* Thread line — draws as progress increases */}
          <path
            d="M10 30 Q 40 10, 70 30 Q 100 50, 130 30 Q 160 10, 190 30 Q 220 50, 250 30"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="300"
            strokeDashoffset={300 - (progress / 100) * 300}
            className="transition-all duration-100"
          />
          {/* Stitch marks along the thread */}
          {[70, 130, 190].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1="22"
              x2={x}
              y2="38"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={progress > (i + 1) * 25 ? 1 : 0}
              className="transition-opacity duration-300"
            />
          ))}
          {/* Needle — moves along the path */}
          <g
            style={{
              transform: `translateX(${(progress / 100) * 240}px)`,
              transition: "transform 0.1s linear",
            }}
          >
            {/* Needle body */}
            <ellipse cx="10" cy="30" rx="8" ry="3" fill="var(--color-primary)" />
            {/* Needle eye */}
            <circle cx="6" cy="30" r="1" fill="var(--bg-primary)" />
            {/* Needle tip */}
            <path d="M18 30 L22 29 L22 31 Z" fill="var(--color-dark)" />
          </g>
        </svg>
      </div>

      {/* Brand name — reveals letter by letter */}
      <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        {"Бабаевская".split("").map((char, i) => (
          <span
            key={i}
            className="inline-block transition-all duration-300"
            style={{
              opacity: progress > (i / 10) * 80 + 10 ? 1 : 0,
              transform: progress > (i / 10) * 80 + 10 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {char}
          </span>
        ))}
      </h1>
      <p
        className="mt-1 text-xs tracking-[0.3em] uppercase text-[var(--text-muted)] transition-opacity duration-500"
        style={{ opacity: progress > 60 ? 1 : 0 }}
      >
        мастерская
      </p>

      {/* Progress bar */}
      <div className="mt-8 h-0.5 w-32 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
