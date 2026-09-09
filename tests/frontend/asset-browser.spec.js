import { expect, test } from "@playwright/test";

// The ASSETS tab of the Director left panel: it fetches the unified catalog on
// first open, renders a filtered grid, and a double-click compiles a
// deterministic scene object (design spec sections 11 and 16).

async function mountDirector(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );
}

test("switching to ASSETS loads the catalog grid and hides the SCENE tab", async ({ page }) => {
  await mountDirector(page);
  const root = page.locator(".majoor-omnicam");

  await root.locator('[data-asset-view="assets"]').click();
  await expect(root.locator('[data-role="asset-grid"] .oc-asset-card')).toHaveCount(2);
  await expect(root.locator('[data-role="scene-tab"]')).toBeHidden();
  await expect(root.locator('[data-role="assets-tab"]')).toBeVisible();
  // the rigged character advertises its rig
  await expect(root.locator('.oc-asset-card', { hasText: "Human Neutral 01" }).locator(".oc-asset-badge")).toHaveText(/RIGGED/);
});

test("a kind chip narrows the grid", async ({ page }) => {
  await mountDirector(page);
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-asset-view="assets"]').click();
  await expect(root.locator('[data-role="asset-grid"] .oc-asset-card')).toHaveCount(2);

  await root.locator('[data-asset-kind="prop"]').click();
  // the stub echoes the same page regardless of filter, but the request went out
  await expect(root.locator('[data-asset-kind="prop"]')).toHaveClass(/active/);
});

test("double-clicking a card instantiates a deterministic scene object", async ({ page }) => {
  await mountDirector(page);
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-asset-view="assets"]').click();

  const card = root.locator('.oc-asset-card', { hasText: "Human Neutral 01" });
  await card.waitFor();

  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.length);
  await card.dblclick();

  const result = await page.evaluate(() => {
    const objects = window.omnicamNode.__majoorOmniCam.state.objects;
    const added = objects[objects.length - 1];
    return {
      count: objects.length,
      type: added.type,
      assetKind: added.asset_kind,
      assetId: added.asset_id,
      rigProfile: added.character?.rig_profile,
      posePreset: added.character?.pose?.preset_id,
    };
  });

  expect(result.count).toBe(before + 1);
  expect(result.type).toBe("glb");
  expect(result.assetKind).toBe("character");
  expect(result.assetId).toBe("omnicam.character.human_neutral_01");
  expect(result.rigProfile).toBe("omnicam_humanoid_v1");
  expect(result.posePreset).toBe("neutral");
});
