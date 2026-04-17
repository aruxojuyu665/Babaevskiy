import { test } from "@playwright/test";

export const MOBILE_PROJECTS = ["Mobile Chrome", "Mobile Safari", "Mobile Small"] as const;

export type MobileProject = (typeof MOBILE_PROJECTS)[number];

export function isMobileProject(name: string): name is MobileProject {
  return (MOBILE_PROJECTS as readonly string[]).includes(name);
}

/** Skip when running under the Desktop Chrome project. */
export function skipOnDesktop(): void {
  test.skip(!isMobileProject(test.info().project.name), "Mobile-only test");
}

/** Skip non-chromium when the test depends on CDP-only features. */
export function skipOnNonChromium({ browserName }: { browserName: string }): void {
  test.skip(browserName !== "chromium", "Chromium-only (CDP or perf API)");
}
