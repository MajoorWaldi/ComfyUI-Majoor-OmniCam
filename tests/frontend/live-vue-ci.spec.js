import { expect, test } from "@playwright/test";

const CASES = [
  ["MajoorOmniCamDirector", "__majoorOmniCam"],
  ["MajoorOmniCamExtractor", "__majoorOmniCamExtractor"],
  ["MajoorOmniCamMonitor", "__majoorOmniCamMonitor"],
];

async function openReady(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      window.comfyAPI?.app?.app?.isGraphReady
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamMonitor,
    null,
    { timeout: 30_000 },
  );
}

async function enableVueNodes(page) {
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", true);
    app.graph.clear();
  });
}

for (const [nodeType, marker] of CASES) {
  test(`${nodeType} mounts and disposes with Nodes 2.0 enabled`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(String(error?.stack || error));
    });

    await openReady(page);
    await enableVueNodes(page);

    await page.evaluate(async (type) => {
      const { app } = await import("/scripts/app.js");
      const node = window.LiteGraph.createNode(type);
      app.graph.add(node);
      window.__omnicamVueTestNode = node;
    }, nodeType);

    await page.waitForFunction(
      ({ marker }) =>
        Boolean(window.__omnicamVueTestNode?.[marker]?.root?.isConnected),
      { marker },
      { timeout: 30_000 },
    );

    const mounted = await page.evaluate(
      ({ marker }) => ({
        hasMarker: Boolean(window.__omnicamVueTestNode?.[marker]),
        connected: Boolean(
          window.__omnicamVueTestNode?.[marker]?.root?.isConnected,
        ),
      }),
      { marker },
    );

    expect(mounted.hasMarker).toBe(true);
    expect(mounted.connected).toBe(true);

    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      const node = window.__omnicamVueTestNode;
      window.__omnicamDisposedRoot =
        node.__majoorOmniCam?.root
        || node.__majoorOmniCamExtractor?.root
        || node.__majoorOmniCamMonitor?.root;
      app.graph.remove(node);
    });

    await page.waitForFunction(
      () => !window.__omnicamDisposedRoot?.isConnected,
    );

    expect(pageErrors).toEqual([]);
  });
}
