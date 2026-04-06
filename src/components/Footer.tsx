"use client";

import { BUSINESS, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[var(--text-primary)] text-[var(--bg-primary)]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo + description */}
          <div>
            <div className="font-serif text-xl font-bold">
              Бабаевская
              <span className="block text-xs font-normal tracking-[0.2em] uppercase opacity-60 font-sans">
                мастерская
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-70">
              Перетяжка мягкой мебели, замена наполнителей и реставрация
              в Москве и Московской области.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">
              Навигация
            </h4>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">
              Контакты
            </h4>
            <div className="space-y-3">
              <a
                href={BUSINESS.phoneHref}
                className="block text-lg font-semibold transition-opacity hover:opacity-80"
              >
                {BUSINESS.phone}
              </a>
              <p className="text-sm opacity-70">{BUSINESS.address}</p>
              <p className="text-sm opacity-70">{BUSINESS.workingHours}</p>
              <a
                href={BUSINESS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm opacity-70 transition-opacity hover:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs opacity-40">
          <p>© {new Date().getFullYear()} {BUSINESS.name}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
