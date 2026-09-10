// Hard gate: pressing TRACK (or Reconstruction Start) queues a *partial*
// ComfyUI execution that stops at MajoorOmniCamExtractor. The downstream
// Director / Monitor must never execute from those buttons.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 \
//   OMNICAM_LIVE_MATCH=live-extractor-partial-queue.spec.js \
//   OMNICAM_LIVE_VIDEO=omnicam_docs_sample.mp4 npm run test:live
//
// The graph is  Load Video -> Extractor -> Director -> Monitor. We subscribe to
// ComfyUI's own `executing` websocket events and assert the set of node ids
// that actually ran is a subset of {loader, extractor}: the Director and
// Monitor ids must never appear.

import { expect, test } from "@playwright/test";

const SOURCE = process.env.OMNICAM_LIVE_VIDEO || "omnicam_docs_sample.mp4";
const STILL = process.env.OMNICAM_LIVE_IMAGE || "example.png";

test("TRACK runs a partial execution that stops at the Extractor", async ({ page }) => {
  test.setTimeout(240_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/");
  await page.waitForFunction(
    () => window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamMonitor,
    null, { timeout: 60_000 },
  );
  await page.waitForTimeout(1_500);

  // --- build Load Video -> Extractor -> Director -> Monitor ----------------
  const ids = await page.evaluate(async (file) => {
    const { app } = await import("/scripts/app.js");
    const { api } = await import("/scripts/api.js");
    app.graph.clear();

    const loader = window.LiteGraph.createNode("LoadVideo");
    loader.pos = [-500, 0];
    app.graph.add(loader);
    const fileWidget = loader.widgets?.find((w) => w.name === "file");
    if (fileWidget) { fileWidget.value = file; fileWidget.callback?.(file); }

    const extractor = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    extractor.pos = [-150, 0];
    app.graph.add(extractor);
    loader.connect(0, extractor, 0);
    const method = extractor.widgets?.find((w) => w.name === "method");
    if (method) method.value = "opencv_sift";

    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    director.pos = [250, 0];
    app.graph.add(director);
    const solvedSlot = director.findInputSlot("solved_scene");
    extractor.connect(0, director, solvedSlot >= 0 ? solvedSlot : "solved_scene");

    const monitor = window.LiteGraph.createNode("MajoorOmniCamMonitor");
    monitor.pos = [650, 0];
    app.graph.add(monitor);
    director.connect(0, monitor, 0);

    // Collect every node id ComfyUI touches for the next prompt: `executing`
    // for a fresh run, `execution_cached` when a prior identical solve is
    // served from the execution cache. Either way the node is "in the set".
    window.__omniExecuted = new Set();
    window.__omniTouched = new Set();
    window.__omniPromptStarted = 0;
    api.addEventListener("execution_start", () => { window.__omniPromptStarted += 1; });
    api.addEventListener("executing", (event) => {
      const node = event?.detail?.node ?? event?.detail;
      if (node != null) { window.__omniExecuted.add(String(node)); window.__omniTouched.add(String(node)); }
    });
    api.addEventListener("execution_cached", (event) => {
      for (const node of event?.detail?.nodes ?? []) window.__omniTouched.add(String(node));
    });

    window.omniExtractor = extractor;
    return {
      loader: String(loader.id),
      extractor: String(extractor.id),
      director: String(director.id),
      monitor: String(monitor.id),
    };
  }, SOURCE);

  await page.waitForFunction(
    () => window.omniExtractor?.__majoorOmniCamExtractor?.root?.isConnected,
    null, { timeout: 30_000 },
  );
  // The source has to resolve before TRACK will queue anything.
  await page.waitForFunction(
    () => window.omniExtractor.__majoorOmniCamExtractor.state.source.available,
    null, { timeout: 30_000 },
  );

  // --- press TRACK -------------------------------------------------------
  await page.evaluate(() => window.omniExtractor.__majoorOmniCamExtractor.startSolve());

  await page.waitForFunction(
    () => {
      const ui = window.omniExtractor.__majoorOmniCamExtractor;
      if (["FAILED", "CANCELLED", "STOPPED"].includes(ui.state.solveState)) return true;
      return ui.state.solveState === "COMPLETED" && Boolean(ui.result.refined);
    },
    null, { timeout: 240_000 },
  );

  const result = await page.evaluate(() => {
    const ui = window.omniExtractor.__majoorOmniCamExtractor;
    return {
      solveState: ui.state.solveState,
      error: ui.state.error,
      refinedKeys: ui.result.refined?.keyframes?.length ?? 0,
      executed: [...window.__omniExecuted],
      touched: [...window.__omniTouched],
      promptStarts: window.__omniPromptStarted,
    };
  });

  expect(result.solveState, result.error).toBe("COMPLETED");
  expect(result.refinedKeys).toBeGreaterThan(1);
  expect(result.promptStarts).toBeGreaterThan(0);

  // The load-bearing assertions: the Extractor was in the partial set (freshly
  // executed, or served from the execution cache); nothing downstream was.
  expect(result.touched, "Extractor must be in the partial set").toContain(ids.extractor);
  expect(result.touched, "Director must NOT be executed by TRACK").not.toContain(ids.director);
  expect(result.touched, "Monitor must NOT be executed by TRACK").not.toContain(ids.monitor);
  for (const id of result.executed) {
    expect([ids.loader, ids.extractor], `unexpected node executed: ${id}`).toContain(id);
  }

  expect(errors).toEqual([]);
});

test("Reconstruction Start also stops at the Extractor", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto("/");
  await page.waitForFunction(
    () => window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector,
    null, { timeout: 60_000 },
  );
  await page.waitForTimeout(1_500);

  const ids = await page.evaluate(async (file) => {
    const { app } = await import("/scripts/app.js");
    const { api } = await import("/scripts/api.js");
    app.graph.clear();

    const loader = window.LiteGraph.createNode("LoadImage");
    loader.pos = [-500, 0];
    app.graph.add(loader);
    const imgWidget = loader.widgets?.find((w) => w.name === "image");
    if (imgWidget) { imgWidget.value = file; imgWidget.callback?.(file); }

    const extractor = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    extractor.pos = [-150, 0];
    app.graph.add(extractor);
    loader.connect(0, extractor, 0);
    const modeWidget = extractor.widgets?.find((w) => w.name === "extract_mode");
    if (modeWidget) modeWidget.value = "scene_reconstruct";

    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    director.pos = [250, 0];
    app.graph.add(director);
    const slot = director.findInputSlot("solved_scene");
    extractor.connect(0, director, slot >= 0 ? slot : "solved_scene");

    const monitor = window.LiteGraph.createNode("MajoorOmniCamMonitor");
    monitor.pos = [650, 0];
    app.graph.add(monitor);
    director.connect(0, monitor, 0);

    window.__omniExecuted = new Set();
    window.__omniTouched = new Set();
    api.addEventListener("executing", (event) => {
      const node = event?.detail?.node ?? event?.detail;
      if (node != null) { window.__omniExecuted.add(String(node)); window.__omniTouched.add(String(node)); }
    });
    api.addEventListener("execution_cached", (event) => {
      for (const node of event?.detail?.nodes ?? []) window.__omniTouched.add(String(node));
    });
    window.omniExtractor = extractor;
    return {
      loader: String(loader.id),
      extractor: String(extractor.id),
      director: String(director.id),
      monitor: String(monitor.id),
    };
  }, STILL);

  await page.waitForFunction(
    () => window.omniExtractor?.__majoorOmniCamExtractor?.reconstruction,
    null, { timeout: 30_000 },
  );

  // Press Reconstruction Start. The recon solve itself may fail (a MoGe
  // checkpoint might not be installed) -- that is fine: this gate only asserts
  // that the partial execution never reaches the Director or Monitor.
  const started = await page.evaluate(async () => {
    const ui = window.omniExtractor.__majoorOmniCamExtractor;
    ui.setExtractMode("scene_reconstruct");
    const recon = ui.reconstruction;
    if (!recon.getSource() && !recon.state.source) return false;
    await recon.run();
    return true;
  });

  if (!started) {
    test.skip(true, "reconstruction source did not resolve without a full graph run");
  }

  await page.waitForFunction(
    () => {
      const recon = window.omniExtractor.__majoorOmniCamExtractor.reconstruction;
      return ["DONE", "FAILED", "STOPPED"].includes(recon.state.jobState)
        || window.__omniTouched.size > 0;
    },
    null, { timeout: 150_000 },
  );
  await page.waitForTimeout(3_000); // let any stray downstream event land

  const { executed, touched } = await page.evaluate(() => ({
    executed: [...window.__omniExecuted],
    touched: [...window.__omniTouched],
  }));
  expect(touched, "Director must NOT be executed by Reconstruct").not.toContain(ids.director);
  expect(touched, "Monitor must NOT be executed by Reconstruct").not.toContain(ids.monitor);
  for (const id of executed) {
    expect([ids.loader, ids.extractor], `unexpected node executed: ${id}`).toContain(id);
  }
});
