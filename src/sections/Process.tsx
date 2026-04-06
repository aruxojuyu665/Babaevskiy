"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS_STEPS } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { useReducedMotion, useIsDesktop } from "@/lib/animations";

export function Process() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--bg-surface)]">
      {/* Header — always visible */}
      <div className="section-padding pb-0">
        <div className="mx-auto max-w-6xl">
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
        </div>
      </div>

      {/* Timeline content */}
      {desktop && !reduced ? <DesktopPinned /> : <MobileTimeline />}
    </section>
  );
}

/* ─── Desktop: GSAP pinned storytelling ─── */
function DesktopPinned() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function setup() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      if (!container) return;

      const steps = container.querySelectorAll("[data-process-step]");
      const progressLine = container.querySelector("[data-thread-progress]");

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 15%",
            end: `+=${PROCESS_STEPS.length * 600}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Animate thread line progress
        if (progressLine) {
          tl.to(progressLine, {
            scaleX: 1,
            duration: PROCESS_STEPS.length,
            ease: "none",
          }, 0);
        }

        // Animate each step sequentially
        steps.forEach((step, i) => {
          const circle = step.querySelector("[data-step-circle]");
          const content = step.querySelector("[data-step-content]");
          const stitch = step.querySelector("[data-step-stitch]");

          // Circle fills
          tl.to(circle, {
            backgroundColor: "var(--color-primary)",
            color: "white",
            borderColor: "var(--color-primary)",
            scale: 1.1,
            duration: 0.3,
            ease: "back.out(2)",
          }, i * 1);

          // Content reveals
          tl.from(content, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
          }, i * 1 + 0.1);

          // Stitch mark appears
          if (stitch) {
            tl.from(stitch, {
              scale: 0,
              opacity: 0,
              duration: 0.2,
              ease: "back.out(3)",
            }, i * 1 + 0.3);
          }

          // Hold for reading time, then dim (except last step)
          if (i < PROCESS_STEPS.length - 1) {
            tl.to(circle, {
              scale: 0.9,
              opacity: 0.5,
              duration: 0.3,
            }, (i + 1) * 1 - 0.2);
            tl.to(content, {
              opacity: 0.3,
              duration: 0.3,
            }, (i + 1) * 1 - 0.2);
          }
        });
      }, container);

      cleanup = () => ctx.revert();
    }

    setup();
    return () => cleanup?.();
  }, []);

  return (
    <div ref={containerRef} className="pb-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Thread line container */}
        <div className="relative mb-12">
          {/* Background thread (dashed) */}
          <div className="h-[2px] w-full bg-[var(--border)]" style={{
            backgroundImage: "repeating-linear-gradient(90deg, var(--border) 0, var(--border) 8px, transparent 8px, transparent 16px)"
          }} />
          {/* Active thread (solid, scales from left) */}
          <div
            data-thread-progress
            className="absolute top-0 left-0 h-[2px] w-full bg-[var(--color-primary)] origin-left"
            style={{ transform: "scaleX(0)" }}
          />
          {/* Stitch marks at step positions */}
          {PROCESS_STEPS.map((_, i) => (
            <div
              key={i}
              data-step-stitch
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${(i / (PROCESS_STEPS.length - 1)) * 100}%` }}
            >
              <div className="h-3 w-3 rotate-45 border border-[var(--color-primary)] bg-[var(--bg-surface)]" />
            </div>
          ))}
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-5 gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.step}
              data-process-step
              className="flex flex-col items-center text-center"
            >
              <div
                data-step-circle
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--bg-surface)] font-serif text-xl font-bold text-[var(--text-muted)] transition-colors"
              >
                {step.step}
              </div>
              <div data-step-content className="mt-4">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile: batch-triggered vertical timeline ─── */
function MobileTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let step = 0;
          const interval = setInterval(() => {
            step++;
            setActiveStep(step);
            if (step >= PROCESS_STEPS.length) clearInterval(interval);
          }, 400);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="px-4 pb-20 pt-4">
      <div className="mx-auto max-w-lg pl-10 relative">
        {/* Vertical thread */}
        <div className="absolute left-4 top-0 bottom-0 w-px">
          <div className="absolute inset-0 border-l-2 border-dashed border-[var(--border)]" />
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
            <div
              className="absolute -left-[26px] top-2 h-3 w-3 rotate-45 border transition-colors duration-500"
              style={{
                borderColor: "var(--color-primary)",
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
  );
}
