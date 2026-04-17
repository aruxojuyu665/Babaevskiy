"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CASES } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";

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

  const handleMouseDown = () => {
    isDragging.current = true;
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const up = () => {
      isDragging.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full cursor-ew-resize overflow-hidden rounded-3xl select-none ring-1 ring-[var(--color-accent)]/20"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onDragStart={(e) => e.preventDefault()}
      role="slider"
      aria-label={`Сравнение до и после: ${title}`}
      aria-valuenow={Math.round(position)}
    >
      <div className="absolute inset-0">
        <Image
          src={after}
          alt={`${title} — после`}
          fill
          className="object-cover pointer-events-none"
          draggable={false}
          sizes="(max-width: 768px) 100vw, 70vw"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`${title} — до`}
          fill
          className="object-cover pointer-events-none"
          draggable={false}
          sizes="(max-width: 768px) 100vw, 70vw"
        />
      </div>

      {/* Labels top — БЫЛО / СТАЛО */}
      <div className="absolute top-5 left-5 z-10 rounded-full bg-[var(--color-dark)]/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
        Было
      </div>
      <div className="absolute top-5 right-5 z-10 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[var(--shadow-warm-sm)] backdrop-blur-sm">
        Стало
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--color-primary)] shadow-xl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3l-5 9 5 9" />
            <path d="M16 3l5 9-5 9" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function Cases() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = () => {
    setDirection(-1);
    setActive((a) => (a - 1 + CASES.length) % CASES.length);
  };
  const next = () => {
    setDirection(1);
    setActive((a) => (a + 1) % CASES.length);
  };

  // Auto-rotate every 6s
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActive((a) => (a + 1) % CASES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const leftIdx = (active - 1 + CASES.length) % CASES.length;
  const rightIdx = (active + 1) % CASES.length;

  return (
    <section
      id="cases"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 md:py-32"
    >
      {/* Warm light ambient matching site palette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.18) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(196,149,106,0.14) 0%, transparent 60%), linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-surface) 50%, var(--bg-primary) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-primary)]" />
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              Наши работы
            </p>
            <div className="h-px w-12 bg-[var(--color-primary)]" />
          </div>
          <AnimatedHeading className="font-serif text-4xl font-bold leading-[1.15] text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            Было → Стало
          </AnimatedHeading>
          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
            Потяните ползунок, чтобы увидеть разницу
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Side thumbs (desktop) */}
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-between lg:flex">
            <motion.button
              key={`left-${leftIdx}`}
              onClick={prev}
              whileHover={{ scale: 1.04, opacity: 0.7 }}
              className="pointer-events-auto relative aspect-[4/3] w-[22%] overflow-hidden rounded-2xl opacity-55 shadow-[var(--shadow-warm-sm)] ring-1 ring-[var(--color-primary)]/25 transition-opacity"
              aria-label="Предыдущий кейс"
            >
              <Image
                src={CASES[leftIdx].after}
                alt={CASES[leftIdx].title}
                fill
                className="object-cover"
                sizes="22vw"
              />
              <div className="absolute inset-0 bg-[var(--bg-primary)]/35" />
            </motion.button>
            <motion.button
              key={`right-${rightIdx}`}
              onClick={next}
              whileHover={{ scale: 1.04, opacity: 0.7 }}
              className="pointer-events-auto relative aspect-[4/3] w-[22%] overflow-hidden rounded-2xl opacity-55 shadow-[var(--shadow-warm-sm)] ring-1 ring-[var(--color-primary)]/25 transition-opacity"
              aria-label="Следующий кейс"
            >
              <Image
                src={CASES[rightIdx].after}
                alt={CASES[rightIdx].title}
                fill
                className="object-cover"
                sizes="22vw"
              />
              <div className="absolute inset-0 bg-[var(--bg-primary)]/35" />
            </motion.button>
          </div>

          {/* Center slider */}
          <div className="relative mx-auto w-full lg:w-[58%]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -direction * 60, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <BeforeAfterSlider
                  before={CASES[active].before}
                  after={CASES[active].after}
                  title={CASES[active].title}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrows + counter */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            onClick={prev}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-accent)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-warm-sm)] md:h-14 md:w-14"
            aria-label="Назад"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            <span className="text-[var(--text-accent)]">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="mx-2 text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-muted)]">
              {String(CASES.length).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={next}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-accent)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-warm-sm)] md:h-14 md:w-14"
            aria-label="Вперёд"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${active}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-6 text-center"
          >
            <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              {CASES[active].title}
            </h3>
            <p className="mt-2 text-base text-[var(--text-secondary)] md:text-lg">
              {CASES[active].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--color-primary)] px-10 py-4 text-base font-semibold text-white shadow-[var(--shadow-warm)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm-lg)] md:text-lg"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Смотреть все работы</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
