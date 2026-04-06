"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { CASES } from "@/lib/constants";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  title: string;
}

function BeforeAfterSlider({ before, after, title }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const up = () => { isDragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full cursor-ew-resize overflow-hidden rounded-[var(--radius-lg)]"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      role="slider"
      aria-label={`Сравнение до и после: ${title}`}
      aria-valuenow={Math.round(position)}
    >
      {/* After (full background) */}
      <div className="absolute inset-0">
        <Image
          src={after}
          alt={`${title} — после`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {/* Before (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`${title} — до`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {/* Fabric curtain texture on the divider */}
      <div
        className="absolute top-0 bottom-0 z-10 w-6 -translate-x-1/2 pointer-events-none"
        style={{
          left: `${position}%`,
          background: `repeating-linear-gradient(
            180deg,
            rgba(196, 149, 106, 0.15) 0px,
            rgba(196, 149, 106, 0.05) 2px,
            transparent 2px,
            transparent 4px
          )`,
          backdropFilter: "blur(1px)",
        }}
      />
      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/80 shadow-lg"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--color-primary)] shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3l-5 9 5 9" /><path d="M16 3l5 9-5 9" />
          </svg>
        </div>
      </div>
      {/* Labels */}
      <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
        До
      </span>
      <span className="absolute bottom-3 right-3 z-10 rounded-full bg-[var(--color-primary)]/80 px-3 py-1 text-xs font-medium text-white">
        После
      </span>
    </div>
  );
}

export function Cases() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-cases-animate]", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
          },
        });
      }, ref);
      return () => ctx.revert();
    }
    animate();
  }, []);

  return (
    <section id="cases" ref={ref} className="section-padding bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center md:mb-16" data-cases-animate>
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Наши работы
          </p>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            До и после
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)]">
            Потяните ползунок, чтобы увидеть разницу
          </p>
        </div>

        <div data-cases-animate>
          <BeforeAfterSlider
            before={CASES[active].before}
            after={CASES[active].after}
            title={CASES[active].title}
          />
        </div>

        {/* Case selector */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {CASES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                i === active
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
          {CASES[active].description}
        </p>
      </div>
    </section>
  );
}
