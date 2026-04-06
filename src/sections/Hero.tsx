"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // GSAP staggered reveal
    async function animate() {
      const gsap = (await import("gsap")).default;
      const ctx = gsap.context(() => {
        gsap.from("[data-hero-animate]", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        });
      }, sectionRef);
      return () => ctx.revert();
    }
    animate();
  }, []);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value));
  }

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
      alert("Ошибка отправки. Позвоните нам: " + BUSINESS.phone);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background — placeholder gradient until real photo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-primary)] to-[var(--bg-elevated)]" />
      {/* Workshop photo placeholder */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url(/process/workshop-hero.jpg)" }}
      />
      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center md:px-8">
        {/* Tagline */}
        <p
          data-hero-animate
          className="mb-4 font-accent text-lg italic text-[var(--color-primary)] md:text-xl"
        >
          Мастерская ручной работы
        </p>

        {/* Title */}
        <h1
          data-hero-animate
          className="font-serif text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-6xl lg:text-7xl"
        >
          Бабаевская
          <br />
          <span className="text-[var(--color-primary)]">мастерская</span>
        </h1>

        {/* Subtitle */}
        <p
          data-hero-animate
          className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-secondary)] md:text-xl"
        >
          Перетяжка мягкой мебели в Москве и МО.
          <br className="hidden sm:block" />
          Один мастер — одно изделие. Опыт от 6 до 30 лет.
        </p>

        {/* CTA */}
        <div data-hero-animate className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="magnetic-btn rounded-full bg-[var(--color-primary)] px-8 py-4 text-base font-medium text-white shadow-[var(--shadow-warm)] transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm-lg)]"
          >
            Рассчитать стоимость
          </button>
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center gap-2 rounded-full border-2 border-[var(--border)] px-8 py-4 text-base font-medium text-[var(--text-primary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <PhoneIcon />
            {BUSINESS.phone}
          </a>
        </div>

        {/* Mini callback form */}
        <div data-hero-animate className="mt-12">
          {submitted ? (
            <p className="text-base font-medium text-[var(--color-primary)]">
              Спасибо! Перезвоним в ближайшее время.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col items-center gap-3 sm:flex-row"
            >
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                className="w-full rounded-full border border-[var(--border)] bg-white/80 px-6 py-3.5 text-center text-base text-[var(--text-primary)] outline-none backdrop-blur transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 sm:text-left"
                maxLength={18}
              />
              <button
                type="submit"
                className="w-full whitespace-nowrap rounded-full bg-[var(--color-dark)] px-6 py-3.5 text-base font-medium text-white transition-all hover:bg-[var(--text-primary)] sm:w-auto"
              >
                Перезвоните мне
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)]">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
