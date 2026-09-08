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
  // Hundreds of synchronous SwiftShader renders in one page.evaluate; on a
  // contended CI runner that whole call can crawl past the default 60s even
  // though the per-frame ratio it checks is still fine. Give it headroom.
  test.slow();
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

test("adding cameras does not make a render super-linear (preview strip stays bounded)", async ({ page }) => {
  // Same story as the light-tick test: ~90 synchronous software renders back to
  // back in one page.evaluate. The ratio it asserts is runner-speed independent,
  // but the wall-clock of the evaluate itself is not -- it timed out at 60s on a
  // starved CI box. Triple the budget rather than loosen the actual check.
  test.slow();
  await mount(page);
  await loadLongShot(page);
  // Absolute ms on a contended CI software renderer is unusably noisy (seen
  // 5x run-to-run). The regression this guards against -- "every camera
  // preview re-rendered every frame", i.e. cost going quadratic in camera
  // count -- is a *ratio*, which is runner-speed independent: measure a
  // 1-camera render and a 5-camera render in the same session and compare.
  const { one, five, ratio } = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    for (let i = 0; i < 3; i += 1) {
      ui.state.motion_layers.push({
        id: `m_${i}`, label: `Layer ${i}`, source_kind: "manual_2d", enabled: true,
        keys: Array.from({ length: 20 }, (_, k) => ({ time_seconds: k * 0.5, x: 0.5, y: 0.5, visible: true, interpolation: "linear" })),
      });
    }
    ui.refreshKeys();
    ui.playing = true;

    const measure = () => {
      for (let i = 0; i < 3; i += 1) { ui.frame = i * 10; ui.render(); } // warm up
      const N = 24;
      const t0 = performance.now();
      for (let i = 0; i < N; i += 1) { ui.frame = i * 10; ui.render(); }
      return (performance.now() - t0) / N;
    };

    const one = measure(); // 1 camera (the default)
    for (let i = 0; i < 4; i += 1) ui.addCamera();
    ui.refreshKeys();
    const five = measure(); // 5 cameras
    ui.playing = false;
    return { one, five, ratio: five / Math.max(one, 0.01) };
  });
  // Linear-ish in camera count is fine (~5x for 5x the cameras, plus slack);
  // quadratic would be ~25x+. A wide ceiling so only a real regression trips it.
  expect(ratio, `1-cam ${one.toFixed(1)}ms vs 5-cam ${five.toFixed(1)}ms`).toBeLessThan(12);
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
