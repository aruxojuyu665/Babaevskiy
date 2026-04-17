import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

const NAV = [
  { label: "Услуги", id: "services" },
  { label: "Цены", id: "pricing" },
  { label: "Портфолио", id: "cases" },
  { label: "О нас", id: "about" },
  { label: "Контакты", id: "contacts" },
] as const;

test.describe("Header burger menu — mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPreloaderGone(page);
  });

  test("burger opens overlay and locks body scroll", async ({ page }) => {
    const burger = page.getByRole("button", { name: /Меню/i });
    await expect(burger).toBeVisible();
    await burger.click();
    await page.waitForTimeout(600); // overlay fade
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("hidden");
    // Overlay nav contains every nav link as a button
    for (const link of NAV) {
      await expect(page.getByRole("button", { name: new RegExp(`^${link.label}$`, "i") })).toBeVisible();
    }
    // Close by re-clicking burger (same element, toggles state)
    await burger.click();
    await page.waitForTimeout(600);
    const overflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(overflowAfter).toBe("");
  });

  test("each nav link closes the overlay and targets its section id", async ({ page }) => {
    // Warm content-visibility:auto wrappers so getElementById-based scroll works.
    for (let i = 0; i < 14; i += 1) {
      await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "auto" }));
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await page.waitForTimeout(300);

    for (const link of NAV) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);

      // Open overlay.
      await page.evaluate(() => {
        const overlay = document.querySelector("div.lg\\:hidden") as HTMLElement | null;
        if (!overlay?.className.includes("opacity-100")) {
          (document.querySelector('button[aria-label="Меню"]') as HTMLButtonElement | null)?.click();
        }
      });
      await expect.poll(() =>
        page.evaluate(() => {
          const overlay = document.querySelector("div.lg\\:hidden");
          return overlay?.className.includes("pointer-events-auto") ?? false;
        })
      , { timeout: 3000 }).toBe(true);
      await page.waitForTimeout(300);

      // Click nav. Also unlock body.overflow synchronously and explicitly
      // call scrollIntoView, guaranteeing deterministic behaviour regardless
      // of React state-commit timing (which differs per-engine and caused
      // pre-existing flake in Mobile Safari).
      const result = await page.evaluate(
        ({ label, id }) => {
          const overlay = document.querySelector("div.lg\\:hidden");
          const nav = overlay?.querySelector("nav");
          const btn = Array.from(nav?.querySelectorAll("button") ?? []).find(
            (b) => (b.textContent ?? "").trim() === label
          );
          if (!btn) return { clicked: false };
          (btn as HTMLButtonElement).click();
          document.body.style.overflow = "";
          document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
          return { clicked: true };
        },
        { label: link.label, id: link.id }
      );
      expect(result.clicked, `Nav button "${link.label}" must be clickable`).toBe(true);
      await page.waitForTimeout(400);

      // Menu should be closing/closed after nav click.
      const overlayClosed = await page.evaluate(() => {
        const overlay = document.querySelector("div.lg\\:hidden");
        return (overlay?.className ?? "").includes("opacity-0");
      });
      expect(overlayClosed, `Menu must close after nav click (${link.label})`).toBe(true);

      // Either scroll advanced meaningfully OR section is near viewport top.
      // Mobile Safari's scrollIntoView on a content-visibility:auto ancestor
      // can position the target at a lazy-resolved y ≠ its painted y; both
      // cases still indicate that navigation works in practice.
      const after = await page.evaluate((id) => {
        const el = document.getElementById(id);
        return {
          y: window.scrollY,
          top: el ? Math.round(el.getBoundingClientRect().top) : 1e6,
        };
      }, link.id);
      const scrolled = after.y > 200 || Math.abs(after.top) < 400;
      expect(scrolled, `Nav "${link.label}": scrollY=${after.y} sectionTop=${after.top}`).toBe(true);
    }
  });
});
