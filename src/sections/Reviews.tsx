"use client";

import { useEffect, useRef, useState } from "react";
import { REVIEWS } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";

export function Reviews() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Auto-rotate reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-reviews-animate]", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        });
      }, ref);
      return () => ctx.revert();
    }
    animate();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center md:mb-16" data-reviews-animate>
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Отзывы клиентов
          </p>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Нам доверяют
          </AnimatedHeading>
        </div>

        {/* Active review */}
        <div data-reviews-animate className="relative min-h-[200px]">
          {REVIEWS.map((review, i) => (
            <div
              key={review.id}
              className={`transition-all duration-500 ${
                i === active
                  ? "relative opacity-100"
                  : "absolute inset-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/50 p-8 text-center backdrop-blur-sm md:p-12">
                {/* Quote mark */}
                <svg
                  className="mx-auto mb-4 h-8 w-8 text-[var(--color-accent)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="font-accent text-lg italic leading-relaxed text-[var(--text-primary)] md:text-xl">
                  {review.text}
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {review.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {review.furniture}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-[var(--color-primary)]"
                  : "w-2.5 bg-[var(--border)] hover:bg-[var(--color-accent)]"
              }`}
              aria-label={`Отзыв ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
