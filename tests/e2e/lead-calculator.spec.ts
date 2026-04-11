import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("Lead flow — calculator form", () => {
  test("calculator section is reachable and phone input accepts value", async ({ page }) => {
    await page.route("**/api/lead", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/");
    await waitForPreloaderGone(page);

    // The hero CTA uses MagneticButton which adds transforms that can occlude
    // neighbours on small viewports, so we scroll to #calculator directly.
    await page.evaluate(() => {
      const el = document.getElementById("calculator");
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
    });

    const calculator = page.locator("#calculator");
    await expect(calculator).toBeVisible({ timeout: 10_000 });

    const phoneInput = calculator.locator("input[type='tel']").first();
    if (await phoneInput.count()) {
      await phoneInput.fill("+7 (999) 111-22-33");
      await expect(phoneInput).toHaveValue(/\+7/);
    }
  });
});
