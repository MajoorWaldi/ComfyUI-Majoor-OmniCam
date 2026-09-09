import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });
}

test("selecting an object routes the Inspector to the object pane; a mode button overrides, a new selection restores", async ({ page }) => {
  await mount(page);
  const pane = (name) => page.locator(`[data-tab-panel="${name}"]`);

  // Default selection is the camera -> camera pane.
  await expect(pane("camera")).toBeVisible();
  await expect(pane("scene")).toBeHidden();

  // Select the object -> the object-transform pane, no tab click needed.
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "object";
    ui.selectedObjectId = "qa_cube";
    ui.refreshInspector();
  });
  await expect(pane("scene")).toBeVisible();
  await expect(pane("camera")).toBeHidden();

  // A secondary mode button overrides the entity context.
  await page.locator('[data-inspector-mode="motion"]').click();
  await expect(pane("motion")).toBeVisible();
  await expect(page.locator(".majoor-omnicam:not(.context-menu)")).toHaveClass(/oc-motion-mode/);

  // Selecting a different entity drops the mode and shows that entity again.
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "camera";
    ui.selectedObjectId = null;
    ui.refreshInspector();
  });
  await expect(pane("camera")).toBeVisible();
  await expect(pane("motion")).toBeHidden();
  await expect(page.locator('[data-inspector-mode="motion"]')).not.toHaveClass(/active/);
});
