import { expect, test } from "@playwright/test";

// The FK Pose editor: it shows for a selected Character, Edit Pose toggles the
// mode, a selected canonical joint gets X/Y/Z rotation inputs, and every change
// goes through the Semantic Director API (design spec sections 25-27).

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );
}

async function selectHero(page) {
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    if (!ui.state.objects.some((o) => o.id === "hero")) {
      ui.state.objects.push({
        id: "hero", type: "glb", name: "Hero",
        asset_id: "omnicam.character.human_neutral_01", asset_kind: "character",
        position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
        character: { rig_profile: "omnicam_humanoid_v1", pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} }, motion: null },
      });
    }
    ui.selectedEntity = "object";
    ui.selectedObjectId = "hero";
    ui.selectedObjectIds = new Set(["hero"]);
    ui.refreshInspector();
  });
}

test("the Pose section appears for a Character with a preset select", async ({ page }) => {
  await mount(page);
  const root = page.locator(".majoor-omnicam");
  await expect(root.locator('[data-role="pose-editor"]')).toBeHidden();

  await selectHero(page);
  await expect(root.locator('[data-role="pose-editor"]')).toBeVisible();
  await expect(root.locator('[data-role="pose-preset"] option')).toContainText(["Standing Neutral", "T Pose"]);
});

test("Edit Pose toggles the mode and reveals joint rotation inputs", async ({ page }) => {
  await mount(page);
  await selectHero(page);
  const root = page.locator(".majoor-omnicam");

  await root.locator('[data-pose-act="edit"]').click();
  await expect(root.locator('[data-pose-act="edit"]')).toHaveClass(/active/);

  // pick a canonical joint (no model bones in the test, so pick via state)
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.subSelection = { type: "character_joint", objectId: "hero", jointId: "upper_arm_r" };
    ui.poseEditor.sync();
  });
  await expect(root.locator('[data-role="pose-joint-row"]')).toBeVisible();
  await expect(root.locator('[data-role="pose-joint-name"]')).toHaveText("upper_arm_r");

  await root.locator('[data-role="pose-rot-z"]').fill("30");
  await root.locator('[data-role="pose-rot-z"]').dispatchEvent("change");

  const stored = await page.evaluate(() => {
    const j = window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "hero").character.pose.joints;
    return j.upper_arm_r || null;
  });
  expect(Array.isArray(stored)).toBe(true);
  expect(Math.hypot(...stored)).toBeCloseTo(1, 6);
});

test("Edit Pose is disabled while a motion clip is set (spec section 27)", async ({ page }) => {
  await mount(page);
  await selectHero(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.objects.find((o) => o.id === "hero").character.motion = { clip_id: "walk" };
    ui.poseEditor.sync();
  });
  await expect(page.locator('.majoor-omnicam [data-pose-act="edit"]')).toBeDisabled();
});

test("choosing a preset writes it through the Semantic API", async ({ page }) => {
  await mount(page);
  await selectHero(page);
  const root = page.locator(".majoor-omnicam");

  await root.locator('[data-role="pose-preset"]').selectOption("t_pose");
  const presetId = await page.evaluate(
    () => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "hero").character.pose.preset_id,
  );
  expect(presetId).toBe("t_pose");
});
