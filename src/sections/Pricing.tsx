"use client";

import { useEffect, useRef, useState } from "react";
import { PRICING } from "@/lib/constants";

interface PriceTableProps {
  title: string;
  items: readonly { name: string; price: string }[];
  delay: number;
}

function PriceTable({ title, items, delay }: PriceTableProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
      }}
    >
      <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4">
        <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {items.map((item) => (
          <div key={item.name} className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-primary)]/[0.03]">
            <span className="text-base text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{item.name}</span>
            <span className="whitespace-nowrap font-semibold text-[var(--color-primary)]">
              {item.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
              Прозрачные цены
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Стоимость работ
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)]">
            Указаны ориентировочные цены на работу. Стоимость ткани рассчитывается отдельно.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <PriceTable title="Диваны" items={PRICING.sofas} delay={0} />
          <PriceTable title="Кресла" items={PRICING.chairs} delay={150} />
          <PriceTable title="Другая мебель" items={PRICING.other} delay={300} />
        </div>

        <div className="mt-10 text-center">
          <p className="mb-4 text-base text-[var(--text-secondary)]">
            Точную стоимость рассчитаем после осмотра мебели
          </p>
          <button
            onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative overflow-hidden rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-base font-medium text-white transition-all hover:shadow-[var(--shadow-warm)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Узнать точную стоимость</span>
          </button>
        </div>
      </div>
    </section>
  );
}
