import { expect, test } from "@playwright/test";

// Task 4 of docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md:
// the real Three.js TransformControls now owns object / camera / camera_target
// manipulation. These tests drive the actual on-screen gizmo through real
// pointer events at its screen-space free-translate/rotate handle (the small
// centre control TransformControls always renders at the anchor's own
// projected position), computed with the same `project()` helper the legacy
// gizmo's own regression tests use.

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  await page.waitForFunction(() => window.omnicamNode?.__majoorOmniCam?.webgl, null, { timeout: 15000 });
}

/** CSS-pixel point (relative to the page) where `worldPosition` projects
 * under the REAL Three.js camera TransformControls itself raycasts against.
 * The test dev server (tests/frontend/global-setup.mjs) is a plain Vite
 * server over the repo root, so the source module is reachable directly. */
async function screenPoint(page, worldPosition) {
  return page.evaluate(async ({ worldPosition }) => {
    const { Vector3 } = await import("/web-src/three-runtime.js");
    const ui = window.omnicamNode.__majoorOmniCam;
    const v = new Vector3(...worldPosition).project(ui.webgl.activeCamera);
    const rect = ui.interactionElement.getBoundingClientRect();
    return {
      x: rect.left + ((v.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - v.y) / 2) * rect.height,
    };
  }, { worldPosition });
}


test("select object, translate, drag the gizmo, release: one history step", async ({ page }) => {
  await mount(page);
  const ui = () => page.evaluate(() => ({
    position: window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position,
    historyLength: window.omnicamNode.__majoorOmniCam.history.stack?.length ?? null,
  }));

  await page.locator('[data-object-id="qa_cube"]').click();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setTransformMode("translate"));
  const before = await ui();

  const object = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  const point = await screenPoint(page, object);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 40, point.y - 20, { steps: 4 });
  await page.mouse.up();

  const after = await ui();
  expect(after.position).not.toEqual(before.position);
  const undone = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.undo();
    return ui.state.objects.find((o) => o.id === "qa_cube").position;
  });
  expect(undone).toEqual(before.position);
});

test("camera cannot be scaled: no gizmo attaches, and dragging its former handle does nothing", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "camera";
    ui.selectedObjectId = null;
    ui.setTransformMode("scale");
    ui.render();
  });
  const attached = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return ui.webgl.scene.children.some((child) => child.isTransformControlsRoot && child.visible);
  });
  expect(attached).toBe(false);
  const before = await page.evaluate(() => ({ ...window.omnicamNode.__majoorOmniCam.camera }));
  const point = await screenPoint(page, before.position);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 50, point.y + 50, { steps: 4 });
  await page.mouse.up();

  const after = await page.evaluate(() => ({ ...window.omnicamNode.__majoorOmniCam.camera }));
  expect(after.position).toEqual(before.position);
  expect(after.target).toEqual(before.target);
});

test("camera target supports translate only: rotate/scale never attach a gizmo to it", async ({ page }) => {
  // Clicking exactly at the target's world position also hits its own
  // always-on pickable marker (a separate, pre-existing "grab the target
  // diamond directly" feature, unrelated to this gizmo) -- so this checks the
  // wiring's own attach decision rather than simulating a pointer drag, which
  // would exercise that unrelated feature instead of what Task 4 changed.
  await mount(page);
  const attachedForMode = async (mode) => page.evaluate((mode) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "camera_target";
    ui.selectedObjectId = null;
    ui.setTransformMode(mode);
    ui.render();
    // The helper root is added to the scene once and reused; attach()/detach()
    // toggle its own .visible rather than adding/removing it.
    return ui.webgl.scene.children.some((child) => child.isTransformControlsRoot && child.visible);
  }, mode);

  expect(await attachedForMode("rotate")).toBe(false);
  expect(await attachedForMode("scale")).toBe(false);
  expect(await attachedForMode("translate")).toBe(true);
});

test("orbit navigation is disabled while the gizmo is dragging", async ({ page }) => {
  await mount(page);
  await page.locator('[data-object-id="qa_cube"]').click();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setTransformMode("translate"));
  const object = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  const point = await screenPoint(page, object);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  // A large move well away from the handle used to be exactly the gesture that
  // armed viewport orbit once a gizmo drag had already claimed the pointer.
  await page.mouse.move(point.x + 300, point.y + 5, { steps: 4 });
  const draggingArmedNav = await page.evaluate(() => Boolean(window.omnicamNode.__majoorOmniCam.drag));
  await page.mouse.up();

  expect(draggingArmedNav).toBe(false);
});

test("Escape restores the pre-drag transform", async ({ page }) => {
  await mount(page);
  await page.locator('[data-object-id="qa_cube"]').click();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setTransformMode("translate"));
  const before = await page.evaluate(() => [...window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position]);
  const point = await screenPoint(page, before);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 40, point.y - 20, { steps: 4 });
  const moved = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  expect(moved).not.toEqual(before);

  await page.keyboard.press("Escape");
  await page.mouse.up();

  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  expect(after).toEqual(before);
});
