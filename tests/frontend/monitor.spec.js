import { expect, test } from "@playwright/test";

test("Monitor renders its preflight, capability and profile surfaces", async ({ page }) => {
  await page.goto("/tests/frontend/monitor-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading");
  expect(await page.locator("#status").textContent(), await page.evaluate(() => window.monitorError)).toBe("ready");

  await expect(page.locator(".oc-monitor")).toBeVisible();
  await expect(page.locator('[data-role="monitor-status"]')).toHaveText(/WARNING/);

  // Every preflight check the backend returns is shown with its own state, so a
  // warning cannot hide behind an overall verdict.
  const preflight = page.locator('[data-role="profile-preflight"]');
  await expect(preflight).toContainText("Enabled motion layers: 2");
  await expect(preflight).toContainText("Single-camera scene");
  await expect(preflight).toContainText("Encodable trajectories: 1");
  await expect(preflight).toContainText("is not visible on the first sample");
  await expect(preflight.locator('[data-state="warning"]')).toHaveCount(1);

  // A downstream that is not installed has to read as missing, never as blank.
  const capabilities = page.locator('[data-role="profile-capabilities"]');
  await expect(capabilities).toContainText("Wan 2.1 ATI");
  await expect(capabilities).toContainText("missing");
  // ... and it is styled as a problem, not as "not checked".
  await expect(capabilities.locator('[data-state="blocked"]')).toHaveCount(1);

  // The profile catalogue has its own slot; the capability report no longer
  // erases it after a run.
  const catalogue = page.locator('[data-role="profile-catalogue"]');
  await expect(catalogue).toContainText("WanVideoWrapper ATI");
  await expect(catalogue).toContainText("screen_tracks");

  await expect(page.locator('[data-role="profile-select"]')).toBeVisible();
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
