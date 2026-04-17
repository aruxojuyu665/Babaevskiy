import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { injectNoMotion, waitForFonts } from "../helpers/disable-animations";

test.describe("Visual — header collapsed vs scrolled state", () => {
  test.beforeEach(async ({ page }) => {
    await injectNoMotion(page);
  });

  test("header at scrollY=0 (transparent)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await waitForFonts(page);
    const header = page.locator("header").first();
    await expect(header).toHaveScreenshot("header-top.png", { maxDiffPixelRatio: 0.03 });
  });

  test("header at scrollY=400 (blurred + shadow)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await waitForFonts(page);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    const header = page.locator("header").first();
    await expect(header).toHaveScreenshot("header-scrolled.png", { maxDiffPixelRatio: 0.03 });
  });
});
