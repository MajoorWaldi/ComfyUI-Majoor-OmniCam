import { expect, test } from "@playwright/test";

const IMAGE = "00696bfa-46a5-4d50-bc79-a51db84bc00d.jpg";

// Director's own "Sync Upstream Inputs" already read a post-execution
// node.imgs[0] thumbnail; this proves the shared client-only fallback (which
// also checks widget media) still covers that exact case end to end.
test("Director's Sync Upstream Inputs reads a connected LoadImage with nothing executed", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector, null, { timeout: 60000 });
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
    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    director.pos = [0, 0];
    app.graph.add(director);
    const videoInput = director.inputs?.findIndex((i) => i.name === "video");
    loader.connect(0, director, videoInput);
    window.omnicamDirector = director;
  }, IMAGE);
  await page.waitForFunction(() => window.omnicamDirector?.__majoorOmniCam?.root?.isConnected, null, { timeout: 30000 });
  await page.evaluate(async () => {
    const ui = window.omnicamDirector.__majoorOmniCam;
    await ui.syncUpstreamInputs();
  });
  await page.waitForTimeout(300);

  const dump = await page.evaluate(() => {
    const ui = window.omnicamDirector.__majoorOmniCam;
    const media = ui.cardMedia;
    return {
      upstreamImageConnected: ui.upstreamImageConnected,
      cardMediaTag: media?.tagName,
      cardMediaSize: media ? [media.naturalWidth || media.videoWidth, media.naturalHeight || media.videoHeight] : null,
      trackSize: [ui.state.width, ui.state.height],
    };
  });
  console.log("DUMP", JSON.stringify(dump));
  expect(dump.upstreamImageConnected).toBe(true);
  expect(dump.cardMediaTag).toBe("IMG");
  expect(dump.cardMediaSize[0]).toBeGreaterThan(0);
  expect(dump.trackSize).toEqual(dump.cardMediaSize);
});
