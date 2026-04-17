import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

test.describe("Messenger & phone links", () => {
  test("Telegram and Max buttons have correct target/rel/aria attributes", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);

    // Header has Telegram + Max icons (desktop viewport-only on lg+) — skip header
    // unless visible. Contacts section always renders both for every viewport.
    await page.evaluate(() => document.getElementById("contacts")?.scrollIntoView({ block: "start" }));
    const contacts = page.locator("#contacts");
    await expect(contacts).toBeVisible();

    const telegramLinks = contacts.locator('a[aria-label="Telegram"], a:has-text("Telegram")');
    const maxLinks = contacts.locator('a[aria-label="Max"], a:has-text("Max")');

    expect(await telegramLinks.count(), "At least one Telegram link in contacts").toBeGreaterThanOrEqual(1);
    expect(await maxLinks.count(), "At least one Max link in contacts").toBeGreaterThanOrEqual(1);

    for (const locator of [telegramLinks.first(), maxLinks.first()]) {
      const target = await locator.getAttribute("target");
      const rel = await locator.getAttribute("rel");
      const href = await locator.getAttribute("href");
      expect(target).toBe("_blank");
      expect(rel ?? "").toContain("noopener");
      expect(rel ?? "").toContain("noreferrer");
      // Current BUSINESS.telegram / .max are "#" placeholders — assert href present,
      // but log a warning so future ingestion of real links is noticed.
      expect(href, `href must not be empty`).toBeTruthy();
      if (href === "#") {
        // eslint-disable-next-line no-console
        console.warn(`[messenger-links] placeholder href '#' still in use for ${await locator.getAttribute("aria-label")}`);
      }
    }
  });

  test("Phone link uses tel: scheme", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await page.evaluate(() => document.getElementById("contacts")?.scrollIntoView({ block: "start" }));
    const phoneLink = page.locator('#contacts a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
    const href = await phoneLink.getAttribute("href");
    expect(href).toMatch(/^tel:\+?\d+/);
  });
});
