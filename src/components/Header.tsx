"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BUSINESS, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleNavClick(href: string) {
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-[var(--shadow-warm-sm)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex min-h-[44px] flex-col items-center justify-center py-1 font-serif text-xl font-bold leading-none tracking-tight text-[var(--text-primary)] md:text-2xl"
          >
            <span className="leading-none">Бабаевская</span>
            <span className="mt-1 text-[0.62em] font-normal tracking-[0.32em] uppercase text-[var(--text-secondary)] font-sans">
              мастерская
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-base font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-accent)]"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop phone + Telegram + Max + CTA */}
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href={BUSINESS.phoneHref}
              className="flex min-h-[44px] items-center text-base font-bold text-[var(--text-accent)] transition-colors hover:text-[var(--color-dark)]"
            >
              {BUSINESS.phone}
            </a>
            <a
              href={BUSINESS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0088cc] text-white transition-all hover:bg-[#0077b5] hover:shadow-[var(--shadow-warm-sm)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href={BUSINESS.max}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Max"
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition-all hover:shadow-[var(--shadow-warm-sm)]"
            >
              <Image src="/max-logo.png" alt="Max" width={44} height={44} className="object-cover" />
            </a>
            <button
              onClick={() => handleNavClick("#calculator")}
              className="rounded-full bg-[var(--color-primary)] px-7 py-3 text-base font-semibold text-white transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm)]"
            >
              Рассчитать стоимость
            </button>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label="Меню"
          >
            <span
              className={cn(
                "h-0.5 w-6 bg-[var(--text-primary)] transition-all duration-300",
                menuOpen && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "h-0.5 w-6 bg-[var(--text-primary)] transition-all duration-300",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "h-0.5 w-6 bg-[var(--text-primary)] transition-all duration-300",
                menuOpen && "-translate-y-2 -rotate-45"
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[var(--bg-primary)] transition-all duration-500 lg:hidden",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="font-serif text-2xl font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--text-accent)]"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-4 flex flex-col items-center gap-5">
            <a
              href={BUSINESS.phoneHref}
              className="flex min-h-[44px] items-center text-xl font-bold text-[var(--text-accent)]"
            >
              {BUSINESS.phone}
            </a>
            <div className="flex items-center gap-4">
              <a
                href={BUSINESS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0088cc] text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href={BUSINESS.max}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Max"
                className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full"
              >
                <Image src="/max-logo.png" alt="Max" width={48} height={48} className="object-cover" />
              </a>
            </div>
            <button
              onClick={() => handleNavClick("#calculator")}
              className="rounded-full bg-[var(--color-primary)] px-10 py-4 text-lg font-semibold text-white"
            >
              Рассчитать стоимость
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
