import { expect, test } from "@playwright/test";

const IMAGE = "00696bfa-46a5-4d50-bc79-a51db84bc00d.jpg";

test("Monitor's proxy panel reads a client-only preview with no Director connected", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.LiteGraph?.registered_node_types?.MajoorOmniCamMonitor, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async (file) => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const loader = window.LiteGraph.createNode("LoadImage");
    loader.pos = [-400, 0];
    app.graph.add(loader);
    const w = loader.widgets?.find((x) => x.name === "image");
    if (w) { w.value = file; w.callback?.(file); }
    await new Promise((r) => setTimeout(r, 2000));
    const monitor = window.LiteGraph.createNode("MajoorOmniCamMonitor");
    monitor.pos = [0, 0];
    app.graph.add(monitor);
    const proxyInput = monitor.inputs?.findIndex((i) => i.name === "playblast_video");
    loader.connect(0, monitor, proxyInput);
    window.omnicamMonitor = monitor;
  }, IMAGE);
  await page.waitForFunction(() => window.omnicamMonitor?.__majoorOmniCamMonitor?.root?.isConnected, null, { timeout: 30000 });
  await page.waitForTimeout(1000);

  const dump = await page.evaluate(() => {
    const ui = window.omnicamMonitor.__majoorOmniCamMonitor;
    const canvas = ui.root.querySelector('[data-role="proxy-upstream-preview"]');
    return { canvasHidden: canvas?.hidden, canvasSize: canvas ? [canvas.width, canvas.height] : null };
  });
  console.log("DUMP", JSON.stringify(dump));
  expect(dump.canvasHidden).toBe(false);
  expect(dump.canvasSize[0]).toBeGreaterThan(0);
});
