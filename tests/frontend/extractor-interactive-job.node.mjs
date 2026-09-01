// The interactive solve panel: source resolution, the job client, panel state
// and the refine debounce.
//
// The load-bearing assertion is the first one: pressing TRACK must reach the
// jobs route and must never touch queuePrompt. Everything else in this feature
// is a convenience; that one is the feature.

import assert from "node:assert/strict";
import test from "node:test";

// source-resolver.js checks `instanceof HTMLImageElement` when it looks for a
// client-only upstream preview; Node has no DOM, so this stands in.
globalThis.HTMLImageElement ??= class FakeImageElement {};
globalThis.HTMLVideoElement ??= class FakeVideoElement {};
globalThis.HTMLCanvasElement ??= class FakeCanvasElement {};

import { SolveJobClient, stopActiveSolveOnDispose } from "../../web-src/extractor/job-client.js";
import { FallbackFrameViewer } from "../../web-src/extractor/fallback-frame-viewer.js";
import { SOLVE_EVENTS, SolveEventSubscription, solveEventMatcher } from "../../web-src/extractor/job-events.js";
import { RefineController, alignmentQuaternion } from "../../web-src/extractor/refine-controls.js";
import { SCENE_WIDGET } from "../../web-src/extractor/result-cache.js";
import { ResultApplyError, appliedStatus, applyRefinedTrack } from "../../web-src/extractor/result-sync.js";
import {
  describeSource,
  resolveInteractiveExtractorSource,
} from "../../web-src/extractor/source-resolver.js";
import { timecode } from "../../web-src/extractor/source-viewer.js";
import {
  SOLVE_STATES,
  appliedLabel,
  controlAvailability,
  createExtractorState,
  progressLabel,
  reduceExtractorState,
  statusLabel,
  statusTone,
} from "../../web-src/extractor/state.js";

// --- doubles ---------------------------------------------------------------

class FakeNode {
  constructor(id, type, graph) {
    this.id = id;
    this.comfyClass = type;
    this.graph = graph;
    this.widgets = [];
    this.inputs = [];
    this.outputs = [];
  }

  addWidget(_type, name, value) {
    const widget = { name, value, options: {} };
    this.widgets.push(widget);
    return widget;
  }
}

class FakeGraph {
  constructor() {
    this.nodes = new Map();
    this.links = {};
    this.next = 1;
  }

  add(id, type) {
    const node = new FakeNode(id, type, this);
    this.nodes.set(id, node);
    return node;
  }

  getNodeById(id) {
    return this.nodes.get(id) || null;
  }

  connect(origin, target, inputName) {
    const link = this.next++;
    this.links[link] = { origin_id: origin.id, target_id: target.id };
    origin.outputs.push({ name: "VIDEO", links: [link] });
    target.inputs.push({ name: inputName, link });
    return link;
  }
}

function fakeApi(handler) {
  const calls = [];
  return {
    calls,
    clientId: "client-a",
    apiURL: (path) => path,
    async fetchApi(path, options = {}) {
      calls.push({ path, method: options.method || "GET", body: options.body });
      return handler ? handler(path, options) : { ok: true, async json() { return {}; } };
    },
    addEventListener() {},
    removeEventListener() {},
  };
}

test("a newer fallback scrub aborts and ignores an older frame response", async () => {
  const calls = [];
  const pending = [];
  const paints = [];
  const canvas = {
    width: 160,
    height: 90,
    getContext() {
      return {
        clearRect: (...args) => paints.push(["clear", ...args]),
        drawImage: (image, ...args) => paints.push(["draw", image.frame, ...args]),
      };
    },
  };
  const api = {
    fetchApi(_path, options) {
      calls.push(options);
      return new Promise((resolve) => pending.push(resolve));
    },
  };
  const viewer = new FallbackFrameViewer(canvas, {
    api,
    decodeImage: async (blob) => ({ width: 160, height: 90, frame: blob.frame, close() {} }),
  });
  const source = { kind: "managed", value: "omnicam/extractor_sources/shot.mov" };
  const first = viewer.load(source, 4);
  const second = viewer.load(source, 9);

  assert.equal(calls.length, 2);
  assert.equal(calls[0].signal.aborted, true, "the old frame request must be cancelled");
  pending[0]({ ok: true, blob: async () => ({ frame: 4 }), headers: new Headers() });
  pending[1]({ ok: true, blob: async () => ({ frame: 9 }), headers: new Headers() });
  await Promise.all([first, second]);

  assert.deepEqual(paints.filter(([kind]) => kind === "draw"), [["draw", 9, 0, 0, 160, 90]]);
  assert.equal(viewer.frame, 9);
});

