"use client";

import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { FocusCards } from "@/components/ui/FocusCards";
import { SquishyCard } from "@/components/SquishyCard";
import Tilt from "react-parallax-tilt";

const ICONS: Record<string, React.ReactNode> = {
  sofa: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z" />
      <path d="M4 18v2" /><path d="M20 18v2" />
    </svg>
  ),
  layers: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  ),
  settings: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.18V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 15.09V15a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.68 9H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  tree: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 22v-2" /><path d="M9 18H4l4.5-6H5l7-9 7 9h-3.5L20 18h-5" />
      <path d="M12 22v-6" />
    </svg>
  ),
};

function ServiceCard({ service, index }: { service: typeof SERVICES[number]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Staggered delay based on index
          setTimeout(() => setIsVisible(true), index * 150);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 transition-all duration-500 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-warm-lg)]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0)"
          : "translateY(40px)",
        transition: `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      {/* Hover background glow */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-accent)]/5 transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 h-20 w-20 translate-x-10 -translate-y-10 rounded-full bg-[var(--color-primary)]/5 transition-all duration-500 group-hover:scale-150 group-hover:bg-[var(--color-primary)]/10" />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-400"
          style={{
            backgroundColor: isHovered ? 'var(--color-primary)' : 'rgba(196, 149, 106, 0.1)',
            color: isHovered ? 'white' : 'var(--color-primary)',
          }}
        >
          {ICONS[service.icon]}
        </div>

        <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
          {service.title}
        </h3>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          {service.description}
        </p>

        {/* Arrow link */}
        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition-all duration-300 group-hover:gap-3">
          Подробнее
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section id="services" className="section-padding bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[var(--color-primary)]/[0.03] blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[var(--color-accent)]/[0.03] blur-3xl" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
              Что мы делаем
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Наши услуги
          </AnimatedHeading>
        </div>

        {/* Cards grid — FocusCards blurs siblings on hover */}
        <FocusCards>
          {SERVICES.map((service, i) => (
            <Tilt
              key={service.id}
              tiltMaxAngleX={6}
              tiltMaxAngleY={6}
              glareEnable
              glareMaxOpacity={0.08}
              glareColor="var(--color-accent)"
              scale={1.01}
              transitionSpeed={600}
            >
              <SquishyCard>
                <ServiceCard service={service} index={i} />
              </SquishyCard>
            </Tilt>
          ))}
        </FocusCards>
      </div>
    </section>
  );
}
