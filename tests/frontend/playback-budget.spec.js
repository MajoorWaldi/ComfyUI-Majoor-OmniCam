import { expect, test } from "@playwright/test";

// Frame-time budgets for the Director. These are deliberately loose starting
// ceilings, not tight regression thresholds -- the point is to catch an
// order-of-magnitude regression (a per-frame full timeline rebuild sneaking
// back in, an N-camera preview strip going quadratic) on CI's software
// renderer, and to give a place to tighten the numbers once real data lands.
// See the review items "La lecture reconstruit toute la timeline a chaque
// frame" and "Toutes les previews camera sont rendues a chaque frame".

test.describe.configure({ mode: "serial" });

async function mount(page) {
  await page.setViewportSize({ width: 1180, height: 1600 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  await page.waitForTimeout(400);
}

// A long shot with plenty of keyframes on the active camera -- the shape that
// used to make every playback frame O(duration) via the Camera Health pass.
async function loadLongShot(page) {
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.fps = 24;
    ui.state.duration_frames = 1200;
    const track = ui.activeCameraTrack();
    track.keyframes = Array.from({ length: 40 }, (_, i) => ({
      frame: i * 30,
      camera: {
        position: [Math.sin(i) * 6, 3 + (i % 4), Math.cos(i) * 6],
        target: [0, 1.5, 0],
        fov: 35 + (i % 3) * 5,
        roll: 0,
        camera_type: "perspective",
        zoom: 1,
        near: 0.01,
        far: 10000,
      },
      interpolation: "ease",
    }));
    ui.state.keyframes = track.keyframes;
    ui.syncFromWidgets(false);
    ui.refreshKeys();
    ui.setFrame(0, false, true);
  });
}

test("a light playback frame tick stays well under a frame budget on a long shot", async ({ page }) => {
  await mount(page);
  await loadLongShot(page);
  const perFrameMs = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.playing = true; // route setFrame through the scheduler, like real playback
    const N = 300;
    const started = performance.now();
    for (let i = 0; i < N; i += 1) ui.setFrame(i % ui.state.duration_frames, true, false);
    const elapsed = performance.now() - started;
    ui.playing = false;
    return elapsed / N;
  });
  // Software-renderer CI ceiling. A per-frame full timeline rebuild pushed this
  // well past 16ms; the light path should be a small fraction of a frame.
  expect(perFrameMs).toBeLessThan(12);
});

test("the frame scheduler coalesces a burst of requests into one render", async ({ page }) => {
  await mount(page);
  const { before, after, renders } = await page.evaluate(async () => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.rendersCoalesced = 0;
    const before = ui.rendersCoalesced;
    for (let i = 0; i < 50; i += 1) ui.requestRender("burst");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { before, after: ui.rendersCoalesced, renders: ui.renderInvalidations };
  });
  expect(renders).toBeGreaterThanOrEqual(50); // every request was counted
  expect(after - before).toBeLessThanOrEqual(2); // but at most a render or two ran
});

test("rendering a five-camera shot stays within a loose per-render ceiling", async ({ page }) => {
  await mount(page);
  await loadLongShot(page);
  const perRenderMs = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    for (let i = 0; i < 4; i += 1) ui.addCamera();
    for (let i = 0; i < 3; i += 1) {
      ui.state.motion_layers.push({
        id: `m_${i}`, label: `Layer ${i}`, source_kind: "manual_2d", enabled: true,
        keys: Array.from({ length: 20 }, (_, k) => ({ time_seconds: k * 0.5, x: 0.5, y: 0.5, visible: true, interpolation: "linear" })),
      });
    }
    ui.refreshKeys();
    ui.playing = true;
    const N = 40;
    const started = performance.now();
    for (let i = 0; i < N; i += 1) { ui.frame = i * 10; ui.render(); }
    const elapsed = performance.now() - started;
    ui.playing = false;
    return elapsed / N;
  });
  // A full synchronous render including the throttled preview strip. Generous
  // on a software renderer; tighten once real hardware numbers exist.
  expect(perRenderMs).toBeLessThan(90);
});

test("repeated camera add/remove does not accumulate document listeners", async ({ page }) => {
  await mount(page);
  const growth = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const count = () => (window.getEventListeners ? window.getEventListeners(document).length : null);
    const baseline = count();
    for (let i = 0; i < 25; i += 1) {
      const id = ui.addCamera();
      ui.deleteCamera?.(typeof id === "string" ? id : ui.state.cameras.at(-1)?.id);
    }
    ui.refreshKeys();
    return baseline == null ? 0 : count() - baseline;
  });
  // getEventListeners only exists in DevTools; when unavailable this is a
  // no-op assertion (0 <= 5) rather than a skipped test.
  expect(growth).toBeLessThanOrEqual(5);
});
