// A busy GPU means the solve WAITS in ComfyUI's queue -- it is never rejected
// by a custom "GPU busy" admission gate. The old out-of-queue scheduler had
// one (SolveSlotBusyError); the queue-only path has none, because ComfyUI's
// queue serializes execution for us.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 \
//   OMNICAM_LIVE_MATCH=live-extractor-queue-order.spec.js \
//   OMNICAM_LIVE_VIDEO=omnicam_docs_sample.mp4 npm run test:live

import { expect, test } from "@playwright/test";

const SOURCE = process.env.OMNICAM_LIVE_VIDEO || "omnicam_docs_sample.mp4";

test("TRACK pressed while a prompt runs is QUEUED, not rejected", async ({ page }) => {
  test.setTimeout(240_000);
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
    const fileWidget = loader.widgets?.find((w) => w.name === "file");
    if (fileWidget) { fileWidget.value = file; fileWidget.callback?.(file); }
    const extractor = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    extractor.pos = [0, 0];
    app.graph.add(extractor);
    loader.connect(0, extractor, 0);
    const method = extractor.widgets?.find((w) => w.name === "method");
    if (method) method.value = "opencv_sift";
    // Force a distinct cache key from the partial run so ComfyUI actually
    // executes (not an instant cache hit) and there is a real busy window.
    const step = extractor.widgets?.find((w) => w.name === "frame_step");
    if (step) step.value = 2;
    window.omniExtractor = extractor;
  }, SOURCE);

  await page.waitForFunction(
    () => window.omniExtractor?.__majoorOmniCamExtractor?.state.source.available,
    null, { timeout: 30_000 },
  );

  // Occupy the queue with a full run, then press TRACK immediately after.
  const pressed = await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    const ui = window.omniExtractor.__majoorOmniCamExtractor;
    // frame_step 2 for the full run; the partial TRACK will set its own below.
    await app.queuePrompt(0, 1);
    const step = window.omniExtractor.widgets?.find((w) => w.name === "frame_step");
    if (step) step.value = 1; // different cache key -> TRACK is real work, queued behind
    await ui.startSolve();
    return {
      state: ui.state.solveState,
      error: ui.state.error,
    };
  });

  // The load-bearing assertion: TRACK was accepted and is waiting, not failed
  // with a custom rejection.
  expect(pressed.error).toBe("");
  expect(["QUEUED", "PREPARING", "TRACKING"], `TRACK state was ${pressed.state}`)
    .toContain(pressed.state);

  // And it drains on its own once the queue clears.
  await page.waitForFunction(
    () => {
      const ui = window.omniExtractor.__majoorOmniCamExtractor;
      if (["FAILED", "CANCELLED"].includes(ui.state.solveState)) return true;
      return ui.state.solveState === "COMPLETED" && Boolean(ui.result.refined);
    },
    null, { timeout: 240_000 },
  );

  const final = await page.evaluate(() => {
    const ui = window.omniExtractor.__majoorOmniCamExtractor;
    return { state: ui.state.solveState, error: ui.state.error, keys: ui.result.refined?.keyframes?.length ?? 0 };
  });
  expect(final.state, final.error).toBe("COMPLETED");
  expect(final.keys).toBeGreaterThan(1);
  expect(errors).toEqual([]);
});