// --- source resolution -----------------------------------------------------

test("a connected Load Video is a file-backed source", () => {
  const graph = new FakeGraph();
  const loader = graph.add(1, "LoadVideo");
  loader.addWidget("combo", "file", "shot.mov");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(loader, extractor, "video");

  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, true);
  assert.deepEqual(source.ref, { kind: "annotated_input", value: "shot.mov" });
  assert.equal(source.label, "shot.mov");
});

test("a connected Load Video resolves through modern Map links", () => {
  const graph = new FakeGraph();
  graph.links = new Map();
  const loader = graph.add(1, "LoadVideo");
  loader.addWidget("combo", "file", "shot.mov");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  const linkId = graph.next++;
  graph.links.set(linkId, { origin_id: loader.id, target_id: extractor.id });
  extractor.inputs.push({ name: "video", link: linkId });

  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, true);
  assert.equal(source.label, "shot.mov");
});

test("a connected Load Video resolves when the input carries its link object", () => {
  const graph = new FakeGraph();
  const loader = graph.add(1, "LoadVideo");
  loader.addWidget("combo", "file", "shot.mov");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  extractor.inputs.push({ name: "video", link: { originId: loader.id, targetId: extractor.id } });

  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, true);
  assert.equal(source.label, "shot.mov");
});

test("an in-memory VIDEO producer is refused with a reason, not a guess", () => {
  const graph = new FakeGraph();
  const creator = graph.add(1, "CreateVideo");
  creator.addWidget("text", "prompt", "a cat");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(creator, extractor, "video");

  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, false);
  assert.equal(source.ref, null);
  assert.match(source.reason, /only while the workflow runs/);
});

test("a non-file-backed source that already rendered a thumbnail offers it as a client-only preview", () => {
  const graph = new FakeGraph();
  const creator = graph.add(1, "CreateVideo");
  const thumbnail = new HTMLImageElement();
  creator.imgs = [thumbnail];
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(creator, extractor, "video");

  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, false);
  assert.equal(source.previewMedia, thumbnail);
});

test("a non-file-backed source with nothing rendered yet offers no preview media", () => {
  const graph = new FakeGraph();
  const creator = graph.add(1, "CreateVideo");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(creator, extractor, "video");

  assert.equal(resolveInteractiveExtractorSource(extractor, graph).previewMedia, null);
});

test("an unknown third-party VIDEO node is never guessed at", () => {
  const graph = new FakeGraph();
  const exotic = graph.add(1, "SomeVendorVideoThing");
  exotic.addWidget("text", "path_to_the_file", "C:/secret/shot.mov");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(exotic, extractor, "video");
  assert.equal(resolveInteractiveExtractorSource(extractor, graph).available, false);
});

test("a runtime VIDEO becomes interactive after queued execution materializes it", () => {
  const graph = new FakeGraph();
  const creator = graph.add(1, "CreateVideo");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  extractor.addWidget(
    "text", "omnicam_extractor_source",
    "omnicam/extractor_runtime/runtime.mp4 [temp]",
  );
  graph.connect(creator, extractor, "video");

  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, true);
  assert.equal(source.runtimeMaterialized, true);
  assert.deepEqual(source.ref, {
    kind: "annotated_input",
    value: "omnicam/extractor_runtime/runtime.mp4 [temp]",
  });
});

test("a picked managed source works with no loader connected", () => {
  const graph = new FakeGraph();
  const extractor = graph.add(1, "MajoorOmniCamExtractor");
  extractor.addWidget("text", "omnicam_extractor_source", "omnicam/extractor_sources/picked.mp4");
  const source = resolveInteractiveExtractorSource(extractor, graph);
  assert.equal(source.available, true);
  assert.equal(source.ref.kind, "managed");
  assert.equal(source.label, "picked.mp4");
});

