export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const d = digits.startsWith("7") ? digits : "7" + digits;

  if (d.length <= 1) return "+7";
  if (d.length <= 4) return `+7 (${d.slice(1)}`;
  if (d.length <= 7) return `+7 (${d.slice(1, 4)}) ${d.slice(4)}`;
  if (d.length <= 9) return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

export function isValidRussianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("7");
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

interface LenisLike {
  scrollTo(
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean; lock?: boolean; force?: boolean }
  ): void;
}

const SCROLL_DURATION_MS = 1200;
const DRIFT_TOLERANCE_PX = 8;
const SNAP_TOLERANCE_PX = 20;

// Page is considered "visually settled" after the window load event + a grace
// period for entrance animations. Before that, we skip the smooth animation
// entirely (animated scroll mid-layout-shift produces a visible overshoot +
// correction flicker). After settle, smooth scrolling drives Lenis normally.
let pageSettled = false;
if (typeof window !== "undefined") {
  const markSettled = () => {
    window.setTimeout(() => {
      pageSettled = true;
    }, 1500);
  };
  if (document.readyState === "complete") {
    markSettled();
  } else {
    window.addEventListener("load", markSettled, { once: true });
  }
}

export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;

  // While the page is still laying out (fonts swapping, images streaming, GSAP
  // entrance animations firing), an animated 1.2 s scroll can land on the
  // wrong section because the target's absolute Y keeps moving. Use an
  // immediate jump — correct destination, zero flicker.
  if (!pageSettled) {
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, immediate: true, force: true });
    } else {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
    return;
  }

  if (!lenis) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    scheduleSnap(id);
    return;
  }

  // Smooth path with drift correction: every frame, check if the target's
  // absolute Y has moved; if so, silently re-aim Lenis so it continues
  // toward the current target instead of the initial (stale) Y.
  const startedAt = performance.now();
  let lastTargetY = Math.round(el.getBoundingClientRect().top + window.scrollY);
  lenis.scrollTo(el, { offset: 0, duration: SCROLL_DURATION_MS / 1000, lock: true });

  const driftLoop = () => {
    const elapsed = performance.now() - startedAt;
    if (elapsed >= SCROLL_DURATION_MS - 50) return;
    const r = el.getBoundingClientRect();
    const currentY = Math.round(r.top + window.scrollY);
    if (Math.abs(currentY - lastTargetY) > DRIFT_TOLERANCE_PX) {
      const remainingMs = Math.max(300, SCROLL_DURATION_MS - elapsed);
      lenis.scrollTo(currentY, { duration: remainingMs / 1000, lock: true, force: true });
      lastTargetY = currentY;
    }
    requestAnimationFrame(driftLoop);
  };
  requestAnimationFrame(driftLoop);

  scheduleSnap(id);
}

function scheduleSnap(id: string): void {
  window.setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (Math.abs(rect.top) <= SNAP_TOLERANCE_PX) return;

    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, immediate: true, force: true });
    } else {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, SCROLL_DURATION_MS + 150);
}
