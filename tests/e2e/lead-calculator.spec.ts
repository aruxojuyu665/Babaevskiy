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

  test("full multi-step submit sends type=calculator with selected furniture", async ({ page }) => {
    const leadRequests: Array<{ postData: string | null; contentType: string }> = [];
    await page.route("**/api/lead", async (route) => {
      leadRequests.push({
        postData: route.request().postData(),
        contentType: route.request().headers()["content-type"] ?? "",
      });
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/");
    await waitForPreloaderGone(page);

    await page.evaluate(() => document.getElementById("calculator")?.scrollIntoView({ block: "start" }));
    const calculator = page.locator("#calculator");
    await expect(calculator).toBeVisible({ timeout: 10_000 });

    // Fill inputs FIRST so all React state updates that spread stale
    // `formData` have committed before we change the chip state last.
    // pressSequentially drives per-char keyboard events — on WebKit this
    // updates React's controlled state more reliably than `fill`.
    const phoneInput = calculator.locator("input[type='tel']").first();
    await phoneInput.click();
    await phoneInput.pressSequentially("9991112233", { delay: 10 });
    const nameInput = calculator.locator("input[type='text']").first();
    if (await nameInput.count()) {
      await nameInput.click();
      await nameInput.pressSequentially("Тест", { delay: 10 });
    }
    await page.waitForTimeout(200);

    const divanChip = calculator.getByRole("button", { name: /Диван прямой/i });
    // Mobile Safari + framer-motion's whileTap can swallow a single .click()
    // before the React onClick handler processes state change. Dispatch
    // directly so React receives a synthetic click with proper event timing.
    await divanChip.dispatchEvent("click");
    await expect.poll(async () => {
      const cls = (await divanChip.getAttribute("class")) ?? "";
      return /color-primary|bg-\[var\(--color-primary\)/.test(cls);
    }, { timeout: 3000 }).toBe(true);
    await page.waitForTimeout(350);

    await calculator.getByRole("button", { name: /Отправить|Рассчитать|Узнать|Получить/i }).first().click();

    await expect.poll(() => leadRequests.length, { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
    const payload = leadRequests[0]?.postData ?? "";
    expect(payload).toContain("type");
    expect(payload).toContain("calculator");
    expect(payload).toContain("Диван прямой");
  });
});
