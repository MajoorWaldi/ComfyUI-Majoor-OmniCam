import test from "node:test";
import assert from "node:assert/strict";

import { ExtractorRuntime } from "../../web-src/extractor/runtime.js";

// ExtractorRuntime has no DOM dependency: state.js and result-cache.js are
// pure, and bindExtractorQueueEvents only needs an api with
// add/removeEventListener. This is exactly the "cache restore and queue
// lifecycle work with no visible root" guarantee the migration plan requires
// (section 17, Task 12) and the "workbench close != cancel; node removal =
// cancel" safety property Task 13 exists for.

function fakeApi() {
  const listeners = new Map();
  const fetchCalls = [];
  return {
    listeners,
    fetchCalls,
    addEventListener(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
    },
    removeEventListener(event, handler) {
      listeners.get(event)?.delete(handler);
    },
    emit(event, detail) {
      for (const handler of listeners.get(event) || []) handler({ detail });
    },
    async fetchApi(url, opts) {
      fetchCalls.push({ url, opts });
      return { ok: true, json: async () => ({ cancelled: true }) };
    },
  };
}

function fakeNode(extractMode = "camera_track") {
  return {
    id: 1,
    graph: { setDirtyCanvas() {} },
    widgets: [
      { name: "extract_mode", value: extractMode },
      { name: "omnicam_extracted_motion_scene_json", value: "" },
      { name: "omnicam_extracted_track_fingerprint", value: "" },
    ],
    setDirtyCanvas() {},
  };
}

const MOTION_SCENE = (fingerprint = "fp-1") => ({
  version: 1,
  timeline: { duration_seconds: 2, authoring_fps: 24 },
  canvas: { width: 640, height: 360 },
  cameras: [{
    id: "extracted_camera",
    label: "Extracted Camera",
    enabled: true,
    track: {
      fps: 24,
      duration_frames: 48,
      width: 640,
      height: 360,
      metadata: { extractor_fingerprint: fingerprint },
      keyframes: [{ frame: 0, camera: { position: [0, 0, 0], target: [0, 0, -1], fov: 50 } }],
    },
  }],
  active_camera_id: "extracted_camera",
  playblast_camera_id: "extracted_camera",
  objects: [],
  motion_layers: [],
  cuts: [],
  metadata: {},
});

function executedMessage(fingerprint = "fp-1") {
  return {
    text: [JSON.stringify({
      kind: "omnicam_extractor_result_v2",
      mode: "camera_track",
      fingerprint,
      motion_scene: MOTION_SCENE(fingerprint),
    })],
  };
}

function reconstructMessage(fingerprint = "recon-fp-1") {
  return {
    text: [JSON.stringify({
      kind: "omnicam_extractor_result_v2",
      mode: "scene_reconstruct",
      fingerprint,
      motion_scene: MOTION_SCENE(fingerprint),
      reconstruction: { provider: "fake_provider", warnings: ["Low texture contrast"] },
    })],
  };
}

test("restores a cached result from widgets with no visible root", () => {
  const node = fakeNode();
  node.widgets.find((w) => w.name === "omnicam_extracted_motion_scene_json").value = JSON.stringify(MOTION_SCENE("cached-fp"));
  node.widgets.find((w) => w.name === "omnicam_extracted_track_fingerprint").value = "cached-fp";

  const runtime = new ExtractorRuntime(node, { api: fakeApi() });
  assert.equal(runtime.state.applied.fingerprint, "cached-fp");
  assert.ok(runtime.result.refined);
  runtime.dispose();
});

test("a native 'executed' event is adopted headlessly with no workbench attached", () => {
  const node = fakeNode();
  const api = fakeApi();
  const runtime = new ExtractorRuntime(node, { api });
  runtime.queuePromptId = "prompt-1";

  api.emit("executed", { node: "1", prompt_id: "prompt-1", output: executedMessage("solved-fp") });

  assert.equal(runtime.state.solveState, "COMPLETED");
  assert.equal(runtime.result.refined.metadata.extractor_fingerprint, "solved-fp");
  const cached = node.widgets.find((w) => w.name === "omnicam_extracted_track_fingerprint").value;
  assert.equal(cached, "solved-fp", "the result must reach the node's cache widgets with no panel open");
  runtime.dispose();
});

