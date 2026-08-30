import { expect, test } from "@playwright/test";

test("Monitor renders its QC, preflight, preview and delivery surfaces", async ({ page }) => {
  await page.goto("/tests/frontend/monitor-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading");
  expect(await page.locator("#status").textContent(), await page.evaluate(() => window.monitorError)).toBe("ready");
  await expect(page.locator(".oc-monitor")).toBeVisible();
  await expect(page.locator('[data-role="monitor-status"]')).toHaveText(/WARNING/);
  await expect(page.locator('[data-role="camera-health"]')).toContainText("READY");
  await expect(page.locator('[data-role="adapter-preflight"]')).toContainText("Verify socket contract");
  await expect(page.locator(".oc-trajectory-canvas")).toBeVisible();
  await expect(page.locator('[data-role="adapter-preview"]')).toContainText("OUTPUT PREVIEW");
  await page.locator('[data-tab="final-prompt"]').click();
  await expect(page.locator('[data-role="final-prompt"]')).toContainText("Copy camera motion only");
  await page.locator('[data-act="copy-text"]').click();
  await expect(page.locator('[data-act="copy-text"]')).toHaveText("COPIED");
});

test("Monitor and Director share a centered logo without subtitles", async ({ page }) => {
  await page.goto("/tests/frontend/monitor-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading");
  expect(await page.locator("#status").textContent(), await page.evaluate(() => window.monitorError)).toBe("ready");

  const headers = page.locator("#director-host .oc-header, #host .oc-header");
  await expect(headers).toHaveCount(2);
  await expect(headers.locator("small")).toHaveCount(0);
  await expect(headers.locator(".oc-mark")).toHaveCount(2);

  const alignment = await headers.evaluateAll((items) => items.map((header) => {
    const brand = header.querySelector(".oc-brand").getBoundingClientRect();
    const core = header.querySelector(".oc-mark-core").getBoundingClientRect();
    return {
      x: Math.abs((brand.left + brand.width / 2) - (core.left + core.width / 2)),
      y: Math.abs((brand.top + brand.height / 2) - (core.top + core.height / 2)),
    };
  }));

  expect(alignment).toEqual([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
});
