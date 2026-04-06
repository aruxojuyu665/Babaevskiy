"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { TextRevealByWord } from "@/components/TextRevealByWord";
import { BlurText } from "@/components/BlurText";

export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-about-text]", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        });
        gsap.from("[data-about-image]", {
          scale: 1.05,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        });
        // Parallax on About image
        gsap.to("[data-about-image] img", {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }, ref);
      return () => ctx.revert();
    }
    animate();
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
              className="object-cover ken-burns"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-primary)]/20 to-transparent" />
          </div>

          {/* Text */}
          <div>
            <p
              data-about-text
              className="mb-2 font-accent text-base italic text-[var(--color-primary)]"
            >
              О мастерской
            </p>
            <AnimatedHeading
              data-about-text
              className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
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
                В нашей команде работают специалисты с опытом от 6 до 30 лет.
                Это мастера, которые посвятили своему ремеслу большую часть жизни.
                Многие из них пришли в профессию ещё в начале 90-х и продолжают
                развиваться в ней до сих пор.
              </p>
            </div>

            {/* Quote — scroll-reveal word by word */}
            <div data-about-text className="mt-8 border-l-2 border-[var(--color-accent)] pl-6">
              <TextRevealByWord
                text="Один мастер — одно изделие. Мастер полностью ведёт работу от начала до конца и несёт личную ответственность за результат."
              />
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
      </div>
    </section>
  );
}
