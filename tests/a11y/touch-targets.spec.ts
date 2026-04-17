import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { collectTouchTargetViolations } from "../helpers/touch-targets";
import { scrollThroughPage } from "../helpers/scroll-all";

test.describe("A11y — touch targets ≥ 44×44 CSS px", () => {
  test("all visible interactive elements meet the 44px threshold", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await scrollThroughPage(page, 12, 150);

    const violations = await collectTouchTargetViolations(page, 44);
    // eslint-disable-next-line no-console
    console.log(`[a11y] touch-target violations (${violations.length}):`, violations.slice(0, 20));
    expect(
      violations,
      `Interactive elements smaller than 44×44:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });
});
