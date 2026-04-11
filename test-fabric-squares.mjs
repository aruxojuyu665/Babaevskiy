import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("test-screenshots");

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });

  // Find and scroll to fabric section by heading text
  const fabricSection = page.locator("text=Подберём ткань под ваш интерьер").first();
  await fabricSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(4000); // Wait for canvas lazy load + animation

  // Screenshot the viewport after scrolling
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "fabric-section-view.png"),
    fullPage: false,
  });
  console.log("Section viewport screenshot saved");

  // Find all canvas elements and pick the right one
  const canvases = await page.locator("canvas").all();
  console.log(`Found ${canvases.length} canvas elements`);

  for (let i = 0; i < canvases.length; i++) {
    const c = canvases[i];
    const box = await c.boundingBox();
    const visible = await c.isVisible();
    console.log(`  Canvas ${i}: visible=${visible}, bounds=${JSON.stringify(box)}`);
  }

  // Take section screenshot by finding the parent container
  const sectionEl = page.locator("section").filter({ hasText: "Подберём ткань" }).first();
  if (await sectionEl.isVisible()) {
    await sectionEl.screenshot({
      path: path.join(SCREENSHOT_DIR, "fabric-section-element.png"),
    });
    console.log("Section element screenshot saved");
  }

  // Test hover on each position (5 evenly spaced)
  const fabricNames = ["velvet", "leather", "linen", "wool", "fleece"];

  // Find the canvas inside the fabric section
  const fabricCanvas = sectionEl.locator("canvas").first();
  const isVisible = await fabricCanvas.isVisible().catch(() => false);

  if (isVisible) {
    const canvasBox = await fabricCanvas.boundingBox();
    console.log(`Fabric canvas bounds: ${JSON.stringify(canvasBox)}`);

    if (canvasBox) {
      // Move mouse away first
      await page.mouse.move(0, 0);
      await page.waitForTimeout(1500);

      // Screenshot without hover
      await sectionEl.screenshot({
        path: path.join(SCREENSHOT_DIR, "fabric-no-hover.png"),
      });

      const planeWidth = canvasBox.width / 5;
      for (let i = 0; i < 5; i++) {
        const x = canvasBox.x + planeWidth * i + planeWidth / 2;
        const y = canvasBox.y + canvasBox.height / 2;

        await page.mouse.move(x, y);
        await page.waitForTimeout(1000);

        await sectionEl.screenshot({
          path: path.join(SCREENSHOT_DIR, `fabric-hover-${fabricNames[i]}.png`),
        });
        console.log(`Hover on ${fabricNames[i]} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
      }

      // Hover on edge of fleece (rightmost) to test edge behavior
      const fleeceRightEdge = canvasBox.x + canvasBox.width - planeWidth * 0.1;
      await page.mouse.move(fleeceRightEdge, canvasBox.y + canvasBox.height / 2);
      await page.waitForTimeout(1000);
      await sectionEl.screenshot({
        path: path.join(SCREENSHOT_DIR, "fabric-hover-fleece-edge.png"),
      });
      console.log("Edge hover on fleece captured");
    }
  } else {
    console.log("Fabric canvas not visible - may be mobile fallback");
  }

  console.log("\nAll screenshots saved to:", SCREENSHOT_DIR);
  await browser.close();
}

main().catch(console.error);
