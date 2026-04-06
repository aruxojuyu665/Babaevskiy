"use client";

import { REVIEWS } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { InfiniteMovingCards } from "@/components/InfiniteMovingCards";

export function Reviews() {
  return (
    <section className="section-padding bg-[var(--bg-surface)] overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--color-primary)]">
              Отзывы клиентов
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Нам доверяют
          </AnimatedHeading>
        </div>
      </div>

      {/* Infinite scrolling review cards — two rows, opposite directions */}
      <InfiniteMovingCards
        items={REVIEWS}
        direction="left"
        speed="slow"
        className="mb-4"
      />
      <InfiniteMovingCards
        items={[...REVIEWS].reverse()}
        direction="right"
        speed="slow"
      />
    </section>
  );
}
