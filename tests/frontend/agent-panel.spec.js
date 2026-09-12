import { expect, test } from "@playwright/test";

// Mounted integration for the Director's AGENT tab (design spec section 32).
// No Python backend runs here: api.customFetch stands in for the provider/
// planner HTTP routes, exactly like agent-bridge.spec.js does for the
// external Agent bridge. /apply-plan's handler calls the *real*
// ui.directorApi.execute() with the transaction the fake /plan handed out,
// so a genuine Director API mutation (and its revision bump) is exercised
// end-to-end -- only the network hop and the LLM are faked.

async function mountAgentPanel(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });

  await page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");

    window.__planCalls = [];
    window.__applyCalls = [];
    window.__nextPlanResponse = null;
    window.__pendingTransaction = null;
    window.__forceStale = false;

    api.customFetch = async (path, options) => {
      const body = options?.body ? JSON.parse(options.body) : null;

      if (path === "/majoor/omnicam/agent/v1/session/register") {
        return { ok: true, status: 200, json: async () => ({ session_id: "sess_1", session_token: "tok_1" }) };
      }
      if (path === "/majoor/omnicam/agent/v1/session/heartbeat") return { ok: true, status: 200, json: async () => ({ ok: true }) };
      if (path === "/majoor/omnicam/agent/v1/session/close") return { ok: true, status: 200, json: async () => ({ ok: true }) };
      if (/^\/majoor\/omnicam\/agent\/v1\/providers\/[^/]+\/status$/.test(path)) {
        return { ok: true, status: 200, json: async () => ({ provider: "ollama", configured: false, source: "none" }) };
      }
      if (path === "/majoor/omnicam/agent/v1/plan") {
        window.__planCalls.push(body);
        return { ok: true, status: 200, json: async () => window.__nextPlanResponse };
      }
      if (path === "/majoor/omnicam/agent/v1/apply-plan") {
        window.__applyCalls.push(body);
        if (window.__forceStale) {
          return { ok: false, status: 409, json: async () => ({ error: { code: "STALE_PLAN", message: "changed" } }) };
        }
        const ui = window.omnicamNode.__majoorOmniCam;
        const result = ui.directorApi.execute({ ...window.__pendingTransaction, validateOnly: false });
        return { ok: result.ok !== false, status: result.ok === false ? 400 : 200, json: async () => result };
      }
      return undefined;
    };

    // Re-register the Agent bridge under the intercepted fetch, same as
    // agent-bridge.spec.js -- the one from mount used the plain stub.
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.agentBridge.dispose();
    const { createDirectorAgentBridge } = await import("/web-src/agent/bridge.js");
    ui.agentBridge = createDirectorAgentBridge(ui, window.omnicamNode, api);

    for (let i = 0; i < 50 && !ui.agentBridge.sessionId; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  });
}

async function openAgentTab(page) {
  const root = page.locator(".majoor-omnicam");
  await root.locator('[data-asset-view="agent"]').click();
  await expect(root.locator('[data-role="agent-tab"]')).toBeVisible();

  // director.js's onAgentFirstOpen dynamically imports panel.js and mounts it
  // with `ui.api` -- but `ui.api` was captured from the bundle's own
  // import-mapped module instance of scripts/api.js, a *different* module
  // instance than the one this spec dynamically imports and patches above
  // (the same caveat agent-bridge.spec.js works around for the bridge).
  // Replace the auto-mounted panel with one explicitly given the
  // intercepted `api` so this spec's customFetch actually gets hit.
  await page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.agentPanel?.dispose?.();
    const { createDirectorAgentPanel } = await import("/web-src/agent/panel.js");
    ui.agentPanel = createDirectorAgentPanel(ui, { api });
  });

  await expect(root.locator('[data-role="agent-credential-status"]')).toHaveText(/Not configured/, { timeout: 10000 });
}

test("Preview renders the diff without mutating the scene, then Apply mutates it once", async ({ page }) => {
  await mountAgentPanel(page);
  await openAgentTab(page);
  const root = page.locator(".majoor-omnicam");

  const before = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return {
      position: ui.state.objects.find((o) => o.id === "qa_cube").position,
      revision: ui.directorRevision,
    };
  });
  expect(before.position).toEqual([0, 0.5, 0]);

  await page.evaluate((baseRevision) => {
    window.__pendingTransaction = {
      version: 1,
      id: "plan_preview_1",
      description: "Move the cube",
      baseRevision,
      operations: [{ type: "object.transform", objectId: "qa_cube", position: [9, 9, 9] }],
    };
    window.__nextPlanResponse = {
      ok: true,
      plan_id: "plan_1",
      revision: baseRevision,
      description: "Move the cube",
      changes: [{ entity: "qa_cube", field: "position" }],
      warnings: [],
      truncated: false,
    };
  }, before.revision);

  await root.locator('[data-role="agent-describe"]').fill("move the cube");
  await root.locator('[data-agent-act="preview"]').click();

  await expect(root.locator('[data-role="agent-plan"] li')).toContainText("qa_cube", { timeout: 10000 });
  await expect(root.locator('[data-agent-act="apply"]')).toBeEnabled();

  // Preview is a dry run: the live scene must be untouched.
  const afterPreview = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  expect(afterPreview).toEqual([0, 0.5, 0]);

  await root.locator('[data-agent-act="apply"]').click();

  await expect(root.locator('[data-agent-act="apply"]')).toBeDisabled({ timeout: 10000 });
  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { position: ui.state.objects.find((o) => o.id === "qa_cube").position, revision: ui.directorRevision };
  });
  expect(after.position).toEqual([9, 9, 9]);
  expect(after.revision).toBeGreaterThan(before.revision);

  const applyCalls = await page.evaluate(() => window.__applyCalls);
  expect(applyCalls).toHaveLength(1);
  expect(applyCalls[0]).toEqual({ plan_id: "plan_1" });
});

test("a STALE_PLAN response disables Apply and asks for a new preview", async ({ page }) => {
  await mountAgentPanel(page);
  await openAgentTab(page);
  const root = page.locator(".majoor-omnicam");

  const revision = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.directorRevision);
  await page.evaluate((baseRevision) => {
    window.__pendingTransaction = {
      version: 1, id: "plan_preview_2", description: "x", baseRevision,
      operations: [{ type: "object.transform", objectId: "qa_cube", position: [1, 1, 1] }],
    };
    window.__nextPlanResponse = {
      ok: true, plan_id: "plan_2", revision: baseRevision, description: "x",
      changes: [{ entity: "qa_cube", field: "position" }], warnings: [], truncated: false,
    };
  }, revision);

  await root.locator('[data-role="agent-describe"]').fill("do something");
  await root.locator('[data-agent-act="preview"]').click();
  await expect(root.locator('[data-agent-act="apply"]')).toBeEnabled();

  await page.evaluate(() => { window.__forceStale = true; });
  await root.locator('[data-agent-act="apply"]').click();

  await expect(root.locator('[data-role="agent-hint"]')).toHaveText(/changed after this preview/, { timeout: 10000 });
  await expect(root.locator('[data-agent-act="apply"]')).toBeDisabled();

  // A stale Apply must never have touched the scene.
  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").position);
  expect(after).toEqual([0, 0.5, 0]);
});
