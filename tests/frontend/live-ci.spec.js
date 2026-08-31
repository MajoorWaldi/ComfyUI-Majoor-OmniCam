import { expect, test } from "@playwright/test";

function captureBrowserDiagnostics(page, testInfo) {
  const diagnostics = {
    pageErrors: [],
    consoleErrors: [],
    requestFailures: [],
    responseErrors: [],
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
    // Chromium omits the failed URL from this message. The response listener
    // below records actionable HTTP failures with both URL and status.
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      diagnostics.consoleErrors.push(message.text());
    }
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
    const url = response.url();
    const status = response.status();
    if (url.includes("/extensions/majoor-omnicam-chunks/")) {
      diagnostics.chunkResponses.push({ url, status });
      refresh();
    }
    if (status < 400) return;
    const parsed = new URL(url);
    // A fresh ComfyUI profile legitimately has no optional user CSS or
    // user-data files yet. The server reports those misses as 404 responses.
    if (status === 404 && (parsed.pathname === "/user.css" || parsed.pathname.startsWith("/api/userdata"))) return;
    diagnostics.responseErrors.push({ url, status });
    refresh();
  });
  return diagnostics;
}

async function openComfy(page) {
  await page.goto("/");
  await page.waitForFunction(
    () => window.comfyAPI?.app?.app?.isGraphReady
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
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.requestFailures).toEqual([]);
  expect(diagnostics.responseErrors).toEqual([]);
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
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.requestFailures).toEqual([]);
  expect(diagnostics.responseErrors).toEqual([]);
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

  await page.evaluate(async (workflow) => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    if (typeof app.loadGraphData === "function") {
      await app.loadGraphData(workflow);
    } else {
      app.graph.configure(workflow);
    }
    window.omnicamCiSubgraph = app.graph.nodes.find((node) => node.id === 20);
  }, workflowData);

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

