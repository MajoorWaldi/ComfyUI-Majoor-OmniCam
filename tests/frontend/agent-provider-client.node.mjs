import test from "node:test";
import assert from "node:assert/strict";

import {
  deleteProviderCredential,
  getProviderStatus,
  listProviderModels,
  listProviders,
  setProviderCredential,
  testProvider,
} from "../../web-src/agent/provider-client.js";

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

test("listProviders GETs the providers route and returns the list", async () => {
  const api = makeApi(() => ok({ providers: [{ id: "ollama" }] }));
  const providers = await listProviders(api);
  assert.deepEqual(providers, [{ id: "ollama" }]);
  assert.equal(api.calls[0].url, "/majoor/omnicam/agent/v1/providers");
  assert.equal(api.calls[0].method, "GET");
});

test("getProviderStatus GETs the provider-specific status route", async () => {
  const api = makeApi(() => ok({ provider: "anthropic", configured: true, source: "environment" }));
  const status = await getProviderStatus(api, "anthropic");
  assert.equal(status.configured, true);
  assert.equal(api.calls[0].url, "/majoor/omnicam/agent/v1/providers/anthropic/status");
});

test("setProviderCredential PUTs only {secret} and never anything else", async () => {
  const api = makeApi(() => ok({ provider: "openai", configured: true, source: "local_store" }));
  await setProviderCredential(api, "openai", "sk-test-123");
  const call = api.calls[0];
  assert.equal(call.method, "PUT");
  assert.equal(call.url, "/majoor/omnicam/agent/v1/providers/openai/credential");
  assert.deepEqual(Object.keys(call.body), ["secret"]);
  assert.equal(call.body.secret, "sk-test-123");
});

test("deleteProviderCredential DELETEs the credential route", async () => {
  const api = makeApi(() => ok({ provider: "openai", configured: false, source: "none" }));
  await deleteProviderCredential(api, "openai");
  assert.equal(api.calls[0].method, "DELETE");
  assert.equal(api.calls[0].url, "/majoor/omnicam/agent/v1/providers/openai/credential");
});

test("testProvider POSTs only provider/model config, no scene data", async () => {
  const api = makeApi(() => ok({ ok: true }));
  await testProvider(api, "ollama", { model: "qwen3", base_url: "http://127.0.0.1:11434" });
  const call = api.calls[0];
  assert.equal(call.method, "POST");
  assert.equal(call.url, "/majoor/omnicam/agent/v1/providers/ollama/test");
  assert.deepEqual(call.body, { model: "qwen3", base_url: "http://127.0.0.1:11434" });
});

test("listProviderModels POSTs config and returns the models array", async () => {
  const api = makeApi(() => ok({ models: ["a", "b"] }));
  const models = await listProviderModels(api, "ollama", { model: "" });
  assert.deepEqual(models, ["a", "b"]);
});

test("a non-ok response raises with the structured error code", async () => {
  const api = makeApi(() => ({
    ok: false,
    status: 409,
    json: async () => ({ error: { code: "CREDENTIAL_MANAGED_BY_ENV", message: "nope" } }),
  }));
  await assert.rejects(
    () => setProviderCredential(api, "openai", "sk-x"),
    (error) => {
      assert.equal(error.code, "CREDENTIAL_MANAGED_BY_ENV");
      assert.equal(error.status, 409);
      return true;
    },
  );
});
