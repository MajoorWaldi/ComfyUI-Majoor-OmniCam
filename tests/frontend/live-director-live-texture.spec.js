import { expect, test } from "@playwright/test";

const VIDEO = "260512_Atopi__00006_.mp4";

test("connecting a Load Video auto-applies it as a playing texture on subject", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async (file) => {
    const { app } = await import("/scripts/app.js");
    app.graph.clear();
    const loader = window.LiteGraph.createNode("LoadVideo");
    loader.pos = [-400, 0];
    app.graph.add(loader);
    const w = loader.widgets?.find((x) => x.name === "file");
    if (w) { w.value = file; w.callback?.(file); }
    const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
    director.pos = [0, 0];
    app.graph.add(director);
    const videoInput = director.inputs?.findIndex((i) => i.name === "video");
    loader.connect(0, director, videoInput);
    window.omnicamDirector = director;
  }, VIDEO);
  await page.waitForFunction(() => window.omnicamDirector?.__majoorOmniCam?.root?.isConnected, null, { timeout: 30000 });
  // syncUpstreamInputs already runs automatically off onConnectionsChange.
  await page.waitForTimeout(1500);

  const before = await page.evaluate(() => {
    const ui = window.omnicamDirector.__majoorOmniCam;
    const media = ui.cardMedia;
    return {
      tag: media?.tagName, paused: media?.paused, currentTime: media?.currentTime,
      subjectObject: ui.state.objects.find((o) => o.id === "subject"),
    };
  });
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => {
    const ui = window.omnicamDirector.__majoorOmniCam;
    return { currentTime: ui.cardMedia?.currentTime };
  });

  console.log("BEFORE", JSON.stringify(before));
  console.log("AFTER", JSON.stringify(after));
  expect(before.tag).toBe("VIDEO");
  expect(before.paused).toBe(false);
  expect(before.subjectObject.type).toBe("card");
  expect(after.currentTime).toBeGreaterThan(before.currentTime);
});