test("a loader with no file selected yet says so", () => {
  const graph = new FakeGraph();
  const loader = graph.add(1, "LoadVideo");
  loader.addWidget("combo", "file", "");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(loader, extractor, "video");
  assert.match(resolveInteractiveExtractorSource(extractor, graph).reason, /no file selected/);
});

test("a non-video filename is refused", () => {
  const graph = new FakeGraph();
  const loader = graph.add(1, "LoadVideo");
  loader.addWidget("combo", "file", "notes.txt");
  const extractor = graph.add(2, "MajoorOmniCamExtractor");
  graph.connect(loader, extractor, "video");
  assert.match(resolveInteractiveExtractorSource(extractor, graph).reason, /does not look like a video/);
});

test("nothing connected asks for a source rather than failing", () => {
  const graph = new FakeGraph();
  const extractor = graph.add(1, "MajoorOmniCamExtractor");
  assert.equal(resolveInteractiveExtractorSource(extractor, graph).available, false);
});

test("a queued result drops the old interactive job before refinement can reuse it", () => {
  let state = createExtractorState();
  state = reduceExtractorState(state, { type: "JOB_STARTED", status: { job_id: "old-job", state: "COMPLETED" } });
  state = reduceExtractorState(state, { type: "QUEUED_RESULT" });
  assert.equal(state.jobId, "");
  assert.equal(state.solveState, "COMPLETED");
});

test("a changed source clears its stale transport metadata", () => {
  let state = createExtractorState();
  state = reduceExtractorState(state, { type: "JOB_STARTED", status: { job_id: "old-job", state: "TRACKING", frame_count: 240 } });
  state = reduceExtractorState(state, { type: "SOURCE", source: { info: { fps: 30, frame_count: 240 } } });
  state = reduceExtractorState(state, { type: "SOURCE_RESET", source: { available: false, ref: null } });
  assert.equal(state.jobId, "");
  assert.equal(state.frameCount, 0);
  assert.equal(state.source.info, null);
});

test("the source strip describes the resolved footage", () => {
  const described = describeSource({
    available: true, label: "shot.mov",
    info: { width: 1920, height: 1080, fps: 24, frame_count: 121 },
  });
  assert.equal(described, "shot.mov · 1920x1080 · 24fps · 121 frames");
});

// --- the no-run guarantee --------------------------------------------------

test("starting a solve calls the jobs route and never queuePrompt", async () => {
  let queued = 0;
  const api = fakeApi(() => ({ ok: true, async json() { return { job_id: "j1", state: "PREPARING" }; } }));
  api.queuePrompt = () => { queued += 1; };

  const client = new SolveJobClient(api);
  await client.startSolve({
    nodeId: 7, source: { kind: "annotated_input", value: "shot.mov" }, settings: { method: "auto" },
  });

  assert.equal(queued, 0, "the interactive path must never enqueue a prompt");
  assert.equal(api.calls.length, 1);
  assert.match(api.calls[0].path, /^\/majoor\/omnicam\/extractor\/jobs\?/);
  assert.equal(api.calls[0].method, "POST");
});

test("the job client only ever talks to the extractor job routes", async () => {
  const api = fakeApi(() => ({ ok: true, async json() { return {}; } }));
  const client = new SolveJobClient(api);
  await client.startSolve({ nodeId: 1, source: {}, settings: {} });
  await client.getSolveStatus("j1");
  await client.stopSolve("j1");
  await client.refineSolve("j1", { motion_scale: 2 });
  await client.getSolveResult("j1");
  await client.deleteSolve("j1");

  assert.equal(api.calls.length, 6);
  for (const call of api.calls) {
    assert.match(call.path, /^\/majoor\/omnicam\/extractor\/jobs/);
    assert.doesNotMatch(call.path, /prompt|queue/i);
  }
  assert.deepEqual(
    api.calls.map((call) => call.method),
    ["POST", "GET", "POST", "POST", "GET", "DELETE"],
  );
});

