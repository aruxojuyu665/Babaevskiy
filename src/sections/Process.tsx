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

    let cleanup: (() => void) | undefined;

    async function setup() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!el) return;
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          end: "bottom 30%",
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        });
      }, el as Element);

      cleanup = () => ctx.revert();
    }

    setup();
    return () => cleanup?.();
  }, []);

  const activeStep = Math.floor(progress * PROCESS_STEPS.length);

  return (
    <section ref={ref} className="section-padding bg-[var(--bg-surface)] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[var(--color-primary)]/[0.02] blur-3xl" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
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
                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 font-serif text-lg font-bold transition-all duration-500"
                    style={{
                      borderColor: activeStep >= i ? "var(--color-primary)" : "var(--border)",
                      backgroundColor: activeStep >= i ? "var(--color-primary)" : "var(--bg-surface)",
                      color: activeStep >= i ? "white" : "var(--text-muted)",
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

        {/* Mobile vertical timeline */}
        <div className="md:hidden">
          <div className="relative pl-10">
            <div className="absolute left-4 top-0 bottom-0 w-px">
              <div className="absolute inset-0 border-l-2 border-dashed border-[var(--border)]" />
              <div
                className="absolute top-0 left-0 w-full border-l-2 border-[var(--color-primary)] transition-all duration-700"
                style={{ height: `${Math.min(progress * 120, 100)}%` }}
              />
            </div>

            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.step}
                className="relative mb-10 last:mb-0 transition-all duration-500"
                style={{
                  opacity: activeStep >= i ? 1 : 0.35,
                  transform: activeStep >= i ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                <div
                  className="absolute -left-[26px] top-2 h-3 w-3 rotate-45 border transition-colors duration-500"
                  style={{
                    borderColor: "var(--color-primary)",
                    backgroundColor: activeStep >= i ? "var(--color-primary)" : "var(--bg-surface)",
                  }}
                />
                <div
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full font-serif text-sm font-bold transition-all duration-500 mb-2"
                  style={{
                    backgroundColor: activeStep >= i ? "var(--color-primary)" : "var(--bg-elevated)",
                    color: activeStep >= i ? "white" : "var(--text-muted)",
                  }}
                >
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
