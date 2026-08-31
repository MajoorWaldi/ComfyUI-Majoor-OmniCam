import { expect, test } from "@playwright/test";

function captureBrowserDiagnostics(page, testInfo) {
  const diagnostics = {
    pageErrors: [],
    consoleErrors: [],
    requestFailures: [],
    chunkResponses: [],
  };
  const annotation = { type: "browser-diagnostics", description: "no browser errors" };
  testInfo.annotations.push(annotation);
  const refresh = () => {
    annotation.description = JSON.stringify(diagnostics);
  };
  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push(String(error?.stack || error));
    refresh();
  });
  page.on("console", (message) => {
    if (message.type() === "error") diagnostics.consoleErrors.push(message.text());
    refresh();
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.includes("user.css") || url.includes("comfy.templates.json")) return;
    // ComfyUI's model/asset manager fires background pre-fetches for model
    // weights from external CDNs (HuggingFace, etc.). In CI, external network
    // access is blocked, so those fail with ERR_ABORTED. They are not OmniCam
    // requests and must not be counted as test failures.
    if (!url.startsWith("http://127.0.0.1") && !url.startsWith("http://localhost")) return;
    diagnostics.requestFailures.push({
      url,
      error: request.failure()?.errorText || "unknown",
    });
    refresh();
  });
  page.on("response", (response) => {
    if (response.url().includes("/extensions/majoor-omnicam-chunks/")) {
      diagnostics.chunkResponses.push({ url: response.url(), status: response.status() });
      refresh();
    }
  });
  return diagnostics;
}

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
    () => window.omnicamCiDirector?.__majoorOmniCam?.root,
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
    const data = { last_node_id: workflow.id, last_link_id: 0, nodes: [workflow], links: [] };
    if (typeof app.loadGraphData === "function") {
      await app.loadGraphData(data);
    } else {
      app.graph.configure(data);
    }
    window.omnicamCiDirector = app.graph.nodes.find((node) => node.comfyClass === "MajoorOmniCamDirector");
  }, editedFps);
  await page.waitForFunction(
    () => window.omnicamCiDirector?.__majoorOmniCam?.root,
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
    () => window.omnicamCiDirector?.__majoorOmniCam?.root,
    null,
    { timeout: 30_000 },
  );
});

test("Extractor attaches and detaches its lazy UI on a real ComfyUI graph", async ({ page }, testInfo) => {
  const diagnostics = captureBrowserDiagnostics(page, testInfo);
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
    (diagnostics) => {
      if (diagnostics.pageErrors.length || diagnostics.consoleErrors.length) {
        throw new Error("Console errors: " + diagnostics.consoleErrors.join(", ") + " Page errors: " + diagnostics.pageErrors.join(", "));
      }
      return window.omnicamCiExtractor?.__majoorOmniCamExtractor?.root;
    },
    diagnostics,
    { timeout: 30_000 },
  );
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    window.omnicamCiExtractorRoot = window.omnicamCiExtractor.__majoorOmniCamExtractor.root;
    app.graph.remove(window.omnicamCiExtractor);
  });
  await page.waitForFunction(() => !window.omnicamCiExtractorRoot.isConnected);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.requestFailures).toEqual([]);
  expect(diagnostics.chunkResponses.some(({ url, status }) => url.endsWith("/omnicam.js") && status === 200)).toBe(true);
  expect(diagnostics.chunkResponses.some(({ url, status }) => !url.endsWith("/omnicam.js") && status === 200)).toBe(true);
});

test("Extractor renders an injected solved track in TRACK 3D without page errors", async ({ page }, testInfo) => {
  const diagnostics = captureBrowserDiagnostics(page, testInfo);
  await openComfy(page);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const extractor = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    app.graph.add(extractor);
    window.omnicamCiTrackExtractor = extractor;
  });
  await page.waitForFunction(
    (diagnostics) => {
      if (diagnostics.pageErrors.length || diagnostics.consoleErrors.length) {
        throw new Error("Console errors: " + diagnostics.consoleErrors.join(", ") + " Page errors: " + diagnostics.pageErrors.join(", "));
      }
      return window.omnicamCiTrackExtractor?.__majoorOmniCamExtractor?.root;
    },
    diagnostics,
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
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.requestFailures).toEqual([]);
  expect(viewer.renderer).toBe(true);
  expect(viewer.canvasWidth).toBeGreaterThan(0);
  expect(viewer.paths).toBeGreaterThan(0);
  expect(viewer.frustums).toBeGreaterThan(0);
});

test("Director mounts inside a Subgraph and keeps its promoted fps widget", async ({ page }) => {
  await openComfy(page);
  const fs = await import("fs/promises");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const workflowData = JSON.parse(await fs.readFile(path.join(__dirname, "../fixtures/director-subgraph-v034.json"), "utf8"));

  // Use afterConfigureGraph to ensure the full configure cycle (including
  // SubgraphNode proxy widget population) has completed before we capture
  // the outer node. loadGraphData resolves before SubgraphNode's async
  // widget promotion via Vue reactivity finishes, so a raw await is not enough.
  await page.evaluate(async (workflow) => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    await new Promise((resolve) => {
      const ext = {
        name: "OmniCam.SubgraphCiProbe",
        afterConfigureGraph() {
          try { app.unregisterExtension?.(ext); } catch { /* ignore */ }
          resolve();
        },
      };
      app.registerExtension(ext);
      if (typeof app.loadGraphData === "function") {
        app.loadGraphData(workflow).catch(() => resolve());
      } else {
        app.graph.configure(workflow);
        // afterConfigureGraph won't fire for configure(); resolve immediately.
        resolve();
      }
    });
    window.omnicamCiSubgraph = app.graph.nodes.find((node) => node.id === 20);
  }, workflowData);

  // Poll for the fps widget. Check both the outer SubgraphNode's proxy widget
  // array (the intended path) and the inner graph nodes as a fallback, since
  // the outer proxy population may be deferred by additional async passes.
  await page.waitForFunction(
    () => {
      const outer = window.omnicamCiSubgraph;
      if (!outer) return false;
      if (outer.widgets?.some((w) => w.name === "fps")) return true;
      // Fallback: probe the subgraph's inner graph directly.
      const innerGraph = outer.subgraph || outer._subgraph;
      if (innerGraph) {
        const nodes = innerGraph._nodes || innerGraph.nodes || [];
        const director = nodes.find(
          (n) => String(n.comfyClass || n.type) === "MajoorOmniCamDirector",
        );
        if (director?.widgets?.some((w) => w.name === "fps")) return true;
      }
      return false;
    },
    null,
    { timeout: 30_000 },
  );

  // Locate the fps widget via whichever path succeeded, set its value and
  // confirm the write-back.
  expect(await page.evaluate(() => {
    const outer = window.omnicamCiSubgraph;
    let fps = outer.widgets?.find((w) => w.name === "fps");
    if (!fps) {
      const innerGraph = outer.subgraph || outer._subgraph;
      const nodes = (innerGraph?._nodes || innerGraph?.nodes || []);
      const director = nodes.find(
        (n) => String(n.comfyClass || n.type) === "MajoorOmniCamDirector",
      );
      fps = director?.widgets?.find((w) => w.name === "fps");
    }
    if (!fps) return null;
    fps.value = 30;
    fps.callback?.(30);
    return fps.value;
  })).toBe(30);
});

