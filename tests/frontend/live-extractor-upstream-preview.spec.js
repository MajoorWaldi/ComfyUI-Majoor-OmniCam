import { expect, test } from "@playwright/test";

const IMAGE = "00696bfa-46a5-4d50-bc79-a51db84bc00d.jpg";

test("connecting before the upstream image finishes decoding still ends up with a preview", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async (file) => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const loader = window.LiteGraph.createNode("LoadImage");
    loader.pos = [-400, 0];
    app.graph.add(loader);
    const w = loader.widgets?.find((x) => x.name === "image");
    const node = window.LiteGraph.createNode("MajoorOmniCamExtractor");
    node.pos = [0, 0];
    app.graph.add(node);
    // Set the widget and connect in the same tick -- the image has not
    // decoded yet when onConnectionsChange fires.
    if (w) { w.value = file; w.callback?.(file); }
    loader.connect(0, node, 0);
    window.omnicamExtractor = node;
  }, IMAGE);
  await page.waitForFunction(() => window.omnicamExtractor?.__majoorOmniCamExtractor?.root?.isConnected, null, { timeout: 30000 });
  await page.waitForTimeout(900);

  const dump = await page.evaluate(() => {
    const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
    const canvas = ui.root.querySelector('[data-role="upstream-preview"]');
    return { upstreamPreviewActive: ui.upstreamPreviewActive, canvasHidden: canvas?.hidden };
  });
  console.log("DUMP", JSON.stringify(dump));
  expect(dump.upstreamPreviewActive).toBe(true);
  expect(dump.canvasHidden).toBe(false);
});
