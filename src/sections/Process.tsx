"use client";

import { useEffect, useRef } from "react";
import { PROCESS_STEPS } from "@/lib/constants";

export function Process() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-step]", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
          },
        });
        // Animate the thread line
        gsap.from("[data-thread-line]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
          },
        });
      }, ref);
      return () => ctx.revert();
    }
    animate();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Просто и понятно
          </p>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Как мы работаем
          </h2>
        </div>

        {/* Desktop timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Thread line */}
            <div
              data-thread-line
              className="stitch-divider absolute top-8 right-0 left-0"
            />

            <div className="relative grid grid-cols-5 gap-4">
              {PROCESS_STEPS.map((step) => (
                <div key={step.step} data-step className="flex flex-col items-center text-center">
                  {/* Circle */}
                  <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--bg-surface)] font-serif text-xl font-bold text-[var(--color-primary)]">
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

        {/* Mobile timeline */}
        <div className="md:hidden">
          <div className="relative border-l-2 border-dashed border-[var(--color-accent)] pl-8">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} data-step className="relative mb-8 last:mb-0">
                <div className="absolute -left-[calc(2rem+5px)] top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--bg-surface)] font-serif text-sm font-bold text-[var(--color-primary)]">
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
