import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("Motion — scroll-triggered entrance animations reach full opacity", () => {
  test("[data-hero-animate] elements are opacity 1 at page load", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    // Hero animations finish within ~3s after preloader (delays 2.8s on text).
    await page.waitForTimeout(3500);

    const opacities = await page.$$eval(
      "[data-hero-animate]",
      (els) => els.map((el) => ({
        opacity: window.getComputedStyle(el).opacity,
        visible: (el as HTMLElement).offsetParent !== null,
      }))
    );
    expect(opacities.length, "At least one [data-hero-animate] expected").toBeGreaterThan(0);
    for (const { opacity, visible } of opacities) {
      if (!visible) continue;
      expect(Number(opacity)).toBeGreaterThanOrEqual(0.9);
    }
  });

  test("[data-about-text] reaches opacity 1 after entering viewport", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await page.evaluate(() => document.getElementById("about")?.scrollIntoView({ block: "start" }));
    // Allow ScrollTrigger + stagger + tween duration (~1s) and some safari slack.
    await page.waitForTimeout(2500);

    // Poll — safari animations are slower under playwright emulation.
    await expect.poll(async () =>
      page.$$eval(
        "[data-about-text]",
        (els) => els.every((el) => Number(window.getComputedStyle(el).opacity) >= 0.9)
      )
    , { timeout: 4000 }).toBe(true);
  });
});
