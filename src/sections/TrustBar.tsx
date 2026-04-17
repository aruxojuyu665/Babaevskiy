"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { OdometerCounter } from "@/components/OdometerCounter";

const ICONS: Record<string, React.ReactNode> = {
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  person: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

const STATS = [
  { icon: "star", value: 30, suffix: "+", label: "лет опыта мастеров" },
  { icon: "check", value: 21000, suffix: "+", label: "перетянутых изделий" },
  { icon: "person", value: 1, suffix: " мастер", label: "= 1 изделие" },
  { icon: "shield", prefix: "До ", value: 2, suffix: " лет", label: "гарантии на работы" },
] as const;

export function TrustBar() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-surface)]">
      {/* Soft ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(212,165,116,0.14) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:gap-8 md:py-14">
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2, delay: 0, ease: "easeOut" } }}
            className="group flex flex-col items-center gap-2 rounded-2xl px-2 py-3 transition-colors hover:bg-[var(--bg-primary)]/60"
          >
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)]/25 to-[var(--color-primary)]/20 text-[var(--text-accent)] transition-transform group-hover:scale-110">
              {ICONS[stat.icon]}
            </div>
            <OdometerCounter
              value={stat.value}
              prefix={"prefix" in stat ? stat.prefix : ""}
              suffix={stat.suffix}
              label={stat.label}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
