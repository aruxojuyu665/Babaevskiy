"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";
import { AnimatedHeading } from "@/components/AnimatedHeading";

export function Contacts() {
  const ref = useRef<HTMLElement>(null);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidRussianPhone(phone)) return;

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "callback" }),
      });
      setSubmitted(true);
      setPhone("");
    } catch {
      alert("Ошибка. Позвоните нам: " + BUSINESS.phone);
    }
  }

  return (
    <section id="contacts" ref={ref} className="section-padding bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <p className="mb-2 font-accent text-base italic text-[var(--text-accent)]">
            Свяжитесь с нами
          </p>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Контакты
          </AnimatedHeading>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info + mini form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-6">
              {/* Phone — with pulse */}
              <motion.div whileHover={{ x: 4 }} className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--text-accent)]">
                  <span className="absolute inset-0 animate-ping rounded-xl bg-[var(--color-primary)]/20 [animation-duration:2s]" />
                  <svg className="relative" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-[var(--text-muted)]">Телефон</p>
                  <a href={BUSINESS.phoneHref} className="flex min-h-[44px] items-center text-lg font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--text-accent)]">
                    {BUSINESS.phone}
                  </a>
                </div>
              </motion.div>

              {/* Address — pin bounce */}
              <motion.div whileHover={{ x: 4 }} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--text-accent)]">
                  <motion.svg
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </motion.svg>
                </div>
                <div>
                  <p className="text-base font-medium text-[var(--text-muted)]">Адрес</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{BUSINESS.address}</p>
                </div>
              </motion.div>

              {/* Hours — clock hand rotates */}
              <motion.div whileHover={{ x: 4 }} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--text-accent)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    {/* Static hour hand */}
                    <line x1="12" y1="12" x2="15" y2="13" strokeWidth="1.8" />
                    {/* Rotating minute hand — pivoted on circle center */}
                    <motion.line
                      x1="12"
                      y1="12"
                      x2="12"
                      y2="6.5"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
                    />
                    {/* Center pivot dot */}
                    <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-[var(--text-muted)]">Режим работы</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{BUSINESS.workingHours}</p>
                </div>
              </motion.div>

              {/* Messenger buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={BUSINESS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#229ED9] px-6 py-3 text-base font-medium text-[#229ED9] transition-all hover:bg-[#229ED9] hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Написать в Telegram
                </a>
                <a
                  href={BUSINESS.max}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1FA5F9] via-[#5B7BF7] to-[#B84AC5] px-6 py-3 text-base font-medium text-white transition-all hover:brightness-110"
                >
                  <span className="relative flex h-5 w-5 overflow-hidden rounded">
                    <Image src="/max-logo.png" alt="Max" width={20} height={20} />
                  </span>
                  Написать в Max
                </a>
              </div>
            </div>

            {/* Mini callback form */}
            <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Перезвоним за 5 минут
              </h3>
              {submitted ? (
                <p className="text-base font-medium text-[var(--text-accent)]">
                  Спасибо! Скоро перезвоним.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="+7 (___) ___-__-__"
                    maxLength={18}
                    className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-[var(--radius)] bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--color-dark)]"
                  >
                    Позвоните мне
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-warm-sm)]"
          >
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A&source=constructorLink&ll=37.785926%2C55.814598&z=17&pt=37.785926%2C55.814598%2Cpm2rdm"
              width="100%"
              height="100%"
              className="min-h-[350px] lg:min-h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Карта — Бабаевская мастерская"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
