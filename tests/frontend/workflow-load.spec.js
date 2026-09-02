import { expect, test } from "@playwright/test";

test("a workflow load that beats the lazy chunk still restores the Director", async ({ page }) => {
  await page.goto("/tests/frontend/director-workflow-load.html");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });
  const result = await page.evaluate(() => window.omnicamLoad);
  expect(result.attached).toBe(true);
  // The Director's own constructor re-reads the widgets, so the state survives
  // even though the attach lands after configure(); this pins that end-to-end
  // result down rather than the mechanism that produces it.
  expect(result.cameraIds).toEqual(["from_workflow_a", "from_workflow_b"]);
  expect(result.width).toBe(1920);
  expect(result.height).toBe(1080);
  expect(result.fps).toBe(30);
  expect(result.duration).toBe(8);
  // The node's saved [800, 800] is above Director's [760, 760] minimum, so
  // the loaded-workflow path must leave it exactly alone -- never the
  // fresh-node default, and never clamped when there was nothing to clamp.
  expect(result.size).toEqual([800, 800]);
});

test("a fresh Director gets the comfortable default size; a too-small restored one is floored", async ({ page }) => {
  // This page attaches three full Director UIs in sequence (fresh, tiny-restored,
  // saved-restored), each standing up its own WebGL viewport, so it legitimately
  // takes longer than the single-attach pages above -- give it more headroom
  // than the default 30s test timeout and a matching wait for #status.
  test.setTimeout(60_000);
  // A window comfortably larger than the raw default, so the fresh-node path
  // is observed without its viewport cap engaging -- the cap itself is pinned
  // in tests/frontend/node-layout.node.mjs.
  await page.setViewportSize({ width: 1760, height: 1900 });
  await page.goto("/tests/frontend/director-node-sizing.html");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 45_000 });
  const result = await page.evaluate(() => window.omnicamSizing);
  expect(result.freshAttached).toBe(true);
  expect(result.freshSize).toEqual([1313, 1633]);
  expect(result.tinyAttached).toBe(true);
  expect(result.tinySize).toEqual([760, 760]);
  // A real browser refresh: LiteGraph's own widget-less layout pass shrinks
  // node.size again right after configure() applies the saved size. The
  // saved size, captured directly off the configure() call, must still win.
  expect(result.restoredAttached).toBe(true);
  expect(result.restoredSize).toEqual([1313.3125, 1632.5625]);
});

test("a node deleted while its chunk loads is never attached", async ({ page }) => {
  await page.goto("/tests/frontend/director-removed-during-load.html");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });
  const result = await page.evaluate(() => window.omnicamRemoved);
  // Attaching here would leak a DOM widget and a WebGL context on a dead node.
  expect(result.attached).toBe(false);
  expect(result.widgetAdded).toBe(false);
  expect(result.hostChildren).toBe(0);
});