test("the client identifies its session so another tab cannot steer the job", async () => {
  const api = fakeApi(() => ({ ok: true, async json() { return {}; } }));
  await new SolveJobClient(api, { clientId: "tab-7" }).getSolveStatus("j1");
  assert.match(api.calls[0].path, /clientId=tab-7/);
});

test("disposing an active panel requests a cooperative stop", async () => {
  const api = fakeApi(() => ({ ok: true, async json() { return { state: "STOPPING" }; } }));
  const client = new SolveJobClient(api);

  assert.equal(stopActiveSolveOnDispose(client, { jobId: "j1", solveState: "TRACKING" }), true);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(api.calls.length, 1);
  assert.match(api.calls[0].path, /\/j1\/stop\?/);
});

test("disposing a terminal panel sends no stop request", () => {
  const api = fakeApi();
  const client = new SolveJobClient(api);
  assert.equal(stopActiveSolveOnDispose(client, { jobId: "j1", solveState: "COMPLETED" }), false);
  assert.equal(api.calls.length, 0);
});

test("a server refusal surfaces its message", async () => {
  const api = fakeApi(() => ({ ok: false, status: 409, async text() { return "Another solve is active"; } }));
  await assert.rejects(
    () => new SolveJobClient(api).startSolve({ nodeId: 1, source: {}, settings: {} }),
    /Another solve is active/,
  );
});

// --- panel state -----------------------------------------------------------

function stateAfter(...actions) {
  return actions.reduce(reduceExtractorState, createExtractorState());
}

test("an idle panel with a source offers only TRACK", () => {
  const state = stateAfter({ type: "SOURCE", source: { available: true } });
  const available = controlAvailability(state);
  assert.deepEqual(
    [available.track, available.stop, available.apply],
    [true, false, false],
  );
});

test("no source means TRACK stays disabled", () => {
  assert.equal(controlAvailability(createExtractorState()).track, false);
});

test("tracking offers stop but not track", () => {
  const state = stateAfter(
    { type: "SOURCE", source: { available: true } },
    { type: "JOB_STARTED", status: { job_id: "j1", state: "TRACKING", frame_count: 121 } },
  );
  const available = controlAvailability(state);
  assert.deepEqual([available.track, available.stop], [false, true]);
});

test("interactive controls expose stop without a pause-resume protocol", () => {
  const state = reduceExtractorState(
    { ...createExtractorState(), source: { available: true } },
    { type: "JOB_STATE", state: "TRACKING" },
  );
  const available = controlAvailability(state);
  assert.equal(available.stop, true);
  assert.equal("pause" in available, false);
  assert.equal("resume" in available, false);
  assert.equal(SOLVE_STATES.includes("PAUSING"), false);
  assert.equal(SOLVE_STATES.includes("PAUSED"), false);
});

test("a stopped solve can be retried but never applied", () => {
  const state = stateAfter(
    { type: "JOB_STARTED", status: { job_id: "j1", state: "TRACKING" } },
    { type: "JOB_STATE", state: "STOPPED" },
  );
  const available = controlAvailability(state);
  assert.equal(available.apply, false, "a partial solve is reviewable, never shippable");
  assert.equal(available.retry, true);
});

test("a completed solve with a refined track can be applied", () => {
  const state = stateAfter(
    { type: "JOB_STARTED", status: { job_id: "j1", state: "TRACKING" } },
    { type: "COMPLETED", result: { fingerprint: "fp-1" } },
  );
  assert.equal(controlAvailability(state).apply, true);
  assert.equal(controlAvailability(state).refine, true);
  assert.equal(statusTone("COMPLETED"), "ok");
});

test("a failure carries its message and colours the pill", () => {
  const state = stateAfter({ type: "FAILED", error: "Camera tracking lost near frame 84" });
  assert.match(state.error, /frame 84/);
  assert.equal(statusTone("FAILED"), "danger");
});

