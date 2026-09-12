import { expect, test } from "@playwright/test";

// Mounted integration for the live OmniCam Agent bridge. The backend broker
// is not running here, so api.customFetch stands in for it: every
// /majoor/omnicam/agent/v1/* call is answered directly in the browser, and a
// server->browser push is simulated with api.dispatchEvent (the same hook the
// stub already exposes for other custom ComfyUI events).

async function mountWithAgentBroker(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });

  return page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");

    window.__agentCalls = [];
    api.customFetch = async (path, options) => {
      const body = options?.body ? JSON.parse(options.body) : null;
      window.__agentCalls.push({ path, body });

      if (path === "/majoor/omnicam/agent/v1/session/register") {
        window.__agentSession = { session_id: "sess_1", session_token: "tok_1" };
        return { ok: true, status: 200, json: async () => window.__agentSession };
      }
      if (path === "/majoor/omnicam/agent/v1/session/heartbeat") {
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      }
      if (path === "/majoor/omnicam/agent/v1/session/close") {
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      }
      if (path === "/majoor/omnicam/agent/v1/reply") {
        window.__agentReplies = window.__agentReplies || [];
        window.__agentReplies.push(body);
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      }
      return undefined;
    };

    // Force a fresh registration under the intercepted fetch (the bridge
    // already registered once at mount, against the plain stub).
    window.omnicamNode.__majoorOmniCam.agentBridge.dispose();
    const { createDirectorAgentBridge } = await import("/web-src/agent/bridge.js");
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.agentBridge = createDirectorAgentBridge(ui, window.omnicamNode, api);

    for (let i = 0; i < 20 && !window.__agentSession; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return { registered: Boolean(window.__agentSession), sessionId: window.__agentSession?.session_id };
  });
}

test("the Director registers a live Agent session", async ({ page }) => {
  const mount = await mountWithAgentBroker(page);
  expect(mount.registered).toBe(true);
});

test("a targeted transaction reaches the correct node, mutates state and advances revision", async ({ page }) => {
  await mountWithAgentBroker(page);

  const result = await page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");
    const ui = window.omnicamNode.__majoorOmniCam;
    const before = [...ui.state.objects.find((o) => o.id === "qa_cube").position];
    const beforeRevision = ui.directorRevision;

    api.dispatchEvent("majoor.omnicam.agent.request", {
      protocol: "omnicam-agent/1",
      schema_version: 1,
      session_id: window.__agentSession.session_id,
      request_id: "req_1",
      node_id: String(window.omnicamNode.id),
      kind: "transaction",
      payload: {
        version: 1,
        id: "tx_agent_1",
        description: "Agent moves the cube",
        baseRevision: beforeRevision,
        operations: [{ type: "object.transform", objectId: "qa_cube", position: [9, 9, 9] }],
      },
    });

    for (let i = 0; i < 20 && !(window.__agentReplies || []).length; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const stateJson = JSON.parse(ui.node.widgets.find((w) => w.name === "state_json").value);
    return {
      reply: window.__agentReplies[0],
      before,
      afterLive: ui.state.objects.find((o) => o.id === "qa_cube").position,
      afterSerialized: stateJson.objects.find((o) => o.id === "qa_cube").position,
      afterRevision: ui.directorRevision,
      beforeRevision,
    };
  });

  expect(result.reply.result.ok).toBe(true);
  expect(result.afterLive).toEqual([9, 9, 9]);
  expect(result.afterSerialized).toEqual([9, 9, 9]);
  expect(result.afterRevision).toBeGreaterThan(result.beforeRevision);
});

test("a stale baseRevision is rejected atomically and never mutates state", async ({ page }) => {
  await mountWithAgentBroker(page);

  const result = await page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");
    const ui = window.omnicamNode.__majoorOmniCam;
    const before = [...ui.state.objects.find((o) => o.id === "qa_cube").position];

    api.dispatchEvent("majoor.omnicam.agent.request", {
      protocol: "omnicam-agent/1",
      schema_version: 1,
      session_id: window.__agentSession.session_id,
      request_id: "req_stale",
      node_id: String(window.omnicamNode.id),
      kind: "transaction",
      payload: {
        version: 1,
        id: "tx_agent_stale",
        description: "Stale agent write",
        baseRevision: ui.directorRevision + 999,
        operations: [{ type: "object.transform", objectId: "qa_cube", position: [1, 1, 1] }],
      },
    });

    for (let i = 0; i < 20 && !(window.__agentReplies || []).length; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return {
      reply: window.__agentReplies[0],
      before,
      after: ui.state.objects.find((o) => o.id === "qa_cube").position,
    };
  });

  expect(result.reply.result.ok).toBe(false);
  expect(result.reply.result.error.code).toBe("STALE_REVISION");
  expect(result.after).toEqual(result.before);
});

test("node removal closes the Agent session", async ({ page }) => {
  await mountWithAgentBroker(page);

  const result = await page.evaluate(async () => {
    window.omnicamNode.onRemoved();
    for (let i = 0; i < 20 && !window.__agentCalls.some((c) => c.path.endsWith("/session/close")); i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return window.__agentCalls.find((c) => c.path.endsWith("/session/close"));
  });

  expect(result).toBeTruthy();
  expect(result.body.session_id).toBe("sess_1");
});
