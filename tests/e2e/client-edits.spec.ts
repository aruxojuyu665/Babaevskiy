import { test, expect, type Page } from "@playwright/test";
import { waitForPreloaderGone } from "../helpers/wait-ready";

// All tests mock /api/lead so nothing reaches the real backend.
async function mockLeadApi(page: Page): Promise<Array<Record<string, unknown>>> {
  const captured: Array<Record<string, unknown>> = [];
  await page.route("**/api/lead", async (route) => {
    try {
      const json = route.request().postDataJSON() as Record<string, unknown>;
      captured.push(json);
    } catch {
      captured.push({});
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, id: "test-id-000" }),
    });
  });
  return captured;
}

async function scrollToId(page: Page, id: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el?.scrollIntoView({ behavior: "instant", block: "center" });
  }, `#${id}`);
  await page.waitForTimeout(400);
}

async function scrollToText(page: Page, text: string) {
  // Find the nearest section containing the text and scroll it into view.
  const section = page.locator(`section:has-text("${text}")`).first();
  await section.waitFor({ state: "attached", timeout: 15_000 });
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
}

test.describe("Client edit #1 — invalid phone triggers toast", () => {
  test("Hero form shows toast on invalid phone and does not hit API", async ({ page }) => {
    const calls = await mockLeadApi(page);
    await page.goto("/");
    await waitForPreloaderGone(page);

    const phoneInput = page.getByPlaceholder("+7 (___) ___-__-__").first();
    await phoneInput.waitFor({ state: "visible" });
    await phoneInput.click();
    await phoneInput.pressSequentially("12345", { delay: 15 });
    await page.getByRole("button", { name: /Перезвоните мне/i }).click();

    await expect(page.getByText(/Введите корректный номер телефона/i)).toBeVisible({
      timeout: 5_000,
    });
    await page.waitForTimeout(300);
    expect(calls).toHaveLength(0);
  });

  test("valid phone → success toast + no validation toast", async ({ page }) => {
    const calls = await mockLeadApi(page);
    await page.goto("/");
    await waitForPreloaderGone(page);

    const phoneInput = page.getByPlaceholder("+7 (___) ___-__-__").first();
    await phoneInput.click();
    await phoneInput.pressSequentially("9990001122", { delay: 15 });
    await page.getByRole("button", { name: /Перезвоните мне/i }).click();

    await expect(page.getByText(/Заявка принята/i).first()).toBeVisible({
      timeout: 5_000,
    });
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Client edit #2 — section subheadings responsive sizing", () => {
  test("eyebrow 'Что мы делаем' has responsive size classes", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);

    const eyebrow = page.getByText("Что мы делаем", { exact: true });
    await scrollToId(page, "services");
    await expect(eyebrow).toBeVisible();

    const classNames = await eyebrow.getAttribute("class");
    expect(classNames).toContain("text-base");
    expect(classNames).toContain("md:text-lg");
    expect(classNames).toContain("lg:text-xl");
  });

  test("eyebrows render at desktop with computed font-size ≥ 18px", async ({
    page,
    viewport,
  }) => {
    // Only meaningful on desktop viewport (md breakpoint ≥ 768px applies).
    test.skip(!viewport || viewport.width < 1024, "Desktop-only check");

    await page.goto("/");
    await waitForPreloaderGone(page);

    const labels = [
      "Что мы делаем",
      "Прозрачные цены",
      "Наши работы",
      "Отзывы клиентов",
      "Просто и понятно",
    ];
    for (const label of labels) {
      const el = page.getByText(label, { exact: true }).first();
      await el.scrollIntoViewIfNeeded();
      const fontSize = await el.evaluate((node) =>
        parseFloat(getComputedStyle(node).fontSize)
      );
      expect(fontSize, `"${label}" font-size`).toBeGreaterThanOrEqual(18);
    }
  });
});

