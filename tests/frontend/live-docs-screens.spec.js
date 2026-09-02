// Documentation screenshots of all three public nodes, against a real running
// ComfyUI -- real Director/Monitor/Extractor wiring, a real live preflight,
// real capability detection. Not an assertion suite: run it manually and copy
// the results into docs/assets/.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 \
//   OMNICAM_LIVE_MATCH=live-docs-screens.spec.js \
//   OMNICAM_LIVE_VIDEO=omnicam_docs_sample.mp4 npm run test:live
//
// docs-screens.spec.js covers the Director close-ups (outliner, inspector)
// from an isolated module mount; this covers the full node surface, Extractor
// included, from the real app so the Monitor screenshot shows a real live
// preflight rather than a canned one.

import { expect, test } from "@playwright/test";

const SOURCE = process.env.OMNICAM_LIVE_VIDEO || "omnicam_docs_sample.mp4";

async function readyGraph(page) {
  await page.goto("/");
  await page.waitForFunction(
    () => window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamMonitor
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor,
    null, { timeout: 60_000 },
  );
  await page.waitForTimeout(1_000);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
  });
}

test("director - node screenshot", async ({ page }) => {
  await readyGraph(page);
  await page.evaluate(() => {
    const camKey = (frame, position, target, fov) => ({
      frame, interpolation: "ease",
      camera: { position, target, fov, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
    });
    const state = {
      cameras: [{
        id: "camera_1", name: "Hero Cam", active_camera_id: "camera_1",
        keyframes: [
          camKey(0, [7, 4, 7], [0, 1.4, 0], 38),
          camKey(48, [4.5, 3.2, 8.5], [0, 1.4, 0], 34),
          camKey(96, [-3, 2.6, 8], [0, 1.4, 0], 40),
        ],
      }],
      active_camera_id: "camera_1", playblast_camera_id: "camera_1",
      objects: [{
        id: "subject", name: "Subject", type: "cube", position: [0, 0.5, 0],
        rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
      }],
    };
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    node.pos = [0, 0];
    node.size = [1180, 900];
    window.app.graph.add(node);
    const widget = (name) => node.widgets?.find((item) => item.name === name);
    if (widget("state_json")) widget("state_json").value = JSON.stringify(state);
    window.omnicamDirector = node;
  });
  await page.waitForFunction(
    () => window.omnicamDirector?.__majoorOmniCam?.domWidget?.element?.isConnected,
    null, { timeout: 15_000 },
  );
  await page.evaluate(() => window.omnicamDirector.__majoorOmniCam.restoreFromWidgets());
  await page.waitForTimeout(600);
  const box = await page.evaluate(() => {
    const el = window.omnicamDirector.__majoorOmniCam.domWidget.element;
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.screenshot({ path: "test-results/live-director.png", clip: box });
});

test("extractor - node screenshot", async ({ page }) => {
  await readyGraph(page);
  await page.evaluate(async (file) => {
    const loader = window.LiteGraph.createNode("LoadVideo");
    loader.pos = [-420, 0];
    window.app.graph.add(loader);
    const fileWidget = loader.widgets?.find((widget) => widget.name === "file");
    if (fileWidget) { fileWidget.value = file; fileWidget.callback?.(file); }
    const node = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    node.pos = [0, 0];
    window.app.graph.add(node);
    loader.connect(0, node, 0);
    window.omnicamExtractor = node;
  }, SOURCE);
  await page.waitForFunction(
    () => window.omnicamExtractor?.__majoorOmniCamExtractor?.root?.isConnected,
    null, { timeout: 30_000 },
  );
  await page.waitForFunction(
    () => {
      const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
      const video = ui.root.querySelector('[data-role="source-video"]');
      return Boolean(ui.state.source.info) && Number(video?.videoWidth) > 0;
    },
    null, { timeout: 20_000 },
  ).catch(() => {}); // best effort: still screenshot even if the source never primes

  await page.evaluate(() => {
    const start = window.omnicamExtractor.__majoorOmniCamExtractor.root.querySelector('[data-act="track"]');
    start?.click();
  });
  await page.waitForFunction(
    () => window.omnicamExtractor.__majoorOmniCamExtractor.state.solveState === "COMPLETED"
      || window.omnicamExtractor.__majoorOmniCamExtractor.state.solveState === "FAILED",
    null, { timeout: 60_000 },
  ).catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.omnicamExtractor.__majoorOmniCamExtractor.root.querySelector('[data-tab="track3d"]')?.click();
  });
  await page.waitForTimeout(400);

  const box = await page.evaluate(() => {
    const el = window.omnicamExtractor.__majoorOmniCamExtractor.root;
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.screenshot({ path: "test-results/live-extractor.png", clip: box });
});

test("monitor - node screenshot with a real live preflight", async ({ page }) => {
  await readyGraph(page);
  await page.evaluate(() => {
    const camKey = (frame, position, target, fov) => ({
      frame, interpolation: "ease",
      camera: { position, target, fov, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
    });
    const state = {
      cameras: [{
        id: "camera_1", name: "Hero Cam", active_camera_id: "camera_1",
        keyframes: [
          camKey(0, [7, 4, 7], [0, 1.4, 0], 38),
          camKey(96, [-3, 2.6, 8], [0, 1.4, 0], 40),
        ],
      }],
      active_camera_id: "camera_1", playblast_camera_id: "camera_1",
      objects: [],
    };
    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    director.pos = [-500, 0];
    window.app.graph.add(director);
    const widget = (node, name) => node.widgets?.find((item) => item.name === name);
    if (widget(director, "state_json")) widget(director, "state_json").value = JSON.stringify(state);

    const monitor = window.LiteGraph.createNode("MajoorOmniCamMonitor");
    monitor.pos = [200, 0];
    window.app.graph.add(monitor);
    director.connect(0, monitor, 0);
    director.connect(1, monitor, 1); // playblast_video, so the real-playblast preview fix is visible
    window.omnicamDirector2 = director;
    window.omnicamMonitor = monitor;
  });
  await page.waitForFunction(
    () => window.omnicamMonitor?.__majoorOmniCamMonitor?.root?.isConnected,
    null, { timeout: 15_000 },
  );
  // A real recorded playblast, so the panel shows the actual fix from this
  // session: the Director's own file, not its live edit viewport.
  await page.evaluate(() => window.omnicamDirector2.__majoorOmniCam.makePlayblast());
  await page.waitForFunction(
    () => !window.omnicamDirector2.__majoorOmniCam.recording,
    null, { timeout: 20_000 },
  );
  // A named, strict profile -- the generic default has nothing to check.
  await page.evaluate(() => {
    const select = window.omnicamMonitor.__majoorOmniCamMonitor.root.querySelector('[data-role="profile-select"]');
    select.value = "h3_native";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  // The live preflight polls every 250ms and debounces 250ms; give it a few
  // rounds to land a real, non-empty panel from the actual backend.
  await page.waitForFunction(
    () => {
      const preflight = window.omnicamMonitor.__majoorOmniCamMonitor.root.querySelector('[data-role="profile-preflight"]');
      return preflight && preflight.querySelector(".oc-row");
    },
    null, { timeout: 15_000 },
  ).catch(() => {});
  await page.waitForTimeout(400);
  const box = await page.evaluate(() => {
    const el = window.omnicamMonitor.__majoorOmniCamMonitor.root;
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.screenshot({ path: "test-results/live-monitor.png", clip: box });
});
