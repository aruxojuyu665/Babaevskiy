import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { waitForFonts } from "../helpers/disable-animations";

test.describe("Typography — hero fits the mobile viewport", () => {
  test("hero h1 doesn't overflow viewport width", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await waitForFonts(page);

    const h1 = page.locator("main section h1").first();
    await expect(h1).toBeVisible();

    const metrics = await h1.evaluate((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      return {
        width: rect.width,
        scrollWidth: (el as HTMLElement).scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    // h1 allows for 16 px side margin from the layout container.
    expect(
      metrics.width,
      `h1 width ${metrics.width}px vs viewport ${metrics.viewportWidth}px`
    ).toBeLessThanOrEqual(metrics.viewportWidth);

    expect(
      metrics.scrollWidth,
      `h1 scrollWidth ${metrics.scrollWidth} must not exceed rendered width ${metrics.width}`
    ).toBeLessThanOrEqual(metrics.width + 2);
  });

  test("primary hero CTA is reachable within first 2 screen heights", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);

    const cta = page.getByRole("button", { name: /Рассчитать стоимость/i }).first();
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box, "CTA must have measurable box").not.toBeNull();
    const vh = page.viewportSize()?.height ?? 800;
    expect(
      (box?.y ?? Infinity),
      `CTA y=${box?.y} must be within 2×viewport (${vh * 2})`
    ).toBeLessThan(vh * 2);
  });
});
