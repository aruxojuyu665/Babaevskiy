"use client";

import { useEffect, useRef } from "react";
import { SERVICES } from "@/lib/constants";

const ICONS: Record<string, React.ReactNode> = {
  sofa: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z" />
      <path d="M4 18v2" /><path d="M20 18v2" />
    </svg>
  ),
  layers: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  ),
  settings: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  tree: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 22v-2" /><path d="M9 18H4l4.5-6H5l7-9 7 9h-3.5L20 18h-5" />
      <path d="M12 22v-6" />
    </svg>
  ),
};

export function Services() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-service-card]", {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
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
    <section id="services" ref={ref} className="section-padding bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Что мы делаем
          </p>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Наши услуги
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              data-service-card
              className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-warm-lg)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                {ICONS[service.icon]}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
                {service.title}
              </h3>
              <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
