import { expect, test } from "@playwright/test";

// Exercises the Director's controls inside a REAL running ComfyUI and asserts
// that each one actually changes observable state.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 OMNICAM_LIVE_MATCH=live-behaviour.spec.js \
//   npx playwright test --config playwright.live.config.mjs
//
// Deliberately NOT exercised, because they touch the user's install or graph:
//   clear-caches (deletes managed files), record (captures + uploads a playblast),
//   h3-setup (adds nodes to the open workflow), load-*/upload-* (native file dialogs).
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
  for (const [tab, panel] of [["camera", "camera"], ["display", "display"], ["scene", "scene"]]) {
    await root.locator(`[data-tab="${tab}"]`).click();
    await expect(root.locator(`[data-tab-panel="${panel}"]`)).toBeVisible();
  }

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

  await root.locator('[data-tab="camera"]').click();
  await root.locator('[data-act="next-frame"]').click();
  await root.locator('[data-tab-panel="camera"] [data-act="key"]').click();
  expect(await read("ui.activeCameraTrack().keyframes.length")).toBe(before + 2);

  await root.locator('[data-tab="display"]').click();
  await root.locator('[data-tab-panel="display"] [data-act="delete-key"]').click();
  await root.locator('[data-act="previous-key"]').click();
  await root.locator('[data-tab-panel="display"] [data-act="delete-key"]').click();
  expect(await read("ui.activeCameraTrack().keyframes.length")).toBe(before);

  // --- toggles -------------------------------------------------------------
  await root.locator('[data-act="loop"]').click();
  expect(await read("!!ui.state.loop_playback")).toBe(true);
  await root.locator('[data-act="loop"]').click();
  expect(await read("!!ui.state.loop_playback")).toBe(false);

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

  const graph = root.locator(".curve-editor");
  const wasOpen = await graph.evaluate((el) => el.open);
  await root.locator('[data-act="toggle-graph"]').click();
  expect(await graph.evaluate((el) => el.open)).toBe(!wasOpen);
  await root.locator('[data-act="toggle-graph"]').click();

  // --- dope sheet channels --------------------------------------------------
  const rowCount = () => root.locator(".oc-dope-row").count();
  const full = await rowCount();
  await root.locator('[data-dope-channel="roll"]').uncheck();
  expect(await rowCount()).toBe(full - 1);
  await root.locator('[data-dope-channel="roll"]').check();
  expect(await rowCount()).toBe(full);

  // --- lens card ------------------------------------------------------------
  await root.locator('[data-tab="camera"]').click();
  await root.locator('[data-lens="85"]').click();
  const fov = Number(await root.locator('[data-role="camera-fov"]').inputValue());
  const mm = Number((await root.locator('[data-role="camera-focal"]').inputValue()).replace(",", "."));
  expect(Math.round(mm)).toBe(85);
  expect(fov).toBeGreaterThan(5);
  expect(fov).toBeLessThan(30);

  // --- outliner search ------------------------------------------------------
  await root.locator('[data-tab="scene"]').click();
  const allRows = await root.locator('[data-role="objects"] .scene-item').count();
  await root.locator('[data-role="outliner-search"]').fill("zzz-no-match");
  expect(await root.locator('[data-role="objects"] .scene-item').count()).toBe(0);
  await root.locator('[data-role="outliner-search"]').fill("");
  expect(await root.locator('[data-role="objects"] .scene-item').count()).toBe(allRows);

  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);

  await page.evaluate(() => window.app.graph.remove(window.__scratch));
});
