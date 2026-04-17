import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { assertNoHorizontalOverflow } from "../helpers/overflow";
import { scrollThroughPage } from "../helpers/scroll-all";

test.describe("Layout — no horizontal overflow, non-zero sections", () => {
  test("no horizontal overflow and no zero-height sections", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await assertNoHorizontalOverflow(page);
    await scrollThroughPage(page, 12, 150);
    await assertNoHorizontalOverflow(page);

    // Scroll each section into view and verify non-zero height there.
    // We can't measure all sections at once because `content-visibility: auto`
    // legitimately collapses offscreen wrappers to zero height.
    const count = await page.locator("main section").count();
    for (let i = 0; i < count; i += 1) {
      const section = page.locator("main section").nth(i);
      await section.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(100);
      const box = await section.boundingBox();
      expect(box?.height ?? 0, `Section [${i}] height after scroll-into-view`).toBeGreaterThan(10);
    }
  });

  test("fixed header stays on top after scroll", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(400);
    const headerBox = await page.locator("header").first().boundingBox();
    expect(headerBox?.y ?? -1).toBeLessThanOrEqual(2);
  });
});
