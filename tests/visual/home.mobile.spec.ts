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
    await page.waitForTimeout(1000); // let webfonts settle
    await expect(page).toHaveScreenshot("hero.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });
  });

  test("full page long screenshot", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Scroll through once so lazy sections mount before the full-page capture.
    for (let i = 0; i < 15; i += 1) {
      await page.evaluate(() => window.scrollBy({ top: window.innerHeight, behavior: "auto" }));
      await page.waitForTimeout(200);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot("home-full.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.04,
    });
  });
});
