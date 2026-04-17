import type { Page } from "@playwright/test";

/**
 * Kill CSS animations / transitions AND request prefers-reduced-motion so
 * any JS-driven motion (GSAP, framer-motion) honors the hook.
 * Call before navigation so the stylesheet is present from the first paint.
 */
export async function injectNoMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.documentElement.appendChild(style);
  });
}

/** Settle web fonts so text widths match across machines. */
export async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }
  });
}
