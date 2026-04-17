"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { PRICING, PRICING_META } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";

type IconKey = "sofa" | "armchair" | "pillow";

const CATEGORY_ICONS: Record<IconKey, React.ReactNode> = {
  sofa: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 20V14a4 4 0 0 0-4-4H12a4 4 0 0 0-4 4v6" />
      <path d="M4 22v10a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V22a4 4 0 0 0-8 0v4H12v-4a4 4 0 0 0-8 0z" />
      <path d="M10 36v4M38 36v4" />
    </svg>
  ),
  armchair: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v10" />
      <path d="M8 26a4 4 0 0 1 8 0v6h16v-6a4 4 0 0 1 8 0v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" />
      <path d="M14 38v4M34 38v4" />
    </svg>
  ),
  pillow: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14c0-2 2-4 4-4h24c2 0 4 2 4 4v20c0 2-2 4-4 4H12c-2 0-4-2-4-4z" />
      <path d="M12 10c4 4 20 4 24 0M12 38c4-4 20-4 24 0" />
    </svg>
  ),
};

interface PriceCardProps {
  title: string;
  items: readonly { name: string; price: string }[];
  icon: IconKey;
  note: string;
  delay: number;
}

function PriceCard({ title, items, icon, note, delay }: PriceCardProps) {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <Tilt
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        glareEnable
        glareMaxOpacity={0.1}
        glareColor="#D4A574"
        scale={1.01}
        transitionSpeed={600}
        className="h-full"
      >
        <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-warm-sm)] transition-shadow duration-500 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-warm-lg)] md:p-10">
          {/* Icon badge */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-accent)]/10 text-[var(--text-accent)] transition-transform group-hover:scale-105">
            {CATEGORY_ICONS[icon]}
          </div>

          <h3 className="mb-6 font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            {title}
          </h3>

          <ul className="mb-6 space-y-3">
            {items.map((item, i) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[var(--text-accent)]"
                >
                  <motion.path
                    d="M20 6 9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
                  />
                </svg>
                <span className="flex-1 text-base">{item.name}</span>
                <span className="whitespace-nowrap text-base font-bold text-[var(--text-primary)]">
                  {item.price}
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-auto border-t border-dashed border-[var(--border)] pt-4">
            <p className="text-sm font-semibold italic text-[var(--text-accent)]">
              {note}
            </p>
          </div>
        </div>
      </Tilt>
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
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              Прозрачные цены
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Стоимость работ
          </AnimatedHeading>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
            Указаны ориентировочные цены на работу. Стоимость ткани рассчитывается отдельно.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <PriceCard
            title="Диваны"
            items={PRICING.sofas}
            icon={PRICING_META.sofas.icon}
            note={PRICING_META.sofas.note}
            delay={0}
          />
          <PriceCard
            title="Кресла и стулья"
            items={PRICING.chairs}
            icon={PRICING_META.chairs.icon}
            note={PRICING_META.chairs.note}
            delay={150}
          />
          <PriceCard
            title="Другая мебель"
            items={PRICING.other}
            icon={PRICING_META.other.icon}
            note={PRICING_META.other.note}
            delay={300}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="mb-5 text-base text-[var(--text-secondary)] md:text-lg">
            Точную стоимость рассчитаем после замера мебели
          </p>
          <button
            onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative overflow-hidden rounded-full bg-[var(--color-primary)] px-10 py-4 text-base font-semibold text-white transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm)] md:text-lg"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Уточнить точную стоимость</span>
          </button>
        </div>
      </div>
    </section>
  );
}
