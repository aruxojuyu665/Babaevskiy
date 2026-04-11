import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

/**
 * Network throttled run — simulates Slow 3G and Fast 3G via CDP and asserts
 * that the critical lead form still works and LCP stays within a loose budget.
 */
const PROFILES = [
  {
    name: "Slow 3G",
    latency: 400,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
    lcpBudgetMs: 8_000,
  },
  {
    name: "Fast 3G",
    latency: 150,
    downloadThroughput: (1600 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    lcpBudgetMs: 5_000,
  },
] as const;

for (const profile of PROFILES) {
  test.describe(`Throttled — ${profile.name}`, () => {
    test.skip(({ browserName }) => browserName !== "chromium", "CDP throttling is Chromium only");

    test(`home loads and hero callback submit works under ${profile.name}`, async ({ page }) => {
      const client = await page.context().newCDPSession(page);
      await client.send("Network.enable");
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: profile.latency,
        downloadThroughput: profile.downloadThroughput,
        uploadThroughput: profile.uploadThroughput,
      });

      await page.route("**/api/lead", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      });

      const start = Date.now();
      await page.goto("/", { waitUntil: "load", timeout: 90_000 });

      const lcp = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let value = 0;
            const po = new PerformanceObserver((list) => {
              const entries = list.getEntries() as PerformanceEntry[];
              const last = entries[entries.length - 1] as PerformanceEntry & {
                renderTime?: number;
                loadTime?: number;
                startTime: number;
              };
              value = last.renderTime || last.loadTime || last.startTime;
            });
            po.observe({ type: "largest-contentful-paint", buffered: true });
            setTimeout(() => resolve(value), 3000);
          })
      );
      const loadMs = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(`[throttle:${profile.name}] loadMs=${loadMs} lcp=${Math.round(lcp)}`);

      expect(lcp, `LCP under ${profile.name} budget`).toBeLessThan(profile.lcpBudgetMs);

      await waitForPreloaderGone(page, 20_000);
      const phone = page.getByPlaceholder("+7 (___) ___-__-__").first();
      await phone.waitFor({ state: "visible", timeout: 30_000 });
      await phone.fill("+7 (999) 555-00-11");
      await page.getByRole("button", { name: /Перезвоните мне/i }).click();
      await expect(page.getByText(/Спасибо! Перезвоним/i)).toBeVisible({ timeout: 20_000 });
    });
  });
}
