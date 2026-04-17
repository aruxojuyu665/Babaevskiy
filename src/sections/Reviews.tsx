"use client";

import { motion } from "framer-motion";
import { REVIEWS } from "@/lib/constants";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { InfiniteMovingCards } from "@/components/InfiniteMovingCards";

export function Reviews() {
  return (
    <section className="section-padding overflow-hidden bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-12">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              Отзывы клиентов
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Нам доверяют
          </AnimatedHeading>

          {/* Rating badge */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: "backOut" }}
            className="mx-auto mt-6 inline-flex items-center gap-4 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-3 shadow-[var(--shadow-warm-sm)]"
          >
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.svg
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: "backOut" }}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-[#f5b800]"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </motion.svg>
              ))}
            </div>
          </motion.div>
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