test.describe("Client edit #3 — fabric carousel swipe hint on mobile", () => {
  test("mobile shows swipe hint arrow and caption", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width >= 768, "Mobile-only check");

    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Подберём ткань под ваш интерьер");

    await expect(page.getByText(/листайте для просмотра тканей/i)).toBeVisible();
  });

  test("desktop does NOT show swipe hint caption", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 1024, "Desktop-only check");

    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Подберём ткань под ваш интерьер");

    const caption = page.getByText(/листайте для просмотра тканей/i);
    // Element exists in DOM but is hidden via md:hidden.
    const visible = await caption.isVisible().catch(() => false);
    expect(visible).toBe(false);
  });
});

test.describe("Client edit #4 — 'Вызвать замерщика' heading", () => {
  test("fabric form heading reads 'Вызвать замерщика'", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Подберём ткань под ваш интерьер");

    await expect(
      page.getByRole("heading", { name: "Вызвать замерщика" })
    ).toBeVisible();

    // Old text must not exist anywhere.
    await expect(
      page.getByText("Вызовите замерщика с образцами", { exact: true })
    ).toHaveCount(0);
  });
});

test.describe("Client edit #5 — Process step digits enlarged", () => {
  test("desktop step digit font-size ≥ 22px", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 1024, "Desktop-only check");

    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Как мы работаем");

    // First step digit rendered in the desktop grid (hidden md:block).
    const digit = page.locator('.hidden.md\\:block span.relative').first();
    await digit.waitFor({ state: "visible" });
    const fontSize = await digit.evaluate((node) => {
      // The digit's span inherits font-size from parent div.
      const parent = node.closest("div");
      return parent ? parseFloat(getComputedStyle(parent).fontSize) : 0;
    });
    expect(fontSize).toBeGreaterThanOrEqual(22);
  });

  test("mobile step digit font-size ≥ 15px", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width >= 768, "Mobile-only check");

    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Как мы работаем");

    // Mobile circle wrapper uses h-8 w-8 with font-serif text-base font-bold
    const digit = page.locator(".md\\:hidden .h-8.w-8").first();
    await digit.waitFor({ state: "visible" });
    const fontSize = await digit.evaluate((node) =>
      parseFloat(getComputedStyle(node).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(15);
  });
});

