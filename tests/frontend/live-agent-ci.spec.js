import { expect, test } from "@playwright/test";
import { waitForComfyCanvas, waitForDirectorInline } from "./live-helpers.js";

test("real broker discovers the Director target, previews, commits once and recovers its outcome", async ({ page, request }) => {
  page.on("pageerror", (error) => console.error("agent live page error", error.message));
  page.on("console", (message) => { if (message.type() === "error") console.error("agent live console", message.text()); });
  page.on("response", (response) => { if (response.status() >= 400 && response.url().includes("omnicam")) console.error("agent live HTTP", response.status(), response.url()); });
  await page.goto("/");
  await waitForComfyCanvas(page);
  await page.waitForFunction(() => window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", false);
  });
  await waitForComfyCanvas(page);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    window.__majoorOmniCamCiTrace = [];
    // Use the host's async workflow boundary; a bare clear can race initial
    // workflow restoration and leave our freshly-created node detached.
    await app.loadGraphData({ version: 0.4, nodes: [], links: [], groups: [], extra: {} });
  });
  await waitForComfyCanvas(page);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    app.graph.add(node);
    window.agentAuditNode = node;
  });
  try {
    await page.waitForFunction(() => window.agentAuditNode?.__majoorOmniCamDirectorRuntime?.agentBridge?.sessionId, null, { timeout: 15000 });
  } catch (error) {
    console.error("agent live diagnostic", await page.evaluate(() => ({
      trace: window.__majoorOmniCamCiTrace,
      type: window.agentAuditNode?.comfyClass,
      graph: Boolean(window.agentAuditNode?.graph),
      activeNodes: window.comfyAPI?.app?.app?.graph?._nodes?.map((node) => ({ id: node.id, type: node.comfyClass })),
      runtime: Boolean(window.agentAuditNode?.__majoorOmniCamDirectorRuntime),
      clientId: window.comfyAPI?.api?.api?.clientId,
    })));
    throw error;
  }
  await waitForDirectorInline(page, "agentAuditNode");
  const sessionId = await page.evaluate(() => window.agentAuditNode.__majoorOmniCamDirectorRuntime.agentBridge.sessionId);
  const headers = { "X-OmniCam-Agent": "1" };
  const prefix = "/majoor/omnicam/agent/v1";
  const contract = await (await request.get(`${prefix}/contract`, { headers })).json();
  expect(contract.official_comfy_agent.registered).toBe(false);
  const sessions = await (await request.get(`${prefix}/sessions`, { headers })).json();
  const session = sessions.sessions.find((s) => s.session_id === sessionId);
  expect(session.target.document_id).toBeTruthy();
  expect(session.queries).toContain("asset.catalog_search");
  const query = await (await request.post(`${prefix}/query`, {
    headers, data: { session_id: sessionId, request: { type: "scene.summary" } },
  })).json();
  const tx = { version: 1, id: "live-reviewed-transaction", description: "Rename camera",
    baseRevision: query.revision, validateOnly: true,
    operations: [{ type: "camera.rename", cameraId: query.summary.active_camera_id, name: "Agent reviewed" }] };
  const post = async (transaction) => (await request.post(`${prefix}/transaction`, {
    headers, data: { session_id: sessionId, transaction },
  })).json();
  const preview = await post(tx);
  expect(preview.ok, JSON.stringify(preview)).toBe(true);
  const committed = await post({ ...tx, validateOnly: false });
  expect(committed.ok, JSON.stringify(committed)).toBe(true);
  expect(await post({ ...tx, validateOnly: false })).toEqual(committed);
  const recovered = await (await request.post(`${prefix}/transaction/status`, {
    headers, data: { session_id: sessionId, transaction_id: tx.id },
  })).json();
  expect(recovered.status).toBe("completed");
  expect(recovered.result).toEqual(committed);
  const serialized = await page.evaluate(() => JSON.parse(window.agentAuditNode.widgets.find((w) => w.name === "state_json").value));
  expect(serialized.cameras.find((c) => c.id === query.summary.active_camera_id).name).toBe("Agent reviewed");
});
