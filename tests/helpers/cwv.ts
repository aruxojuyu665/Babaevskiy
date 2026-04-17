import type { Page } from "@playwright/test";

export interface CwvSnapshot {
  lcp: number;
  cls: number;
  fcp: number;
}

/**
 * Collect Core Web Vital snapshots inside the page using PerformanceObserver.
 * Works on every engine (Chromium / WebKit). `settleMs` controls how long to
 * wait after observer registration before resolving.
 */
export async function collectCwv(page: Page, settleMs = 1500): Promise<CwvSnapshot> {
  return page.evaluate((settle) => {
    return new Promise<CwvSnapshot>((resolve) => {
      let lcp = 0;
      let cls = 0;
      let fcp = 0;

      try {
        const lcpPo = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceEntry[];
          const last = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
            startTime: number;
          };
          lcp = last.renderTime || last.loadTime || last.startTime;
        });
        lcpPo.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // WebKit may not support LCP observer — leave 0.
      }

      try {
        const clsPo = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEntry[]) {
            const e = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
            if (!e.hadRecentInput) cls += e.value;
          }
        });
        clsPo.observe({ type: "layout-shift", buffered: true });
      } catch {
        // WebKit may not support layout-shift — leave 0.
      }

      const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
      if (fcpEntry) fcp = fcpEntry.startTime;

      setTimeout(() => resolve({ lcp, cls, fcp }), settle);
    });
  }, settleMs);
}
