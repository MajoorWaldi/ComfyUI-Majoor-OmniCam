// Mapping ComfyUI's execution / job lifecycle into the Extractor panel state.
//
// The load-bearing rules: correlate by prompt id, reject late events, and let
// a terminal Comfy state always win over telemetry.

import assert from "node:assert/strict";
import test from "node:test";

import {
  QUEUE_DISPLAY_STATES,
  mapComfyJobStatus,
  reconcileDisplayState,
} from "../../web-src/extractor/queue/job-state.js";
import { bindExtractorQueueEvents } from "../../web-src/extractor/queue/events.js";
import { createExtractorState, reduceExtractorState } from "../../web-src/extractor/state.js";

// --- job-state.js --------------------------------------------------------

test("mapComfyJobStatus covers the documented Jobs API states", () => {
  assert.equal(mapComfyJobStatus("waiting_to_dispatch"), "QUEUED");
  assert.equal(mapComfyJobStatus("pending"), "QUEUED");
  assert.equal(mapComfyJobStatus("in_progress"), "PREPARING");
  assert.equal(mapComfyJobStatus("completed"), "COMPLETED");
  assert.equal(mapComfyJobStatus("error"), "FAILED");
  assert.equal(mapComfyJobStatus("cancelled"), "CANCELLED");
  assert.equal(mapComfyJobStatus("something_new"), null);
});

test("every mapped state is a known display state", () => {
  for (const status of ["pending", "in_progress", "completed", "error", "cancelled"]) {
    assert.ok(QUEUE_DISPLAY_STATES.includes(mapComfyJobStatus(status)));
  }
});

test("reconcileDisplayState: a terminal state is never walked back", () => {
  assert.equal(reconcileDisplayState("TRACKING", "SOLVING"), "SOLVING");
  assert.equal(reconcileDisplayState("COMPLETED", "TRACKING"), "COMPLETED");
  assert.equal(reconcileDisplayState("FAILED", "PREPARING"), "FAILED");
  assert.equal(reconcileDisplayState("CANCELLED", "TRACKING"), "CANCELLED");
  assert.equal(reconcileDisplayState("TRACKING", null), "TRACKING");
});

// --- state.js reducer --------------------------------------------------------

test("QUEUE_LIFECYCLE moves a non-terminal state and holds a terminal one", () => {
  let s = createExtractorState();
  s = reduceExtractorState(s, { type: "QUEUE_LIFECYCLE", state: "QUEUED" });
  assert.equal(s.solveState, "QUEUED");
  s = reduceExtractorState(s, { type: "QUEUE_LIFECYCLE", state: "TRACKING", progress: 0.5 });
  assert.equal(s.solveState, "TRACKING");
  assert.equal(s.progress, 0.5);
  s = reduceExtractorState(s, { type: "QUEUE_LIFECYCLE", state: "COMPLETED" });
  assert.equal(s.solveState, "COMPLETED");
  // A late frame for the finished job cannot resurrect it.
  s = reduceExtractorState(s, { type: "QUEUE_LIFECYCLE", state: "TRACKING", progress: 0.2 });
  assert.equal(s.solveState, "COMPLETED");
});

// --- events.js --------------------------------------------------------

function harness({ mode = "camera_track" } = {}) {
  const handlers = new Map();
  const api = {
    addEventListener: (name, fn) => handlers.set(name, fn),
    removeEventListener: (name) => handlers.delete(name),
  };
  const dispatched = [];
  const ui = {
    node: { id: 7 },
    extractMode: mode,
    queuePromptId: "",
    awaitingQueueStart: false,
    dispatch: (action) => dispatched.push(action),
  };
  const unbind = bindExtractorQueueEvents(ui, api);
  const emit = (name, detail) => handlers.get(name)?.({ detail });
  return { ui, dispatched, emit, unbind, handlers };
}

test("execution_start is adopted only while awaiting our own queued run", () => {
  const h = harness();
  h.emit("execution_start", { prompt_id: "p1" });
  assert.equal(h.ui.queuePromptId, ""); // not awaiting -> ignored

  h.ui.awaitingQueueStart = true;
  h.emit("execution_start", { prompt_id: "p2" });
  assert.equal(h.ui.queuePromptId, "p2");
  assert.equal(h.ui.awaitingQueueStart, false);
  assert.deepEqual(h.dispatched.at(-1), { type: "QUEUE_LIFECYCLE", state: "PREPARING" });

  // A second execution_start (another prompt) does not steal the panel.
  h.emit("execution_start", { prompt_id: "p3" });
  assert.equal(h.ui.queuePromptId, "p2");
});

test("executing our node maps to TRACKING or RECONSTRUCTING by mode", () => {
  const track = harness({ mode: "camera_track" });
  track.ui.queuePromptId = "p1";
  track.emit("executing", { prompt_id: "p1", node: "7" });
  assert.deepEqual(track.dispatched.at(-1), { type: "QUEUE_LIFECYCLE", state: "TRACKING" });

  const recon = harness({ mode: "scene_reconstruct" });
  recon.ui.queuePromptId = "p1";
  recon.emit("executing", { prompt_id: "p1", node: "7" });
  assert.deepEqual(recon.dispatched.at(-1), { type: "QUEUE_LIFECYCLE", state: "RECONSTRUCTING" });
});

test("events for another prompt or another node are rejected", () => {
  const h = harness();
  h.ui.queuePromptId = "p1";
  h.emit("executing", { prompt_id: "p2", node: "7" }); // wrong prompt
  h.emit("executing", { prompt_id: "p1", node: "9" }); // wrong node (dependency)
  h.emit("progress", { prompt_id: "p2", value: 5, max: 10 });
  assert.equal(h.dispatched.length, 0);
});

test("progress for our node is normalized to 0..1", () => {
  const h = harness();
  h.ui.queuePromptId = "p1";
  h.emit("progress", { prompt_id: "p1", node: "7", value: 85, max: 100 });
  assert.deepEqual(h.dispatched.at(-1), {
    type: "QUEUE_LIFECYCLE", state: null, progress: 0.85,
  });
});

test("terminal events set the state and clear the id so stragglers are dropped", () => {
  for (const [event, detail, expected] of [
    ["execution_error", { prompt_id: "p1", exception_message: "boom" }, "FAILED"],
    ["execution_interrupted", { prompt_id: "p1" }, "CANCELLED"],
    ["execution_success", { prompt_id: "p1" }, "FINALIZING"],
  ]) {
    const h = harness();
    h.ui.queuePromptId = "p1";
    h.emit(event, detail);
    assert.equal(h.dispatched.at(-1).state, expected);
    assert.equal(h.ui.queuePromptId, "");
    // A straggler for the now-cleared prompt is ignored.
    const before = h.dispatched.length;
    h.emit("executing", { prompt_id: "p1", node: "7" });
    assert.equal(h.dispatched.length, before);
  }
});

test("unbind removes every native listener", () => {
  const h = harness();
  assert.ok(h.handlers.size > 0);
  h.unbind();
  assert.equal(h.handlers.size, 0);
});
