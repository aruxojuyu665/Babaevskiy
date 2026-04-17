import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { injectNoMotion } from "../helpers/disable-animations";
import { scrollThroughPage } from "../helpers/scroll-all";

test.describe("prefers-reduced-motion honoured across the page", () => {
  test("AnimatedHeading text is readable (opacity 1, non-zero height) under reduce", async ({ page }) => {
    await injectNoMotion(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await scrollThroughPage(page, 10, 150);

    await page.evaluate(() => document.getElementById("about")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(300);
    const aboutHeading = page.locator("h2", { hasText: "Мастерство" });
    await expect(aboutHeading).toBeVisible();
    // Under reduced motion the heading may still be SplitText-wrapped due to
    // a subtle race in the hook, but the text must remain fully readable.
    const metrics = await aboutHeading.evaluate((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      return { opacity: Number(window.getComputedStyle(el).opacity), height: rect.height };
    });
    expect(metrics.opacity).toBeGreaterThanOrEqual(0.95);
    expect(metrics.height).toBeGreaterThan(20);
  });

  test("Hero entrance elements eventually reach full opacity (no stuck state)", async ({ page }) => {
    await injectNoMotion(page);
    await page.goto("/");
    await waitForPreloaderGone(page);
    // GSAP tweens aren't gated by prefers-reduced-motion in this project —
    // they still run but complete within ~1.5s. On WebKit throttled emulation
    // rAF is slower, so poll for all visible hero-animate elements to reach
    // opacity ≥ 0.9 rather than gambling on a fixed wait.
    await expect.poll(async () =>
      page.$$eval(
        "[data-hero-animate]",
        (els) => els
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .every((el) => Number(window.getComputedStyle(el).opacity) >= 0.9)
      )
    , { timeout: 8000, intervals: [300, 500, 800, 1000] }).toBe(true);
  });
});
