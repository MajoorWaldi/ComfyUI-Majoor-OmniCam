import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });
}

// Director modal audit Lot 3: Timeline (the dope sheet), Graph (the curve
// editor) and Sequence share one block with the camera preview via a tab
// strip instead of stacking as two separate sections (.oc-lower always
// visible, a collapsible .oc-graph below it). There is no more "collapse the
// whole editor" toggle -- switching tabs replaces the visible stage, and
// transport/solve-health stay visible no matter which tab is active.
test("Timeline, Graph and Sequence are tabs of one block alongside the player", async ({ page }) => {
  await mount(page);

  await expect(page.locator('[data-role="graph-tabs"] [data-graph-tab]')).toHaveCount(3);
  await expect(page.locator('[data-graph-tab="dope"]')).toHaveText("Timeline");
  await expect(page.locator('[data-graph-tab="curves"]')).toContainText("Graph");
  await expect(page.locator('[data-graph-tab="sequence"]')).toHaveText("Sequence");

  // Timeline is the default: the fully-interactive dope sheet is visible,
  // and transport/solve-health share the same always-visible column.
  await expect(page.locator('[data-graph-tab="dope"]')).toHaveClass(/active/);
  await expect(page.locator('[data-role="dope-stage"]')).toBeVisible();
  await expect(page.locator('[data-role="curve-canvas"]')).toBeHidden();
  await expect(page.locator(".oc-transport")).toBeVisible();
  await expect(page.locator('[data-role="camera-previews"]')).toBeVisible();

  await page.locator('[data-graph-tab="curves"]').click();
  await expect(page.locator('[data-role="dope-stage"]')).toBeHidden();
  await expect(page.locator('[data-role="curve-canvas"]')).toBeVisible();
  // Transport and the player never leave, whichever tab is active.
  await expect(page.locator(".oc-transport")).toBeVisible();
  await expect(page.locator('[data-role="camera-previews"]')).toBeVisible();

  await page.locator('[data-graph-tab="sequence"]').click();
  await expect(page.locator('[data-role="curve-canvas"]')).toBeHidden();
  await expect(page.locator('[data-role="graph-sequence"]')).toBeVisible();
});
