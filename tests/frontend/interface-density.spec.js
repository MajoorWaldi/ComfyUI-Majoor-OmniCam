// The Director's three "Interface" tiers (Basic / Animation / Advanced) used
// to be entirely cosmetic: setDensity() stamped a `data-density` attribute
// nothing ever read. This suite proves each tier actually hides progressively
// more chrome, and that switching tiers never strands the UI on a hidden pane.

import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
}

function setDensity(page, density) {
  return page.evaluate((value) => window.omnicamNode.__majoorOmniCam.setDensity(value), density);
}

// Only one toolbar dropdown stays open at a time (opening a second closes the
// first), matching real usage, so each menu is checked with just itself open.
async function withMenuOpen(page, menuName, run) {
  await page.locator(`[data-menu="${menuName}"] > summary`).click();
  await run();
}

test("Scene menu: Camera Interchange needs Animation, Blocking Scene Sets needs Advanced", async ({ page }) => {
  await mount(page);
  await withMenuOpen(page, "scene", async () => {
    await setDensity(page, "basic");
    await expect(page.locator('[data-act="import-camera"]')).toBeHidden();
    await expect(page.locator('[data-blocking-scene="tabletop_orbit"]')).toBeHidden();
    await expect(page.locator('[data-menu="scene"] [data-object-type="cube"]')).toBeVisible();

    await setDensity(page, "animation");
    await expect(page.locator('[data-act="import-camera"]')).toBeVisible();
    await expect(page.locator('[data-blocking-scene="tabletop_orbit"]')).toBeHidden();

    await setDensity(page, "advanced");
    await expect(page.locator('[data-blocking-scene="tabletop_orbit"]')).toBeVisible();
  });
});

test("Cameras menu: aim/frame stay in Basic, aim baking needs Animation", async ({ page }) => {
  await mount(page);
  await withMenuOpen(page, "camera", async () => {
    await setDensity(page, "basic");
    await expect(page.locator('[data-act="aim-at-object"]')).toBeVisible();
    await expect(page.locator('[data-act="bake-aim-keys"]')).toBeHidden();

    await setDensity(page, "animation");
    await expect(page.locator('[data-act="bake-aim-keys"]')).toBeVisible();
  });
});

test("View menu: sub-object select mode and spatial snapping need Advanced", async ({ page }) => {
  await mount(page);
  await withMenuOpen(page, "view", async () => {
    await setDensity(page, "basic");
    await expect(page.locator('[data-role="select-mode"]')).toBeHidden();
    await expect(page.locator('[data-role="spatial-snap-mode"]')).toBeHidden();
    await expect(page.locator('[data-role="navigation-profile"]')).toBeVisible();

    await setDensity(page, "advanced");
    await expect(page.locator('[data-role="select-mode"]')).toBeVisible();
  });
});

test("Display menu: the radar and diagnostic overlays need Advanced, the resolution gate needs Animation", async ({ page }) => {
  await mount(page);
  await withMenuOpen(page, "display", async () => {
    await setDensity(page, "basic");
    await expect(page.locator('[data-role="show-radar"]')).toBeHidden();
    await expect(page.locator('[data-role="resolution-gate"]')).toBeHidden();
    await expect(page.locator('[data-role="show-wireframe"]')).toBeHidden();
    await expect(page.locator('[data-role="guides"]')).toBeVisible();

    await setDensity(page, "animation");
    await expect(page.locator('[data-role="resolution-gate"]')).toBeVisible();
    await expect(page.locator('[data-role="show-wireframe"]')).toBeHidden();

    await setDensity(page, "advanced");
    await expect(page.locator('[data-role="show-wireframe"]')).toBeVisible();
  });
});

test("Output menu: H3 delivery settings need Animation, Clear Caches needs Advanced", async ({ page }) => {
  await mount(page);
  await withMenuOpen(page, "output", async () => {
    await setDensity(page, "basic");
    await expect(page.locator('[data-act="h3-setup"]')).toBeHidden();
    await expect(page.locator('[data-act="clear-caches"]')).toBeHidden();
    await expect(page.locator('[data-role="playblast-camera"]')).toBeVisible();

    await setDensity(page, "animation");
    await expect(page.locator('[data-act="h3-setup"]')).toBeVisible();
    await expect(page.locator('[data-act="clear-caches"]')).toBeHidden();

    await setDensity(page, "advanced");
    await expect(page.locator('[data-act="clear-caches"]')).toBeVisible();
  });
});

test("basic hides the animation curve editor and its toggle", async ({ page }) => {
  await mount(page);
  await setDensity(page, "basic");
  await expect(page.locator(".oc-graph")).toBeHidden();
  await expect(page.locator('[data-act="toggle-graph"]')).toBeHidden();

  await setDensity(page, "animation");
  await expect(page.locator(".oc-graph")).toBeVisible();
  await expect(page.locator('[data-act="toggle-graph"]')).toBeVisible();
});

test("basic hides vertex/edge/face selection and the Health tab; advanced restores them", async ({ page }) => {
  await mount(page);
  await setDensity(page, "basic");
  await expect(page.locator('[data-select-mode="vertex"]')).toBeHidden();
  await expect(page.locator('[data-select-mode="edge"]')).toBeHidden();
  await expect(page.locator('[data-select-mode="face"]')).toBeHidden();
  await expect(page.locator('[data-select-mode="object"]')).toBeVisible();
  await expect(page.locator('[data-tab="health"]')).toBeHidden();

  await setDensity(page, "advanced");
  await expect(page.locator('[data-select-mode="vertex"]')).toBeVisible();
  await expect(page.locator('[data-tab="health"]')).toBeVisible();
});

test("the Interface selector itself is never hidden by its own setting", async ({ page }) => {
  await mount(page);
  await page.locator('[data-menu="view"] > summary').click();
  for (const density of ["basic", "animation", "advanced"]) {
    await setDensity(page, density);
    await expect(page.locator('[data-role="ui-density"]')).toBeVisible();
  }
});

test("dropping to basic while on the Health tab falls back to the Outliner instead of going blank", async ({ page }) => {
  await mount(page);
  await page.locator('[data-tab="health"]').click();
  await expect(page.locator('[data-tab-panel="health"]')).toBeVisible();

  await setDensity(page, "basic");
  await expect(page.locator('[data-tab="scene"]')).toHaveClass(/active/);
  await expect(page.locator('[data-tab-panel="scene"]')).toBeVisible();
});
