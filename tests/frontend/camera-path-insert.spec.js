import { expect, test } from "@playwright/test";

// Mirrors camera-path-curve.spec.js: the director mount boots a full three.js
// viewport well past expect()'s default budget on CI's software renderer.
async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent !== "loading",
    null,
    { timeout: 30000 },
  );
  const mountResult = await page.evaluate(() => window.omnicamMount);
  expect(await page.locator("#status").textContent(), mountResult?.error ?? "no error").toBe("ready");
}

async function drawPath(page) {
  await page.evaluate(() => {
    window.omnicamNode.__majoorOmniCam.state.playback_range = [0, 60];
  });
  await page.locator('[data-act="draw-camera-path"]').click();
  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.6, { steps: 8 });
  await page.mouse.up();
  return { canvas, box };
}

test("double-clicking the rendered path inserts a new camera key there, one undo step", async ({ page }) => {
  // The viewport is no longer forced to 16:9 (Director modal audit, Lot 1:
  // the true output framing is drawn at render time, not enforced by CSS),
  // so the default test window's bounded stage renders it noticeably wider
  // than tall -- this test's midpoint sample can land where the freehand
  // path is nearly edge-on to the camera at that shape and go unhit. A
  // taller window gives the bounded stage enough headroom to land close to
  // 16:9 again without depending on an exact viewport shape.
  await page.setViewportSize({ width: 1440, height: 1100 });
  await mount(page);
  await drawPath(page);

  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.length);
  expect(before).toBeGreaterThanOrEqual(2);

  // Project a point that lies exactly on the tube's own centreline (the same
  // sample array rebuildPath() used to build the tube geometry) so the
  // double-click is guaranteed to land on the rendered surface, however much
  // the freehand curve bows between its control points.
  const target = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const segMesh = ui.webgl.path.children.find((c) => c.userData?.omnicamPathSegments);
    if (!segMesh) return null;
    const { points, firstFrame, lastFrame } = segMesh.userData.omnicamPathSegments;
    const idx = Math.floor(points.length / 2);
    const [x, y, z] = points[idx];
    // Reuse an existing THREE.Vector3 instance from the scene graph -- this
    // module has no direct import of the THREE namespace.
    const vec = ui.webgl.path.children[0].position.clone().set(x, y, z).project(ui.webgl.activeCamera);
    const hitFrame = firstFrame + ((lastFrame - firstFrame) * idx) / Math.max(1, points.length - 1);
    return {
      hitFrame,
      fracX: vec.x * 0.5 + 0.5,
      fracY: 1 - (vec.y * 0.5 + 0.5),
    };
  });
  expect(target).not.toBeNull();

  const canvas = page.locator(".viewport-wrap > canvas");
  const cbox = await canvas.boundingBox();
  const cssX = cbox.x + target.fracX * cbox.width;
  const cssY = cbox.y + target.fracY * cbox.height;
  await page.mouse.dblclick(cssX, cssY);

  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return {
      count: ui.activeCameraTrack().keyframes.length,
      selectedFrame: ui.selectedKeyFrame,
    };
  });
  expect(after.count).toBe(before + 1);
  expect(after.selectedFrame).not.toBeNull();
  // The inserted key must land strictly inside the segment the double-click hit.
  expect(Math.abs(after.selectedFrame - target.hitFrame)).toBeLessThan(6);

  // One undo step removes exactly the inserted key.
  await page.keyboard.press("Control+z");
  const undone = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.length);
  expect(undone).toBe(before);
});
