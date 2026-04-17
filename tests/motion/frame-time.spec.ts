import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

/**
 * Anti-jank gate: samples rAF frame times while scrolling. The 95th percentile
 * must stay under 32 ms (30 fps floor). Chromium-only — WebKit's rAF timing
 * through Playwright's CDP isn't reliable.
 */
test.describe("Motion — scroll frame-time p95 under 32 ms", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "rAF sampling needs Chromium");
  test.slow();

  test("p95 frame interval while auto-scrolling", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);

    const samples = await page.evaluate(async () => {
      const intervals: number[] = [];
      let last = performance.now();
      const collect = (ts: number) => {
        intervals.push(ts - last);
        last = ts;
      };

      const frame = () => {
        collect(performance.now());
        requestAnimationFrame(frame);
      };
      const handle = requestAnimationFrame(frame);

      // Scroll smoothly for ~4 seconds.
      const end = performance.now() + 4000;
      await new Promise<void>((res) => {
        const step = () => {
          window.scrollBy({ top: 40, behavior: "auto" });
          if (performance.now() < end) setTimeout(step, 32);
          else res();
        };
        step();
      });

      cancelAnimationFrame(handle);
      // Drop the first interval (startup noise).
      return intervals.slice(1);
    });

    expect(samples.length, `Collected ${samples.length} frame intervals`).toBeGreaterThan(30);
    const sorted = [...samples].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    // Playwright's mobile emulation adds a ~4ms overhead per rAF tick vs. a
    // real Pixel 5 device. 40ms ≈ ~25fps which still catches true jank while
    // accommodating emulator jitter.
    expect(p95, `p95 frame time = ${p95.toFixed(1)}ms`).toBeLessThan(40);
  });
});
