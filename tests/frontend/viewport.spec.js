import { expect, test } from "@playwright/test";

test("director UI mounts with viewport, timeline, curve editor and previews", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  const status = await page.locator("#status").textContent();
  const result = await page.evaluate(() => window.omnicamMount);
  expect(status, result?.error ?? "no error").toBe("ready");
  expect(result.mounted).toBe(true);
  expect(result.canvasSized).toBe(true);
  expect(result.hasTimeline).toBe(true);
  expect(result.hasCurve).toBe(true);
  expect(result.hasPreviews).toBe(true);
  expect(result.keysCount).toBeGreaterThan(0);
  expect(result.unsafeNameElements).toBe(0);
  expect(result.nameExecuted).toBe(false);

  const modeButtons = page.locator("[data-select-mode]");
  await expect(modeButtons).toHaveCount(4);
  for (let index = 0; index < 4; index++) await expect(modeButtons.nth(index)).toBeVisible();

  const objectRow = page.locator('[data-object-id="qa_cube"]');
  await expect(objectRow).toBeVisible();
  const rowBox = await objectRow.boundingBox();
  expect(await page.evaluate(({ x, y }) => {
    const hit = document.elementFromPoint(x, y);
    return { tag: hit?.tagName, cls: hit?.className, objectId: hit?.closest?.("[data-object-id]")?.dataset.objectId || null };
  }, { x: rowBox.x + 30, y: rowBox.y + 13 })).toEqual({ tag: "SPAN", cls: "", objectId: "qa_cube" });
  await objectRow.click({ position: { x: 30, y: 13 } });
  expect(await page.evaluate(() => ({ id: window.omnicamNode.__majoorOmniCam.selectedObjectId, entity: window.omnicamNode.__majoorOmniCam.selectedEntity }))).toEqual({ id: "qa_cube", entity: "object" });
  await expect(objectRow).toHaveClass(/selected/);

  await page.locator('[data-select-mode="face"]').click();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.select_mode)).toBe("face");
  await objectRow.click({ button: "right", position: { x: 30, y: 13 } });
  expect(await page.evaluate(() => window.omnicamMount?.error || null)).toBeNull();
  await expect(page.locator('body > [data-role="context-menu"] .context-menu-title')).toHaveText("QA Cube");
});

test("renders perspective and orthographic scenes and releases WebGL", async ({ page }) => {
  await page.goto("/tests/frontend/harness.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15_000 });
  const result = await page.evaluate(() => window.omnicamTest);
  expect(await page.locator("#status").textContent(), result?.error ?? "no error").toBe("ready");
  expect(result.error).toBeUndefined();
  expect(result.perspectivePixels).toBe(640 * 360);
  expect(Object.keys(result.modeChildren)).toHaveLength(6);
  expect(Object.values(result.modeChildren).every((count) => count > 0)).toBe(true);
  expect(result.glbLoaded).toBe(true);
  expect(result.selectionVisible).toBe(true);
  expect(result.disposed).toBe(true);
  expect([result.width, result.height]).toEqual([1, 1]);
});

test("the axis gizmo tracks the camera and stays out of the recorded canvas", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const gizmo = page.locator('[data-role="viewport-axis"]');
  await expect(gizmo).toHaveCount(1);
  // It must be an overlay sibling, never inside the canvas the playblast records.
  expect(await gizmo.evaluate((svg) => svg.closest("canvas") === null)).toBe(true);
  expect(await gizmo.evaluate((svg) => svg.querySelectorAll("line").length)).toBe(3);

  const read = () => gizmo.evaluate((svg) =>
    [...svg.querySelectorAll("line")].map((line) => `${line.getAttribute("x2")},${line.getAttribute("y2")}`).sort().join("|"));

  const before = await read();
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.camera = { ...ui.camera, position: [-6, 4, -6] };
    ui.render();
  });
  expect(await read()).not.toBe(before);
});

