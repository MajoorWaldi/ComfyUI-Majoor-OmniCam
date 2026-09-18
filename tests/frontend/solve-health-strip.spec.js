import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });
}

test("Director timeline does not expose solve health strip (P0 product boundary)", async ({ page }) => {
  await mount(page);
  const strip = await page.locator('[data-role="solve-health-strip"]').count();
  const cells = await page.locator('[data-role="solve-health-cells"]').count();
  expect(strip).toBe(0);
  expect(cells).toBe(0);
});
