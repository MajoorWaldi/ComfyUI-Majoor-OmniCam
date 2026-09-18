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

test("a transform-mode switch (translate/rotate/scale) is visible on the very next frame, not a frame late (regression)", async ({ page }) => {
  // Regression: transformControlsWiring.sync() -- which applies the new
  // mode/attachment to the live TransformControls gizmo -- ran *after*
  // this.webgl.render()'s actual WebGL draw call within the same render()
  // invocation (director/methods/render.js). Clicking a Translate/Rotate/
  // Scale toolbar button calls setTransformMode() -> render() once: the
  // frame that call drew still showed the *previous* mode's gizmo, and
  // nothing else was queued to trigger a second render -- so the visible
  // gizmo only caught up once some *other* action (a second click, a
  // hover, etc.) happened to repaint. sync() now also runs once before
  // the draw (using the previous frame's already-configured camera, which
  // is exactly correct for a mode-only change with no camera movement).
  await mount(page);
  await page.locator('[data-object-id="qa_cube"]').click();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setTransformMode("translate"));

  const captureModeAtNextDraw = (mode) => page.evaluate((mode) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const helper = ui.webgl.scene.children.find((c) => c.isTransformControlsRoot);
    const gizmo = helper.children.find((c) => c.mode !== undefined);
    const original = ui.webgl.render.bind(ui.webgl);
    let modeAtDrawTime = null;
    ui.webgl.render = (...args) => { modeAtDrawTime = gizmo.mode; return original(...args); };
    ui.setTransformMode(mode);
    ui.webgl.render = original;
    return modeAtDrawTime;
  }, mode);

  expect(await captureModeAtNextDraw("rotate")).toBe("rotate");
  expect(await captureModeAtNextDraw("scale")).toBe("scale");
  expect(await captureModeAtNextDraw("translate")).toBe("translate");
});

test("select camera, translate the gizmo, release: one history step", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "camera";
    ui.selectedObjectId = null;
    ui.setTransformMode("translate");
    ui.render();
  });
  const attached = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return ui.webgl.scene.children.some((child) => child.isTransformControlsRoot && child.visible);
  });
  expect(attached).toBe(true);

  const before = await page.evaluate(() => ({ ...window.omnicamNode.__majoorOmniCam.camera }));
  const point = await screenPoint(page, before.position);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 40, point.y - 20, { steps: 4 });
  await page.mouse.up();

  const after = await page.evaluate(() => ({ ...window.omnicamNode.__majoorOmniCam.camera }));
  expect(after.position).not.toEqual(before.position);

  const undone = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.undo();
    return ui.camera.position;
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

// Task 5 of the plan: path-point selection and multi-selection.

/** Screen point (CSS pixels) for the marker of the camera_1 keyframe at `frame`. */
async function pathKeyScreenPoint(page, frame) {
  return page.evaluate(async (frame) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const marker = ui.webgl.path.children.find((c) => c.userData?.omnicamPathKey?.frame === frame);
    if (!marker) return null;
    const projected = marker.position.clone().project(ui.webgl.activeCamera);
    const rect = ui.interactionElement.getBoundingClientRect();
    return {
      x: rect.left + ((projected.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - projected.y) / 2) * rect.height,
    };
  }, frame);
}

// page.mouse.click has no `modifiers` option (that's locator.click-only);
// hold the key with the keyboard API around a raw mouse click instead.
async function shiftClick(page, x, y) {
  await page.keyboard.down("Shift");
  await page.mouse.click(x, y);
  await page.keyboard.up("Shift");
}

async function setUpThreeKeyPath(page) {
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const track = ui.activeCameraTrack();
    track.keyframes = [
      { frame: 0, interpolation: "smooth", camera: { position: [-2, 1, 0], target: [-2, 1, -5], fov: 35, camera_type: "perspective" } },
      { frame: 30, interpolation: "smooth", camera: { position: [0, 1, 0], target: [0, 1, -5], fov: 35, camera_type: "perspective" } },
      { frame: 60, interpolation: "smooth", camera: { position: [2, 1, 0], target: [2, 1, -5], fov: 35, camera_type: "perspective" } },
    ];
    ui.state.keyframes = track.keyframes;
    ui.state.duration_frames = 90;
    ui.selectedKeyFrame = null;
    ui.selectedKeyFrames = new Set();
    // The active camera's own TransformControls gizmo (Task 4) claims the
    // pointer over its own on-screen footprint, same as a real camera body --
    // step out of "camera" selection first so a path-key click is not racing
    // its own live camera's translate handles for the same pointer.
    ui.selectedEntity = "camera_path";
    ui.serialize(); // bumps renderRevision so rebuildPath's cache key changes
    ui.render();
  });
}

