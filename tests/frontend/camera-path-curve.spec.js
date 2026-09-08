import { expect, test } from "@playwright/test";

// Mirrors camera-path-draw.spec.js: the director mount boots a full three.js
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

test("dragging a tangent handle promotes the keyframe to a bezier and stores spatial handles", async ({ page }) => {
  await mount(page);
  await drawPath(page);

  // Select the middle keyframe so its handles render, then drag a handle knob.
  const dragged = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const track = ui.activeCameraTrack();
    const mid = track.keyframes[Math.floor(track.keyframes.length / 2)];
    ui.selectKeyframe(mid);
    ui.setFrame(mid.frame);
    ui.render();

    const knob = ui.webgl.path.children.find((c) => c.userData?.omnicamCurveHandle?.side === "out");
    if (!knob) return { ok: false };
    const projected = knob.position.clone().project(ui.webgl.activeCamera);
    return {
      ok: true,
      frame: mid.frame,
      fracX: projected.x * 0.5 + 0.5,
      fracY: 1 - (projected.y * 0.5 + 0.5),
    };
  });
  expect(dragged.ok).toBe(true);

  const canvas = page.locator(".viewport-wrap > canvas");
  const cbox = await canvas.boundingBox();
  const cssX = cbox.x + dragged.fracX * cbox.width;
  const cssY = cbox.y + dragged.fracY * cbox.height;

  await page.mouse.move(cssX, cssY);
  await page.mouse.down();
  await page.mouse.move(cssX + 40, cssY - 40, { steps: 6 });
  await page.mouse.up();

  const after = await page.evaluate((frame) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const key = ui.activeCameraTrack().keyframes.find((k) => k.frame === frame);
    return {
      interpolation: key?.interpolation,
      hasChannels: Boolean(key?.tangents?.channels?.pos_x),
      mode: key?.tangents?.spatial_mode,
    };
  }, dragged.frame);

  expect(after.interpolation).toBe("bezier");
  expect(after.hasChannels).toBe(true);
  expect(after.mode).toBe("aligned");
});

test("Handle Type: Corner freezes the tangents and undo restores the smooth path", async ({ page }) => {
  await mount(page);
  await drawPath(page);

  const frame = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const track = ui.activeCameraTrack();
    const mid = track.keyframes[Math.floor(track.keyframes.length / 2)];
    ui.selectKeyframe(mid);
    ui.setFrame(mid.frame);
    ui.setSpatialHandleMode("corner");
    return mid.frame;
  });

  const cornered = await page.evaluate((f) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const key = ui.activeCameraTrack().keyframes.find((k) => k.frame === f);
    return { mode: key?.tangents?.spatial_mode, interpolation: key?.interpolation };
  }, frame);
  expect(cornered.mode).toBe("corner");
  expect(cornered.interpolation).toBe("bezier");

  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.undo());
  const reverted = await page.evaluate((f) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const key = ui.activeCameraTrack().keyframes.find((k) => k.frame === f);
    return key?.tangents?.spatial_mode ?? null;
  }, frame);
  expect(reverted).not.toBe("corner");
});
