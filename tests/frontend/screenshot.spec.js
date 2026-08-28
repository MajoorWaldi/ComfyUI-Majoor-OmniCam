import { test } from "@playwright/test";

// Not an assertion suite: renders the Director at a realistic width so the
// layout can be eyeballed against the design reference. Run with
//   npx playwright test tests/frontend/screenshot.spec.js
const HOST = ".majoor-omnicam:not(.context-menu)";

async function mount(page) {
  await page.setViewportSize({ width: 1180, height: 1500 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  await page.waitForTimeout(600);
}

test("capture the outliner layout", async ({ page }) => {
  await mount(page);
  await page.locator(HOST).first().screenshot({ path: "test-results/director-outliner.png" });
});

test("capture the inspector layout", async ({ page }) => {
  await mount(page);
  await page.locator('[data-tab="camera"]').click();
  await page.waitForTimeout(200);
  await page.locator(HOST).first().screenshot({ path: "test-results/director-inspector.png" });
});

test("capture the shot layout", async ({ page }) => {
  await mount(page);
  await page.locator('[data-tab="display"]').click();
  await page.waitForTimeout(200);
  await page.locator(HOST).first().screenshot({ path: "test-results/director-shot.png" });
});
