import { expect, test } from "@playwright/test";

async function openComfy(page) {
  await page.goto("/");
  await page.waitForFunction(
    () => window.comfyAPI?.app?.app?.graph
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor,
    null,
    { timeout: 30_000 },
  );
}

test("Director survives widget edit, workflow reload, recreation and queueing", async ({ page }) => {
  await openComfy(page);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    app.graph.add(director);
    window.omnicamCiDirector = director;
  });
  await page.waitForFunction(
    () => window.omnicamCiDirector?.__majoorOmniCam?.root?.isConnected,
    null,
    { timeout: 30_000 },
  );

  const editedFps = await page.evaluate(() => {
    const node = window.omnicamCiDirector;
    const fps = node.widgets.find((widget) => widget.name === "fps");
    fps.value = 30;
    fps.callback?.(30);
    return node.serialize();
  });

  await page.evaluate(async (workflow) => {
    const { app } = await import("/scripts/app.js");
    app.graph.configure({ last_node_id: workflow.id, last_link_id: 0, nodes: [workflow], links: [] });
    window.omnicamCiDirector = app.graph.nodes.find((node) => node.comfyClass === "MajoorOmniCamDirector");
  }, editedFps);
  await page.waitForFunction(
    () => window.omnicamCiDirector?.__majoorOmniCam?.root?.isConnected,
    null,
    { timeout: 30_000 },
  );
  expect(await page.evaluate(() => window.omnicamCiDirector.widgets.find((widget) => widget.name === "fps").value)).toBe(30);

  const queued = page.waitForResponse((response) => response.url().endsWith("/prompt"));
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.queuePrompt(0, 1);
  });
  expect((await queued).status()).toBeLessThan(500);

  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.remove(window.omnicamCiDirector);
    const replacement = window.LiteGraph.createNode("MajoorOmniCamDirector");
    app.graph.add(replacement);
    window.omnicamCiDirector = replacement;
  });
  await page.waitForFunction(
    () => window.omnicamCiDirector?.__majoorOmniCam?.root?.isConnected,
    null,
    { timeout: 30_000 },
  );
});

test("Extractor attaches and detaches its lazy UI on a real ComfyUI graph", async ({ page }) => {
  await openComfy(page);
  const attached = await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const extractor = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    app.graph.add(extractor);
    window.omnicamCiExtractor = extractor;
  });
  void attached;
  await page.waitForFunction(
    () => window.omnicamCiExtractor?.__majoorOmniCamExtractor?.root?.isConnected,
    null,
    { timeout: 30_000 },
  );
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    window.omnicamCiExtractorRoot = window.omnicamCiExtractor.__majoorOmniCamExtractor.root;
    app.graph.remove(window.omnicamCiExtractor);
  });
  await page.waitForFunction(() => !window.omnicamCiExtractorRoot.isConnected);
});

test("Extractor renders an injected solved track in TRACK 3D without page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await openComfy(page);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const extractor = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    app.graph.add(extractor);
    window.omnicamCiTrackExtractor = extractor;
  });
  await page.waitForFunction(
    () => window.omnicamCiTrackExtractor?.__majoorOmniCamExtractor?.root?.isConnected,
    null,
    { timeout: 30_000 },
  );
  const viewer = await page.evaluate(async () => {
    const ui = window.omnicamCiTrackExtractor.__majoorOmniCamExtractor;
    const track = {
      schema_version: 1, fps: 24, duration_frames: 48, width: 1280, height: 720,
      render_mode: "omni_ref", objects: [], metadata: { extractor_fingerprint: "ci-track" },
      keyframes: [
        { frame: 0, interpolation: "linear", camera: { position: [0, 1, 5], target: [0, 1, 0], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 } },
        { frame: 47, interpolation: "linear", camera: { position: [2, 1.5, 3], target: [0, 1, 0], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 } },
      ],
    };
    ui.acceptSolvedResult({ track, fingerprint: "ci-track" }, "queued");
    await ui.setViewerMode("track3d");
    await new Promise(requestAnimationFrame);
    const canvas = ui.root.querySelector('[data-role="track-canvas"]');
    return {
      renderer: Boolean(ui.viewer?.renderer),
      canvasWidth: canvas?.width || 0,
      paths: ui.viewer?.trackScene?.pathGroup?.children?.length || 0,
      frustums: ui.viewer?.trackScene?.frustumGroup?.children?.length || 0,
    };
  });
  expect(errors).toEqual([]);
  expect(viewer.renderer).toBe(true);
  expect(viewer.canvasWidth).toBeGreaterThan(0);
  expect(viewer.paths).toBeGreaterThan(0);
  expect(viewer.frustums).toBeGreaterThan(0);
});

test("Director mounts inside a Subgraph and keeps its promoted fps widget", async ({ page }) => {
  await openComfy(page);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    app.graph.add(director);
    const serializedDirector = director.serialize();
    const subgraphId = crypto.randomUUID();
    serializedDirector.id = 1;
    const workflow = {
      version: 1,
      state: { lastNodeId: 2, lastLinkId: 0, lastGroupId: 0, lastRerouteId: 0 },
      nodes: [{
        id: 2,
        type: subgraphId,
        pos: [80, 80],
        size: [300, 180],
        flags: {},
        order: 0,
        mode: 0,
        properties: { proxyWidgets: [["1", "fps"]] },
      }],
      links: [],
      groups: [],
      definitions: {
        subgraphs: [{
          id: subgraphId,
          version: 1,
          revision: 0,
          state: { lastNodeId: 1, lastLinkId: 0, lastGroupId: 0, lastRerouteId: 0 },
          name: "OmniCam Director test",
          config: {},
          inputNode: { id: -10, bounding: [10, 100, 150, 126] },
          outputNode: { id: -20, bounding: [400, 100, 140, 126] },
          inputs: [],
          outputs: [],
          widgets: [{ id: 1, name: "fps" }],
          nodes: [serializedDirector],
          links: [],
          groups: [],
        }],
      },
    };
    if (typeof app.loadGraphData === "function") {
      await app.loadGraphData(workflow);
    } else {
      app.graph.configure(workflow);
    }
    window.omnicamCiSubgraph = app.graph.nodes.find((node) => node.id === 2);
  });
  await page.waitForFunction(
    () => window.omnicamCiSubgraph?.widgets?.some((widget) => widget.name === "fps"),
    null,
    { timeout: 30_000 },
  );
  expect(await page.evaluate(() => {
    const fps = window.omnicamCiSubgraph.widgets.find((widget) => widget.name === "fps");
    fps.value = 30;
    fps.callback?.(30);
    return fps.value;
  })).toBe(30);
});
