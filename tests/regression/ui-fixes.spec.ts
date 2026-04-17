import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { waitForFonts } from "../helpers/disable-animations";
import { assertSectionOrder } from "../helpers/section-order";
import { assertHeadingNoMidWordBreak } from "../helpers/text-wrap";
import { scrollThroughPage } from "../helpers/scroll-all";

test.describe("Regression — 7 recent UI fixes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
    await waitForFonts(page);
  });

  test("(1) Contacts clock SVG: static hour hand + rotating minute hand with view-box pivot", async ({ page }) => {
    await page.evaluate(() => document.getElementById("contacts")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(400);
    const clockSvg = page.locator("#contacts svg").filter({ has: page.locator("circle[r='10']") }).first();
    await expect(clockSvg).toBeVisible();

    const diag = await clockSvg.evaluate((svg) => {
      const lines = Array.from(svg.querySelectorAll("line"));
      // The rotating minute hand gets its transform-box/origin via inline style.
      // framer-motion may rewrite "12px 12px" to "50% 50%" — both resolve to the
      // viewBox center once transform-box: view-box is applied.
      const minute = lines.find((l) => {
        const s = window.getComputedStyle(l);
        return s.transformBox === "view-box" && /^(12px 12px|50% 50%)$/.test(s.transformOrigin);
      });
      return {
        lineCount: lines.length,
        minuteFound: Boolean(minute),
        minuteComputedOrigin: minute ? window.getComputedStyle(minute).transformOrigin : null,
        minuteComputedBox: minute ? window.getComputedStyle(minute).transformBox : null,
      };
    });

    expect(diag.lineCount, "Clock has at least an hour-hand line + a minute-hand line").toBeGreaterThanOrEqual(2);
    expect(
      diag.minuteFound,
      `Minute hand must pivot at viewBox (12,12). origin=${diag.minuteComputedOrigin} box=${diag.minuteComputedBox}`
    ).toBe(true);
  });

  test("(2) Section order matches expected pipeline", async ({ page }) => {
    await scrollThroughPage(page, 10, 150);
    await assertSectionOrder(page);
  });

  test("(3) Wave / thread SVG patterns are absent from TrustBar, Cases and PhotoRequest", async ({ page }) => {
    await scrollThroughPage(page, 10, 150);
    const patternCount = await page.evaluate(() => {
      const SECTION_HEADINGS = [
        "лет опыта мастеров",
        "Было → Стало",
        "Пришлите",
      ];
      let count = 0;
      const matchedSections: string[] = [];
      const allSections = Array.from(document.querySelectorAll("main section"));
      for (const s of allSections) {
        const heading = s.querySelector("h1, h2, h3");
        const htext = (heading?.textContent ?? "") + " " + (s.textContent ?? "").slice(0, 200);
        const idx = SECTION_HEADINGS.findIndex((h) => htext.includes(h));
        if (idx === -1) continue;
        matchedSections.push(SECTION_HEADINGS[idx]);
        count += s.querySelectorAll("svg pattern").length;
      }
      return { count, matchedSections };
    });
    expect(
      patternCount.count,
      `Expected no svg<pattern> in wave-candidate sections. matched=${patternCount.matchedSections.join(", ")}`
    ).toBe(0);
  });

  test("(4) SectionDivider component is NOT rendered anywhere on the page", async ({ page }) => {
    const dividers = await page.evaluate(() => {
      const byClass = Array.from(document.querySelectorAll("[class*='section-divider'], [class*='stitch-divider']"));
      const byDataAttr = Array.from(document.querySelectorAll("[data-section-divider]"));
      return byClass.length + byDataAttr.length;
    });
    expect(dividers, "No SectionDivider elements expected").toBe(0);
  });

  test("(5) About heading 'Мастерство, проверенное временем' wraps at word boundary only", async ({ page }) => {
    await page.evaluate(() => document.getElementById("about")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(600);
    const heading = page.locator("h2", { hasText: "Мастерство" });
    await expect(heading).toBeVisible();
    await assertHeadingNoMidWordBreak(heading);
  });

  test("(6) Header logo 'Бабаевская' and 'МАСТЕРСКАЯ' share the same X-center", async ({ page }) => {
    const centers = await page.evaluate(() => {
      const anchor = document.querySelector("header a[href='#']") as HTMLElement | null;
      if (!anchor) return null;
      const spans = Array.from(anchor.querySelectorAll("span"));
      if (spans.length < 1) return null;
      // The anchor itself renders "Бабаевская" as its own text node (no span),
      // so measure the anchor text range vs the last span (мастерская/МАСТЕРСКАЯ).
      const findTextRect = (el: HTMLElement): DOMRect | null => {
        for (const node of Array.from(el.childNodes)) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SPAN") {
            const first = (node as HTMLElement).firstChild;
            if (first && first.nodeType === Node.TEXT_NODE && (first.textContent ?? "").trim().length > 0) {
              return (node as HTMLElement).getBoundingClientRect();
            }
          }
          if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim().length > 0) {
            const range = document.createRange();
            range.selectNode(node);
            return range.getBoundingClientRect();
          }
        }
        return null;
      };
      // Top line: first child span OR direct text. Find both top and bottom line spans.
      const all = Array.from(anchor.querySelectorAll("span")).map((s) => s.getBoundingClientRect());
      const anchorBox = anchor.getBoundingClientRect();
      const topRect = findTextRect(anchor) ?? anchorBox;
      const bottomRect = all[all.length - 1] ?? anchorBox;
      return {
        topCenter: topRect.left + topRect.width / 2,
        bottomCenter: bottomRect.left + bottomRect.width / 2,
      };
    });
    expect(centers, "Header logo anchor must exist").not.toBeNull();
    const delta = Math.abs((centers!.topCenter) - (centers!.bottomCenter));
    expect(
      delta,
      `Logo lines must share center-x within 2px, got ${delta.toFixed(2)}px`
    ).toBeLessThanOrEqual(2);
  });

  test("(7) Reviews rating pill shows 5 stars and no '4.9 / 5 · N отзывов' text", async ({ page }) => {
    await scrollThroughPage(page, 14, 150);
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("h2")).find((h) => (h.textContent ?? "").includes("Нам доверяют"));
      el?.scrollIntoView({ block: "start" });
    });
    await page.waitForTimeout(400);

    // Rating pill is the rounded-full container near the Reviews heading.
    const pill = page
      .locator("section:has-text('Нам доверяют') [class*='rounded-full']")
      .filter({ has: page.locator("svg") })
      .first();
    await expect(pill).toBeVisible();

    const svgCount = await pill.locator("svg").count();
    expect(svgCount, "Pill must contain exactly 5 stars").toBe(5);

    const text = ((await pill.textContent()) ?? "").trim();
    expect(text, `Pill must NOT contain rating text, got: "${text}"`).not.toMatch(/4\.9|\/\s*5|отзыв/i);
  });
});
