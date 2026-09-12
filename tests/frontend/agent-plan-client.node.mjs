import test from "node:test";
import assert from "node:assert/strict";

import { applyPlan, requestPlan } from "../../web-src/agent/plan-client.js";

function makeApi(handler) {
  return {
    calls: [],
    async fetchApi(url, options) {
      const body = options?.body ? JSON.parse(options.body) : undefined;
      this.calls.push({ url, method: options?.method, body });
      return handler(url, options, body);
    },
  };
}

function ok(payload) {
  return { ok: true, status: 200, json: async () => payload };
}

test("requestPlan POSTs session_id/instruction/provider and never a credential", async () => {
  const api = makeApi(() => ok({ ok: true, plan_id: "plan_1", changes: [] }));
  await requestPlan(api, {
    sessionId: "sess_1",
    instruction: "lower the camera",
    provider: { id: "ollama", model: "qwen3" },
  });
  const call = api.calls[0];
  assert.equal(call.url, "/majoor/omnicam/agent/v1/plan");
  assert.deepEqual(call.body, {
    session_id: "sess_1",
    instruction: "lower the camera",
    provider: { id: "ollama", model: "qwen3" },
  });
  assert.equal("credential" in call.body, false);
});

test("applyPlan POSTs only plan_id", async () => {
  const api = makeApi(() => ok({ ok: true, revision: 3 }));
  const result = await applyPlan(api, "plan_1");
  assert.deepEqual(api.calls[0].body, { plan_id: "plan_1" });
  assert.equal(result.revision, 3);
});

test("a non-ok response raises with the structured error code", async () => {
  const api = makeApi(() => ({
    ok: false,
    status: 409,
    json: async () => ({ error: { code: "STALE_PLAN", message: "changed" } }),
  }));
  await assert.rejects(
    () => applyPlan(api, "plan_1"),
    (error) => {
      assert.equal(error.code, "STALE_PLAN");
      assert.equal(error.status, 409);
      return true;
    },
  );
});
