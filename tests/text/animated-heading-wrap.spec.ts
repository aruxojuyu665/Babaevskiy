import { test, expect } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";
import { assertHeadingNoMidWordBreak } from "../helpers/text-wrap";
import { waitForFonts } from "../helpers/disable-animations";

test.describe("Typography — AnimatedHeading word-wrap regressions", () => {
  test("About heading 'Мастерство, проверенное временем' never breaks mid-word", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await waitForFonts(page);
    await page.evaluate(() => document.getElementById("about")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(800);

    const heading = page.locator("h2", { hasText: "Мастерство" });
    await expect(heading).toBeVisible();
    await assertHeadingNoMidWordBreak(heading);
  });

  test("critical multi-word headings break only at word boundaries", async ({ page }) => {
    test.slow();
    await page.goto("/");
    await waitForPreloaderGone(page);
    await waitForFonts(page);

    // Representative sample covering diverse section contexts.
    const CRITICAL = [
      "Мастерство",
      "Узнать стоимость",
      "Подберём ткань",
      "Было → Стало",
      "Нам доверяют",
      "Способы оплаты",
    ];

    const failures: string[] = [];
    for (const needle of CRITICAL) {
      const heading = page.locator("main h2, main h3").filter({ hasText: needle }).first();
      if ((await heading.count()) === 0) continue;
      await heading.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(200);
      try {
        await assertHeadingNoMidWordBreak(heading);
      } catch (err) {
        failures.push(`"${needle}": ${(err as Error).message.split("\n")[0]}`);
      }
    }
    expect(failures, `Heading word-wrap failures:\n${failures.join("\n")}`).toEqual([]);
  });
});
