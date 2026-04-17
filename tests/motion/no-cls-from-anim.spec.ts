import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { scrollThroughPage } from "../helpers/scroll-all";

/**
 * CLS gate for a mobile scroll journey with animations enabled. CWV budget
 * is 0.1 — this test asserts entrance tweens use compositor-only properties
 * (transform/opacity) and `defer-paint` wrappers reserve intrinsic heights
 * that match real content, so no observable shift remains.
 */
test.describe("Motion — no CLS from entrance animations", () => {
  test("CLS stays below 0.1 across animated scroll journey", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);

    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const e = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      });
      po.observe({ type: "layout-shift", buffered: true });
    });

    await scrollThroughPage(page, 18, 320);
    await page.waitForTimeout(1200);

    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    // eslint-disable-next-line no-console
    console.log(`[motion] CLS during animated scroll = ${cls.toFixed(4)}`);
    expect(cls, `CLS = ${cls.toFixed(4)}`).toBeLessThan(0.1);
  });
});
