import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { injectNoMotion, waitForFonts } from "../helpers/disable-animations";
import { scrollThroughPage } from "../helpers/scroll-all";

/**
 * Per-section visual snapshots. Playwright auto-suffixes by project name so
 * one test emits 3 baselines across Mobile Chrome / Safari / Small.
 *
 * Usage (first baseline generation, ONE project at a time):
 *   npx playwright test tests/visual/sections.mobile.spec.ts \
 *     --project="Mobile Chrome" --update-snapshots
 * then inspect results and repeat for other projects.
 */
const SECTIONS: Array<{ key: string; finder: string; text?: string }> = [
  { key: "hero", finder: "hero-by-id" },
  { key: "trustbar", finder: "text", text: "лет опыта мастеров" },
  { key: "transformation", finder: "text", text: "Старая обивка" },
  { key: "services", finder: "id", text: "services" },
  { key: "repair-options", finder: "text", text: "Варианты перетяжки" },
  { key: "pricing", finder: "id", text: "pricing" },
  { key: "photo-request", finder: "text", text: "Пришлите" },
  { key: "cases", finder: "id", text: "cases" },
  { key: "fabrics", finder: "text", text: "Подберём ткань" },
  { key: "process", finder: "text", text: "Как мы работаем" },
  { key: "corporate", finder: "text", text: "Работаем с организациями" },
  { key: "about", finder: "id", text: "about" },
  { key: "reviews", finder: "text", text: "Нам доверяют" },
  { key: "calculator", finder: "id", text: "calculator" },
  { key: "payment", finder: "text", text: "Способы оплаты" },
  { key: "contacts", finder: "id", text: "contacts" },
  { key: "footer", finder: "tag", text: "footer" },
];

test.describe("Visual — per-section mobile snapshots", () => {
  // 1-retry handles occasional 1px height flakes caused by content-visibility:auto
  // resolving sub-pixel heights differently across runs on WebKit.
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await injectNoMotion(page);
  });

  for (const section of SECTIONS) {
    test(`section ${section.key}`, async ({ page }, testInfo) => {
      // About section measures 1px height differently across runs on WebKit
      // — the GSAP `data-about-text` entrance tween sometimes lays out with
      // sub-pixel offsets. Skip on Mobile Safari only; regression spec
      // covers the heading correctness.
      testInfo.skip(
        section.key === "about" && testInfo.project.name === "Mobile Safari",
        "WebKit sub-pixel height flake — covered by regression spec"
      );

      await page.goto("/", { waitUntil: "networkidle" });
      await waitForPreloaderGone(page);
      await waitForFonts(page);
      // Trigger lazy mounts once, then scroll back to top so section is fresh.
      await scrollThroughPage(page, 14, 150);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      // Resolve the target section element.
      const elementLocator = await (async () => {
        if (section.finder === "hero-by-id") return page.locator("main section").first();
        if (section.finder === "id") return page.locator(`#${section.text}`);
        if (section.finder === "tag") return page.locator(section.text ?? "footer").first();
        return page.locator("main section", { hasText: section.text ?? "" }).first();
      })();

      await elementLocator.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      // Sections with intrinsic variance (before/after sliders, marquees, shuffled
      // avatars) need higher tolerance. Keep the default tight for static sections.
      const LOOSE = new Set(["cases", "reviews", "fabrics"]);
      await expect(elementLocator).toHaveScreenshot(`${section.key}.png`, {
        maxDiffPixelRatio: LOOSE.has(section.key) ? 0.25 : 0.05,
      });
    });
  }
});
