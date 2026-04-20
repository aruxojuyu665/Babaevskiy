import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for testing against a remote deployed URL (e.g. Vercel prod).
 * Usage:  npx playwright test --config=playwright.prod.config.ts
 * Set PLAYWRIGHT_BASE_URL to override the default https://babaevskaya.vercel.app.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "https://babaevskaya.vercel.app";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/client-edits.spec.ts"],
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: "ru-RU",
    timezoneId: "Europe/Moscow",
  },
  projects: [
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 13"] } },
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  // No webServer — we're running against a remote deployment.
});
