"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";
import { useAntiBot } from "@/components/AntiBot";
import { ConsentNotice } from "@/components/ConsentNotice";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import toast from "react-hot-toast";

const BENEFITS = [
  {
    title: "Договор с гарантией",
    text: "Оформим официальный договор с прописанными обязательствами",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Гарантия качества",
    text: "Работаем только с проверенными материалами и мастерами",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Чёткие сроки",
    text: "Пропишем точную стоимость и сроки — без сюрпризов",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Полный отчёт",
    text: "Предоставим фотоотчёт и все документы по завершении",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
] as const;

export function Corporate() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { HoneypotField, getAntiBotPayload } = useAntiBot();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidRussianPhone(phone)) {
      toast.error("Введите корректный номер телефона");
      return;
    }
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "corporate", ...getAntiBotPayload() }),
      });
      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !data?.success) {
        toast.error(
          data?.error || "Не удалось отправить. Позвоните нам: " + BUSINESS.phone
        );
        return;
      }
      toast.success("Заявка принята — мы свяжемся с вами в ближайшее время");
      setSubmitted(true);
      setPhone("");
    } catch {
      toast.error("Не удалось отправить. Позвоните нам: " + BUSINESS.phone);
    }
  }

  return (
    <section id="corporate" className="relative overflow-hidden bg-[var(--bg-surface)] py-24 md:py-32">
      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(212,165,116,0.14) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(196,149,106,0.12) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center md:mb-14"
        >
          <SectionEyebrow lineColor="--color-primary">для организаций</SectionEyebrow>
          <h2 className="font-serif text-4xl font-bold leading-[1.15] text-[var(--text-primary)] md:text-5xl lg:text-6xl">
            Работаем с организациями
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            Составим индивидуальное коммерческое предложение для организаций и физических лиц. Рестораны, отели, офисы — перетяжка в объёме.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <motion.div
          className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
          }}
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-warm)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/15 text-[var(--text-accent)] transition-transform group-hover:scale-110">
                {b.icon}
              </div>
              <h3 className="mb-2 font-serif text-lg font-bold text-[var(--text-primary)]">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {b.text}
              </p>
              <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-[var(--color-primary)]/[0.05] blur-2xl transition-all group-hover:bg-[var(--color-primary)]/[0.12]" />
            </motion.div>
          ))}
        </motion.div>

        {/* Discount banner + form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border-2 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-accent)]/10 to-transparent p-8 md:p-12"
        >
          {/* Animated glow orbs */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-0 -z-0"
          >
            <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-[var(--color-primary)]/15 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-[var(--color-accent)]/15 blur-3xl" />
          </motion.div>

          <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-[var(--shadow-warm-sm)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m6 3-1 2h14l-1-2zm0 4L4 22h16L18 7z" />
                </svg>
                Спецпредложение
              </motion.div>
              <h3 className="mb-2 font-serif text-2xl font-bold leading-tight text-[var(--text-primary)] md:text-3xl">
                Дополнительная скидка для корпоративных клиентов
              </h3>
              <p className="text-base text-[var(--text-secondary)] md:text-lg">
                Оставьте номер — мы перезвоним и согласуем условия
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-8">
            {submitted ? (
              <div className="rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--bg-primary)] p-5 text-center">
                <p className="text-base font-medium text-[var(--text-accent)]">
                  Спасибо! Свяжемся в ближайшее время с индивидуальным предложением.
                </p>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col items-stretch gap-3 sm:flex-row"
                >
                  <HoneypotField />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="+7 (___) ___-__-__"
                    className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-4 text-center text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 sm:text-left"
                    maxLength={18}
                  />
                  <button
                    type="submit"
                    className="group relative overflow-hidden whitespace-nowrap rounded-full bg-[var(--color-primary)] px-8 py-4 text-base font-semibold text-white shadow-[var(--shadow-warm)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm-lg)]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">Получить предложение</span>
                  </button>
                </form>
                <ConsentNotice buttonLabel="Получить предложение" />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
