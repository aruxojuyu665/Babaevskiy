"use client";

import { useState, useRef, useMemo, useEffect, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { useIsDesktop } from "@/lib/animations";
import Image from "next/image";

// Lazy load R3F canvases — no SSR
const FabricSwatchCanvas = dynamic(() => import("@/components/r3f/FabricSwatchCanvas").then(m => ({ default: m.FabricSwatchCanvas })), { ssr: false });
const FurnitureViewerCanvas = dynamic(() => import("@/components/r3f/FurnitureViewerCanvas").then(m => ({ default: m.FurnitureViewerCanvas })), { ssr: false });

const FABRICS = [
  { id: "velvet", name: "Велюр", color: "#8B6544", preview: "/textures/velvet-warm.jpg" },
  { id: "leather", name: "Кожа", color: "#A0937D", preview: "/textures/leather-cognac.jpg" },
  { id: "linen", name: "Лён", color: "#C4B49A", preview: "/textures/fabric-swatches.jpg" },
] as const;

type FabricId = typeof FABRICS[number]["id"];

export function FabricShowcase() {
  const [activeFabric, setActiveFabric] = useState<FabricId>("velvet");
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const desktop = useIsDesktop();

  // Lazy render — only when section enters viewport
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
              Подберём идеальную ткань
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Более 1250 материалов на выбор
          </AnimatedHeading>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)]">
            Подберём идеальную ткань под ваш интерьер. Приезжайте в мастерскую — покажем каталог вживую.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* LEFT: Fabric swatches */}
          <div className="flex flex-row gap-4 lg:flex-col lg:gap-6">
            {FABRICS.map((fabric) => (
              <button
                key={fabric.id}
                onClick={() => setActiveFabric(fabric.id)}
                className="group flex-1 lg:flex-none"
              >
                <div
                  className="overflow-hidden rounded-2xl border-2 transition-all duration-300"
                  style={{
                    borderColor: activeFabric === fabric.id ? "var(--color-primary)" : "var(--border)",
                    boxShadow: activeFabric === fabric.id ? "var(--shadow-warm)" : "none",
                  }}
                >
                  {/* Swatch — 3D canvas on desktop, static image on mobile */}
                  <div className="aspect-square w-full">
                    {desktop && inView ? (
                      <FabricSwatchCanvas fabricId={fabric.id} />
                    ) : (
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          src={fabric.preview}
                          alt={fabric.name}
                          fill
                          className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                          sizes="200px"
                        />
                        {/* CSS wave overlay for mobile */}
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            background: `repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 8px,
                              rgba(255,255,255,0.1) 8px,
                              rgba(255,255,255,0.1) 9px
                            )`,
                            animation: "shimmer 3s ease-in-out infinite",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className="mt-2 text-center text-sm font-medium transition-colors"
                  style={{
                    color: activeFabric === fabric.id ? "var(--color-primary)" : "var(--text-secondary)",
                  }}
                >
                  {fabric.name}
                </p>
              </button>
            ))}
          </div>

          {/* RIGHT: 3D Furniture viewer */}
          <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-elevated)]" style={{ boxShadow: "var(--shadow-warm-lg)" }}>
            <div className="aspect-[4/3] w-full md:aspect-[16/10]">
              {desktop && inView ? (
                <FurnitureViewerCanvas activeFabric={activeFabric} />
              ) : (
                /* Mobile fallback — static image with fabric color buttons */
                <div className="relative h-full w-full">
                  <Image
                    src="/cases/case-2-after.jpg"
                    alt="Кресло"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                    {FABRICS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFabric(f.id)}
                        className="h-8 w-8 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: f.color,
                          borderColor: activeFabric === f.id ? "white" : "transparent",
                          transform: activeFabric === f.id ? "scale(1.2)" : "scale(1)",
                        }}
                        aria-label={f.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Label */}
            <div className="absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] backdrop-blur">
              Вращайте мышью
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