test.describe("Client edit #6 — Reviews support manual drag", () => {
  test("review track opts in to drag (cursor-grab, no CSS keyframe)", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Нам доверяют");

    // Framer Motion track — the first .cursor-grab on the page is the top
    // reviews row. If the CSS marquee regressed back, this selector wouldn't
    // find anything (the old implementation had no cursor-grab).
    const track = page.locator(".cursor-grab").first();
    await track.waitFor({ state: "visible", timeout: 10_000 });

    // Must not use the CSS `scroll` keyframe animation that the old
    // implementation relied on. Framer Motion drives `transform` via
    // style, not via CSS animation-name.
    const animationName = await track.evaluate(
      (node) => getComputedStyle(node).animationName
    );
    expect(animationName).not.toBe("scroll");

    // Track must carry a transform (motion value rendered into inline style).
    const transform = await track.evaluate(
      (node) => getComputedStyle(node).transform
    );
    expect(transform).not.toBe("none");
  });

  test("auto-scroll transform changes over time", async ({ page }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Нам доверяют");

    const track = page.locator(".cursor-grab").first();
    await track.waitFor({ state: "visible" });

    // Avoid triggering the hover-pause by moving the mouse away from the track.
    await page.mouse.move(5, 5);

    const getTx = () =>
      track.evaluate((node) => {
        const t = getComputedStyle(node).transform;
        if (!t || t === "none") return 0;
        const m = t.match(/matrix.*\(([^)]+)\)/);
        if (!m) return 0;
        const v = m[1].split(", ");
        return parseFloat(v[v.length - 2]) || 0;
      });

    const t0 = await getTx();
    await page.waitForTimeout(800);
    const t1 = await getTx();

    // Either direction — magnitude should be ≥ a few px over ~0.8s of auto-scroll.
    expect(Math.abs(t1 - t0)).toBeGreaterThan(3);
  });

  test("dragging opposite to auto-scroll direction never exposes empty space", async ({
    page,
  }, testInfo) => {
    // Desktop reproduces the original bug most reliably because the row is
    // wider and the drag gesture has more reach. Skipping reduced-motion and
    // Safari gestures is not needed here — the bug was purely about wrap math.
    test.skip(
      testInfo.project.name === "Mobile Safari",
      "WebKit drag flakiness — covered by Mobile Chrome + Desktop Chrome"
    );

    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToText(page, "Нам доверяют");

    // Ensure the first row (direction=left) and the second row (direction=right)
    // are both mounted. We test both since the wrap bug was symmetric.
    const tracks = page.locator(".cursor-grab");
    await tracks.first().waitFor({ state: "visible", timeout: 10_000 });
    const count = await tracks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Helper: drag the track by `deltaX` from its center, then assert that
    // the track still fully covers the wrapper horizontally. If the wrap is
    // broken, either the track's left edge drifts right of the wrapper
    // (empty on the left) or the right edge drifts left of the wrapper
    // (empty on the right).
    async function dragAndCheck(trackIndex: number, deltaX: number) {
      const track = tracks.nth(trackIndex);
      const wrapper = track.locator("..");
      const box = await track.boundingBox();
      const wrapperBox = await wrapper.boundingBox();
      if (!box || !wrapperBox) throw new Error("No bounding box");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      // Multi-step drag so Framer Motion registers it as a gesture.
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        await page.mouse.move(
          box.x + box.width / 2 + (deltaX * i) / steps,
          box.y + box.height / 2
        );
      }
      await page.mouse.up();
      // Let Framer Motion finish any momentum animation + our wrap snap.
      await page.waitForTimeout(300);

      const afterBox = await track.boundingBox();
      if (!afterBox) throw new Error("track no longer on screen");

      // Track must still cover the wrapper horizontally — no empty space.
      // Allow 1px of sub-pixel fuzz.
      expect(
        afterBox.x,
        `track left edge should be ≤ wrapper left edge`
      ).toBeLessThanOrEqual(wrapperBox.x + 1);
      expect(
        afterBox.x + afterBox.width,
        `track right edge should be ≥ wrapper right edge`
      ).toBeGreaterThanOrEqual(wrapperBox.x + wrapperBox.width - 1);
    }

    // Top row: direction="left" (auto-scrolls left). Drag RIGHT to reproduce
    // the original "runs out on the left" bug.
    await dragAndCheck(0, 350);

    // Bottom row (if mounted): direction="right". Drag LEFT to reproduce
    // the mirror of the bug.
    if (count >= 2) {
      await dragAndCheck(1, -350);
    }
  });
});

test.describe("Client edit #8 — phone input caret starts at the left", () => {
  test("every phone input is text-align: left (caret at start, not center)", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);

    const phoneInputs = page.locator('input[type="tel"]');
    // We need to scroll through the page so every form mounts. Touch each
    // section that owns a phone input.
    await scrollToId(page, "services");
    await scrollToText(page, "Подберём ткань под ваш интерьер");
    await scrollToText(page, "Узнать стоимость");
    await scrollToText(page, "Работаем с организациями");
    await scrollToId(page, "contacts");

    const count = await phoneInputs.count();
    expect(count, "at least one phone input must be mounted").toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const input = phoneInputs.nth(i);
      await input.scrollIntoViewIfNeeded();
      const align = await input.evaluate(
        (node) => getComputedStyle(node as HTMLInputElement).textAlign
      );
      // "left" or "start" both put the caret at the leading edge. "center" is
      // the bug — regardless of viewport. The old behavior used text-center
      // on mobile only.
      expect(align, `phone input #${i} text-align`).not.toBe("center");
      expect(align === "left" || align === "start").toBeTruthy();
    }
  });
});

test.describe("Client edit #7 — Services CTA text", () => {
  test("service cards show 'Оставить заявку' (not 'Подробнее')", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPreloaderGone(page);
    await scrollToId(page, "services");

    // At least one card should say Оставить заявку.
    const cta = page.getByText("Оставить заявку").first();
    await expect(cta).toBeVisible();

    // Legacy "Подробнее" must not appear in the services grid link area.
    // (Header/Footer links don't use this word; safe page-wide check.)
    await expect(page.getByText(/^Подробнее$/)).toHaveCount(0);
  });
});
