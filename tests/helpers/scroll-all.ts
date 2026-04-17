import type { Page } from "@playwright/test";

/**
 * Scroll through the full page in `steps` stages so IntersectionObserver,
 * GSAP ScrollTrigger and `content-visibility: auto` sections get a chance
 * to hydrate/paint. Finally returns to top.
 */
export async function scrollThroughPage(page: Page, steps = 20, restingMs = 250): Promise<void> {
  for (let i = 0; i < steps; i += 1) {
    await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "auto" }));
    await page.waitForTimeout(restingMs);
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" }));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await page.waitForTimeout(300);
}
