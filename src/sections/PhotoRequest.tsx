"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { BUSINESS } from "@/lib/constants";

const STEPS = [
  { n: 1, text: "Сделайте фото мебели со всех сторон" },
  { n: 2, text: "Нажмите одну из кнопок ниже" },
  { n: 3, text: "Отправьте фото — и получите расчёт" },
] as const;

interface ChatMessage {
  readonly side: "in" | "out";
  readonly delay: number;
  readonly w: string;
  readonly h: string;
  readonly label?: string;
}

const CHAT_MESSAGES: readonly ChatMessage[] = [
  { side: "out", delay: 0.6, w: "w-40", h: "h-24", label: "📷" },
  { side: "in", delay: 1.1, w: "w-28", h: "h-3" },
  { side: "in", delay: 1.4, w: "w-20", h: "h-3" },
  { side: "out", delay: 1.9, w: "w-32", h: "h-14" },
  { side: "in", delay: 2.4, w: "w-24", h: "h-3" },
] as const;

export function PhotoRequest() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [8, -2]);
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 md:py-32"
    >
      {/* Warm light gradient base matching site palette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 20%, rgba(212,165,116,0.20) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(196,149,106,0.16) 0%, transparent 55%), linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-surface) 50%, var(--bg-primary) 100%)",
        }}
      />

      {/* Animated copper blobs */}
      <motion.div
        style={{ y: blob1Y }}
        className="absolute -top-40 -left-20 h-[32rem] w-[32rem] rounded-full bg-[var(--color-primary)]/[0.10] blur-3xl"
      />
      <motion.div
        style={{ y: blob2Y }}
        className="absolute -bottom-40 right-0 h-[36rem] w-[36rem] rounded-full bg-[var(--color-accent)]/[0.08] blur-3xl"
      />

      {/* Corner ornaments */}
      <div className="absolute left-8 top-8 h-20 w-20 border-l border-t border-[var(--color-accent)]/40" />
      <div className="absolute right-8 bottom-8 h-20 w-20 border-r border-b border-[var(--color-accent)]/40" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-4 md:grid-cols-[1.15fr_1fr] md:px-8">
        {/* Left — content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-10 bg-[var(--color-primary)]" />
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              быстрый расчёт
            </p>
          </div>

          {/* Title with staggered word reveal */}
          <h2 className="mb-8 font-serif text-4xl font-bold leading-[1.18] text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            {[
              "Пришлите",
              "фото",
              "вашей",
              "мебели",
              "в",
              "Telegram",
              "или",
              "Max",
              "— и мы",
              "рассчитаем",
              "стоимость",
            ].map((word, i) => {
              const isHighlight = word === "Telegram" || word === "Max";
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.15 + i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={
                    isHighlight
                      ? "mr-3 inline-block bg-gradient-to-r from-[var(--color-dark)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text pb-[0.14em] text-transparent"
                      : "mr-3 inline-block"
                  }
                >
                  {word}
                </motion.span>
              );
            })}
          </h2>

          {/* Steps with staggered circles */}
          <motion.ol
            className="mb-10 space-y-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } },
            }}
          >
            {STEPS.map((step) => (
              <motion.li
                key={step.n}
                className="flex items-start gap-4"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] font-serif text-lg font-bold text-white shadow-[var(--shadow-warm-sm)]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary)]/30 [animation-duration:3s]" />
                  <span className="relative">{step.n}</span>
                </span>
                <span className="pt-1.5 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
                  {step.text}
                </span>
              </motion.li>
            ))}
          </motion.ol>

          {/* Buttons */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.a
              href={BUSINESS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#0088cc] px-8 py-4 text-lg font-semibold text-white shadow-[0_12px_40px_rgba(0,136,204,0.35)] transition-colors hover:bg-[#0099dd]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="relative">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="relative">Написать в ТГ</span>
            </motion.a>
            <motion.a
              href={BUSINESS.max}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#1FA5F9] via-[#5B7BF7] to-[#B84AC5] px-8 py-4 text-lg font-semibold text-white shadow-[0_12px_40px_rgba(91,123,247,0.35)] transition-all hover:shadow-[0_16px_50px_rgba(184,74,197,0.45)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex h-7 w-7 overflow-hidden rounded-md">
                <Image src="/max-logo.png" alt="Max" width={28} height={28} />
              </span>
              <span className="relative">Написать в Макс</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Right — animated phone mockup */}
        <div className="relative mx-auto hidden md:block">
          {/* Orbiting glow */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-primary)]/20" />
            <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/70 blur-[2px]" />
          </motion.div>

          <motion.div
            style={{ y: phoneY, rotate: phoneRotate }}
            className="relative h-[500px] w-[260px]"
          >
            {/* Float animation wrapper */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full"
            >
              <div className="relative h-full w-full rounded-[40px] border-[10px] border-[var(--color-dark)] bg-[var(--bg-surface)] shadow-[0_30px_70px_-15px_rgba(139,101,68,0.35),0_0_60px_-10px_rgba(196,149,106,0.25)]">
                {/* Notch */}
                <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-[var(--color-dark)]" />

                {/* Screen */}
                <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-white via-[var(--bg-primary)] to-[var(--bg-surface)]">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[10px] font-semibold text-[var(--text-secondary)]">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>●●●</span>
                    </div>
                  </div>

                  {/* Chat header */}
                  <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white/70 px-4 pt-3 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] font-serif text-sm font-bold text-white">
                      Б
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 w-24 rounded-full bg-[var(--text-primary)]/80" />
                      <div className="mt-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <div className="h-1.5 w-12 rounded-full bg-emerald-500/50" />
                      </div>
                    </div>
                  </div>

                  {/* Chat body */}
                  <div className="flex flex-1 flex-col gap-2.5 p-4">
                    {CHAT_MESSAGES.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.side === "out" ? 20 : -20, scale: 0.9 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: msg.delay,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={
                          msg.side === "out"
                            ? "ml-auto flex items-center justify-center rounded-2xl rounded-br-sm bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-2xl shadow-md"
                            : "rounded-2xl rounded-bl-sm bg-white shadow-sm"
                        }
                        style={{
                          width:
                            msg.w === "w-40"
                              ? "10rem"
                              : msg.w === "w-32"
                              ? "8rem"
                              : msg.w === "w-28"
                              ? "7rem"
                              : msg.w === "w-24"
                              ? "6rem"
                              : "5rem",
                          height:
                            msg.h === "h-24"
                              ? "6rem"
                              : msg.h === "h-14"
                              ? "3.5rem"
                              : "0.75rem",
                        }}
                      >
                        {msg.label && (
                          <span className="drop-shadow-sm">{msg.label}</span>
                        )}
                      </motion.div>
                    ))}
                    {/* Typing indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.8 }}
                      className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-2 self-start"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating sparks */}
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 top-16 h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_20px_rgba(212,165,116,0.8)]"
          />
          <motion.div
            animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-6 bottom-24 h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_16px_rgba(196,149,106,0.7)]"
          />
          <motion.div
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute right-4 -bottom-2 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_18px_rgba(212,165,116,0.8)]"
          />
        </div>
      </div>
    </section>
  );
}
