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

  const modeButtons = page.locator("[data-select-mode]");
  await expect(modeButtons).toHaveCount(4);
  for (let index = 0; index < 4; index++) await expect(modeButtons.nth(index)).toBeVisible();

  const objectRow = page.locator('[data-object-id="qa_cube"]');
  await expect(objectRow).toBeVisible();
  const rowBox = await objectRow.boundingBox();
  expect(await page.evaluate(({ x, y }) => {
    const hit = document.elementFromPoint(x, y);
    return { tag: hit?.tagName, cls: hit?.className, objectId: hit?.closest?.("[data-object-id]")?.dataset.objectId || null };
  }, { x: rowBox.x + 30, y: rowBox.y + 13 })).toEqual({ tag: "SPAN", cls: "", objectId: "qa_cube" });
  await objectRow.click({ position: { x: 30, y: 13 } });
  expect(await page.evaluate(() => ({ id: window.omnicamNode.__majoorOmniCam.selectedObjectId, entity: window.omnicamNode.__majoorOmniCam.selectedEntity }))).toEqual({ id: "qa_cube", entity: "object" });
  await expect(objectRow).toHaveClass(/selected/);

  await page.locator('[data-select-mode="face"]').click();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.select_mode)).toBe("face");
  await objectRow.click({ button: "right", position: { x: 30, y: 13 } });
  expect(await page.evaluate(() => window.omnicamMount?.error || null)).toBeNull();
  await expect(page.locator('body > [data-role="context-menu"] .context-menu-title')).toHaveText("QA Cube");
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
  expect(result.selectionVisible).toBe(true);
  expect(result.disposed).toBe(true);
  expect([result.width, result.height]).toEqual([1, 1]);
});

test("sequencer extension mounts its editorial UI instead of raw V3 widgets", async ({ page }) => {
  await page.goto("/tests/frontend/sequencer-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading");
  const result = await page.evaluate(() => window.omnicamSequencerMount);
  expect(await page.locator("#status").textContent(), result?.error ?? "no error").toBe("ready");
  expect(result.mounted).toBe(true);
  expect(result.hasToolbar).toBe(true);
  expect(result.hasCanvas).toBe(true);
  expect(result.hasSpeedGraph).toBe(true);
  expect(result.buttonCount).toBeGreaterThanOrEqual(12);
  expect(result.hiddenState).toBe(true);
  expect(result.collectionShotCount).toBe(2);
  expect(result.connectedVideoCount).toBe(1);
  expect(result.selectedGraphShot).toBe("shot_000");
  expect(result.disconnectedVideoCount).toBe(0);
});
