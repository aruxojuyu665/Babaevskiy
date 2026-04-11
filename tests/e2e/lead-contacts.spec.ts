import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("Lead flow — hero callback form", () => {
  test("user can submit phone from hero and see success state", async ({ page }) => {
    const leadRequests: Array<Record<string, unknown>> = [];

    await page.route("**/api/lead", async (route) => {
      const post = route.request().postDataJSON();
      leadRequests.push(post);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/");
    await waitForPreloaderGone(page);

    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    const phoneInput = page.getByPlaceholder("+7 (___) ___-__-__").first();
    await phoneInput.waitFor({ state: "visible", timeout: 15_000 });
    await phoneInput.fill("+7 (999) 123-45-67");

    const submit = page.getByRole("button", { name: /Перезвоните мне/i });
    await submit.click();

    await expect(page.getByText(/Спасибо! Перезвоним/i)).toBeVisible({ timeout: 10_000 });

    expect(leadRequests).toHaveLength(1);
    expect(leadRequests[0]).toMatchObject({ type: "callback" });
    expect(String(leadRequests[0].phone)).toContain("999");
  });

  test("validation blocks submit when phone is invalid", async ({ page }) => {
    let apiCalls = 0;
    await page.route("**/api/lead", async (route) => {
      apiCalls += 1;
      await route.fulfill({ status: 200, body: "{}" });
    });

    await page.goto("/");
    await waitForPreloaderGone(page);
    const phoneInput = page.getByPlaceholder("+7 (___) ___-__-__").first();
    await phoneInput.waitFor({ state: "visible" });
    await phoneInput.fill("12345");

    await page.getByRole("button", { name: /Перезвоните мне/i }).click();

    await page.waitForTimeout(500);
    expect(apiCalls).toBe(0);
    await expect(page.getByText(/Спасибо! Перезвоним/i)).toHaveCount(0);
  });
});
