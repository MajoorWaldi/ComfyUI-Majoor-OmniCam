import { expect, test } from "@playwright/test";

// The Outliner list and the lower-deck camera-preview column are drag-resizable,
// and the chosen sizes survive a state round-trip (they live in ui.state).

async function mount(page) {
  await page.setViewportSize({ width: 1180, height: 1600 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  await page.waitForTimeout(400);
}

async function dragHandle(page, selector, dx, dy) {
  const handle = page.locator(selector);
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(50);
}

test("dragging the preview splitter widens the camera column and persists it", async ({ page }) => {
  await mount(page);
  const before = await page.evaluate(() => ({
    varPx: getComputedStyle(document.querySelector(".majoor-omnicam")).getPropertyValue("--oc-preview-w").trim(),
    stateWidth: window.omnicamNode.__majoorOmniCam.state.preview_width,
    columnWidth: Math.round(document.querySelector(".oc-preview").getBoundingClientRect().width),
  }));

  await dragHandle(page, '[data-role="preview-resize"]', 120, 0);

  const after = await page.evaluate(() => ({
    stateWidth: window.omnicamNode.__majoorOmniCam.state.preview_width,
    columnWidth: Math.round(document.querySelector(".oc-preview").getBoundingClientRect().width),
  }));
  expect(after.stateWidth).toBeGreaterThan(before.stateWidth + 60);
  expect(after.columnWidth).toBeGreaterThan(before.columnWidth + 60);

  // The size is state, so a widget sync (workflow reload path) keeps it.
  const persisted = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.syncFromWidgets(false);
    return getComputedStyle(document.querySelector(".majoor-omnicam")).getPropertyValue("--oc-preview-w").trim();
  });
  expect(persisted).toBe(`${after.stateWidth}px`);
});

test("dragging the outliner handle grows the visible list box itself", async ({ page }) => {
  await mount(page);
  // Switch to the Outliner tab so its handle is laid out.
  await page.evaluate(() => document.querySelector('[data-tab="scene"]')?.click());
  const boxHeight = () => page.evaluate(() =>
    Math.round(document.querySelector(".scene-tree").getBoundingClientRect().height));
  const before = await boxHeight();
  await dragHandle(page, '[data-role="outliner-resize"]', 0, 180);
  const after = await boxHeight();
  // The box itself must have grown -- not just an inner scrollbar appearing.
  expect(after).toBeGreaterThan(before + 120);
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.outliner_height)).toBe(after);
});

test("double-clicking a handle resets it to the default", async ({ page }) => {
  await mount(page);
  await dragHandle(page, '[data-role="preview-resize"]', 140, 0);
  await page.locator('[data-role="preview-resize"]').dblclick();
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.preview_width)).toBe(236);
});
