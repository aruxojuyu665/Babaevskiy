"use client";

import { useState, useRef, useEffect } from "react";
import { BUSINESS } from "@/lib/constants";
import { formatPhone, isValidRussianPhone } from "@/lib/utils";

const FURNITURE_TYPES = [
  "Диван прямой",
  "Диван угловой",
  "Кресло",
  "Стул",
  "Кухонный уголок",
  "Кровать",
  "Пуф",
  "Другое",
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

  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.from("[data-calc-animate]", {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        });
      }, ref);
      return () => ctx.revert();
    }
    animate();
  }, []);

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
    if (!isValidRussianPhone(formData.phone)) return;

    setLoading(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("phone", formData.phone);
      body.append("furnitureType", formData.furnitureType);
      body.append("comment", formData.comment);
      body.append("type", "calculator");
      files.forEach((f) => body.append("photos", f));

      await fetch("/api/lead", { method: "POST", body });
      setSubmitted(true);
    } catch {
      alert("Ошибка отправки. Позвоните нам: " + BUSINESS.phone);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section id="calculator" ref={ref} className="section-padding bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-primary)]/20 bg-[var(--bg-surface)] p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
              Заявка отправлена!
            </h3>
            <p className="mt-3 text-base text-[var(--text-secondary)]">
              Мы свяжемся с вами в ближайшее время для расчёта стоимости.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="calculator" ref={ref} className="section-padding bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center" data-calc-animate>
          <p className="mb-2 font-accent text-base italic text-[var(--color-primary)]">
            Бесплатный расчёт
          </p>
          <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Узнать стоимость
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)]">
            Оставьте заявку — мы перезвоним и рассчитаем точную стоимость
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-warm)] md:p-10"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div data-calc-animate>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Ваше имя
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван"
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            {/* Phone */}
            <div data-calc-animate>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Телефон <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                required
                maxLength={18}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            {/* Furniture type */}
            <div data-calc-animate className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Тип мебели
              </label>
              <select
                value={formData.furnitureType}
                onChange={(e) => setFormData({ ...formData, furnitureType: e.target.value })}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                <option value="">Выберите тип мебели</option>
                {FURNITURE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Photo upload */}
            <div data-calc-animate className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Фото мебели (до 5 файлов)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-white/50 p-6 text-center transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
              >
                <svg className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm text-[var(--text-muted)]">
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
              </div>
              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <span
                      key={i}
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
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comment */}
            <div data-calc-animate className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                Комментарий
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Опишите, что нужно сделать..."
                rows={3}
                className="w-full resize-none rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[var(--color-primary)] py-4 text-base font-medium text-white transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm-lg)] disabled:opacity-50"
          >
            {loading ? "Отправка..." : "Узнать стоимость"}
          </button>
        </form>
      </div>
    </section>
  );
}