test("clicking a path key selects only it; Shift+click adds a second key to the selection", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);

  const p0 = await pathKeyScreenPoint(page, 0);
  const p30 = await pathKeyScreenPoint(page, 30);
  expect(p0).not.toBeNull();
  expect(p30).not.toBeNull();

  await page.mouse.click(p0.x, p0.y);
  let selection = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { frames: [...ui.pathSelection.frames], primary: ui.pathSelection.primaryFrame };
  });
  expect(selection.frames).toEqual([0]);
  expect(selection.primary).toBe(0);

  await shiftClick(page, p30.x, p30.y);
  selection = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { frames: [...ui.pathSelection.frames].sort((a, b) => a - b), primary: ui.pathSelection.primaryFrame };
  });
  expect(selection.frames).toEqual([0, 30]);
  expect(selection.primary).toBe(30);

  // Shift-clicking the same key again toggles it back out.
  await shiftClick(page, p30.x, p30.y);
  selection = await page.evaluate(() => [...window.omnicamNode.__majoorOmniCam.pathSelection.frames]);
  expect(selection).toEqual([0]);
});

test("a plain click on a path key replaces a multi-selection", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);

  const p0 = await pathKeyScreenPoint(page, 0);
  const p30 = await pathKeyScreenPoint(page, 30);
  const p60 = await pathKeyScreenPoint(page, 60);

  await page.mouse.click(p0.x, p0.y);
  await shiftClick(page, p30.x, p30.y);
  let frames = await page.evaluate(() => [...window.omnicamNode.__majoorOmniCam.pathSelection.frames].sort((a, b) => a - b));
  expect(frames).toEqual([0, 30]);

  await page.mouse.click(p60.x, p60.y);
  frames = await page.evaluate(() => [...window.omnicamNode.__majoorOmniCam.pathSelection.frames]);
  expect(frames).toEqual([60]);
});

// Task 6 of the plan: TransformControls for path points, groups and the
// whole path. Frame 0's marker doubles as the real TransformControls free-
// translate handle once it is the sole selection -- same technique as the
// object/camera gizmo tests above (screenPoint via project()). Frame 30 is
// deliberately avoided here: setUpThreeKeyPath's three keys are symmetric
// about the path centroid, so frame 30 sits exactly where the *whole path*'s
// own (still-live, just unselected) gizmo anchors -- a plain click there
// would hit that gizmo's handle first, same class of hazard as a camera's
// own gizmo legitimately winning the pointer over a path marker at the
// current playhead frame.

test("selecting one path key attaches the gizmo there; dragging moves only that key, one undo step", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);

  const p0 = await pathKeyScreenPoint(page, 0);
  await page.mouse.click(p0.x, p0.y);

  const before = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return ui.activeCameraTrack().keyframes.map((k) => [...k.camera.position]);
  });
  const point = await screenPoint(page, before[0]); // frame 0 is the selected key

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 40, point.y - 20, { steps: 4 });
  await page.mouse.up();

  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return ui.activeCameraTrack().keyframes.map((k) => [...k.camera.position]);
  });
  expect(after[1]).toEqual(before[1]);
  expect(after[2]).toEqual(before[2]);
  expect(after[0]).not.toEqual(before[0]);

  const undone = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.undo();
    return ui.activeCameraTrack().keyframes.map((k) => [...k.camera.position]);
  });
  expect(undone).toEqual(before);
});

test("selecting two path keys attaches the gizmo at their centroid; dragging moves both, the third stays put", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);

  const p0 = await pathKeyScreenPoint(page, 0);
  const p30 = await pathKeyScreenPoint(page, 30);
  await page.mouse.click(p0.x, p0.y);
  await shiftClick(page, p30.x, p30.y);

  const before = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return ui.activeCameraTrack().keyframes.map((k) => [...k.camera.position]);
  });
  const centroid = before[0].map((v, i) => (v + before[1][i]) / 2);
  const point = await screenPoint(page, centroid);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 40, point.y - 20, { steps: 4 });
  await page.mouse.up();

  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return ui.activeCameraTrack().keyframes.map((k) => [...k.camera.position]);
  });
  expect(after[0]).not.toEqual(before[0]);
  expect(after[1]).not.toEqual(before[1]);
  expect(after[2]).toEqual(before[2]);
});

