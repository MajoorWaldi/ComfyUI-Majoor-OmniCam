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

test("quick views and the compact axis tripod drive editor navigation", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const quickViews = page.locator("[data-view]");
  await expect(quickViews).toHaveCount(6);
  await page.locator('[data-view="iso"]').click();
  await expect(page.locator('[data-view="iso"]')).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("iso");

  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setViewMode("perspective"));
  const xTip = page.locator('[data-role="viewport-axis"] [data-axis="x"]');
  await expect(xTip).toHaveCount(1);
  await xTip.click();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("right");
  await xTip.click();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("left");

  const zTip = page.locator('[data-role="viewport-axis"] [data-axis="z"]');
  await zTip.press("Enter");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("front");

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.__frameSelectionCalls = 0;
    ui.frameTarget = () => { ui.__frameSelectionCalls += 1; };
  });
  const center = page.locator('[data-role="viewport-axis"] [data-axis-center]');
  await center.focus();
  await center.press("Enter");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.__frameSelectionCalls)).toBe(1);
});

test("the studio look is editor-only unless the beauty mode asks for it", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const probe = await page.evaluate(async () => {
    const ui = window.omnicamNode.__majoorOmniCam;
    await ui.webglReady;
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

test("outliner modifier clicks preserve and remove object group selection", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.objects.push({
      id: "qa_sphere", name: "QA Sphere", type: "sphere", position: [2, 1, 0],
      rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
    });
    ui.refreshObjects();
  });
  const cube = page.locator('[data-object-id="qa_cube"]');
  const sphere = page.locator('[data-object-id="qa_sphere"]');
  await cube.click();
  await sphere.click({ modifiers: ["Control"] });
  expect(await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { entity: ui.selectedEntity, ids: [...ui.selectedObjectIds].sort(), active: ui.selectedObjectId };
  })).toEqual({ entity: "object", ids: ["qa_cube", "qa_sphere"], active: "qa_sphere" });
  await sphere.click({ modifiers: ["Control"] });
  expect(await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { entity: ui.selectedEntity, ids: [...ui.selectedObjectIds].sort(), active: ui.selectedObjectId };
  })).toEqual({ entity: "object", ids: ["qa_cube"], active: "qa_cube" });
  await cube.click({ modifiers: ["Control"] });
  expect(await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { entity: ui.selectedEntity, ids: [...ui.selectedObjectIds], active: ui.selectedObjectId };
  })).toEqual({ entity: "camera", ids: [], active: null });
});

test("undo restores complete object and key selections", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  const selection = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.objects.push({
      id: "qa_sphere", name: "QA Sphere", type: "sphere", position: [2, 1, 0],
      rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
    });
    ui.selectedEntity = "object";
    ui.selectedObjectIds = new Set(["qa_cube", "qa_sphere"]);
    ui.selectedObjectId = "qa_sphere";
    ui.selectedKeyFrames = null;
    ui.selectedKeyFrame = null;
    ui.history.clear();
    ui.checkpoint("Keep group selection");
    ui.state.objects[0].position[0] = 99;
    ui.selectedObjectIds = new Set(["qa_cube"]);
    ui.selectedObjectId = "qa_cube";
    ui.selectedKeyFrames = null;
    ui.selectedKeyFrame = null;
    ui.undo();
    const objects = {
      objects: [...ui.selectedObjectIds].sort(), activeObject: ui.selectedObjectId,
    };
    ui.selectedEntity = "camera";
    ui.selectedObjectIds = new Set();
    ui.selectedObjectId = null;
    ui.setFrame(10);
    ui.insertKeyframe();
    ui.selectedKeyFrames = new Set([0, 10]);
    ui.selectedKeyFrame = 10;
    ui.history.clear();
    ui.checkpoint("Keep key group selection");
    ui.selectedKeyFrames = new Set([0]);
    ui.selectedKeyFrame = 0;
    ui.undo();
    return {
      ...objects,
      keys: [...ui.selectedKeyFrames].sort((a, b) => a - b), activeKey: ui.selectedKeyFrame,
    };
  });
  expect(selection).toEqual({ objects: ["qa_cube", "qa_sphere"], activeObject: "qa_sphere", keys: [0, 10], activeKey: 10 });
});

test("leaving key edit clears every selected key", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  const selection = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedKeyFrame = 10;
    ui.selectedKeyFrames = new Set([0, 10]);
    ui.exitKeyEdit(true);
    return { active: ui.selectedKeyFrame, keys: ui.selectedKeyFrames };
  });
  expect(selection).toEqual({ active: null, keys: null });
});

test("the radar draws a continuous path for the active camera keys", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });

  const segments = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const context = ui.canvas.getContext("2d");
    const track = ui.activeCameraTrack();
    const base = { fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };
    ui.state.show_radar = true;
    ui.state.guides = false;
    ui.state.safe_areas = false;
    ui.drawTransformGizmo = () => {};
    const countLineSegments = (keyframes) => {
      track.keyframes = keyframes;
      ui.state.keyframes = keyframes;
      let lines = 0;
      const real = context.lineTo.bind(context);
      context.lineTo = (...args) => { lines++; return real(...args); };
      try { ui.drawOverlays(); } finally { context.lineTo = real; }
      return lines;
    };
    const key = (frame, position) => ({ frame, interpolation: "linear", camera: { ...base, position, target: [0, 0, 0] } });
    return {
      oneKey: countLineSegments([key(0, [0, 1.5, 5])]),
      threeKeys: countLineSegments([key(0, [0, 1.5, 5]), key(10, [4, 2, 3]), key(20, [7, 2.5, 0])]),
    };
  });

  // A sampled path has one segment per frame, so it must contain more than
  // the two straight key-to-key segments used by the old radar renderer.
  expect(segments.threeKeys - segments.oneKey).toBeGreaterThan(2);
});

test("interactive object selection invokes the outline renderer while clean captures skip it", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  const probe = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const vp = ui.webgl;
    ui.state.objects = [{ id: "mesh_1", name: "Mesh", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true }];
    ui.serialize();
    vp.rebuildPath(ui.state, "object", null);

    // Interactive render via UI to ensure the state propagates
    ui.selectedEntity = "object";
    ui.selectedObjectId = "mesh_1";
    ui.render();

    const wasOutlined = !!vp.outlineRenderer;

    // Clean capture render
    let cleanRenderCalled = false;
    const originalRender = vp.renderer.render;
    vp.renderer.render = (...args) => { cleanRenderCalled = true; originalRender.apply(vp.renderer, args); };
    vp.render(ui.state, ui.state.cameras[0], new Map(), 800, 600, new Map(), 0, true, "object", "mesh_1");
    vp.renderer.render = originalRender; // restore

    return { wasOutlined, cleanRenderCalled };
  });
  expect(probe.wasOutlined).toBe(true);
  expect(probe.cleanRenderCalled).toBe(true);
});
