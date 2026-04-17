import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("A11y — icon-only buttons/links have aria-label", () => {
  test("every visible icon-only a/button exposes accessible name", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);

    const offenders = await page.evaluate(() => {
      const out: Array<{ tag: string; html: string }> = [];
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("a, button"));
      for (const el of nodes) {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const text = (el.textContent ?? "").replace(/\s+/g, "").trim();
        if (text.length > 0) continue; // has visible text → no aria-label required
        const ariaLabel = el.getAttribute("aria-label");
        const ariaLabelledBy = el.getAttribute("aria-labelledby");
        const title = el.getAttribute("title");
        if (!ariaLabel && !ariaLabelledBy && !title) {
          out.push({ tag: el.tagName.toLowerCase(), html: el.outerHTML.slice(0, 120) });
        }
      }
      return out;
    });

    expect(
      offenders,
      `Icon-only interactive elements missing accessible name:\n${offenders.map((o) => `  ${o.html}`).join("\n")}`
    ).toEqual([]);
  });

  test("known icon triggers: burger, Telegram, Max have expected aria-labels", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await expect(page.getByRole("button", { name: "Меню" })).toBeVisible();
    // Telegram + Max are duplicated (header + contacts) — assert ≥ 1 of each.
    expect(await page.getByLabel("Telegram").count()).toBeGreaterThanOrEqual(1);
    expect(await page.getByLabel("Max").count()).toBeGreaterThanOrEqual(1);
  });
});
