import { expect } from "@playwright/test";

export async function waitForComfyCanvas(page) {
  await page.waitForFunction(() => {
    const app = window.comfyAPI?.app?.app;
    const canvas = app?.canvas?.canvas;
    return app?.isGraphReady && canvas?.isConnected && canvas.getBoundingClientRect().width > 0;
  }, null, {timeout: 30000});
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

// Give every product a real output sink. Extractor without footage must reject
// validation explicitly; Director/Monitor must execute and preserve their UI data.
export async function queueProductGraph(page, handle, { repeat = false } = {}) {
  const graph = await page.evaluate(async ({handle}) => {
    const {app} = await import("/scripts/app.js");
    const node = window[handle];
    const extractor = node.comfyClass === "MajoorOmniCamExtractor";
    let monitor = node;
    if (node.comfyClass !== "MajoorOmniCamMonitor") {
      monitor = window.LiteGraph.createNode("MajoorOmniCamMonitor");
      app.graph.add(monitor);
      node.connect(0, monitor, 0);
    } else {
      const director = window.LiteGraph.createNode("MajoorOmniCamDirector");
      app.graph.add(director);
      director.connect(0, monitor, 0);
    }
    monitor.widgets.find(w => w.name === "target_profile").value = "external_reference_video";
    const prompt = await app.graphToPrompt();
    const {api} = await import("/scripts/api.js");
    return {prompt: prompt.output, monitorId: String(monitor.id), extractor, clientId: api.clientId};
  }, {handle});
  for (let run = 0; run < (repeat ? 2 : 1); run++) {
    const response = await page.request.post("/prompt", {data: {prompt: graph.prompt, client_id: graph.clientId}});
    const queued = await response.json();
    if (graph.extractor) {
      expect(response.status()).toBe(400);
      expect(JSON.stringify(queued.node_errors)).toContain("video");
      return;
    }
    expect(response.ok(), JSON.stringify(queued)).toBe(true);
    expect(queued.prompt_id).toBeTruthy();
    let history;
    await expect.poll(async () => {
      const response = await page.request.get(`/history/${queued.prompt_id}`);
      history = (await response.json())[queued.prompt_id];
      return history?.status?.completed;
    }, {timeout: 30000}).toBe(true);
    expect(history.status.status_str).toBe("success");
    const ui = history.outputs[graph.monitorId];
    expect(ui.target_profile).toEqual(["external_reference_video"]);
    expect(ui.capabilities).toHaveLength(1);
    expect(Array.isArray(ui.capabilities[0].capabilities)).toBe(true);
    if (run > 0) {
      const cached = history.status.messages.find(([type]) => type === "execution_cached");
      expect(cached?.[1]?.nodes).toContain(graph.monitorId);
    }
  }
}
