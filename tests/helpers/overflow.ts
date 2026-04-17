import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Assert the document and every main-level section fit inside the viewport
 * horizontally. Catches off-canvas elements, hidden overflow regressions,
 * and wide absolute-positioned decorators.
 */
/**
 * Strict: document.documentElement.scrollWidth — a user-visible horizontal
 * scrollbar is an automatic fail (2 px tolerance for rounding).
 * Soft: per-section scrollWidth may exceed vw by up to `sectionTolerancePx`
 * to allow for decorative shadows/blobs that aren't clipped by overflow-hidden.
 */
export async function assertNoHorizontalOverflow(
  page: Page,
  sectionTolerancePx = 48,
  docTolerancePx = 2
): Promise<void> {
  const offenders = await page.evaluate(
    ({ sectionTol, docTol }) => {
      const vw = window.innerWidth;
      const out: Array<{ tag: string; cls: string; scrollW: number; top: number }> = [];

      // Hard document-level check
      const docWidth = document.documentElement.scrollWidth;
      if (docWidth > vw + docTol) {
        out.push({ tag: "html", cls: "", scrollW: docWidth, top: 0 });
      }

      // Per-section soft check — skip sections that explicitly clip overflow.
      const sections = document.querySelectorAll("main section, main > div > section");
      sections.forEach((s) => {
        const el = s as HTMLElement;
        const cs = window.getComputedStyle(el);
        const clipsX = /(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow);
        if (clipsX) return;
        if (el.scrollWidth > vw + sectionTol) {
          out.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || "").toString().slice(0, 60),
            scrollW: el.scrollWidth,
            top: Math.round(el.getBoundingClientRect().top + window.scrollY),
          });
        }
      });
      return out;
    },
    { sectionTol: sectionTolerancePx, docTol: docTolerancePx }
  );

  expect(
    offenders,
    `Horizontal overflow detected:\n${offenders.map((o) => `  ${o.tag}.${o.cls} scrollW=${o.scrollW} @y=${o.top}`).join("\n")}`
  ).toEqual([]);
}
