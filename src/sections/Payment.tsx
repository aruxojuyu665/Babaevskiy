"use client";

import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

function CashIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <motion.rect
        x="4" y="12" width="40" height="24" rx="3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.circle
        cx="24" cy="24" r="5"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4, ease: "backOut" }}
      />
      <circle cx="11" cy="24" r="1" fill="currentColor" />
      <circle cx="37" cy="24" r="1" fill="currentColor" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <motion.rect
        x="4" y="10" width="40" height="28" rx="3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.line
        x1="4" y1="20" x2="44" y2="20"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ transformOrigin: "left" }}
      />
      <motion.line
        x1="10" y1="30" x2="20" y2="30"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{ transformOrigin: "left" }}
      />
    </svg>
  );
}

const METHODS = [
  {
    title: "Наличными",
    text: "Принимаем оплату наличными при получении готовой мебели",
    Icon: CashIcon,
  },
  {
    title: "Безналичный расчёт",
    text: "По счёту для организаций или картой — принимаем любые варианты",
    Icon: CardIcon,
  },
] as const;

export function Payment() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] py-20 md:py-24">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(212,165,116,0.10) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center md:mb-14"
        >
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-[var(--color-primary)]" />
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              удобно для всех
            </p>
            <div className="h-px w-10 bg-[var(--color-primary)]" />
          </div>
          <h2 className="font-serif text-4xl font-bold leading-[1.15] text-[var(--text-primary)] md:text-5xl">
            Способы оплаты
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
          }}
        >
          {METHODS.map((m) => (
            <motion.div
              key={m.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="h-full"
            >
              <Tilt
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                glareEnable
                glareMaxOpacity={0.12}
                glareColor="#D4A574"
                scale={1.02}
                transitionSpeed={800}
                className="h-full"
              >
                <article className="group relative h-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-warm-sm)] transition-shadow hover:shadow-[var(--shadow-warm-lg)] md:p-10">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-primary)]/20 text-[var(--text-accent)] transition-transform group-hover:scale-105">
                    <m.Icon />
                  </div>
                  <h3 className="mb-3 font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
                    {m.title}
                  </h3>
                  <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                    {m.text}
                  </p>
                  <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-[var(--color-primary)]/[0.04] blur-3xl transition-all group-hover:bg-[var(--color-primary)]/[0.12]" />
                </article>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
