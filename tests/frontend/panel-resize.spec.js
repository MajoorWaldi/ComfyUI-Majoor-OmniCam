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

// A real bug report: dragging the Outliner (or Assets/Agent) handle bigger,
// with no ceiling tied to the .oc-left-body it scrolls in, could push the
// handle itself out of the scrolled-to area -- its own laid-out position then
// overlapped the dock below, so a click "at" the handle actually landed on
// the camera preview instead (reported as a broken/blank area in the panel).
test("the outliner handle stays reachable and .oc-left-body never overflows, even after repeated large drags", async ({ page }) => {
  // A shorter window than the other tests here, so .oc-left-body genuinely
  // doesn't have room for the old unbounded growth -- this is what exposed
  // the bug in the first place.
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  await page.waitForTimeout(400);

  for (let i = 0; i < 5; i++) {
    await dragHandle(page, '[data-role="outliner-resize"]', 0, 300);
  }

  const info = await page.evaluate(() => {
    const body = document.querySelector(".oc-left-body[data-role='scene-tab']");
    const handleEl = document.querySelector('[data-role="outliner-resize"]');
    const r = handleEl.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      bodyScrollHeight: body.scrollHeight,
      bodyClientHeight: body.clientHeight,
      handleReachable: hit === handleEl || handleEl.contains(hit),
    };
  });
  expect(info.handleReachable).toBe(true);
  expect(info.bodyScrollHeight).toBeLessThanOrEqual(info.bodyClientHeight + 1);
});

// The actual root cause behind the report above: .oc-search's flex:1 (shell.js)
// is meant for a ROW toolbar (the search input filling leftover WIDTH next to
// an icon button, e.g. the Assets/Agent tabs' own toolbars) -- but the
// Outliner's search input is a direct child of .oc-left-body, a COLUMN flex,
// where the same flex:1 instead grows it to fill leftover column HEIGHT. In a
// tall window with a modest Outliner list, that turned the search box into a
// tall, mostly-empty rectangle -- looking like a broken/blank area, worse the
// smaller the Outliner list itself was (so it read as "linked to resizing").
test("the outliner search input never grows past a normal single-line height, regardless of available room", async ({ page }) => {
  // Tall window, small default Outliner list: maximum leftover column height
  // for a wrongly flex:1 search input to have grown into.
  await page.setViewportSize({ width: 1180, height: 1600 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  await page.waitForTimeout(400);

  const searchHeight = await page.evaluate(() =>
    Math.round(document.querySelector('.oc-left-body input.oc-search[data-role="outliner-search"]').getBoundingClientRect().height));
  expect(searchHeight).toBeLessThan(40);
});
