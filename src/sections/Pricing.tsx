"use client";

import { useEffect, useRef } from "react";
import { PRICING } from "@/lib/constants";

interface PriceTableProps {
  title: string;
  items: readonly { name: string; price: string }[];
}

function PriceTable({ title, items }: PriceTableProps) {
  return (
    <div data-pricing-card className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4">
        <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between px-6 py-4">
            <span className="text-base text-[var(--text-secondary)]">{item.name}</span>
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
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-pricing-card]", {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
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
    <section id="pricing" ref={ref} className="section-padding bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Прозрачные цены
          </p>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Стоимость работ
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)]">
            Указаны ориентировочные цены на работу. Стоимость ткани рассчитывается отдельно.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <PriceTable title="Диваны" items={PRICING.sofas} />
          <PriceTable title="Кресла" items={PRICING.chairs} />
          <PriceTable title="Другая мебель" items={PRICING.other} />
        </div>

        <div className="mt-10 text-center">
          <p className="mb-4 text-base text-[var(--text-secondary)]">
            Точную стоимость рассчитаем после осмотра мебели
          </p>
          <button
            onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm)]"
          >
            Узнать точную стоимость
          </button>
        </div>
      </div>
    </section>
  );
}
