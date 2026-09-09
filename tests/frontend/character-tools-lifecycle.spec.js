import { expect, test } from "@playwright/test";

// Every unified-assets surface the Director attaches (Asset Browser, label
// overlay, rig mapper, pose editor + rig-joint overlay, motion editor) must
// tear down cleanly when the node is removed -- no leaked DOM, no page errors
// (design spec section 38, "disposal").

test("the character tools attach on mount and detach on node removal", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );

  // Exercise every surface so its listeners / overlays actually exist.
  await page.evaluate(async () => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.objects.push({
      id: "hero", type: "glb", name: "Hero",
      asset_id: "omnicam.character.human_neutral_01", asset_kind: "character",
      position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
      character: { rig_profile: "omnicam_humanoid_v1", pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} }, motion: null },
    });
    ui.modelInfoById.set("hero", { animations: 1, animationNames: ["Walk"] });
    ui.selectedEntity = "object";
    ui.selectedObjectId = "hero";
    ui.selectedObjectIds = new Set(["hero"]);
    ui.refreshInspector();
    await ui.assetBrowser.switchView("assets");
    ui.poseEditor.sync();
  });

  const root = page.locator(".majoor-omnicam");
  await expect(root.locator(".oc-label-layer")).toHaveCount(1);
  await expect(root.locator(".oc-rig-overlay")).toHaveCount(1);
  await expect(root.locator('[data-role="assets-panel"]')).toHaveCount(1);

  const disposed = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const refs = ["assetBrowser", "labelOverlay", "rigMapper", "poseEditor", "motionEditor", "rigOverlay"];
    const present = refs.filter((r) => ui[r] && typeof ui[r].dispose === "function");
    window.omnicamNode.onRemoved();
    return { present, disposedFlag: ui.disposed === true };
  });
  expect(disposed.present.length).toBeGreaterThanOrEqual(5);
  expect(disposed.disposedFlag).toBe(true);

  // The pooled overlays are DOM children of .viewport-wrap; disposal removes them.
  await expect(root.locator(".oc-label-layer")).toHaveCount(0);
  await expect(root.locator(".oc-rig-overlay")).toHaveCount(0);
  expect(errors).toEqual([]);
});