test("the serializable FRAME action owns the progress readout frame", () => {
  const state = stateAfter(
    { type: "JOB_STARTED", status: { job_id: "j1", state: "TRACKING", frame_count: 121 } },
    { type: "FRAME_COUNT", frameCount: 121 },
    { type: "FRAME", frame: 64 },
    { type: "PROGRESS", progress: { state: "TRACKING", frame: 99, frame_count: 121, progress: 0.53 } },
  );
  assert.equal(progressLabel(state), "64 / 121 frames");
  assert.equal(statusLabel(state), "TRACKING 53%");
  assert.doesNotMatch(progressLabel(state), /remaining|eta|seconds/i);
});

test("status and progress cannot change the coordinator-owned frame count", () => {
  const state = stateAfter(
    { type: "FRAME_COUNT", frameCount: 3 },
    { type: "PROGRESS", progress: { frame_count: 8 } },
    { type: "STATUS", status: { frame_count: 12 } },
  );

  assert.equal(state.frameCount, 3);
});

test("quality samples accumulate as they stream in", () => {
  const state = stateAfter(
    { type: "QUALITY", samples: [{ frame: 1, coverage: 0.9 }] },
    { type: "QUALITY", samples: [{ frame: 2, coverage: 0.4 }] },
  );
  assert.equal(state.quality.length, 2);
});

test("a status poll recovers everything a dropped socket lost", () => {
  const state = stateAfter({
    type: "STATUS",
    status: {
      job_id: "j1", state: "SOLVING", progress: 0.8, frame: 100, frame_count: 121,
      backend: "dpvo", pose_count: 100, warnings: ["scale is relative"], anomalies: [], error: "",
    },
  });
  assert.equal(state.solveState, "SOLVING");
  assert.equal(state.backend, "dpvo");
  assert.deepEqual(state.warnings, ["scale is relative"]);
});

// --- applied / outdated ----------------------------------------------------

test("changing the cleanup after applying marks the result OUTDATED", () => {
  let state = stateAfter(
    { type: "COMPLETED", result: { fingerprint: "fp-1" } },
    { type: "APPLIED", fingerprint: "fp-1" },
  );
  assert.equal(appliedLabel(state), "APPLIED");

  state = reduceExtractorState(state, { type: "REFINED", fingerprint: "fp-2" });
  assert.equal(appliedLabel(state), "OUTDATED");

  state = reduceExtractorState(state, { type: "APPLIED", fingerprint: "fp-2" });
  assert.equal(appliedLabel(state), "APPLIED");
});

test("refining before applying anything never claims to be outdated", () => {
  const state = stateAfter({ type: "REFINED", fingerprint: "fp-1" });
  assert.equal(appliedLabel(state), "NOT APPLIED");
});

test("applied status is reported from the two fingerprints", () => {
  assert.equal(appliedStatus("", "fp"), "NOT APPLIED");
  assert.equal(appliedStatus("fp", "fp"), "APPLIED");
  assert.equal(appliedStatus("fp", "other"), "OUTDATED");
});

// --- apply -----------------------------------------------------------------

const TRACK = {
  schema_version: 1, fps: 24, duration_frames: 90, width: 1920, height: 1080,
  render_mode: "omni_ref", objects: [],
  keyframes: [
    { frame: 0, interpolation: "linear", camera: { position: [0, 0, 0], target: [0, 0, -1], fov: 53 } },
  ],
  metadata: { extractor_fingerprint: "fp-1", confidence: 0.9 },
};

test("applying a completed solve caches it and notifies the Director", () => {
  const graph = new FakeGraph();
  const extractor = graph.add(1, "MajoorOmniCamExtractor");
  const director = graph.add(2, "MajoorOmniCamDirector");
  graph.connect(extractor, director, "motion_scene");
  let synced = 0;
  director.__majoorOmniCam = { syncUpstreamInputs: () => { synced += 1; } };

  const applied = applyRefinedTrack(extractor, { track: TRACK, state: "COMPLETED" });
  assert.equal(applied.fingerprint, "fp-1");
  assert.equal(synced, 1);
  assert.equal(
    extractor.widgets.find((w) => w.name === "omnicam_extracted_track_fingerprint").value, "fp-1",
  );
  const cachedScene = JSON.parse(extractor.widgets.find((w) => w.name === SCENE_WIDGET).value);
  assert.equal(cachedScene.active_camera_id, "extracted_camera");
  assert.deepEqual(cachedScene.cameras[0].track, TRACK);
});

