"use client";

import { useState, useEffect, useRef } from "react";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";

export function Contacts() {
  const ref = useRef<HTMLElement>(null);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-contacts-animate]", {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        });
      }, ref);
      return () => ctx.revert();
    }
    animate();
  }, []);

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
        <div className="mb-12 text-center" data-contacts-animate>
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Свяжитесь с нами
          </p>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Контакты
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info + mini form */}
          <div data-contacts-animate>
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">Телефон</p>
                  <a href={BUSINESS.phoneHref} className="text-lg font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--color-primary)]">
                    {BUSINESS.phone}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">Адрес</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{BUSINESS.address}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">Режим работы</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{BUSINESS.workingHours}</p>
                </div>
              </div>

              {/* Telegram */}
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
            </div>

            {/* Mini callback form */}
            <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Перезвоним за 5 минут
              </h3>
              {submitted ? (
                <p className="text-base font-medium text-[var(--color-primary)]">
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
          </div>

          {/* Map */}
          <div data-contacts-animate className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A&source=constructorLink&ll=37.565478%2C55.831362&z=15&pt=37.565478%2C55.831362%2Cpm2rdm"
              width="100%"
              height="100%"
              className="min-h-[350px] lg:min-h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Карта — Бабаевская мастерская"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
