import { test } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { assertSectionOrder } from "../helpers/section-order";
import { scrollThroughPage } from "../helpers/scroll-all";

test.describe("Layout — section ordering", () => {
  test("main sections render in page.tsx-declared order", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    // Sections use content-visibility: auto — scroll through so they hydrate.
    await scrollThroughPage(page, 12, 150);
    await assertSectionOrder(page);
  });
});
