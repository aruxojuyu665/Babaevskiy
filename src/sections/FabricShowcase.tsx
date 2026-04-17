"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { Lens } from "@/components/ui/Lens";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";
import { BUSINESS } from "@/lib/constants";
import Image from "next/image";

const FABRICS = [
  { id: "velvet", name: "Велюр", desc: "Мягкий, бархатистый", preview: "/fabrics/velvet-v2.jpg" },
  { id: "leather", name: "Кожа", desc: "Натуральная кожа", preview: "/fabrics/leather-v2.jpg" },
  { id: "linen", name: "Лён", desc: "Лёгкий, дышащий", preview: "/fabrics/linen-v2.jpg" },
  { id: "wool", name: "Шерсть", desc: "Шерсть ёлочка", preview: "/fabrics/wool-v2.jpg" },
  { id: "fleece", name: "Флис", desc: "Вязаный флис", preview: "/fabrics/fleece-v2.jpg" },
] as const;

export function FabricShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidRussianPhone(phone)) return;
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "fabric-samples" }),
      });
      setSubmitted(true);
      setPhone("");
    } catch {
      alert("Ошибка отправки. Позвоните нам: " + BUSINESS.phone);
    }
  }

  return (
    <section ref={sectionRef} className="section-padding bg-[var(--bg-surface)] overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 text-center md:mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[var(--color-accent)]" />
            <p className="font-accent text-base italic text-[var(--text-accent)]">
              Более 2 000 видов тканей на выбор
            </p>
            <div className="h-px w-12 bg-[var(--color-accent)]" />
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Подберём ткань под ваш интерьер
          </AnimatedHeading>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            Мы можем подобрать материал, максимально похожий на ваш. А если захотите освежить интерьер — предложим самые ультрамодные ткани. Для домашних животных есть антивандальное покрытие.
          </p>
        </div>

        {/* Fabric photo grid — Lens zoom on desktop, hover lift on mobile */}
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        >
          {FABRICS.map((f) => (
            <motion.div
              key={f.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              className="w-[220px] shrink-0 snap-center md:w-auto"
            >
              <Lens zoomFactor={1.6} lensSize={140}>
                <div className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] shadow-[var(--shadow-warm-sm)] transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(139,101,68,0.2)]">
                  <Image
                    src={f.preview}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 220px, 20vw"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--color-dark)]/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:opacity-0">
                    <div className="w-full p-4 text-center">
                      <p className="font-serif text-lg font-bold text-white">{f.name}</p>
                    </div>
                  </div>
                </div>
              </Lens>
              <div className="mt-3 text-center">
                <p className="text-base font-semibold text-[var(--text-primary)]">{f.name}</p>
                <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Measurer call form */}
        <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-warm-sm)] md:p-8">
          <h3 className="mb-2 text-center font-serif text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Вызовите замерщика с образцами
          </h3>
          <p className="mb-6 text-center text-base text-[var(--text-secondary)] md:text-lg">
            Приедем бесплатно, покажем ткани вживую и рассчитаем стоимость
          </p>
          {submitted ? (
            <div className="rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--bg-surface)] p-4 text-center">
              <p className="text-base font-medium text-[var(--text-accent)]">
                Спасибо! Перезвоним и согласуем удобное время.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-stretch gap-3 sm:flex-row"
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 (___) ___-__-__"
                className="flex-1 rounded-full border border-[var(--border)] bg-white px-6 py-3.5 text-center text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 sm:text-left"
                maxLength={18}
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm)]"
              >
                Вызвать замерщика
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