test("the studio look is editor-only unless the beauty mode asks for it", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const probe = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const viewport = ui.webgl;
    const shoot = (mode, cleanCapture) => {
      viewport.render({ ...ui.state, render_mode: mode }, ui.camera, new Map(), 256, 256,
        new Map(), 0, cleanCapture, "camera", "subject", null);
      return {
        studio: viewport.studioEnabled,
        toneMapped: viewport.renderer.toneMapping !== 0,
        lit: !!viewport.scene.environment,
      };
    };
    return {
      editing: shoot("omni_ref", false),
      neutralCapture: shoot("omni_ref", true),
      beautyCapture: shoot("beauty", true),
      backEditing: shoot("omni_ref", false),
    };
  });

  // Editing is always lit, whatever the proxy mode is set to.
  expect(probe.editing).toEqual({ studio: true, toneMapped: true, lit: true });
  // A neutral proxy capture must record flat: no IBL, no tone mapping.
  expect(probe.neutralCapture).toEqual({ studio: false, toneMapped: false, lit: false });
  // Only the explicit beauty mode keeps the look during a capture.
  expect(probe.beautyCapture).toEqual({ studio: true, toneMapped: true, lit: true });
  // And the editor gets its look back afterwards.
  expect(probe.backEditing).toEqual({ studio: true, toneMapped: true, lit: true });
});

test("path smoothing survives the state.keyframes alias sync", async ({ page }) => {
  // state.keyframes aliases the active camera's array, and syncActiveCameraTrack()
  // copies it back the other way. Replacing only the camera side made smoothing
  // a silent no-op.
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const middleX = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const base = { fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };
    const track = ui.activeCameraTrack();
    track.keyframes = [
      { frame: 0, interpolation: "linear", camera: { ...base, position: [0, 0, 0], target: [0, 0, 0] } },
      { frame: 10, interpolation: "linear", camera: { ...base, position: [10, 0, 0], target: [0, 0, 0] } },
      { frame: 20, interpolation: "linear", camera: { ...base, position: [2, 0, 0], target: [0, 0, 0] } },
    ];
    ui.state.keyframes = track.keyframes;
    const slider = ui.root.querySelector('[data-role="path-smoothing"]');
    slider.value = "100";
    slider.dispatchEvent(new Event("change", { bubbles: true }));
    return ui.activeCameraTrack().keyframes[1].camera.position[0];
  });
  // Full strength pulls the spike to the average of 0, 10 and 2.
  expect(middleX).toBe(4);
});

test("the radar reads live keys and stays out of the playblast", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const probe = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const context = ui.canvas.getContext("2d");
    const count = (run) => {
      let arcs = 0;
      const real = context.arc.bind(context);
      context.arc = (...args) => { arcs++; return real(...args); };
      try { run(); } finally { context.arc = real; }
      return arcs;
    };

    ui.state.show_radar = false;
    const off = count(() => ui.drawOverlays());
    ui.state.show_radar = true;
    const on = count(() => ui.drawOverlays());
    // A throw inside the radar used to leave only its chrome painted, which
    // still looked like a working map. Anything after the frame is what proves
    // the camera, cone, target and markers actually made it out.
    const failed = ui.radarError || null;

    // The alias is deliberately emptied: the radar must follow the real track.
    ui.state.keyframes = [];
    const staleAlias = count(() => ui.drawOverlays());

    // A capture must not paint the radar into the recorded frame.
    ui.recording = true;
    const recording = count(() => ui.drawOverlays());
    ui.recording = false;
    return { off, on, staleAlias, recording, failed };
  });

  expect(probe.failed, "the radar must not swallow an exception").toBeNull();
  // The two range circles alone are two arcs; a complete radar also draws the
  // target ring, the camera dot and one marker per object and keyframe.
  expect(probe.on - probe.off).toBeGreaterThanOrEqual(6);
  expect(probe.staleAlias).toBe(probe.on);
  expect(probe.recording).toBe(probe.off);
});
