import { expect, test } from "@playwright/test";

// Viewport Labels: the pooled DOM overlay projects an object's annotation /
// name / primary tag through the live camera; the Outliner shows tag chips
// (design spec sections 14-15). Labels stay out of a recording.

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () => window.omnicamNode?.__majoorOmniCam?.webgl?.projectWorldToScreen,
    null,
    { timeout: 15000 },
  );
}

test("an annotation on the selected object renders one label with that text", async ({ page }) => {
  await mount(page);
  const root = page.locator(".majoor-omnicam");

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "object";
    ui.selectedObjectId = "qa_cube";
    ui.selectedObjectIds = new Set(["qa_cube"]);
    ui.directorApi.execute({
      version: 1, id: "tx_label_1", description: "annotate",
      operations: [{ type: "object.set_annotation", objectId: "qa_cube", annotation: { text: "HERO", color: "#8d7ee8" } }],
    });
    ui.render();
  });

  const labels = root.locator(".oc-label-layer .oc-label:not([hidden])");
  await expect(labels).toHaveCount(1);
  await expect(labels.first()).toHaveText("HERO");
});

test("Labels: All + Object Name labels every enabled object", async ({ page }) => {
  await mount(page);
  const root = page.locator(".majoor-omnicam");

  await root.locator('[data-role="label-mode"]').selectOption("all");
  await root.locator('[data-role="label-content"]').selectOption("name");
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.render());

  const texts = await root.locator(".oc-label-layer .oc-label:not([hidden])").allTextContents();
  expect(texts).toContain("QA Cube");
});

test("the overlay is suppressed while recording", async ({ page }) => {
  await mount(page);
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-role="label-mode"]').selectOption("all");

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.recording = true;
    ui.labelOverlay.update();
  });
  await expect(root.locator(".oc-label-layer")).toBeHidden();
});

test("Outliner shows tag chips and search matches a tag", async ({ page }) => {
  await mount(page);
  const root = page.locator(".majoor-omnicam");

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.directorApi.execute({
      version: 1, id: "tx_tags_1", description: "tag",
      operations: [{ type: "object.set_tags", objectId: "qa_cube", tags: ["hero", "subject", "foreground"] }],
    });
    ui.refreshObjects();
  });

  const row = root.locator('.scene-item', { hasText: "QA Cube" });
  await expect(row.locator(".scene-item-tag")).toHaveCount(3); // hero, subject, +1
  await expect(row.locator(".scene-item-tag-more")).toHaveText("+1");

  await root.locator('[data-role="outliner-search"]').fill("foreground");
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.refreshObjects());
  await expect(root.locator('.scene-item', { hasText: "QA Cube" })).toHaveCount(1);
});
