import type { Page } from "@playwright/test";

export interface TouchTargetViolation {
  tag: string;
  text: string;
  width: number;
  height: number;
}

/**
 * Measure every visible interactive element and return ones smaller than `minSize`
 * CSS pixels on either axis. Caller decides how to assert (soft-fail during
 * inventory, hard-fail once clean).
 */
export async function collectTouchTargetViolations(
  page: Page,
  minSize = 44
): Promise<TouchTargetViolation[]> {
  return page.evaluate((min) => {
    const SELECTOR =
      "a, button, [role='button'], input[type='submit'], input[type='button'], [onclick]";
    const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const out: TouchTargetViolation[] = [];
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.width < min || rect.height < min) {
        out.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 40),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }
    return out;
  }, minSize);
}
