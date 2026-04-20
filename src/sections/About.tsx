"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { BlurText } from "@/components/BlurText";
import { SectionEyebrow } from "@/components/SectionEyebrow";

export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    let revealPlayed = false;
    let revealCleanup: (() => void) | undefined;
    let parallaxCleanup: (() => void) | undefined;
    let disposed = false;

    // Reveal via IntersectionObserver. ScrollTrigger's "top 75%" trigger
    // misfires here because this section's ancestor uses
    // `content-visibility: auto` (`.defer-paint-xl`), so ScrollTrigger
    // measures against the 3000px intrinsic-size placeholder before the
    // section paints. On first scroll-through the calculated trigger point
    // is stale and the reveal never fires — the heading stays invisible
    // until the user scrolls past and back, which forces a refresh.
    async function playReveal() {
      if (revealPlayed || disposed) return;
      revealPlayed = true;

      const gsap = (await import("gsap")).default;
      if (disposed || !section) return;

      const ctx = gsap.context(() => {
        gsap.from("[data-about-text]", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.from("[data-about-image]", {
          scale: 1.05,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        });
      }, section);
      revealCleanup = () => ctx.revert();
    }

    // Parallax stays on ScrollTrigger — it's scrubbed, so a stale start
    // position self-corrects as the user scrolls through the section.
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (disposed || !section) return;

      const ctx = gsap.context(() => {
        gsap.to("[data-about-image] img", {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }, section);
      parallaxCleanup = () => ctx.revert();
    })();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            playReveal();
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.01 }
    );
    io.observe(section);

    return () => {
      disposed = true;
      io.disconnect();
      revealCleanup?.();
      parallaxCleanup?.();
    };
  }, []);

  return (
    <section id="about" ref={ref} className="section-padding bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div
            data-about-image
            className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]"
          >
            <Image
              src="/process/workshop-wide.jpg"
              alt="Мастерская Бабаевская"
              fill
              className="object-cover ken-burns vintage-photo"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-primary)]/20 to-transparent" />
          </div>

          {/* Text */}
          <div>
            <p
              data-about-text
              className="mb-2 font-accent text-base italic text-[var(--text-accent)] md:text-lg lg:text-xl"
            >
              О мастерской
            </p>
            <AnimatedHeading
              data-about-text
              className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl [hyphens:none] [text-wrap:balance]"
            >
              Мастерство, проверенное временем
            </AnimatedHeading>

            <div data-about-text className="mt-6 space-y-4 text-base leading-relaxed text-[var(--text-secondary)]">
              <p>
                Наша мастерская находится в Москве, по адресу Иркутская 2к4.
                Мы работаем с мебелью уже многие годы. За это время через руки
                наших мастеров прошли тысячи изделий.
              </p>
              <p>
                В нашей команде работают специалисты с опытом более 30 лет.
                Это мастера, которые посвятили своему ремеслу большую часть жизни.
                Многие из них пришли в профессию ещё в начале 90-х и продолжают
                развиваться в ней до сих пор.
              </p>
            </div>

            {/* Quote — displayed immediately, no animation */}
            <div data-about-text className="mt-8 border-l-2 border-[var(--color-accent)] pl-6">
              <p className="font-serif text-xl leading-relaxed text-[var(--text-primary)] md:text-2xl">
                Один мастер — одно изделие. Мастер полностью ведёт работу от начала до конца и несёт личную ответственность за результат.
              </p>
            </div>

            {/* Blur text reveal */}
            <div data-about-text className="mt-6">
              <BlurText
                text="Мебель — это не просто предмет интерьера. Это часть атмосферы дома, отражение вкуса и характера владельца. Мы понимаем, насколько важно бережно работать с такими вещами."
                className="text-base leading-relaxed text-[var(--text-secondary)]"
              />
            </div>
          </div>
        </div>

        {/* Workshop details — «Подробнее о мастерской» */}
        <div className="mt-24 md:mt-32">
          <div className="mb-10 text-center md:mb-14">
            <SectionEyebrow lineColor="--color-primary">наше производство</SectionEyebrow>
            <h3 className="font-serif text-3xl font-bold leading-[1.15] text-[var(--text-primary)] md:text-4xl lg:text-5xl">
              Подробнее о мастерской
            </h3>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              Мы — мастерская полного цикла! Занимаемся перетяжкой и обивкой мебели от простого до сложного проекта. Свой цех, проверенные ткани, мастера с огромным опытом.
            </p>
          </div>

          {/* Photo grid — real client photos */}
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              { src: "/workshop/workshop-storage.jpg", alt: "Цех мастерской", title: "Цех полного цикла", desc: "От разборки до финальной сборки", offset: false },
              { src: "/workshop/master-sewing.jpg", alt: "Мастер за работой", title: "Мастера с опытом", desc: "От простого до сложного проекта", offset: true },
              { src: "/workshop/fabric-rolls-v2.jpg", alt: "Более 2000 видов тканей", title: "2 000+ тканей", desc: "Всегда в наличии в мастерской", offset: false },
            ].map((p, i) => (
              <motion.div
                key={p.src}
                // Only opacity animates in — if the IntersectionObserver misses
                // (fast scroll on content-visibility:auto ancestor), content is
                // at least visible. clipPath:inset(100%) previously left the
                // image permanently hidden when the trigger never fired.
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] md:aspect-[3/4] ${p.offset ? "md:mt-12" : ""}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--text-primary)]/85 via-[var(--text-primary)]/40 to-transparent p-5">
                  <p className="font-serif text-lg font-bold text-white md:text-xl">
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-white/80">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
