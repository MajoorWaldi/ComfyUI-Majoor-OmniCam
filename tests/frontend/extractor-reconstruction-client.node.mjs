// The slim reconstruction client that outlived the job scheduler: capabilities
// and the disk cache. No start/status/stop/result, no clientId, no
// /reconstruction/jobs.

import assert from "node:assert/strict";
import test from "node:test";

import { ReconstructionClient } from "../../web-src/extractor/reconstruction/client.js";

function mockApi({ ok = true, status = 200, json = {}, text = "" } = {}) {
  const calls = [];
  return {
    calls,
    fetchApi: async (url, options = {}) => {
      calls.push({ url, options });
      return { ok, status, json: async () => json, text: async () => text };
    },
  };
}

test("ReconstructionClient only exposes read-only / cache routes", () => {
  const client = new ReconstructionClient(mockApi());
  for (const gone of ["startJob", "getJobStatus", "stopJob", "getJobResult", "deleteJob", "start", "status", "stop", "result"]) {
    assert.equal(client[gone], undefined, `${gone} must be gone`);
  }
  for (const kept of ["capabilities", "clearCache", "deleteCacheEntry"]) {
    assert.equal(typeof client[kept], "function", `${kept} must stay`);
  }
});

test("capabilities is a plain GET to the capabilities route", async () => {
  const api = mockApi({ json: { providers: [] } });
  await new ReconstructionClient(api).capabilities();
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].url, "/majoor/omnicam/reconstruction/capabilities");
  assert.equal(api.calls[0].options.method ?? "GET", "GET");
});

test("clearCache and deleteCacheEntry hit the cache routes", async () => {
  const api = mockApi({ json: { cleared: true } });
  const client = new ReconstructionClient(api);
  await client.clearCache();
  await client.deleteCacheEntry("fp 7/aa");
  assert.deepEqual(api.calls.map((c) => [c.options.method, c.url]), [
    ["DELETE", "/majoor/omnicam/reconstruction/cache"],
    ["DELETE", "/majoor/omnicam/reconstruction/cache/fp%207%2Faa"],
  ]);
});

test("a structured error body surfaces its code and message", async () => {
  const api = mockApi({
    ok: false,
    status: 500,
    text: JSON.stringify({ error: { code: "RECON_GPU_OOM", message: "Out of memory" } }),
  });
  await assert.rejects(
    () => new ReconstructionClient(api).capabilities(),
    /RECON_GPU_OOM|Out of memory/,
  );
});
