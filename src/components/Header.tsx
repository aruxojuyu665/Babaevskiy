"use client";

import { useState, useEffect } from "react";
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
            className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl"
          >
            Бабаевская
            <span className="block text-xs font-normal tracking-[0.2em] uppercase text-[var(--text-secondary)] font-sans">
              мастерская
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop phone + CTA */}
          <div className="hidden items-center gap-6 lg:flex">
            <a
              href={BUSINESS.phoneHref}
              className="text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--color-primary)]"
            >
              {BUSINESS.phone}
            </a>
            <button
              onClick={() => handleNavClick("#calculator")}
              className="rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--color-dark)] hover:shadow-[var(--shadow-warm)]"
            >
              Рассчитать стоимость
            </button>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
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
              className="font-serif text-2xl font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--color-primary)]"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-4 flex flex-col items-center gap-4">
            <a
              href={BUSINESS.phoneHref}
              className="text-lg font-semibold text-[var(--color-primary)]"
            >
              {BUSINESS.phone}
            </a>
            <button
              onClick={() => handleNavClick("#calculator")}
              className="rounded-full bg-[var(--color-primary)] px-8 py-3 text-base font-medium text-white"
            >
              Рассчитать стоимость
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
