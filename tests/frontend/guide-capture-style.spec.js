import { expect, test } from "@playwright/test";

// Guide Capture Style (P1): a material/lighting override that fires only
// during an actual recording pass, decoupled from Viewport Shading
// (state.render_mode) and from any object's own material_mode. Mirrors the
// clean-capture assertions in live-director.spec.js, but on the standalone
// director-mount.html fixture (no live ComfyUI backend needed).
test("guide capture style overrides material/lighting only while recording, without mutating state", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  expect(await page.locator("#status").textContent()).toBe("ready");

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const cube = ui.state.objects.find((object) => object.id === "qa_cube");

    // Give the primitive an explicit, distinctive material choice so a
    // capture override actually has something to override.
    cube.material_mode = "checker";
    ui.state.render_mode = "beauty";
    ui.render();
    const beforeMaterial = ui.webgl.objectNodes.get("qa_cube")?.material;
    const before = {
      hasMap: Boolean(beforeMaterial?.map),
      wireframe: Boolean(beforeMaterial?.wireframe),
      studioEnabled: ui.webgl.studioEnabled,
    };

    // Record a clay guide while the viewport itself stays in Beauty.
    ui.state.guide_capture_style = "clay";
    ui.recording = true;
    ui.render();
    const clayMaterial = ui.webgl.objectNodes.get("qa_cube")?.material;
    const duringClay = {
      hasMap: Boolean(clayMaterial?.map),
      wireframe: Boolean(clayMaterial?.wireframe),
      colorHex: clayMaterial?.color?.getHexString?.(),
      studioEnabled: ui.webgl.studioEnabled,
    };
    ui.recording = false;

    // motion_proxy: flat lighting regardless of render_mode.
    ui.state.guide_capture_style = "motion_proxy";
    ui.recording = true;
    ui.render();
    const duringMotionProxy = { studioEnabled: ui.webgl.studioEnabled };
    ui.recording = false;

    // Back to a live (non-recording) render: the override must not leak.
    ui.render();
    ui.serialize();
    const afterMaterial = ui.webgl.objectNodes.get("qa_cube")?.material;
    const after = {
      hasMap: Boolean(afterMaterial?.map),
      wireframe: Boolean(afterMaterial?.wireframe),
      studioEnabled: ui.webgl.studioEnabled,
      renderMode: ui.state.render_mode,
      materialMode: cube.material_mode,
      serializedGuideStyle: JSON.parse(ui.stateWidget.value).guide_capture_style,
    };

    return { before, duringClay, duringMotionProxy, after };
  });

  // Beauty viewport, checker material, studio lighting on: the baseline.
  expect(result.before.hasMap).toBe(true);
  expect(result.before.studioEnabled).toBe(true);

  // Clay capture: checker is gone (neutral material, no map), studio stays on.
  expect(result.duringClay.hasMap).toBe(false);
  expect(result.duringClay.wireframe).toBe(false);
  expect(result.duringClay.colorHex).toBe("9ca3af");
  expect(result.duringClay.studioEnabled).toBe(true);

  // motion_proxy: flat lighting, explicitly off.
  expect(result.duringMotionProxy.studioEnabled).toBe(false);

  // Nothing about the authored scene changed.
  expect(result.after.renderMode).toBe("beauty");
  expect(result.after.materialMode).toBe("checker");
  expect(result.after.serializedGuideStyle).toBe("motion_proxy");

  // And the override itself doesn't leak into the next live render: back to
  // Beauty's checker + studio lighting.
  expect(result.after.hasMap).toBe(true);
  expect(result.after.studioEnabled).toBe(true);
});

test("guide capture style toolbar select mirrors and serializes state without touching render_mode", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  expect(await page.locator("#status").textContent()).toBe("ready");

  const select = page.locator('[data-role="guide-capture-style"]').first();
  await expect(select).toHaveValue("auto");
  await select.selectOption("clay");

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return {
      state: ui.state.guide_capture_style,
      renderMode: ui.state.render_mode,
      serialized: JSON.parse(ui.stateWidget.value).guide_capture_style,
    };
  });
  expect(result.state).toBe("clay");
  expect(result.renderMode).toBe("omni_ref");
  expect(result.serialized).toBe("clay");
});

// ---------------------------------------------------------------------------
// P3: depth_rich -- reuses the omni_ref/point_field layered point generator
// at capture time (independent of render_mode), forces the floor grid, and
// records flat (no studio lighting), same as motion_proxy.
// ---------------------------------------------------------------------------

test("depth_rich draws depth-cue points and forces the floor grid regardless of render_mode", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  expect(await page.locator("#status").textContent()).toBe("ready");

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.render_mode = "beauty";
    ui.state.playblast_grid = false;
    ui.render();
    const before = { hasPoints: [...ui.webgl.content.children].some((child) => child.isPoints) };

    ui.state.guide_capture_style = "depth_rich";
    ui.recording = true;
    ui.render();
    const grids = [];
    ui.webgl.content.traverse((object) => { if (object.userData.omnicamCaptureGuide) grids.push(object.visible); });
    const during = {
      hasPoints: [...ui.webgl.content.children].some((child) => child.isPoints),
      gridsVisible: grids.length > 0 && grids.every(Boolean),
      studioEnabled: ui.webgl.studioEnabled,
    };
    ui.recording = false;

    // Back to a live render: the depth-cue points and forced grid must not leak.
    ui.render();
    const after = {
      hasPoints: [...ui.webgl.content.children].some((child) => child.isPoints),
      renderMode: ui.state.render_mode,
      playblastGrid: ui.state.playblast_grid,
    };

    return { before, during, after };
  });

  expect(result.before.hasPoints).toBe(false);
  expect(result.during.hasPoints).toBe(true);
  expect(result.during.gridsVisible).toBe(true);
  expect(result.during.studioEnabled).toBe(false);
  expect(result.after.hasPoints).toBe(false);
  expect(result.after.renderMode).toBe("beauty");
  expect(result.after.playblastGrid).toBe(false);
});

test("depth_rich enriches a sparse, single-object scene even when point_density is none", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
  expect(await page.locator("#status").textContent()).toBe("ready");

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    // director-mount.html's scene has exactly one real object (qa_cube).
    ui.state.point_density = "none";
    ui.state.guide_capture_style = "depth_rich";
    ui.recording = true;
    ui.render();
    const pointsMesh = [...ui.webgl.content.children].find((child) => child.isPoints);
    const pointCount = pointsMesh?.geometry?.attributes?.position?.count || 0;
    ui.recording = false;
    ui.render();
    // The enrichment is capture-only -- the authored setting must survive untouched.
    return { pointCount, densityUnchanged: ui.state.point_density };
  });

  expect(result.pointCount).toBeGreaterThan(0);
  expect(result.densityUnchanged).toBe("none");
});
