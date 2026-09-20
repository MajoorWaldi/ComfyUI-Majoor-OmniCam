import { expect, test } from "@playwright/test";

// P2: the Reference Role Matrix editor, plus the guide_reference_index /
// guide_style controls it sits beside. Uses the same real-node fixture as
// workbench-monitor.spec.js so writes actually round-trip through the
// backing ComfyUI widgets, not just the DOM. Monitor mounts inline now (no
// compact shell, no modal) -- the panel is already there once the fixture
// reports "ready".

/** The matrix lives inside a collapsed `<details>` (no Monitor `<details>`
 * ships pre-opened) -- expand it before interacting with anything inside. */
const openMatrix = (page) => page.locator('[data-role="reference-matrix-rows"]')
  .locator("xpath=ancestor::details[1]/summary").click();

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/frontend/workbench-monitor-mount.html");
  await expect(page.locator("#status")).toHaveText("ready");
  await openMatrix(page);
});

test("guide_reference_index and guide_style persist to their backing widgets", async ({ page }) => {
  await page.locator('[data-setting="guide_reference_index"]').fill("3");
  await page.locator('[data-setting="guide_reference_index"]').dispatchEvent("change");
  await page.locator('[data-setting="guide_style"]').selectOption("clay");

  const values = await page.evaluate(() => {
    const widget = (name) => window.monitorNode.widgets.find((item) => item.name === name)?.value;
    return { guideReferenceIndex: widget("guide_reference_index"), guideStyle: widget("guide_style") };
  });
  expect(values.guideReferenceIndex).toBe(3);
  expect(values.guideStyle).toBe("clay");
});

test("adding a reference row and filling it in serializes to reference_plan_json", async ({ page }) => {
  await page.locator('[data-act="reference-matrix-add"]').click();
  const row = page.locator('[data-role="reference-row"]').first();
  await expect(row).toBeVisible();

  await row.locator('[data-field="id"]').fill("identity_img");
  await row.locator('[data-field="media_type"]').selectOption("image");
  await row.locator('[data-field="slot_hint"]').fill("1");
  await row.locator('[data-field="roles"]').selectOption(["identity", "design"]);
  // Selecting the last option fires "change" without needing a separate blur.
  await row.locator('[data-field="roles"]').dispatchEvent("change");

  const plan = await page.evaluate(() => JSON.parse(
    window.monitorNode.widgets.find((item) => item.name === "reference_plan_json").value,
  ));
  expect(plan).toEqual([{ id: "identity_img", media_type: "image", roles: ["identity", "design"], slot_hint: 1 }]);
});

test("removing a reference row clears it from reference_plan_json", async ({ page }) => {
  await page.locator('[data-act="reference-matrix-add"]').click();
  await page.locator('[data-role="reference-row"]').first().locator('[data-field="id"]').fill("identity_img");
  await page.locator('[data-role="reference-row"]').first().locator('[data-field="id"]').dispatchEvent("change");

  await page.locator('[data-act="reference-row-remove"]').first().click();
  await expect(page.locator('[data-role="reference-row"]')).toHaveCount(0);

  const raw = await page.evaluate(() =>
    window.monitorNode.widgets.find((item) => item.name === "reference_plan_json").value);
  expect(JSON.parse(raw)).toEqual([]);
});

test("a plan restored from a saved workflow renders its rows once re-synced", async ({ page }) => {
  const plan = JSON.stringify([{ id: "action_video", media_type: "video", slot_hint: 2, roles: ["subject_action"] }]);
  await page.evaluate((value) => {
    window.monitorNode.widgets.find((item) => item.name === "reference_plan_json").value = value;
    // Simulates a workflow reload: ComfyUI calls the node's own onConfigure,
    // which attachMonitor wires to MonitorUI.syncControlsFromWidgets().
    window.monitorNode.onConfigure();
  }, plan);
  // The <details> section stays open across the resync -- only its rows are
  // repainted -- so no second openMatrix() call is needed here.

  const row = page.locator('[data-role="reference-row"]').first();
  await expect(row).toBeVisible();
  await expect(row.locator('[data-field="id"]')).toHaveValue("action_video");
  await expect(row.locator('[data-field="slot_hint"]')).toHaveValue("2");
});
