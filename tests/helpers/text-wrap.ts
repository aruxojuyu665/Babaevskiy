import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Assert no "word" inside the heading is split across multiple lines.
 *
 * Strategy:
 *  - If the heading has GSAP SplitText word wrappers (`.inline-block` spans
 *    with a single word inside), measure each word wrapper's bounding rect.
 *    A word wrapper that spans multiple lines is a mid-word break.
 *  - Fallback: split textContent by spaces and use Range over char offsets
 *    to measure the visual line span of each word.
 */
export async function assertHeadingNoMidWordBreak(locator: Locator): Promise<void> {
  const analysis = await locator.evaluate((el) => {
    const headingEl = el as HTMLElement;
    const wordWrappers = headingEl.querySelectorAll<HTMLElement>(
      "[class*='inline-block']"
    );

    if (wordWrappers.length > 0) {
      const broken: Array<{ text: string; lines: number }> = [];
      wordWrappers.forEach((w) => {
        const rects = w.getClientRects();
        const lines = new Set(Array.from(rects).map((r) => Math.round(r.top))).size;
        if (lines > 1) {
          broken.push({ text: (w.textContent ?? "").trim(), lines });
        }
      });
      return { mode: "splittext", broken, wordCount: wordWrappers.length };
    }

    // Fallback: walk words via Range on the raw textContent.
    const text = headingEl.textContent ?? "";
    const broken: Array<{ text: string; lines: number }> = [];
    if (!headingEl.firstChild) {
      return { mode: "empty", broken, wordCount: 0 };
    }
    const node = headingEl.firstChild;
    if (node.nodeType !== Node.TEXT_NODE) {
      return { mode: "non-text-root", broken, wordCount: 0 };
    }
    const textNode = node as Text;
    const words = text.split(/(\s+)/);
    let cursor = 0;
    for (const token of words) {
      if (token.trim().length === 0) {
        cursor += token.length;
        continue;
      }
      const start = cursor;
      const end = cursor + token.length;
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      const rects = range.getClientRects();
      const lines = new Set(Array.from(rects).map((r) => Math.round(r.top))).size;
      if (lines > 1) broken.push({ text: token, lines });
      cursor = end;
    }
    return { mode: "range", broken, wordCount: words.filter((t) => t.trim().length > 0).length };
  });

  expect(
    analysis.broken,
    `Mid-word line breaks (mode=${analysis.mode}, words=${analysis.wordCount}):\n${analysis.broken
      .map((b) => `  "${b.text}" spans ${b.lines} lines`)
      .join("\n")}`
  ).toEqual([]);
}
