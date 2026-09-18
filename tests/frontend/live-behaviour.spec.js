import { expect, test } from "@playwright/test";

// Exercises the Director's controls inside a REAL running ComfyUI and asserts
// that each one actually changes observable state.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 OMNICAM_LIVE_MATCH=live-behaviour.spec.js \
//   npx playwright test --config playwright.live.config.mjs
//
// Deliberately NOT exercised, because they touch the user's install or graph:
//   clear-caches (deletes managed files), record (captures + uploads a playblast),
//   load-*/upload-* (native file dialogs).
// Everything else is driven on a scratch node this test creates itself.

async function mountScratchDirector(page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.app?.graph && window.LiteGraph, null, { timeout: 90000 });
  await page.evaluate(() => {
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    // Park it far from the user's graph so nothing overlaps it on screen.
    node.pos = [6000, 6000];
    window.app.graph.add(node);
    node.setSize([1180, 1420]);
    window.__scratch = node;
    window.app.canvas.ds.scale = 1;
    window.app.canvas.ds.offset = [-5960, -5960];
    window.app.canvas.setDirty(true, true);
  });
  // The Director mounts a compact shell by default (migration plan Task 10);
  // open its workbench the way a user would before waiting on the embedded
  // editor's DOM, which no longer exists until then.
  await page.waitForFunction(() => Boolean(window.__scratch?.__majoorOmniCamDirectorRuntime?.shell?.openButton), null, { timeout: 40000 });
  await page.evaluate(() => window.__scratch.__majoorOmniCamDirectorRuntime.shell.openButton.click());
  await page.waitForSelector(".majoor-omnicam .oc-header", { timeout: 40000 });
  await page.waitForTimeout(2000);
  return page.evaluate(() => window.__scratch.id);
}

const ui = (page) => page.evaluate(() => window.__scratch.__majoorOmniCam);

