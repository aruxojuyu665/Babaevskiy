import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("Contacts — Yandex map iframe", () => {
  test("map iframe renders with correct src and minimum height", async ({ page }) => {
    const cspErrors: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error" && /(CSP|Content Security|frame-src|Refused to frame)/i.test(text)) {
        cspErrors.push(text);
      }
    });

    await page.goto("/");
    await waitForPreloaderGone(page);
    await page.evaluate(() => document.getElementById("contacts")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(800);

    const iframe = page.locator('#contacts iframe[title*="Карта"]');
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    const src = await iframe.getAttribute("src");
    expect(src, "src must point to yandex map-widget").toMatch(/^https:\/\/yandex\.(ru|com)\/map-widget/);

    const { height } = await iframe.evaluate((el) => {
      const rect = (el as HTMLIFrameElement).getBoundingClientRect();
      return { height: rect.height };
    });
    expect(height, `iframe height on mobile: ${height}px`).toBeGreaterThanOrEqual(300);

    expect(cspErrors, `No CSP errors expected. Got:\n${cspErrors.join("\n")}`).toEqual([]);
  });
});