// Task 10 of docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md:
// the point Inspector's Timing Weight field and Redistribute Timing action.
// These bind through the pre-existing shot-panel key editor (the same one
// FOV/Roll already use), which selectPathKeyFromClick already wires up to a
// clicked path key via ui.selectedKeyFrame -- see web-src/scene.js.

test("selecting a path key shows its default Timing Weight; editing it persists on the canonical key", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);

  // Frame 0, not 30: setUpThreeKeyPath's three keys are symmetric about the
  // path centroid, so frame 30 sits exactly where the whole path's own gizmo
  // anchors and would win a plain click there (see the comment above the
  // Task 6 single-point-selection test in this file).
  const p0 = await pathKeyScreenPoint(page, 0);
  await page.mouse.click(p0.x, p0.y);

  const weightInput = page.locator('.majoor-omnicam [data-role="key-timing-weight"]');
  await expect(weightInput).toHaveValue("1");

  await weightInput.evaluate((input) => { input.value = "3"; input.dispatchEvent(new Event("change", { bubbles: true })); });

  const stored = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.find((k) => k.frame === 0).timing);
  expect(stored).toEqual({ weight: 3 });

  // One undo step removes the edit, and an untouched key keeps no `timing`.
  await page.keyboard.press("Control+z");
  const undone = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.find((k) => k.frame === 0).timing);
  expect(undone).toBeUndefined();
});

test("Redistribute Timing reflows keys by their Timing Weight, preserving first/last frame, in one undo step", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);

  const p0 = await pathKeyScreenPoint(page, 0);
  await page.mouse.click(p0.x, p0.y);
  // The Shot tab's panel starts hidden; switch to it (directly, so the click
  // itself cannot land on/behind an overlapping viewport element) so its
  // Redistribute Timing button is a real, clickable element.
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setInspectorMode("shot"));
  const weightInput = page.locator('.majoor-omnicam [data-role="key-timing-weight"]');
  // A heavier weight on the first key's own segment slows it down relative to
  // the untouched second segment, pulling the redistributed midpoint later.
  await weightInput.evaluate((input) => { input.value = "5"; input.dispatchEvent(new Event("change", { bubbles: true })); });

  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => k.frame));
  expect(before).toEqual([0, 30, 60]);

  await page.locator('.majoor-omnicam [data-act="redistribute-key-timing"]').click();

  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => k.frame));
  expect(after[0]).toBe(0);
  expect(after[after.length - 1]).toBe(60);
  expect(after[1]).toBeGreaterThan(before[1]);

  await page.keyboard.press("Control+z");
  const undone = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => k.frame));
  expect(undone).toEqual(before);
});

// Task 11 of docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md:
// a single compact dialog lists every camera path preset (never one toolbar
// button per preset); picking one generates an ordinary, fully editable
// camera path across the active camera's current playback range.

test("Camera Path Presets: picking Orbit from the compact dialog generates an editable path over the playback range, one undo step", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.duration_frames = 90;
    ui.state.playback_range = [0, 60];
    ui.serialize();
  });
  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.length);

  await page.locator('.majoor-omnicam [data-act="camera-path-presets"]').click();
  await page.getByRole("button", { name: "Orbit", exact: true }).click();

  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { frames: ui.activeCameraTrack().keyframes.map((k) => k.frame), count: ui.activeCameraTrack().keyframes.length };
  });
  expect(after.count).toBeGreaterThan(1);
  expect(after.frames[0]).toBe(0);
  expect(after.frames[after.frames.length - 1]).toBe(60);

  await page.keyboard.press("Control+z");
  const undone = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.length);
  expect(undone).toBe(before);
});

// Task 12 of docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md:
// the read-only diagnostics list in the Shot Inspector (analyzeCameraPath()
// never mutates the path -- see web-src/director/camera-path-diagnostics.js).

