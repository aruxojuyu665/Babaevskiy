"use client";

import { useEffect, useState, useRef } from "react";

export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");
  const [progress, setProgress] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const duration = 2200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased * 100);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setPhase("reveal");
        setTimeout(() => setPhase("done"), 600);
      }
    }

    requestAnimationFrame(tick);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--bg-primary)]"
      style={{
        opacity: phase === "reveal" ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: phase === "reveal" ? "none" : "auto",
      }}
    >
      {/* Центральный блок */}
      <div className="flex flex-col items-center">
        {/* Нитка со стежком — SVG */}
        <div className="mb-10 w-56 md:w-72">
          <svg viewBox="0 0 300 40" fill="none" className="w-full">
            {/* Нитка — рисуется по мере загрузки */}
            <path
              ref={pathRef}
              d="M 20 20 C 60 6, 90 34, 130 20 C 170 6, 200 34, 240 20 C 260 12, 275 20, 280 20"
              stroke="#C4956A"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="320"
              strokeDashoffset={320 - (progress / 100) * 320}
            />
            {/* Стежки — появляются по мере прогресса */}
            {[80, 135, 190].map((x, i) => (
              <g key={i} opacity={progress > (i + 1) * 28 ? 1 : 0} style={{ transition: "opacity 0.4s" }}>
                <line x1={x - 4} y1="13" x2={x + 4} y2="27" stroke="#8B6544" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            ))}
            {/* Игла — движется вдоль нитки */}
            <g style={{ transform: `translateX(${(progress / 100) * 260}px)`, transition: "transform 0.15s linear" }}>
              <line x1="18" y1="17" x2="28" y2="23" stroke="#8B6544" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="19" cy="17.5" r="1.5" fill="none" stroke="#8B6544" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Название — плавное появление целиком */}
        <h1
          className="font-serif text-4xl font-bold text-[var(--text-primary)] md:text-5xl transition-all duration-700"
          style={{
            opacity: progress > 30 ? 1 : 0,
            transform: progress > 30 ? "translateY(0)" : "translateY(12px)",
          }}
        >
          Бабаевская
        </h1>
        <p
          className="mt-2 text-sm tracking-[0.3em] uppercase text-[var(--text-muted)] transition-all duration-700 delay-200"
          style={{
            opacity: progress > 50 ? 1 : 0,
            transform: progress > 50 ? "translateY(0)" : "translateY(8px)",
          }}
        >
          мастерская
        </p>

        {/* Полоска прогресса */}
        <div className="mt-10 h-[2px] w-40 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${progress}%`, transition: "width 0.15s linear" }}
          />
        </div>
      </div>
    </div>
  );
}
