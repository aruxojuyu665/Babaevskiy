import type { Page } from "@playwright/test";

/**
 * Wait until the Preloader overlay has fully unmounted so clicks no longer
 * get intercepted. The preloader runs for ~3s (2400ms animation + 600ms fade).
 */
export async function waitForPreloaderGone(page: Page, timeoutMs = 10_000): Promise<void> {
  await page
    .locator("div.fixed.inset-0.z-\\[10000\\]")
    .waitFor({ state: "detached", timeout: timeoutMs })
    .catch(async () => {
      // Fallback: at least wait until pointer-events: none / opacity: 0
      await page.waitForTimeout(3200);
    });
}
