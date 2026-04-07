"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { useIsDesktop } from "@/lib/animations";
import Image from "next/image";

// Single Canvas — lazy loaded, no SSR
const FabricShowcaseCanvas = dynamic(
  () => import("@/components/r3f/FabricShowcaseCanvas").then((m) => ({ default: m.FabricShowcaseCanvas })),
  { ssr: false }
);

const FABRICS = [
  { id: "velvet", name: "Велюр", desc: "Мягкий, бархатистый", preview: "/models/fabric-textures/velvet/color.jpg" },
  { id: "leather", name: "Кожа", desc: "Натуральная кожа", preview: "/models/fabric-textures/leather/color.jpg" },
  { id: "linen", name: "Лён", desc: "Лёгкий, дышащий", preview: "/models/fabric-textures/linen/color.jpg" },
  { id: "wool", name: "Шерсть", desc: "Шерсть ёлочка", preview: "/models/fabric-textures/wool/color.jpg" },
  { id: "fleece", name: "Флис", desc: "Вязаный флис", preview: "/models/fabric-textures/fleece/color.jpg" },
] as const;

export function FabricShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const desktop = useIsDesktop();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-[var(--bg-surface)] overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
              Более 1250 материалов
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Подберём ткань под ваш интерьер
          </AnimatedHeading>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-secondary)]">
            От классики до модерна. Потрогайте, чтобы почувствовать.
          </p>
        </div>

        {/* Desktop: single R3F Canvas with 5 planes */}
        {desktop && inView ? (
          <div className="relative" style={{ cursor: "grab" }}>
            <div className="h-[440px] w-full">
              <FabricShowcaseCanvas />
            </div>
            {/* Labels positioned under each plane */}
            <div className="mt-4 grid grid-cols-5 gap-4">
              {FABRICS.map((f) => (
                <div key={f.id} className="text-center">
                  <p className="text-base font-semibold text-[var(--text-primary)]">{f.name}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile: horizontal scroll with static images + CSS breathe */
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
            {FABRICS.map((f) => (
              <div key={f.id} className="shrink-0 snap-center" style={{ width: "240px" }}>
                <div className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(139,101,68,0.15)] hover:-translate-y-1">
                  <Image
                    src={f.preview}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="240px"
                    style={{ animation: "breathe 6s ease-in-out infinite" }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-base font-semibold text-[var(--text-primary)]">{f.name}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            className="group inline-flex items-center gap-2 text-base font-medium text-[var(--color-primary)] transition-all hover:gap-3"
          >
            Смотреть весь каталог
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
