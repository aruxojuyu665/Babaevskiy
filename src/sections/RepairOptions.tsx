"use client";

import { motion } from "framer-motion";

export function RepairOptions() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center md:mb-16"
        >
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--text-accent)]">
            два формата работы
          </p>
          <h2 className="font-serif text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl">
            Варианты перетяжки
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } } }}
        >
          {/* На дому */}
          <motion.article
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            whileHover={{ y: -6, transition: { duration: 0.2, delay: 0, ease: "easeOut" } }}
            className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-warm)] md:p-10"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--text-accent)] transition-transform group-hover:scale-110">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10.5Z"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </svg>
            </div>
            <h3 className="mb-3 font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              На дому
            </h3>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              В случаях когда это возможно — мастер произведёт ремонт прямо у вас на месте, без необходимости вывоза мебели.
            </p>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-[var(--color-primary)]/[0.04] blur-2xl transition-all group-hover:bg-[var(--color-primary)]/[0.1]" />
          </motion.article>

          {/* В мастерской */}
          <motion.article
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            whileHover={{ y: -6, transition: { duration: 0.2, delay: 0, ease: "easeOut" } }}
            className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-warm)] md:p-10"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--text-accent)] transition-transform group-hover:scale-110">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <motion.g
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                >
                  <motion.path d="M3 21V10l6-4 6 4v3" />
                  <motion.path d="M15 21V13l6-3v11" />
                  <motion.path d="M3 21h18" />
                </motion.g>
                {/* Windows — wiggle on hover */}
                <motion.g
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                  className="origin-center"
                >
                  <path d="M7 14h2M7 17h2" />
                  <path d="M18 16h.01M18 19h.01" />
                </motion.g>
              </svg>
            </div>
            <h3 className="mb-3 font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              В мастерской
            </h3>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              Когда требуется специальное оборудование, замена каркаса или сложная работа — выполняем в мастерской с полным циклом контроля качества.
            </p>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-[var(--color-primary)]/[0.04] blur-2xl transition-all group-hover:bg-[var(--color-primary)]/[0.1]" />
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
