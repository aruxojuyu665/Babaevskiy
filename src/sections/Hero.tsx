"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone, scrollToSection } from "@/lib/utils";
import { MagneticButton } from "@/components/MagneticButton";
import { TextGenerateEffect } from "@/components/TextGenerateEffect";
import { RotatingText } from "@/components/RotatingText";
import { useIsDesktop } from "@/lib/animations";
import dynamic from "next/dynamic";

// FabricRipple is a decorative 2D canvas effect only shown on pointer:fine.
// Lazy-loaded to avoid hydrating canvas code + rAF loops on mobile.
const FabricRipple = dynamic(
  () => import("@/components/FabricRipple").then((m) => ({ default: m.FabricRipple })),
  { ssr: false }
);

// Delay for the subtitle word-by-word reveal. The default (2.8s) is tuned to
// uncover right as the Preloader fades away. On any device where the Preloader
// is skipped (see Preloader.tsx) the subtitle would otherwise sit blank for
// ~3s before animating in, which on mobile feels broken.
const SUBTITLE_DELAY_WITH_PRELOADER = 2.8;
const SUBTITLE_DELAY_WITHOUT_PRELOADER = 0.25;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useState(SUBTITLE_DELAY_WITH_PRELOADER);
  const desktop = useIsDesktop();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Mirror Preloader.tsx skip conditions. If the preloader isn't going to
    // run, the subtitle should reveal immediately.
    const seen = window.sessionStorage.getItem("babaevskaya:preloader-seen");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const mobileUa = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (seen || reduced || coarse || narrow || mobileUa) {
      setSubtitleDelay(SUBTITLE_DELAY_WITHOUT_PRELOADER);
    }
  }, []);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Staggered entrance
        gsap.from("[data-hero-animate]", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        });

        // Parallax on background image
        gsap.to("[data-hero-parallax]", {
          y: 80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
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
      {/* Background image with parallax (LCP element). */}
      <div data-hero-parallax className="absolute inset-0 scale-110">
        <Image
          src="/process/workshop-hero.jpg"
          alt="Мастерская"
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="(max-width: 414px) 100vw, (max-width: 828px) 100vw, 100vw"
          quality={60}
        />
      </div>

      {/* Warm overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/80 via-[var(--bg-primary)]/60 to-[var(--bg-primary)]/90" />

      {/* Fabric ripple — ткань дышит за курсором (desktop only, lazy-mounted) */}
      {desktop && (
        <div className="absolute inset-0 hidden md:block" style={{ pointerEvents: "none" }}>
          <FabricRipple />
        </div>
      )}

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 h-32 w-32 animate-[float_6s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)]/[0.06] blur-2xl" />
      <div className="absolute bottom-40 right-10 h-40 w-40 animate-[float_8s_ease-in-out_infinite_1s] rounded-full bg-[var(--color-accent)]/[0.06] blur-2xl" />
      <div className="absolute top-1/3 right-1/4 h-24 w-24 animate-[float_7s_ease-in-out_infinite_2s] rounded-full bg-[var(--color-warm)]/[0.05] blur-xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center md:px-8">
        {/* Tagline with decorative elements */}
        <div data-hero-animate className="mx-auto mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-[var(--color-accent)]/50" />
          <p className="font-accent text-lg italic text-[var(--text-accent)] md:text-xl">
            Мастерская ручной работы
          </p>
          <div className="h-px w-8 bg-[var(--color-accent)]/50" />
        </div>

        {/* Title — LCP element; painted immediately, subtle CSS fade only. */}
        <h1
          className="font-serif text-5xl font-bold leading-tight text-[var(--text-primary)] md:text-7xl lg:text-8xl hero-title-fade"
        >
          Бабаевская
          <br />
          <span className="animated-gradient-text">
            мастерская
          </span>
        </h1>

        {/* Subtitle — words appear one by one after preloader. min-h reserves
            vertical space so the CTA row below doesn't shift as words populate. */}
        <div data-hero-animate className="mx-auto mt-6 max-w-2xl min-h-[3.5rem]">
          <TextGenerateEffect
            text="Перетяжка мягкой мебели в Москве и МО. Один мастер — одно изделие. Опыт более 30 лет."
            className="text-lg font-semibold text-[var(--text-primary)] [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] md:text-xl"
            delay={subtitleDelay}
          />
        </div>

        {/* Rotating text */}
        <div data-hero-animate className="mt-4 min-h-[1.75rem]">
          <RotatingText
            prefix="Мы реставрируем"
            words={["диваны", "кресла", "стулья", "пуфы", "кровати"]}
            className="text-base font-medium text-[var(--text-secondary)] md:text-lg"
          />
        </div>

        {/* CTA Buttons */}
        <div data-hero-animate className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <MagneticButton
            onClick={() => scrollToSection("calculator")}
            className="group relative overflow-hidden rounded-full bg-[var(--color-primary)] px-8 py-4 text-base font-medium text-white shadow-[var(--shadow-warm)] transition-all hover:shadow-[var(--shadow-warm-lg)]"
          >
            {/* Button shine effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Рассчитать стоимость</span>
          </MagneticButton>
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center gap-3 rounded-full border-2 border-[var(--color-primary)] bg-[var(--bg-primary)]/80 px-8 py-4 text-lg font-bold text-[var(--text-accent)] backdrop-blur transition-all hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-warm-sm)]"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--color-primary)]" />
            </span>
            {BUSINESS.phone}
          </a>
        </div>

        {/* Mini callback form */}
        <div data-hero-animate className="mt-12">
          {submitted ? (
            <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--bg-surface)]/80 p-4 backdrop-blur">
              <p className="text-base font-medium text-[var(--text-accent)]">
                Спасибо! Перезвоним в ближайшее время.
              </p>
            </div>
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
                className="w-full rounded-full border border-[var(--border)] bg-white/70 px-6 py-3.5 text-center text-base text-[var(--text-primary)] outline-none backdrop-blur transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 sm:text-left"
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

      {/* Scroll hint with animation — desktop only; on mobile it overlaps the callback form */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase text-[var(--text-muted)]">листайте</span>
          <div className="h-10 w-6 rounded-full border-2 border-[var(--text-muted)]/30 p-1">
            <div className="h-2 w-full animate-bounce rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
