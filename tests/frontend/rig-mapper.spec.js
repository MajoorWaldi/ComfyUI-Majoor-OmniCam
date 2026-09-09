import { expect, test } from "@playwright/test";

// The Rig Mapper shows only for a selected Character, lists all 22
// OMNICAM_HUMANOID_V1 joints, seeds from the catalog row, and Auto Map runs the
// shared auto-mapper on the loaded model's bones (design spec section 23).

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );
}

async function selectCharacter(page) {
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.objects.push({
      id: "hero", type: "glb", name: "Hero",
      asset_id: "omnicam.character.human_neutral_01", asset_kind: "character",
      position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
      character: { rig_profile: "omnicam_humanoid_v1", pose: { preset_id: "neutral" }, motion: null },
    });
    ui.selectedEntity = "object";
    ui.selectedObjectId = "hero";
    ui.selectedObjectIds = new Set(["hero"]);
    ui.refreshInspector();
  });
}

test("the Rig Mapper appears for a Character with all 22 joint rows", async ({ page }) => {
  await mount(page);
  const root = page.locator(".majoor-omnicam");
  await expect(root.locator('[data-role="rig-mapper"]')).toBeHidden();

  await selectCharacter(page);
  await expect(root.locator('[data-role="rig-mapper"]')).toBeVisible();
  await expect(root.locator('[data-role="rig-mapper-grid"] .oc-rig-row')).toHaveCount(22);
  // seeded from the catalog row -> a complete map -> status reads OK
  await expect(root.locator('[data-role="rig-mapper-status"]')).toContainText("✓");
});

test("Auto Map on a model with no bones leaves every joint unmapped", async ({ page }) => {
  await mount(page);
  await selectCharacter(page);
  const root = page.locator(".majoor-omnicam");

  await root.locator('[data-rig-act="auto"]').click();
  await expect(root.locator('[data-role="rig-mapper-status"]')).toContainText("22");
  await expect(root.locator('.oc-rig-row.ok')).toHaveCount(0);
});

test("selecting a non-character hides the Rig Mapper again", async ({ page }) => {
  await mount(page);
  await selectCharacter(page);
  const root = page.locator(".majoor-omnicam");
  await expect(root.locator('[data-role="rig-mapper"]')).toBeVisible();

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedObjectId = "qa_cube";
    ui.selectedObjectIds = new Set(["qa_cube"]);
    ui.refreshInspector();
  });
  await expect(root.locator('[data-role="rig-mapper"]')).toBeHidden();
});
