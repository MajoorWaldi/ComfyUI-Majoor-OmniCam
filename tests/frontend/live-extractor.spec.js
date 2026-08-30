// The Extractor solve panel, against a running ComfyUI.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 \
//   OMNICAM_LIVE_MATCH=live-extractor.spec.js \
//   OMNICAM_LIVE_VIDEO=<a textured clip in ComfyUI/input> npm run test:live
//
// It drives the real node end to end: a real Load Video, a real OpenCV solve,
// and the two previews the panel exists for. Unit tests can prove the state
// machine; only this can prove the user sees a picture.

import { expect, test } from "@playwright/test";

const SOURCE = process.env.OMNICAM_LIVE_VIDEO || "260512_Atopi__00006_.mp4";

test("the Extractor previews its source and its solved track", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/");
  await page.waitForFunction(
    () => window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor,
    null, { timeout: 60_000 },
  );
  await page.waitForTimeout(1_500);

  await page.evaluate(async (file) => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const loader = window.LiteGraph.createNode("LoadVideo");
    loader.pos = [-400, 0];
    app.graph.add(loader);
    const fileWidget = loader.widgets?.find((widget) => widget.name === "file");
    if (fileWidget) { fileWidget.value = file; fileWidget.callback?.(file); }
    const node = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    node.pos = [0, 0];
    app.graph.add(node);
    loader.connect(0, node, 0);
    window.omnicamExtractor = node;
  }, SOURCE);

  await page.waitForFunction(
    () => window.omnicamExtractor?.__majoorOmniCamExtractor?.root?.isConnected,
    null, { timeout: 30_000 },
  );

  // --- the source preview --------------------------------------------------
  // The described source and the primed <video> arrive independently; the strip
  // is only honest once both are in.
  await page.waitForFunction(
    () => {
      const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
      const video = ui.root.querySelector('[data-role="source-video"]');
      return Boolean(ui.state.source.info) && Number(video?.videoWidth) > 0;
    },
    null, { timeout: 20_000 },
  );
  const source = await page.evaluate(() => {
    const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
    const video = ui.root.querySelector('[data-role="source-video"]');
    return {
      info: ui.state.source.info,
      strip: ui.root.querySelector('[data-role="source-label"]').textContent,
      videoWidth: video.videoWidth,
      scrubberMax: Number(ui.root.querySelector('[data-role="scrubber"]').max),
      viewsVisible: ui.root.querySelector('[data-role="views"]').getBoundingClientRect().height > 0,
      internalWidgetsHidden: (window.omnicamExtractor.widgets || [])
        .filter((widget) => widget.name.startsWith("omnicam_ext"))
        .every((widget) => widget.type === "hidden"),
    };
  });

  // The strip must describe the footage, not merely name it: a scrubber with no
  // range and a "0 / 0" readout is what "no preview" actually looks like.
  expect(source.info.frame_count).toBeGreaterThan(1);
  expect(source.strip).toContain(String(source.info.width));
  expect(source.videoWidth).toBeGreaterThan(0);
  expect(source.scrubberMax).toBe(source.info.frame_count - 1);
  expect(source.viewsVisible).toBe(false);
  expect(source.internalWidgetsHidden).toBe(true);

  // --- a real solve --------------------------------------------------------
  await page.evaluate(async () => {
    const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
    const method = window.omnicamExtractor.widgets?.find((widget) => widget.name === "method");
    if (method) method.value = "opencv_sift";
    await ui.startSolve();
  });
  // A finished solve reports COMPLETED before it has awaited its result, so
  // waiting on the state alone reads the panel one fetch too early.
  await page.waitForFunction(
    () => {
      const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
      if (["FAILED", "STOPPED"].includes(ui.state.solveState)) return true;
      return ui.state.solveState === "COMPLETED" && Boolean(ui.result.refined);
    },
    null, { timeout: 240_000 },
  );

  const solved = await page.evaluate(() => {
    const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
    return {
      solveState: ui.state.solveState,
      error: ui.state.error,
      quality: ui.state.quality.length,
      refinedKeys: ui.result.refined?.keyframes?.length ?? 0,
      rawKeys: ui.result.raw?.keyframes?.length ?? 0,
      percent: ui.root.querySelector('[data-role="solve-percent"]').textContent,
    };
  });
  expect(solved.solveState, solved.error).toBe("COMPLETED");
  expect(solved.refinedKeys).toBeGreaterThan(1);
  expect(solved.rawKeys).toBeGreaterThan(1);
  expect(solved.quality).toBeGreaterThan(0);
  // A finished solve reads 100%: a later partial status must not reset it.
  expect(solved.percent).toBe("100%");

  // --- the 3D track preview ------------------------------------------------
  const viewer = await page.evaluate(() => {
    const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
    ui.setViewerMode("track3d");
    const canvas = ui.root.querySelector('[data-role="track-canvas"]');
    return {
      hasRenderer: Boolean(ui.viewer?.renderer),
      canvasVisible: canvas.getBoundingClientRect().height > 0,
      drawingWidth: canvas.width,
      paths: ui.viewer?.trackScene?.pathGroup?.children?.length ?? 0,
      frustums: ui.viewer?.trackScene?.frustumGroup?.children?.length ?? 0,
      viewsVisible: ui.root.querySelector('[data-role="views"]').getBoundingClientRect().height > 0,
    };
  });
  expect(viewer.hasRenderer).toBe(true);
  expect(viewer.canvasVisible).toBe(true);
  expect(viewer.drawingWidth).toBeGreaterThan(0);
  expect(viewer.paths).toBeGreaterThan(0);
  expect(viewer.frustums).toBeGreaterThan(0);
  expect(viewer.viewsVisible).toBe(true);

  await page.screenshot({ path: "test-results/live-extractor-track3d.png" });
  expect(errors).toEqual([]);
});
