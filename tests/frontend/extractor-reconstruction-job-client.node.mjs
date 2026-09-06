import assert from "node:assert/strict";
import test from "node:test";

import {
  ReconstructionJobClient,
  stopActiveReconstructionOnDispose,
} from "../../web-src/extractor/reconstruction/job-client.js";

function createMockApi({ ok = true, status = 200, json = {}, text = "" } = {}) {
  const calls = [];
  const fetchApi = async (url, options = {}) => {
    calls.push({ url, options });
    return {
      ok,
      status,
      json: async () => (typeof json === "function" ? json(url, options) : json),
      text: async () => text,
    };
  };
  return { fetchApi, calls, clientId: "mock_client_id" };
}

test("ReconstructionJobClient propagates clientId and only targets /majoor/omnicam/reconstruction/ namespace", async () => {
  const api = createMockApi({ json: { ok: true } });
  const client = new ReconstructionJobClient(api);

  await client.capabilities();
  assert.equal(api.calls.length, 1);
  const call = api.calls[0];
  assert.ok(call.url.startsWith("/majoor/omnicam/reconstruction/capabilities"));
  assert.ok(call.url.includes("clientId=mock_client_id"));
  assert.ok(!call.url.includes("/extractor/jobs"), "Must never target camera namespace");
});

test("ReconstructionJobClient supports all six job methods plus capabilities and preview", async () => {
  const api = createMockApi({ json: { ok: true } });
  const client = new ReconstructionJobClient(api, { clientId: "custom_client_456" });

  // 1. capabilities
  await client.capabilities();
  assert.equal(api.calls[0].options.method ?? "GET", "GET");
  assert.ok(api.calls[0].url.startsWith("/majoor/omnicam/reconstruction/capabilities"));

  // 2. start / startJob
  await client.startJob({
    nodeId: "42",
    source: { kind: "annotated_input", value: "test.png" },
    settings: { quality: "fast" },
  });
  const startCall = api.calls[1];
  assert.equal(startCall.options.method, "POST");
  assert.ok(startCall.url.startsWith("/majoor/omnicam/reconstruction/jobs"));
  const startBody = JSON.parse(startCall.options.body);
  assert.equal(startBody.node_id, "42");
  assert.equal(startBody.client_id, "custom_client_456");
  assert.equal(startBody.source.value, "test.png");
  assert.equal(startBody.settings.quality, "fast");

  // 3. status / getJobStatus
  await client.getJobStatus("job_123");
  const statusCall = api.calls[2];
  assert.equal(statusCall.options.method ?? "GET", "GET");
  assert.ok(statusCall.url.startsWith("/majoor/omnicam/reconstruction/jobs/job_123"));

  // 4. stop / stopJob
  await client.stopJob("job_123");
  const stopCall = api.calls[3];
  assert.equal(stopCall.options.method, "POST");
  assert.ok(stopCall.url.startsWith("/majoor/omnicam/reconstruction/jobs/job_123/stop"));

  // 5. result / getJobResult
  await client.getJobResult("job_123");
  const resultCall = api.calls[4];
  assert.equal(resultCall.options.method ?? "GET", "GET");
  assert.ok(resultCall.url.startsWith("/majoor/omnicam/reconstruction/jobs/job_123/result"));

  // 6. delete / remove / deleteJob
  await client.deleteJob("job_123");
  const deleteCall = api.calls[5];
  assert.equal(deleteCall.options.method, "DELETE");
  assert.ok(deleteCall.url.startsWith("/majoor/omnicam/reconstruction/jobs/job_123"));

  // 7. preview / getJobPreview
  await client.getJobPreview("job_123");
  const previewCall = api.calls[6];
  assert.equal(previewCall.options.method ?? "GET", "GET");
  assert.ok(previewCall.url.startsWith("/majoor/omnicam/reconstruction/jobs/job_123/preview"));

  // Assert method aliases exist and work
  assert.equal(typeof client.start, "function");
  assert.equal(typeof client.status, "function");
  assert.equal(typeof client.stop, "function");
  assert.equal(typeof client.result, "function");
  assert.equal(typeof client.remove, "function");
  assert.equal(typeof client.preview, "function");
});

test("ReconstructionJobClient extracts structured error or text response", async () => {
  const errorJson = JSON.stringify({
    error: { code: "RECON_GPU_OOM", message: "Out of memory" },
  });
  const api = createMockApi({ ok: false, status: 500, text: errorJson });
  const client = new ReconstructionJobClient(api);

  await assert.rejects(
    async () => client.capabilities(),
    (err) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes("RECON_GPU_OOM") || err.message.includes("Out of memory"));
      return true;
    }
  );
});

test("stopActiveReconstructionOnDispose cancels active reconstruction jobs", async () => {
  const api = createMockApi({ json: { ok: true } });
  const client = new ReconstructionJobClient(api);

  // Active state: should stop
  const didStop = stopActiveReconstructionOnDispose(client, {
    jobId: "job_active",
    jobState: "ESTIMATING_DEPTH",
  });
  assert.equal(didStop, true);
  assert.equal(api.calls.length, 1);
  assert.ok(api.calls[0].url.includes("/jobs/job_active/stop"));

  // Idle state: should not stop
  const didStopIdle = stopActiveReconstructionOnDispose(client, {
    jobId: "",
    jobState: "IDLE",
  });
  assert.equal(didStopIdle, false);
});
