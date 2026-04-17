import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

const SECTION_IDS = ["services", "pricing", "cases", "about", "calculator", "contacts"] as const;

test.describe("Layout — sticky header doesn't overlap section headings", () => {
  test("every anchored section heading sits below header after direct nav", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);

    for (const id of SECTION_IDS) {
      // Scroll twice with a settle delay — `content-visibility: auto` sections
      // paint lazily and can shift the page height after the first scrollIntoView.
      // The second call lands on the real post-paint geometry.
      await page.evaluate((sid) => {
        document.getElementById(sid)?.scrollIntoView({ behavior: "auto", block: "start" });
      }, id);
      await page.waitForTimeout(400);
      // Third scroll after GSAP entrance animations settle (~1s duration) —
      // `gsap.from` animates elements from an offset, so mid-animation
      // getBoundingClientRect returns a transient Y. Wait for stable layout.
      await page.waitForTimeout(1400);
      await page.evaluate((sid) => {
        document.getElementById(sid)?.scrollIntoView({ behavior: "auto", block: "start" });
      }, id);
      await page.waitForTimeout(500);

      const { headerBottom, headingTop, headingText } = await page.evaluate((sid) => {
        const section = document.getElementById(sid);
        const header = document.querySelector("header");
        const heading = section?.querySelector("h1, h2, h3, h4") ?? null;
        const hb = header?.getBoundingClientRect().bottom ?? 0;
        const ht = heading?.getBoundingClientRect().top ?? 0;
        return {
          headerBottom: hb,
          headingTop: ht,
          headingText: (heading?.textContent ?? "").slice(0, 40),
        };
      }, id);

      // Allow a 4 px tolerance for sub-pixel rounding in sticky header transitions.
      expect(
        headingTop,
        `Heading "${headingText}" of #${id} must be at or below header.bottom (${headerBottom}). got ${headingTop}`
      ).toBeGreaterThanOrEqual(headerBottom - 4);
    }
  });
});
