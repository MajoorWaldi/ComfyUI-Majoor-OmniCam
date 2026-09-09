import { expect, test } from "@playwright/test";

// Character motion clips: the Motion section picks an embedded clip, sets its
// Director-frame window / speed / loop, and "Bake current frame to pose"
// clears the clip and enters Pose mode (design spec section 27). Every change
// goes through the Semantic Director API.

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );
}

async function selectHeroWithClips(page) {
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
    ui.modelInfoById.set("hero", { animations: 2, animationNames: ["Idle", "Walk"] });
    ui.selectedEntity = "object";
    ui.selectedObjectId = "hero";
    ui.selectedObjectIds = new Set(["hero"]);
    ui.refreshInspector();
  });
}

const heroMotion = (page) =>
  page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "hero").character.motion);

test("the Motion section lists the model's clips and sets one through the API", async ({ page }) => {
  await mount(page);
  await selectHeroWithClips(page);
  const root = page.locator(".majoor-omnicam");

  await expect(root.locator('[data-role="motion-editor"]')).toBeVisible();
  await expect(root.locator('[data-role="motion-clip"] option')).toContainText(["No motion (static)", "Idle", "Walk"]);
  await expect(root.locator('[data-role="motion-start"]')).toBeDisabled();

  await root.locator('[data-role="motion-clip"]').selectOption("Walk");
  expect((await heroMotion(page)).clip_id).toBe("Walk");
  await expect(root.locator('[data-role="motion-start"]')).toBeEnabled();

  await root.locator('[data-role="motion-speed"]').fill("2");
  await root.locator('[data-role="motion-speed"]').dispatchEvent("change");
  expect((await heroMotion(page)).speed).toBe(2);
});

test("Edit Pose is disabled while a motion clip is set", async ({ page }) => {
  await mount(page);
  await selectHeroWithClips(page);
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-role="motion-clip"]').selectOption("Idle");
  await expect(root.locator('[data-pose-act="edit"]')).toBeDisabled();
});

test("Bake current frame to pose clears the motion", async ({ page }) => {
  await mount(page);
  await selectHeroWithClips(page);
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-role="motion-clip"]').selectOption("Walk");
  expect(await heroMotion(page)).not.toBeNull();

  await root.locator('[data-motion-act="bake"]').click();
  expect(await heroMotion(page)).toBeNull();
  const preset = await page.evaluate(
    () => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "hero").character.pose.preset_id,
  );
  expect(preset).toBe("neutral");
});

test("choosing 'No motion' clears the clip", async ({ page }) => {
  await mount(page);
  await selectHeroWithClips(page);
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-role="motion-clip"]').selectOption("Walk");
  expect(await heroMotion(page)).not.toBeNull();
  await root.locator('[data-role="motion-clip"]').selectOption("");
  expect(await heroMotion(page)).toBeNull();
});
