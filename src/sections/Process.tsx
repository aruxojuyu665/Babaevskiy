"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS_STEPS } from "@/lib/constants";

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate steps one by one
          let step = 0;
          const interval = setInterval(() => {
            step++;
            setActiveStep(step);
            if (step >= PROCESS_STEPS.length) clearInterval(interval);
          }, 400);
          observer.disconnect();
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-[var(--bg-surface)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[var(--color-primary)]/[0.02] blur-3xl" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
              Просто и понятно
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Как мы работаем
          </h2>
        </div>

        {/* Desktop: horizontal thread timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Thread line (SVG wavy stitch) */}
            <svg
              className="absolute top-[28px] left-0 right-0 h-4 w-full"
              viewBox="0 0 1000 16"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Background thread */}
              <path
                d="M0 8 Q 50 2, 100 8 Q 150 14, 200 8 Q 250 2, 300 8 Q 350 14, 400 8 Q 450 2, 500 8 Q 550 14, 600 8 Q 650 2, 700 8 Q 750 14, 800 8 Q 850 2, 900 8 Q 950 14, 1000 8"
                stroke="var(--border)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              {/* Active thread — draws as steps activate */}
              <path
                d="M0 8 Q 50 2, 100 8 Q 150 14, 200 8 Q 250 2, 300 8 Q 350 14, 400 8 Q 450 2, 500 8 Q 550 14, 600 8 Q 650 2, 700 8 Q 750 14, 800 8 Q 850 2, 900 8 Q 950 14, 1000 8"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeDasharray="1200"
                strokeDashoffset={1200 - (activeStep / PROCESS_STEPS.length) * 1200}
                className="transition-all duration-1000 ease-out"
              />
              {/* Stitch marks at step positions */}
              {PROCESS_STEPS.map((_, i) => {
                const x = (i / (PROCESS_STEPS.length - 1)) * 1000;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="16"
                    stroke={activeStep > i ? "var(--color-primary)" : "var(--border)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            <div className="relative grid grid-cols-5 gap-4 pt-0">
              {PROCESS_STEPS.map((step, i) => (
                <div
                  key={step.step}
                  className="flex flex-col items-center text-center transition-all duration-700"
                  style={{
                    opacity: activeStep > i ? 1 : 0.3,
                    transform: activeStep > i ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  {/* Circle with number */}
                  <div
                    className="z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 font-serif text-lg font-bold transition-all duration-500"
                    style={{
                      borderColor: activeStep > i ? "var(--color-primary)" : "var(--border)",
                      backgroundColor: activeStep > i ? "var(--color-primary)" : "var(--bg-surface)",
                      color: activeStep > i ? "white" : "var(--text-muted)",
                    }}
                  >
                    {step.step}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical thread timeline */}
        <div className="md:hidden">
          <div className="relative pl-10">
            {/* Vertical thread */}
            <div className="absolute left-4 top-0 bottom-0 w-px">
              {/* Background dashed thread */}
              <div className="absolute inset-0 border-l-2 border-dashed border-[var(--border)]" />
              {/* Active thread */}
              <div
                className="absolute top-0 left-0 w-full border-l-2 border-[var(--color-primary)] transition-all duration-1000"
                style={{ height: `${(activeStep / PROCESS_STEPS.length) * 100}%` }}
              />
            </div>

            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.step}
                className="relative mb-10 last:mb-0 transition-all duration-500"
                style={{
                  opacity: activeStep > i ? 1 : 0.3,
                  transform: activeStep > i ? "translateX(0)" : "translateX(-10px)",
                }}
              >
                {/* Stitch mark */}
                <div className="absolute -left-[26px] top-2 h-3 w-3 rotate-45 border border-[var(--color-primary)] bg-[var(--bg-surface)] transition-colors duration-500"
                  style={{
                    backgroundColor: activeStep > i ? "var(--color-primary)" : "var(--bg-surface)",
                  }}
                />
                <div
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full font-serif text-sm font-bold transition-all duration-500 mb-2"
                  style={{
                    backgroundColor: activeStep > i ? "var(--color-primary)" : "var(--bg-elevated)",
                    color: activeStep > i ? "white" : "var(--text-muted)",
                  }}
                >
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