test("Camera Path Diagnostics: a static hold is reported and never mutates the path", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);
  const p0 = await pathKeyScreenPoint(page, 0);
  await page.mouse.click(p0.x, p0.y);
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setInspectorMode("shot"));

  const list = page.locator('.majoor-omnicam [data-role="path-diagnostics-list"]');
  await expect(list).not.toContainText("barely moves");

  const before = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const track = ui.activeCameraTrack();
    // Collapse the first segment into a long static hold (Task 12's
    // STATIC_SEGMENT check) purely by editing state -- diagnostics must
    // never be the thing that mutates a path, only report on it.
    track.keyframes[1].camera.position = [...track.keyframes[0].camera.position];
    ui.state.keyframes = track.keyframes;
    ui.serialize();
    ui.refreshKeyEditor();
    return track.keyframes.map((k) => [...k.camera.position]);
  });

  await expect(list).toContainText("barely moves");

  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => [...k.camera.position]));
  expect(after).toEqual(before);
});

// Task 13 of docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md:
// viewport <-> timeline selection sync and shortcut scoping. Note: this
// repo's shipped keybinding convention is T/R/S for translate/rotate/scale
// (docs/SHORTCUTS.md), not the plan's suggested Q/W/E/R -- these tests cover
// the actual scheme; see the final report for that deliberate deviation.

test("clicking a timeline key selects the same key as a spatial gizmo target, not just a visual echo", async ({ page }) => {
  await mount(page);
  await setUpThreeKeyPath(page);
  // setUpThreeKeyPath leaves selectedEntity as "camera_path" for its own
  // gizmo tests; a plain camera selection is the normal state a user would
  // be in while clicking a timeline key.
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.selectedEntity = "camera";
    ui.refreshKeys();
  });

  // Selecting via the TIMELINE (not a viewport marker click) used to update
  // ui.selectedKeyFrame (which drives the marker's highlight colour) without
  // updating ui.pathSelection (which viewport-controls/transform-target.js
  // actually reads to attach a path_point gizmo) -- so the marker looked
  // selected but the gizmo silently stayed on the old selection.
  await page.locator('.majoor-omnicam [data-key-frame="30"]').click();

  const selection = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { frames: [...ui.pathSelection.frames], primary: ui.pathSelection.primaryFrame };
  });
  expect(selection.frames).toEqual([30]);
  expect(selection.primary).toBe(30);

  // Clicking the timeline key above may have auto-scrolled .oc-workbench-content
  // (the embedded editor's natural height can exceed the modal window, plan
  // Task 18) far enough that the viewport canvas scrolled out of view; bring
  // it back before computing a screen-space point on it.
  await page.locator(".viewport-wrap > canvas").scrollIntoViewIfNeeded();

  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => [...k.camera.position]));
  const point = await screenPoint(page, before[1]); // frame 30 is index 1

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 40, point.y - 20, { steps: 4 });
  await page.mouse.up();

  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => [...k.camera.position]));
  expect(after[0]).toEqual(before[0]);
  expect(after[2]).toEqual(before[2]);
  expect(after[1]).not.toEqual(before[1]);
});

test("T/R/S transform-mode shortcuts are scoped to the viewport and suppressed while typing in an input", async ({ page }) => {
  await mount(page);
  await page.locator('[data-object-id="qa_cube"]').click();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setTransformMode("translate"));

  // Typing "r" into an ordinary text input must not switch the gizmo mode.
  const input = page.locator('.majoor-omnicam [data-role="object-x"]').first();
  await input.click();
  await input.press("r");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.gizmo_mode)).toBe("translate");

  // The same key, with focus back on the viewport, does switch it.
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.interactionElement.focus());
  await page.keyboard.press("r");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.gizmo_mode)).toBe("rotate");
});

test("Ctrl held during a translate drag snaps the result to the spatial grid", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => { window.omnicamNode.__majoorOmniCam.state.spatial_grid_size = 0.5; });
  await page.locator('[data-object-id="qa_cube"]').click();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setTransformMode("translate"));

  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  const point = await screenPoint(page, before);

  await page.keyboard.down("Control");
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 47, point.y - 31, { steps: 6 });
  await page.mouse.up();
  await page.keyboard.up("Control");

  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  expect(after).not.toEqual(before);
  // At least one moved axis should land on a 0.5 grid multiple (within float
  // tolerance) -- proof the live Ctrl snap actually reached TransformControls
  // mid-drag, not just at drag start.
  const onGrid = after.some((value, index) => Math.abs(value - before[index]) > 1e-6 && Math.abs((value / 0.5) - Math.round(value / 0.5)) < 1e-4);
  expect(onGrid).toBe(true);
});
