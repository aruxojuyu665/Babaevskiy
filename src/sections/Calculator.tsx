"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { useAntiBot } from "@/components/AntiBot";
import { ConsentNotice } from "@/components/ConsentNotice";
import toast from "react-hot-toast";

const FURNITURE_TYPES = [
  {
    name: "Диван прямой",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
        <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z" />
        <path d="M4 18v2" /><path d="M20 18v2" />
      </svg>
    ),
  },
  {
    name: "Диван угловой",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V10a2 2 0 0 1 2-2h8v13" />
        <path d="M13 13h8a2 2 0 0 1 2 2v6" />
        <path d="M3 21h20" />
      </svg>
    ),
  },
  {
    name: "Кресло",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
        <path d="M4 11v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5a1 1 0 0 0-2 0v3H6v-3a1 1 0 0 0-2 0z" />
        <path d="M7 17v3M17 17v3" />
      </svg>
    ),
  },
  {
    name: "Стул",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v9h8V3" />
        <path d="M6 12h12" />
        <path d="M8 12v9M16 12v9" />
      </svg>
    ),
  },
  {
    name: "Кухонный уголок",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" />
        <path d="M3 20v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
        <path d="M6 20v2M18 20v2" />
      </svg>
    ),
  },
  {
    name: "Кровать",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10v8M22 10v8" />
        <path d="M2 14h20" />
        <path d="M4 14V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" />
        <path d="M8 10h4" />
      </svg>
    ),
  },
  {
    name: "Пуф",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="10" rx="8" ry="4" />
        <path d="M4 10v4a8 4 0 0 0 16 0v-4" />
      </svg>
    ),
  },
  {
    name: "Другое",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
      </svg>
    ),
  },
] as const;

export function Calculator() {
  const ref = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    furnitureType: "",
    comment: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { HoneypotField, appendAntiBotToFormData } = useAntiBot();

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, phone: formatPhone(e.target.value) });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidRussianPhone(formData.phone)) {
      toast.error("Введите корректный номер телефона");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("phone", formData.phone);
      body.append("furnitureType", formData.furnitureType);
      body.append("comment", formData.comment);
      body.append("type", "calculator");
      files.forEach((f) => body.append("photos", f));
      appendAntiBotToFormData(body);

      const res = await fetch("/api/lead", { method: "POST", body });
      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !data?.success) {
        toast.error(
          data?.error || "Не удалось отправить. Позвоните нам: " + BUSINESS.phone
        );
        return;
      }
      toast.success("Заявка принята — мы свяжемся с вами в ближайшее время");
      setSubmitted(true);
    } catch {
      toast.error("Не удалось отправить. Позвоните нам: " + BUSINESS.phone);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section id="calculator" ref={ref} className="section-padding bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-[var(--color-primary)]/30 bg-[var(--bg-surface)] p-12 shadow-[var(--shadow-warm)]"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "backOut" }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] shadow-[var(--shadow-warm)]"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                />
              </svg>
            </motion.div>
            <h3 className="font-serif text-3xl font-bold text-[var(--text-primary)]">
              Заявка отправлена!
            </h3>
            <p className="mt-3 text-base text-[var(--text-secondary)] md:text-lg">
              Мы свяжемся с вами в ближайшее время для расчёта стоимости.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="calculator" ref={ref} className="section-padding relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(212,165,116,0.12) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <div className="mb-2">
            <SectionEyebrow withLines={false}>Бесплатный расчёт</SectionEyebrow>
          </div>
          <AnimatedHeading className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Узнать стоимость
          </AnimatedHeading>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)] md:text-lg">
            Оставьте заявку — мы перезвоним и рассчитаем точную стоимость
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-warm)] md:p-10"
        >
          <HoneypotField />

          {/* Furniture type picker — visual chips */}
          <div className="mb-6">
            <label className="mb-3 block text-base font-semibold text-[var(--text-primary)]">
              Тип мебели
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FURNITURE_TYPES.map((t) => {
                const isActive = formData.furnitureType === t.name;
                return (
                  <motion.button
                    key={t.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, furnitureType: t.name })}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors ${
                      isActive
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--text-accent)]"
                        : "border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t.icon}
                    <span className="text-xs font-medium leading-tight">
                      {t.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-base font-medium text-[var(--text-secondary)]">
                Ваше имя
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван"
                className="w-full rounded-full border border-[var(--border)] bg-white px-5 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-base font-medium text-[var(--text-secondary)]">
                Телефон <span className="text-[var(--text-accent)]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                required
                maxLength={18}
                className="w-full rounded-full border border-[var(--border)] bg-white px-5 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-base font-medium text-[var(--text-secondary)]">
                Фото мебели (до 5 файлов)
              </label>
              <motion.div
                whileHover={{ scale: 1.005 }}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[var(--border)] bg-white/50 p-6 text-center transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
              >
                <svg className="mx-auto mb-2 h-9 w-9 text-[var(--text-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-base text-[var(--text-secondary)]">
                  Нажмите или перетащите фото сюда
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.div>
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {files.map((f, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5 rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                      >
                        {f.name.slice(0, 20)}
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-[var(--text-muted)] hover:text-red-500"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-base font-medium text-[var(--text-secondary)]">
                Комментарий
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Опишите, что нужно сделать..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative mt-7 w-full overflow-hidden rounded-full bg-[var(--color-primary)] py-4 text-lg font-semibold text-white shadow-[var(--shadow-warm)] transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm-lg)] disabled:opacity-50"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{loading ? "Отправка..." : "Узнать стоимость"}</span>
          </motion.button>
          <ConsentNotice buttonLabel="Узнать стоимость" />
        </motion.form>
      </div>
    </section>
  );
}
