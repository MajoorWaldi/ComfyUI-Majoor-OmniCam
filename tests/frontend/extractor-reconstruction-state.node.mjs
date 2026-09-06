import assert from "node:assert/strict";
import test from "node:test";

import {
  RECONSTRUCTION_STATES,
  initialReconstructionState,
  reconstructionActions,
  reduceReconstructionState,
} from "../../web-src/extractor/reconstruction/state.js";

test("initialReconstructionState provides expected shape and defaults", () => {
  const state = initialReconstructionState();
  assert.equal(state.jobState, "IDLE");
  assert.equal(state.jobId, "");
  assert.equal(state.progress, 0);
  assert.equal(state.stage, "");
  assert.equal(state.stageProgress, 0);
  assert.equal(state.error, null);
  assert.deepEqual(state.warnings, []);
  assert.equal(state.result, null);
  assert.equal(state.summary, null);
  assert.equal(state.previewUrl, "");
  assert.equal(state.source, null);
  assert.equal(typeof state.settings, "object");
  assert.equal(state.settings.provider, "comfy_moge");
  assert.equal(state.settings.mode, "geometry");
  assert.equal(state.settings.quality, "balanced");
});

test("reconstructionActions canStart/canStop/canOpenDirector across states", () => {
  const baseState = initialReconstructionState();

  // IDLE without valid source cannot start
  let actions = reconstructionActions(baseState);
  assert.equal(actions.canStart, false);
  assert.equal(actions.canStop, false);
  assert.equal(actions.canOpenDirector, false);

  // IDLE with valid source can start
  const readyState = {
    ...baseState,
    source: { kind: "annotated_input", value: "test.png", available: true },
  };
  actions = reconstructionActions(readyState);
  assert.equal(actions.canStart, true);
  assert.equal(actions.canStop, false);
  assert.equal(actions.canOpenDirector, false);

  // Active states: canStop is true, canStart is false
  const activeStates = [
    "PREPARING",
    "ESTIMATING_DEPTH",
    "EXTRACTING_GEOMETRY",
    "ANALYZING_PLANES",
    "BUILDING_SCENE",
  ];
  for (const st of activeStates) {
    actions = reconstructionActions({ ...readyState, jobState: st, jobId: "job_1" });
    assert.equal(actions.canStart, false, `canStart should be false in ${st}`);
    assert.equal(actions.canStop, true, `canStop should be true in ${st}`);
    assert.equal(actions.canOpenDirector, false, `canOpenDirector should be false in ${st}`);
  }

  // STOPPING: cannot stop again, cannot start
  actions = reconstructionActions({ ...readyState, jobState: "STOPPING", jobId: "job_1" });
  assert.equal(actions.canStart, false);
  assert.equal(actions.canStop, false);
  assert.equal(actions.canOpenDirector, false);

  // STOPPED: can start again, cannot stop
  actions = reconstructionActions({ ...readyState, jobState: "STOPPED", jobId: "job_1" });
  assert.equal(actions.canStart, true);
  assert.equal(actions.canStop, false);
  assert.equal(actions.canOpenDirector, false);

  // FAILED: can start again, cannot stop
  actions = reconstructionActions({ ...readyState, jobState: "FAILED", jobId: "job_1", error: "OOM" });
  assert.equal(actions.canStart, true);
  assert.equal(actions.canStop, false);
  assert.equal(actions.canOpenDirector, false);

  // DONE with motion_scene: canOpenDirector is true, canStart is true (can re-run)
  actions = reconstructionActions({
    ...readyState,
    jobState: "DONE",
    jobId: "job_1",
    result: { motion_scene: { version: 1 } },
  });
  assert.equal(actions.canStart, true);
  assert.equal(actions.canStop, false);
  assert.equal(actions.canOpenDirector, true);

  // DONE without motion_scene: canOpenDirector is false
  actions = reconstructionActions({
    ...readyState,
    jobState: "DONE",
    jobId: "job_1",
    result: {},
  });
  assert.equal(actions.canOpenDirector, false);
});

test("reduceReconstructionState handles state transitions and events", () => {
  let state = initialReconstructionState();

  // SOURCE action
  state = reduceReconstructionState(state, {
    type: "SOURCE",
    source: { kind: "annotated_input", value: "example.png", available: true },
  });
  assert.equal(state.source.value, "example.png");

  // SETTINGS action
  state = reduceReconstructionState(state, {
    type: "SETTINGS",
    settings: { quality: "fast", detect_walls: true },
  });
  assert.equal(state.settings.quality, "fast");
  assert.equal(state.settings.detect_walls, true);
  assert.equal(state.settings.provider, "comfy_moge"); // preserved

  // STATE action (transition to PREPARING)
  state = reduceReconstructionState(state, {
    type: "STATE",
    jobState: "PREPARING",
    jobId: "job_123",
  });
  assert.equal(state.jobState, "PREPARING");
  assert.equal(state.jobId, "job_123");
  assert.equal(state.error, null);

  // PROGRESS action
  state = reduceReconstructionState(state, {
    type: "PROGRESS",
    progress: 45,
    stage: "estimating_depth",
    stageProgress: 60,
  });
  assert.equal(state.progress, 45);
  assert.equal(state.stage, "estimating_depth");
  assert.equal(state.stageProgress, 60);

  // PREVIEW action
  state = reduceReconstructionState(state, {
    type: "PREVIEW",
    previewUrl: "/api/preview/thumb.png",
  });
  assert.equal(state.previewUrl, "/api/preview/thumb.png");

  // DONE action
  state = reduceReconstructionState(state, {
    type: "DONE",
    result: { motion_scene: { version: 1 } },
    summary: { mesh_triangles: 50000 },
    warnings: ["low confidence ground"],
  });
  assert.equal(state.jobState, "DONE");
  assert.equal(state.progress, 100);
  assert.deepEqual(state.warnings, ["low confidence ground"]);
  assert.deepEqual(state.summary, { mesh_triangles: 50000 });
  assert.ok(state.result.motion_scene);

  // ERROR action
  state = reduceReconstructionState(state, {
    type: "ERROR",
    error: { code: "RECON_GPU_OOM", message: "Out of VRAM" },
  });
  assert.equal(state.jobState, "FAILED");
  assert.equal(state.error.code, "RECON_GPU_OOM");

  // RESET action
  state = reduceReconstructionState(state, { type: "RESET" });
  assert.equal(state.jobState, "IDLE");
  assert.equal(state.jobId, "");
  assert.equal(state.error, null);
  assert.equal(state.result, null);
});