test("every non-destructive Director control changes observable state", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mountScratchDirector(page);

  const root = page.locator(".majoor-omnicam").first();
  const read = (path) => page.evaluate((expression) =>
    // eslint-disable-next-line no-new-func
    Function("ui", `return ${expression}`)(window.__scratch.__majoorOmniCam), path);

  // --- side tabs -----------------------------------------------------------
  // The Inspector became selection-driven in a later, unrelated refactor
  // (web-src/inspector/context.js): the "camera" and "scene" panes now
  // follow the selected entity instead of a dedicated tab button -- only
  // Motion/Shot/Health kept switchable [data-tab] buttons. Reach each pane
  // the way a user would: select the camera or an object for camera/scene,
  // click the Shot button for display.
  await root.locator('.scene-item', { hasText: "Camera 1" }).click();
  await expect(root.locator('[data-tab-panel="camera"]')).toBeVisible();
  await root.locator('[data-tab="display"]').click();
  await expect(root.locator('[data-tab-panel="display"]')).toBeVisible();
  await root.locator('.scene-item', { hasText: "Subject Card" }).click();
  await expect(root.locator('[data-tab-panel="scene"]')).toBeVisible();
  // Re-select the camera: insertKeyframe() (web-src/scene.js) now targets
  // whichever entity is selected (timelineObject()), so leaving the Subject
  // Card selected would route the keyframing section below onto the
  // object's own track instead of the camera's.
  await root.locator('.scene-item', { hasText: "Camera 1" }).click();

  // --- transport -----------------------------------------------------------
  await root.locator('[data-act="next-frame"]').click();
  expect(await read("ui.frame")).toBe(1);
  await root.locator('[data-act="next-frame"]').click();
  await root.locator('[data-act="previous-frame"]').click();
  expect(await read("ui.frame")).toBe(1);
  await root.locator('[data-act="key-last"]').click();
  expect(await read("ui.frame")).toBe(await read("ui.state.duration_frames - 1"));
  await root.locator('[data-act="key-first"]').click();
  expect(await read("ui.frame")).toBe(0);

  // --- keyframing ----------------------------------------------------------
  // "key" exists twice (transport bar and the Inspector card); "delete-key"
  // only lives in the Shot panel, so each has to be reached where it is shown.
  const before = await read("ui.activeCameraTrack().keyframes.length");
  await root.locator('[data-act="next-frame"]').click();
  await root.locator('.oc-transport [data-act="key"]').click();
  expect(await read("ui.activeCameraTrack().keyframes.length")).toBe(before + 1);

  // Same selection-driven Inspector as above: reach the camera pane by
  // selecting the camera entity, not a "camera" tab button.
  await root.locator('.scene-item', { hasText: "Camera 1" }).click();
  await root.locator('[data-act="next-frame"]').click();
  await root.locator('[data-tab-panel="camera"] [data-act="key"]').click();
  expect(await read("ui.activeCameraTrack().keyframes.length")).toBe(before + 2);

  await root.locator('[data-tab="display"]').click();
  await root.locator('[data-tab-panel="display"] [data-act="delete-key"]').click();
  await root.locator('[data-act="previous-key"]').click();
  // A changed keyframe selection is a changed selection identity too
  // (inspector/context.js's selectionKey() includes selectedKeyFrame), so
  // syncInspectorSelection() drops the Shot mode back to "entity" here --
  // unrelated to the workbench migration. Re-enter Shot mode to reach
  // delete-key again, the way a user would.
  await root.locator('[data-tab="display"]').click();
  await root.locator('[data-tab-panel="display"] [data-act="delete-key"]').click();
  expect(await read("ui.activeCameraTrack().keyframes.length")).toBe(before);

  // --- toggles -------------------------------------------------------------
  // Loop playback now defaults to true on a fresh Director (unrelated to the
  // workbench migration -- a later state-schema default change), so assert
  // the toggle flips relative to whatever it started at, not a hardcoded
  // true-then-false order.
  const initialLoop = await read("!!ui.state.loop_playback");
  await root.locator('[data-act="loop"]').click();
  expect(await read("!!ui.state.loop_playback")).toBe(!initialLoop);
  await root.locator('[data-act="loop"]').click();
  expect(await read("!!ui.state.loop_playback")).toBe(initialLoop);

  await root.locator('[data-act="auto-key"]').click();
  expect(await read("!!ui.state.auto_key")).toBe(true);
  await root.locator('[data-act="auto-key"]').click();

  // --- viewport tool rail ---------------------------------------------------
  for (const mode of ["vertex", "edge", "face", "object"]) {
    await root.locator(`[data-select-mode="${mode}"]`).first().click();
    expect(await read("ui.state.select_mode")).toBe(mode);
  }
  for (const mode of ["rotate", "scale", "translate"]) {
    await root.locator(`[data-transform-mode="${mode}"]`).first().click();
    expect(await read("ui.state.gizmo_mode")).toBe(mode);
  }

  // --- view chrome ----------------------------------------------------------
  await root.locator('[data-act="toggle-fullscreen"]').click();
  await expect(root).toHaveClass(/oc-fullscreen/);
  await root.locator('[data-act="toggle-fullscreen"]').click();
  await expect(root).not.toHaveClass(/oc-fullscreen/);

  // Timeline/Graph/Sequence are tabs of one block with the player now
  // (Director modal audit Lot 3), not a separate collapsible section.
  await root.locator('[data-graph-tab="curves"]').click();
  await expect(root.locator('[data-role="curve-canvas"]')).toBeVisible();
  await expect(root.locator('[data-role="dope-stage"]')).toBeHidden();
  await root.locator('[data-graph-tab="dope"]').click();
  await expect(root.locator('[data-role="dope-stage"]')).toBeVisible();

  // --- dope sheet channels --------------------------------------------------
  const rowCount = () => root.locator(".oc-dope-row").count();
  const full = await rowCount();
  await root.locator('[data-dope-channel="roll"]').uncheck();
  expect(await rowCount()).toBe(full - 1);
  await root.locator('[data-dope-channel="roll"]').check();
  expect(await rowCount()).toBe(full);

  // --- lens card ------------------------------------------------------------
  // Same selection-driven Inspector as above.
  await root.locator('.scene-item', { hasText: "Camera 1" }).click();
  await root.locator('[data-lens="85"]').click();
  const fov = Number(await root.locator('[data-role="camera-fov"]').inputValue());
  const mm = Number((await root.locator('[data-role="camera-focal"]').inputValue()).replace(",", "."));
  expect(Math.round(mm)).toBe(85);
  expect(fov).toBeGreaterThan(5);
  expect(fov).toBeLessThan(30);

  // --- outliner search ------------------------------------------------------
  // The outliner list ([data-role="objects"]) lives in the always-visible
  // left panel now (template/left-panel.js), not behind a "scene" tab --
  // unrelated to the workbench migration.
  const allRows = await root.locator('[data-role="objects"] .scene-item').count();
  await root.locator('[data-role="outliner-search"]').fill("zzz-no-match");
  expect(await root.locator('[data-role="objects"] .scene-item').count()).toBe(0);
  await root.locator('[data-role="outliner-search"]').fill("");
  expect(await root.locator('[data-role="objects"] .scene-item').count()).toBe(allRows);

  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);

  await page.evaluate(() => window.app.graph.remove(window.__scratch));
});
