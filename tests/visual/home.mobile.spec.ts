import { test, expect } from "@playwright/test";

/**
 * Visual regression on mobile viewport. Snapshots are stored per-project under
 * tests/visual/home.mobile.spec.ts-snapshots/. Run `npm run test:visual:update`
 * once after major layout changes to regenerate baselines.
 */
test.describe("Visual regression — mobile home", () => {
  test.beforeEach(async ({ page }) => {
    // Neutralize entrance animations and randomized floats so screenshots are stable.
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
  });

  test("hero above-the-fold", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Hero contains TextGenerateEffect + RotatingText + MagneticButton —
    // even with CSS animations disabled, the GSAP JS-driven entrance can paint
    // at slightly different timings per-run. 10% tolerance absorbs that while
    // still catching structural changes.
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("hero.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.12,
    });
  });

  /**
   * "full page long screenshot" was removed — `content-visibility: auto` wrappers
   * cause the total page height to vary by ~1000 px between Mobile Safari runs,
   * which Playwright rejects outright regardless of `maxDiffPixelRatio`.
   * Per-section snapshots in `tests/visual/sections.mobile.spec.ts` cover the
   * same ground deterministically.
   */
});
