import assert from "node:assert/strict";
import test from "node:test";

import { ReconstructionPanelController } from "../../web-src/extractor/reconstruction/panel.js";

function makeApi({ startResponse, capabilitiesResponse = { providers: [] } } = {}) {
  return {
    fetchApi: async (path) => {
      if (path.includes("/capabilities")) {
        return { ok: true, json: async () => capabilitiesResponse };
      }
      if (path.includes("/reconstruction/jobs")) {
        return { ok: true, json: async () => startResponse };
      }
      throw new Error(`Unexpected fetchApi path: ${path}`);
    },
    // No WebSocket delivery in these tests -- addEventListener is optional
    // chained in ReconstructionEventSubscription and safely no-ops.
  };
}

const SOURCE = { kind: "annotated_input", value: "recon_input_abc.png [input]" };

test("a cache hit that finishes before the POST returns is resolved from the response, not the socket", async () => {
  // job.to_dict() (omnicam/reconstruction/jobs/types.py) always embeds
  // "result" once job.result is set -- which can happen before the HTTP
  // handler even serializes the response, if the background thread races
  // ahead on a cache hit. The panel must not depend on the "done" WebSocket
  // event (which may have already fired and been dropped, since jobId
  // wasn't set in state yet to match it).
  const api = makeApi({
    startResponse: {
      job_id: "job_cache_hit",
      state: "DONE",
      stage: "DONE",
      progress: 1,
      message: "",
      result: {
        motion_scene: { version: 1, objects: [] },
        summary: { triangle_count: 12345 },
        warnings: ["low confidence ground"],
        fingerprint: "fp123",
      },
      error: null,
      warnings: [],
    },
  });

  const controller = new ReconstructionPanelController({
    root: null,
    node: { id: 1 },
    api,
    getSource: () => SOURCE,
  });

  await controller.run();

  assert.equal(controller.state.jobState, "DONE");
  assert.equal(controller.state.jobId, "job_cache_hit");
  // applyJobResponse() unwraps resp.result.motion_scene, matching the shape
  // openDirector() and the "done" WebSocket handler both already expect
  // (`state.result.motion_scene || state.result`).
  assert.equal(controller.state.result.version, 1);
  assert.deepEqual(controller.state.summary, { triangle_count: 12345 });
  assert.deepEqual(controller.state.warnings, ["low confidence ground"]);

  controller.dispose();
});

test("a job that fails before the POST returns is resolved as an error immediately", async () => {
  const api = makeApi({
    startResponse: {
      job_id: "job_fast_fail",
      state: "FAILED",
      stage: "PREPARING",
      progress: 0,
      message: "",
      result: null,
      error: { code: "RECON_SOURCE_INVALID", message: "Source image not found" },
      warnings: [],
    },
  });

  const controller = new ReconstructionPanelController({
    root: null,
    node: { id: 1 },
    api,
    getSource: () => SOURCE,
  });

  await controller.run();

  assert.equal(controller.state.jobState, "FAILED");
  assert.equal(controller.state.error.code, "RECON_SOURCE_INVALID");

  controller.dispose();
});

test("a normal in-flight job still updates from the STATE branch (no result yet)", async () => {
  const api = makeApi({
    startResponse: {
      job_id: "job_running",
      state: "PREPARING",
      stage: "PREPARING",
      progress: 0.02,
      message: "",
      result: null,
      error: null,
      warnings: [],
    },
  });

  const controller = new ReconstructionPanelController({
    root: null,
    node: { id: 1 },
    api,
    getSource: () => SOURCE,
  });

  await controller.run();

  assert.equal(controller.state.jobState, "PREPARING");
  assert.equal(controller.state.jobId, "job_running");
  assert.equal(controller.state.result, null);

  controller.dispose();
});


test("DONE response with no embedded result is recovered over HTTP (missed 'done' socket event)", async () => {
  let resultCalls = 0;
  const api = {
    fetchApi: async (path) => {
      if (path.includes("/capabilities")) return { ok: true, json: async () => ({ providers: [] }) };
      if (path.includes("/result")) {
        resultCalls += 1;
        return {
          ok: true,
          json: async () => ({
            result: {
              motion_scene: { version: 1, objects: [] },
              summary: { blockout_object_count: 3 },
              warnings: [],
            },
          }),
        };
      }
      if (path.includes("/reconstruction/jobs")) {
        return {
          ok: true,
          json: async () => ({ job_id: "job_no_result", state: "DONE", progress: 1, result: null, error: null }),
        };
      }
      throw new Error(`Unexpected path ${path}`);
    },
  };

  const controller = new ReconstructionPanelController({
    root: null,
    node: { id: 1 },
    api,
    getSource: () => SOURCE,
  });

  await controller.run();
  // recoverResult() is async and fired without await inside applyJobResponse.
  await new Promise((r) => setTimeout(r, 0));

  assert.equal(resultCalls, 1, "must fetch /result once when DONE carries no result");
  assert.equal(controller.state.jobState, "DONE");
  assert.equal(controller.state.result.version, 1);
  assert.deepEqual(controller.state.summary, { blockout_object_count: 3 });

  controller.dispose();
});
