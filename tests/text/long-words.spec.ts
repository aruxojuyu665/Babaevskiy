import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { waitForFonts } from "../helpers/disable-animations";
import { scrollThroughPage } from "../helpers/scroll-all";

test.describe("Typography — long Russian words don't clip or hyphenate badly", () => {
  test("no element containing marketing keywords is clipped (scrollWidth > clientWidth)", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await waitForFonts(page);
    await scrollThroughPage(page, 12, 150);

    const clipped = await page.evaluate(() => {
      const WORDS = ["перетяжка", "реставрация", "мастерская", "изделие", "механизмов"];
      const out: Array<{ text: string; scrollW: number; clientW: number }> = [];
      const all = Array.from(document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, span, a, li"));
      for (const el of all) {
        const txt = (el.textContent ?? "").toLowerCase();
        if (!WORDS.some((w) => txt.includes(w))) continue;
        // Only flag when scrollWidth exceeds clientWidth AND hides content (no
        // intentional horizontal scroll container).
        const style = window.getComputedStyle(el);
        if (style.overflowX === "scroll" || style.overflowX === "auto") continue;
        if (el.scrollWidth > el.clientWidth + 2) {
          out.push({
            text: (el.textContent ?? "").trim().slice(0, 40),
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
          });
        }
      }
      // Dedupe by text (nested inline spans report the same overflow).
      const seen = new Set<string>();
      return out.filter((o) => (seen.has(o.text) ? false : (seen.add(o.text), true)));
    });

    expect(
      clipped,
      `Keyword elements clipped horizontally:\n${clipped
        .map((c) => `  scroll=${c.scrollW} client=${c.clientW} "${c.text}"`)
        .join("\n")}`
    ).toEqual([]);
  });

  test("phone number renders on a single line where it appears", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await waitForFonts(page);
    // Contacts section always has a phone on mobile (header's phone is lg+ only).
    await page.evaluate(() => document.getElementById("contacts")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(400);

    const phoneLines = await page
      .locator('#contacts a[href^="tel:"]')
      .first()
      .evaluate((el) => {
        const rects = (el as HTMLElement).getClientRects();
        return new Set(Array.from(rects).map((r) => Math.round(r.top))).size;
      });
    expect(phoneLines, "Phone number must render on a single line").toBeLessThanOrEqual(1);
  });
});