test("a Scene Reconstruct result is captured headlessly and reaches a terminal COMPLETED status with no workbench open", () => {
  const node = fakeNode("scene_reconstruct");
  const api = fakeApi();
  const runtime = new ExtractorRuntime(node, { api });
  runtime.queuePromptId = "prompt-recon";

  api.emit("executed", { node: "1", prompt_id: "prompt-recon", output: reconstructMessage("recon-fp-1") });

  assert.equal(runtime.state.solveState, "COMPLETED",
    "the shared solve-state machine must reach a terminal state, not sit on FINALIZING forever");
  assert.ok(runtime.reconstructionResult, "the result must be held on the runtime so a later open can replay it");
  assert.equal(runtime.reconstructionResult.fingerprint, "recon-fp-1");
  runtime.dispose();
});

test("a Scene Reconstruct result is replayed into the reconstruction controller once a workbench attaches", () => {
  const node = fakeNode("scene_reconstruct");
  const api = fakeApi();
  const runtime = new ExtractorRuntime(node, { api });

  api.emit("executed", { node: "1", prompt_id: "", output: reconstructMessage("recon-fp-2") });
  assert.ok(runtime.reconstructionResult);

  const accepted = [];
  runtime.attachWorkbench({ render() {}, reconstruction: { acceptQueuedResult: (result) => accepted.push(result) } });
  // Attaching alone does not replay (that is openExtractorWorkbench()'s job,
  // simulated here); a fresh executed() while attached forwards directly.
  api.emit("executed", { node: "1", prompt_id: "", output: reconstructMessage("recon-fp-3") });
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].fingerprint, "recon-fp-3");
  runtime.dispose();
});

test("attaching/detaching a workbench forwards render() only while attached, without touching state", () => {
  const node = fakeNode();
  const runtime = new ExtractorRuntime(node, { api: fakeApi() });
  let renders = 0;
  const workbench = { render: () => { renders++; } };

  runtime.dispatch({ type: "FRAME", frame: 1 });
  assert.equal(renders, 0);

  runtime.attachWorkbench(workbench);
  runtime.dispatch({ type: "FRAME", frame: 2 });
  assert.equal(renders, 1);

  runtime.detachWorkbench(workbench);
  runtime.dispatch({ type: "FRAME", frame: 3 });
  assert.equal(renders, 1, "must not call a detached workbench");
  assert.equal(runtime.state.frame, 3, "state still updates with no workbench attached");
  runtime.dispose();
});

test("a queued job survives workbench detachment but is cancelled on runtime disposal", async () => {
  const node = fakeNode();
  const api = fakeApi();
  const runtime = new ExtractorRuntime(node, { api });
  runtime.queuePromptId = "prompt-2";
  const workbench = { render() {} };

  runtime.attachWorkbench(workbench);
  runtime.detachWorkbench(workbench);
  assert.equal(api.fetchCalls.length, 0, "detaching (closing) the workbench must not cancel the job");

  runtime.dispose();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(api.fetchCalls.length, 1, "node removal must cancel the still-queued job");
  assert.match(api.fetchCalls[0].url, /\/api\/jobs\/prompt-2\/cancel/);
});

test("dispose() with no queued job never calls the cancel endpoint", () => {
  const node = fakeNode();
  const api = fakeApi();
  const runtime = new ExtractorRuntime(node, { api });
  runtime.dispose();
  assert.equal(api.fetchCalls.length, 0);
});

test("getSnapshot summarizes solve state without becoming a second source of truth", () => {
  const node = fakeNode();
  const runtime = new ExtractorRuntime(node, { api: fakeApi() });
  runtime.dispatch({ type: "PROGRESS", progress: { progress: 0.5, state: "TRACKING" } });
  const snapshot = runtime.getSnapshot();
  assert.equal(snapshot.solveState, "TRACKING");
  assert.equal(snapshot.progress, 0.5);
  runtime.dispose();
});
