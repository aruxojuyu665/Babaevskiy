"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS_STEPS } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const DURATION_MS = 2000;
    let rafId = 0;
    let started = false;
    let startedAt = 0;

    // Ease-out cubic — fast fill at first, settles gently at the end.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(now: number) {
      const t = Math.min(1, (now - startedAt) / DURATION_MS);
      setProgress(ease(t));
      if (t < 1) rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            startedAt = performance.now();
            rafId = requestAnimationFrame(tick);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const activeStep = Math.floor(progress * PROCESS_STEPS.length);

  return (
    <section ref={ref} className="section-padding bg-[var(--bg-surface)] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[var(--color-primary)]/[0.02] blur-3xl" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              Просто и понятно
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Как мы работаем
          </AnimatedHeading>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Thread line */}
            <div className="relative mb-10 h-[2px]">
              <div className="absolute inset-0" style={{
                backgroundImage: "repeating-linear-gradient(90deg, var(--border) 0, var(--border) 8px, transparent 8px, transparent 16px)"
              }} />
              <div
                className="absolute top-0 left-0 h-full bg-[var(--color-primary)] transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progress * 120, 100)}%` }}
              />
              {/* Stitch marks */}
              {PROCESS_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{ left: `${(i / (PROCESS_STEPS.length - 1)) * 100}%` }}
                >
                  <div
                    className="h-3 w-3 rotate-45 border transition-colors duration-500"
                    style={{
                      borderColor: "var(--color-primary)",
                      backgroundColor: activeStep >= i ? "var(--color-primary)" : "var(--bg-surface)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="grid grid-cols-5 gap-6">
              {PROCESS_STEPS.map((step, i) => (
                <div
                  key={step.step}
                  className="flex flex-col items-center text-center transition-all duration-500"
                  style={{
                    opacity: activeStep >= i ? 1 : 0.35,
                    transform: activeStep >= i ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 font-serif text-lg font-bold transition-all duration-500"
                    style={{
                      borderColor: activeStep >= i ? "var(--color-primary)" : "var(--border)",
                      backgroundColor: activeStep >= i ? "var(--color-primary)" : "var(--bg-surface)",
                      color: activeStep >= i ? "white" : "var(--text-muted)",
                      boxShadow: activeStep === i ? "0 0 0 6px rgba(196,149,106,0.2), 0 8px 24px rgba(196,149,106,0.35)" : "none",
                    }}
                  >
                    {activeStep === i && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary)]/30" />
                    )}
                    <span className="relative">{step.step}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline — line passes through the centre of the
            numbered circles (circle: 32px wide at left:0 → center x=16px;
            line: 2px wide at left:15px → center x=16px). */}
        <div className="md:hidden">
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5">
              <div className="absolute inset-0 border-l-2 border-dashed border-[var(--border)]" />
              <div
                className="absolute top-0 left-0 w-full border-l-2 border-[var(--color-primary)] transition-all duration-700"
                style={{ height: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>

            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.step}
                className="relative mb-10 last:mb-0 pl-12 transition-all duration-500"
                style={{
                  opacity: activeStep >= i ? 1 : 0.35,
                  transform: activeStep >= i ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                <div
                  className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full font-serif text-sm font-bold transition-all duration-500"
                  style={{
                    backgroundColor: activeStep >= i ? "var(--color-primary)" : "var(--bg-elevated)",
                    color: activeStep >= i ? "white" : "var(--text-muted)",
                    boxShadow: "0 0 0 4px var(--bg-surface)",
                  }}
                >
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-1 text-base text-[var(--text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
