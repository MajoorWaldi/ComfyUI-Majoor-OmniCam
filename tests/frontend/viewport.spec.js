import { expect, test } from "@playwright/test";

test("renders perspective and orthographic scenes and releases WebGL", async ({ page }) => {
  await page.goto("/tests/frontend/harness.html");
  await expect(page.locator("#status")).toHaveText("ready");
  const result = await page.evaluate(() => window.omnicamTest);
  expect(result.error).toBeUndefined();
  expect(result.perspectivePixels).toBe(640 * 360);
  expect(Object.keys(result.modeChildren)).toHaveLength(6);
  expect(Object.values(result.modeChildren).every((count) => count > 0)).toBe(true);
  expect(result.glbLoaded).toBe(true);
  expect(result.codec).toBeTruthy();
  expect(result.encodedBytes).toBeGreaterThan(100);
  expect(result.disposed).toBe(true);
  expect([result.width, result.height]).toEqual([1, 1]);
});