test("a stopped solve cannot be applied", () => {
  const node = new FakeNode(1, "MajoorOmniCamExtractor", null);
  assert.throws(
    () => applyRefinedTrack(node, { track: TRACK, state: "STOPPED" }),
    ResultApplyError,
  );
});

test("a track with no keys cannot be applied", () => {
  const node = new FakeNode(1, "MajoorOmniCamExtractor", null);
  assert.throws(
    () => applyRefinedTrack(node, { track: { ...TRACK, keyframes: [] }, state: "COMPLETED" }),
    /no camera keys/,
  );
});

test("a track with no fingerprint cannot be applied", () => {
  const node = new FakeNode(1, "MajoorOmniCamExtractor", null);
  assert.throws(
    () => applyRefinedTrack(node, { track: { ...TRACK, metadata: {} }, state: "COMPLETED" }),
    /no extractor fingerprint/,
  );
});

// --- refine debounce -------------------------------------------------------

function manualTimers() {
  let pending = null;
  return {
    setTimer: (fn) => { pending = fn; return 1; },
    clearTimer: () => { pending = null; },
    run: () => { const fn = pending; pending = null; fn?.(); },
    get pending() { return Boolean(pending); },
  };
}

test("a slider drag produces one refine, not one per input event", () => {
  const timers = manualTimers();
  const sent = [];
  const controller = new RefineController({
    onRefine: (settings) => sent.push(settings), setTimer: timers.setTimer, clearTimer: timers.clearTimer,
  });
  for (const value of [0.1, 0.2, 0.3, 0.4, 0.5]) controller.update({ position_smoothing: value });
  assert.equal(sent.length, 0, "nothing goes out mid-drag");
  timers.run();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].position_smoothing, 0.5);
});

test("settling on the same values does not re-send", () => {
  const timers = manualTimers();
  const sent = [];
  const controller = new RefineController({
    onRefine: (settings) => sent.push(settings), setTimer: timers.setTimer, clearTimer: timers.clearTimer,
  });
  controller.update({ motion_scale: 2 });
  timers.run();
  controller.update({ motion_scale: 2 });
  timers.run();
  assert.equal(sent.length, 1);
});

test("reset returns every cleanup setting to its default", () => {
  const timers = manualTimers();
  const controller = new RefineController({ setTimer: timers.setTimer, clearTimer: timers.clearTimer });
  controller.update({ motion_scale: 9, position_smoothing: 1 });
  controller.setSpikeAction(12, "exclude");
  controller.reset();
  assert.equal(controller.settings.motion_scale, 1);
  assert.equal(controller.settings.position_smoothing, 0.15);
  assert.deepEqual(controller.settings.spike_actions, {});
});

test("spike actions are settings, and IGNORE removes the entry", () => {
  const timers = manualTimers();
  const controller = new RefineController({ setTimer: timers.setTimer, clearTimer: timers.clearTimer });
  controller.setSpikeAction(68, "interpolate");
  assert.deepEqual(controller.settings.spike_actions, { 68: "interpolate" });
  controller.setSpikeAction(68, "ignore");
  assert.deepEqual(controller.settings.spike_actions, {});
});

test("alignment is one global quaternion, and zero means none", () => {
  assert.equal(alignmentQuaternion({ pitch: 0, yaw: 0, roll: 0 }), null);
  const quaternion = alignmentQuaternion({ pitch: 0, yaw: 90, roll: 0 });
  assert.equal(quaternion.length, 4);
  const length = Math.hypot(...quaternion);
  assert.ok(Math.abs(length - 1) < 1e-9, `expected a unit quaternion, got ${length}`);
  assert.ok(Math.abs(quaternion[1] - Math.sin(Math.PI / 4)) < 1e-9);
});

test("disposing the refine controller cancels a pending request", () => {
  const timers = manualTimers();
  const sent = [];
  const controller = new RefineController({
    onRefine: (settings) => sent.push(settings), setTimer: timers.setTimer, clearTimer: timers.clearTimer,
  });
  controller.update({ motion_scale: 3 });
  controller.dispose();
  assert.equal(timers.pending, false);
  assert.equal(sent.length, 0);
});

