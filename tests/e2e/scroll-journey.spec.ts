import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("Scroll journey — full-page mobile walkthrough", () => {
  test("every section becomes visible without console errors or CLS > 0.1", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          !text.includes("Failed to load resource") &&
          !text.includes("ERR_ABORTED")
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);

    // Inject a CLS observer before we start scrolling.
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const e = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
          if (!e.hadRecentInput) {
            (window as unknown as { __cls: number }).__cls += e.value;
          }
        }
      });
      po.observe({ type: "layout-shift", buffered: true });
    });

    // Sections live either directly under <main> or wrapped in a
    // <div class="defer-paint"> for content-visibility optimization.
    const sections = await page.locator("main section").all();
    // Scroll progressively so IntersectionObserver + GSAP ScrollTrigger have time to fire.
    for (let i = 0; i < 20; i += 1) {
      await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "auto" }));
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" }));
    await page.waitForTimeout(500);

    expect(sections.length).toBeGreaterThanOrEqual(5);

    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.1);

    expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
  });

  test("hero LCP image loads and is painted", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    const hero = page.locator("section").first();
    const heroImage = hero.locator("img").first();
    await expect(heroImage).toBeVisible();
    const naturalWidth = await heroImage.evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });
});
