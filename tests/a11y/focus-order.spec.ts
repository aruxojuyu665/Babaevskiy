import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("A11y — focus order inside burger overlay", () => {
  test("Tab walks through nav links in DOM order", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);

    await page.getByRole("button", { name: /Меню/i }).click();
    await page.waitForTimeout(600);

    const visited: string[] = [];
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(80);
      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return "";
        return (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30);
      });
      visited.push(label);
    }

    // eslint-disable-next-line no-console
    console.log("[a11y] focus-order.visited =", visited);
    const combined = visited.join("|").toLowerCase();
    expect(combined, "Услуги should appear before Контакты in focus order").toMatch(/услуги[\s\S]*контакты/i);
  });
});
