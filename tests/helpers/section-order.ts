import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Expected order of main-level sections on the home page.
 * Must mirror `src/app/page.tsx`. Each entry is an exact heading text OR
 * an id selector — we match whichever renders first inside the section.
 */
export const EXPECTED_SECTION_ORDER: ReadonlyArray<{
  key: string;
  match: { heading?: string; id?: string };
}> = [
  { key: "hero", match: { heading: "Бабаевская" } },
  { key: "trustbar", match: { heading: "лет опыта мастеров" } },
  { key: "transformation", match: { heading: "Старая обивка" } },
  { key: "services", match: { id: "services" } },
  { key: "repair-options", match: { heading: "Варианты перетяжки" } },
  { key: "pricing", match: { id: "pricing" } },
  { key: "photo-request", match: { heading: "Пришлите" } },
  { key: "cases", match: { id: "cases" } },
  { key: "fabrics", match: { heading: "Подберём ткань" } },
  { key: "process", match: { heading: "Как мы работаем" } },
  { key: "corporate", match: { heading: "Работаем с организациями" } },
  { key: "about", match: { id: "about" } },
  { key: "reviews", match: { heading: "Нам доверяют" } },
  { key: "calculator", match: { id: "calculator" } },
  { key: "payment", match: { heading: "Способы оплаты" } },
  { key: "contacts", match: { id: "contacts" } },
];

export async function assertSectionOrder(page: Page): Promise<void> {
  const positions = await page.evaluate((expected) => {
    return expected.map(({ key, match }) => {
      let el: Element | null = null;
      if (match.id) el = document.getElementById(match.id);
      if (!el && match.heading) {
        // Try headings first, then broaden to any element containing the text.
        const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
        el = headings.find((h) => (h.textContent ?? "").includes(match.heading!)) ?? null;
        if (!el) {
          const anyElements = Array.from(
            document.querySelectorAll("main p, main span, main a, main div, footer")
          );
          el = anyElements.find((n) => (n.textContent ?? "").includes(match.heading!)) ?? null;
        }
      }
      if (!el) return { key, top: -1 };
      const rect = (el as HTMLElement).getBoundingClientRect();
      return { key, top: rect.top + window.scrollY };
    });
  }, EXPECTED_SECTION_ORDER as unknown as Array<{ key: string; match: { heading?: string; id?: string } }>);

  const missing = positions.filter((p) => p.top < 0);
  expect(missing, `Missing sections: ${missing.map((m) => m.key).join(", ")}`).toHaveLength(0);

  const sorted = [...positions].sort((a, b) => a.top - b.top);
  const actualKeys = sorted.map((p) => p.key);
  const expectedKeys = EXPECTED_SECTION_ORDER.map((e) => e.key);
  expect(actualKeys, `Section order mismatch.\nExpected: ${expectedKeys.join(" → ")}\nActual:   ${actualKeys.join(" → ")}`).toEqual(expectedKeys);
}
