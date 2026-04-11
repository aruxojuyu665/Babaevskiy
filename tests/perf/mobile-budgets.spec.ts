import { test, expect } from "@playwright/test";

/**
 * Lightweight mobile perf gate — measures CWV-related metrics via the browser
 * PerformanceObserver APIs. This is NOT a replacement for Lighthouse CI, but it
 * runs on every Playwright invocation and catches gross regressions quickly.
 */
test.describe("Mobile performance budgets (runtime PerformanceObserver)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "CDP metrics work best in Chromium");

  test("home route meets CWV budgets on mobile viewport", async ({ page }) => {
    // Arrive on a cold cache simulation.
    const client = await page.context().newCDPSession(page);
    await client.send("Network.clearBrowserCache");
    await client.send("Network.clearBrowserCookies");

    const navigationStart = Date.now();
    await page.goto("/", { waitUntil: "load" });

    // Wait a bit for LCP to stabilize
    await page.waitForTimeout(2500);

    const metrics = await page.evaluate(() => {
      return new Promise<{ lcp: number; cls: number; fcp: number }>((resolve) => {
        let lcp = 0;
        let cls = 0;
        let fcp = 0;
        const lcpPo = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceEntry[];
          const last = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number; startTime: number };
          lcp = last.renderTime || last.loadTime || last.startTime;
        });
        lcpPo.observe({ type: "largest-contentful-paint", buffered: true });

        const clsPo = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEntry[]) {
            const e = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
            if (!e.hadRecentInput) cls += e.value;
          }
        });
        clsPo.observe({ type: "layout-shift", buffered: true });

        const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
        if (fcpEntry) fcp = fcpEntry.startTime;

        setTimeout(() => resolve({ lcp, cls, fcp }), 1500);
      });
    });

    const wallClockMs = Date.now() - navigationStart;
    // eslint-disable-next-line no-console
    console.log("[perf] metrics", { ...metrics, wallClockMs });

    // Loose budgets on unthrottled localhost — Lighthouse CI enforces strict ones.
    expect(metrics.cls, "CLS must be < 0.1").toBeLessThan(0.1);
    expect(metrics.lcp, "LCP on localhost should be well under 4s").toBeLessThan(4_000);
    expect(metrics.fcp, "FCP on localhost should be under 2s").toBeLessThan(2_000);
  });
});
