import { expect, test } from "@playwright/test";

test("director UI mounts with viewport, timeline, curve editor and previews", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  const status = await page.locator("#status").textContent();
  const result = await page.evaluate(() => window.omnicamMount);
  expect(status, result?.error ?? "no error").toBe("ready");
  expect(result.mounted).toBe(true);
  expect(result.canvasSized).toBe(true);
  expect(result.hasTimeline).toBe(true);
  expect(result.hasCurve).toBe(true);
  expect(result.hasPreviews).toBe(true);
  expect(result.keysCount).toBeGreaterThan(0);
  expect(result.unsafeNameElements).toBe(0);
  expect(result.nameExecuted).toBe(false);
});

test("renders perspective and orthographic scenes and releases WebGL", async ({ page }) => {
  await page.goto("/tests/frontend/harness.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15_000 });
  const result = await page.evaluate(() => window.omnicamTest);
  expect(await page.locator("#status").textContent(), result?.error ?? "no error").toBe("ready");
  expect(result.error).toBeUndefined();
  expect(result.perspectivePixels).toBe(640 * 360);
  expect(Object.keys(result.modeChildren)).toHaveLength(6);
  expect(Object.values(result.modeChildren).every((count) => count > 0)).toBe(true);
  expect(result.glbLoaded).toBe(true);
  expect(result.disposed).toBe(true);
  expect([result.width, result.height]).toEqual([1, 1]);
});
