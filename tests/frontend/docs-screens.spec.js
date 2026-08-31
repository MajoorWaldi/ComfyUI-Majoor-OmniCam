import { test } from "@playwright/test";

// Not an assertion suite: captures the images embedded in README.md and
// docs/NODES.md so they can be regenerated when the UI changes. Run with
//   npx playwright test tests/frontend/docs-screens.spec.js
// then copy test-results/docs-*.png into docs/assets/.
const HOST = ".majoor-omnicam:not(.context-menu)";

async function mountDirector(page) {
  await page.setViewportSize({ width: 1180, height: 1500 });
  await page.goto("/tests/frontend/director-docs-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  await page.waitForTimeout(700);
}

test("director - outliner", async ({ page }) => {
  await mountDirector(page);
  await page.locator(HOST).first().screenshot({ path: "test-results/docs-director-outliner.png" });
});

test("director - inspector", async ({ page }) => {
  await mountDirector(page);
  await page.locator('[data-tab="camera"]').click();
  await page.waitForTimeout(200);
  await page.locator(HOST).first().screenshot({ path: "test-results/docs-director-inspector.png" });
});

test("monitor - panel", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1200 });
  await page.goto("/tests/frontend/monitor-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });
  await page.waitForTimeout(400);
  await page.locator("#host").screenshot({ path: "test-results/docs-monitor-panel.png" });
});