// --- events ----------------------------------------------------------------

test("solve events are filtered to this node and this job", () => {
  const match = solveEventMatcher(() => ({ jobId: "j1", nodeId: 7 }));
  assert.equal(match({ job_id: "j1", node_id: "7" }), true);
  assert.equal(match({ job_id: "j2", node_id: "7" }), false, "another job must not steer this panel");
  assert.equal(match({ job_id: "j1", node_id: "9" }), false, "another Extractor must not either");
});

test("every documented solve event is subscribed and then released", () => {
  const listeners = new Map();
  const api = {
    addEventListener(event, listener) { listeners.set(event, listener); },
    removeEventListener(event) { listeners.delete(event); },
  };
  const seen = [];
  const handlers = Object.fromEntries(
    Object.keys(SOLVE_EVENTS).map((key) => [key, () => seen.push(key)]),
  );
  const subscription = new SolveEventSubscription(api, handlers);
  assert.deepEqual([...listeners.keys()].sort(), Object.values(SOLVE_EVENTS).sort());

  listeners.get(SOLVE_EVENTS.progress)({ detail: { job_id: "j1" } });
  assert.deepEqual(seen, ["progress"]);

  subscription.dispose();
  assert.equal(listeners.size, 0, "a disposed panel must leave no listeners behind");
});

// --- transport -------------------------------------------------------------

test("timecode counts frames at the source rate", () => {
  assert.equal(timecode(0, 24), "00:00:00");
  assert.equal(timecode(25, 24), "00:01:01");
  assert.equal(timecode(24 * 65 + 3, 24), "01:05:03");
});

test("Estimate Up asks the server rather than guessing client-side", () => {
  const timers = manualTimers();
  const sent = [];
  const controller = new RefineController({
    onRefine: (settings) => sent.push(settings), setTimer: timers.setTimer, clearTimer: timers.clearTimer,
  });
  controller.requestEstimatedUp();
  timers.run();
  assert.equal(sent[0].estimate_up, true);
  assert.equal(sent[0].global_rotation_xyzw, null, "the server derives it from the raw poses");
});

test("dialling an angle overrules a previous estimate", () => {
  const timers = manualTimers();
  const controller = new RefineController({ setTimer: timers.setTimer, clearTimer: timers.clearTimer });
  controller.requestEstimatedUp();
  controller.setAlignment({ roll: 12 });
  assert.equal(controller.settings.estimate_up, false);
  assert.ok(Array.isArray(controller.settings.global_rotation_xyzw));
});

test("a partial status never erases what the panel already knows", () => {
  // The panel dispatches an anomalies-only status once a result arrives; that
  // used to reset a finished solve's progress bar to 0%.
  let state = stateAfter(
    { type: "JOB_STARTED", status: { job_id: "j1", state: "TRACKING", frame_count: 121 } },
    { type: "FRAME_COUNT", frameCount: 121 },
    { type: "FRAME", frame: 120 },
    { type: "PROGRESS", progress: { state: "TRACKING", frame: 1, frame_count: 121, progress: 0.95 } },
    { type: "COMPLETED", result: { fingerprint: "fp-1" } },
  );
  assert.equal(state.progress, 1);

  state = reduceExtractorState(state, {
    type: "STATUS", status: { state: "COMPLETED", job_id: "j1", anomalies: [{ frame: 4 }] },
  });
  assert.equal(state.progress, 1, "progress must survive a status that does not mention it");
  assert.equal(state.frameCount, 121);
  assert.equal(state.frame, 120);
  assert.equal(state.anomalies.length, 1);
});

test("a status that does report progress still wins", () => {
  const state = stateAfter(
    { type: "JOB_STARTED", status: { job_id: "j1", state: "TRACKING", frame_count: 121 } },
    { type: "FRAME", frame: 48 },
    { type: "STATUS", status: { state: "SOLVING", progress: 0.4, frame: 77, frame_count: 121 } },
  );
  assert.equal(state.progress, 0.4);
  assert.equal(state.frame, 48);
});
