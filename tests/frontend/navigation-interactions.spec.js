import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  // The director mount spins up a full three.js viewport, which on CI's
  // software renderer takes well past expect()'s 5s default -- every other
  // viewport spec waits on the mount flag with its own budget for that reason.
  // Reading #status afterwards keeps a mount *failure* loud (with its stack)
  // instead of surfacing as an opaque timeout.
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  const mountResult = await page.evaluate(() => window.omnicamMount);
  expect(await page.locator("#status").textContent(), mountResult?.error ?? "no error").toBe("ready");
  return page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.setViewMode("perspective");
    ui.state.navigation_profile = "maya";
    ui.selectedEntity = "object";
    ui.selectedObjectId = "qa_cube";
    ui.selectedObjectIds = new Set(["qa_cube"]);
    ui.refreshObjects(); ui.render();
    const rect = ui.interactionElement.getBoundingClientRect();
    return { x: rect.left + rect.width * 0.55, y: rect.top + rect.height * 0.6 };
  });
}

test("Alt orbit preserves selection, Escape restores view and releasing commits for reload", async ({ page }) => {
  const point = await mount(page);
  const before = await page.evaluate(() => structuredClone(window.omnicamNode.__majoorOmniCam.state.editor_views.perspective));
  await page.mouse.move(point.x, point.y);
  await page.keyboard.down("Alt");
  await page.mouse.down();
  await page.mouse.move(point.x + 60, point.y + 20, { steps: 5 });
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.editor_views.perspective)).not.toEqual(before);
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.selectedObjectId)).toBe("qa_cube");
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.editor_views.perspective)).toEqual(before);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 50, point.y, { steps: 5 });
  await page.mouse.up();
  await page.keyboard.up("Alt");
  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const cameraTrack = JSON.stringify(ui.state.cameras);
    const view = structuredClone(ui.state.editor_views.perspective);
    ui.serialize();
    ui.restoreFromWidgets();
    return { view, restored: ui.state.editor_views.perspective, sameTrack: JSON.stringify(ui.state.cameras) === cameraTrack,
      pointer: ui.activePointerId, dragging: ui.canvas.classList.contains("dragging") };
  });
  expect(after.view).not.toEqual(before);
  expect(after.restored).toEqual(after.view);
  expect(after.sameTrack).toBe(true);
  expect(after.pointer).toBeNull();
  expect(after.dragging).toBe(false);
});

test("Blender marquee can be cancelled and Fly still starts a look gesture", async ({ page }) => {
  const point = await mount(page);
  await page.evaluate(() => { window.omnicamNode.__majoorOmniCam.state.navigation_profile = "blender"; });
  // Choose an empty corner below the viewport toolbar.
  const corner = await page.evaluate(() => {
    const rect = window.omnicamNode.__majoorOmniCam.interactionElement.getBoundingClientRect();
    return { x: rect.right - 180, y: rect.bottom - 80 };
  });
  await page.mouse.move(corner.x, corner.y);
  await page.mouse.down();
  await page.mouse.move(corner.x - 20, corner.y - 20);
  expect(await page.evaluate(() => Boolean(window.omnicamNode.__majoorOmniCam.boxSelection))).toBe(true);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.selectedObjectId)).toBe("qa_cube");
  await page.keyboard.press("c");
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.drag?.fly)).toBe(true);
  await page.mouse.up();
  await page.keyboard.press("Escape");
});
