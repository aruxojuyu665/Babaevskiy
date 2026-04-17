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
  const cardRef = useRef<HTMLButtonElement>(null);

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

  function handleOpenContacts() {
    document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleOpenContacts}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${service.title} — перейти к контактам`}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-left transition-all duration-500 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-warm-lg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
      <div className="relative z-10 flex h-full flex-col">
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

        {/* Arrow link — pinned to bottom so cards align */}
        <div className="mt-auto flex items-center gap-2 pt-5 text-base font-medium text-[var(--text-accent)] transition-all duration-300 group-hover:gap-3">
          Подробнее
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
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
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              Что мы делаем
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Наши услуги
          </AnimatedHeading>
        </div>

        {/* Express banner — scrolls to calculator for fast booking */}
        <button
          type="button"
          onClick={() =>
            document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })
          }
          className="group mb-10 block w-full cursor-pointer overflow-hidden rounded-3xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-accent)]/5 to-transparent p-6 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/60 hover:shadow-[var(--shadow-warm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] md:mb-14 md:p-8"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-[var(--shadow-warm)] md:h-16 md:w-16">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-[var(--color-primary)]/40 [animation-duration:2.5s]" />
              <svg className="relative" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
                Экспресс-перетяжка
              </h3>
              <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                Для тех кому важна скорость — от заявки до выполнения всего несколько дней.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-base font-medium text-[var(--text-accent)] transition-all group-hover:gap-3">
              Оставить заявку
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

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
              className="h-full"
            >
              <SquishyCard className="h-full">
                <ServiceCard service={service} index={i} />
              </SquishyCard>
            </Tilt>
          ))}
        </FocusCards>
      </div>
    </section>
  );
}
