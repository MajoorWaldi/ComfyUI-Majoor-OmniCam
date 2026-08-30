// The Extractor -> Director link.
//
// The whole point of the fingerprint is that a connected cable must not
// silently overwrite a camera the user already has. These tests are what stop
// that regressing: a new solve only ever stages a preview, never mutates
// state.cameras, and only becomes a real (new, separate) camera once the
// preview is explicitly committed.

import assert from "node:assert/strict";
import test from "node:test";

import { UPSTREAM_METADATA_KEY, applyCanonicalTrack } from "../../web-src/canonical-track-import.js";
import {
  commitPendingExtractorImport,
  dismissPendingExtractorImport,
  importedFingerprint,
  notifyDownstreamDirectors,
  syncExtractorCameraTrack,
  upstreamExtractorNode,
} from "../../web-src/extractor/director-link.js";
import {
  FINGERPRINT_WIDGET,
  RESULT_ENVELOPE_KIND,
  TRACK_WIDGET,
  cacheExtractorResult,
  ensureCacheWidgets,
  parseExtractorMessage,
  readCachedResult,
  statusLine,
} from "../../web-src/extractor/result-cache.js";

const BASE_CAMERA = {
  fov: 53, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000,
};

function key(frame, position) {
  return {
    frame,
    interpolation: "linear",
    camera: { ...BASE_CAMERA, position, target: [position[0], position[1], position[2] - 1] },
  };
}

function extractorTrack(fingerprint = "fp-1", { fps = 30, duration = 90 } = {}) {
  return {
    schema_version: 1, fps, duration_frames: duration,
    width: 1920, height: 1080, render_mode: "omni_ref",
    keyframes: [key(0, [0, 0, 0]), key(45, [0, 0, -2]), key(89, [0, 0, -4])],
    objects: [],
    metadata: {
      source: "omnicam_extractor", backend: "dpvo", confidence: 0.98,
      monocular_scale: true, extractor_fingerprint: fingerprint,
    },
  };
}

// --- doubles ---------------------------------------------------------------

class FakeWidget {
  constructor(name, value) {
    this.name = name;
    this.value = value;
    this.options = {};
  }
}

class FakeNode {
  constructor(id, type, graph) {
    this.id = id;
    this.comfyClass = type;
    this.graph = graph;
    this.widgets = [];
    this.inputs = [];
    this.outputs = [];
  }

  addWidget(_type, name, value, _callback, _options) {
    const widget = new FakeWidget(name, value);
    this.widgets.push(widget);
    return widget;
  }
}

class FakeGraph {
  constructor() {
    this.nodes = new Map();
    this.links = {};
    this._nextLink = 1;
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
    const linkId = this._nextLink++;
    this.links[linkId] = { origin_id: origin.id, target_id: target.id };
    origin.outputs.push({ name: "camera_track", links: [linkId] });
    target.inputs.push({ name: inputName, link: linkId });
    return linkId;
  }
}

function makeDirectorUi(node) {
  const camera = {
    id: "camera_1", name: "Camera 1",
    camera: { ...BASE_CAMERA, position: [0, 1, 5], target: [0, 1, 0] },
    keyframes: [key(0, [0, 1, 5])],
  };
  const ui = {
    node,
    disposed: false,
    state: {
      fps: 24, duration_frames: 48, width: 1280, height: 720, render_mode: "omni_ref",
      cameras: [camera], active_camera_id: "camera_1",
      keyframes: camera.keyframes,
      objects: [{ id: "subject", type: "card", name: "Subject", asset: "subject.png" }],
      metadata: { card_asset: "subject.png" },
      sequence: { enabled: false, cuts: [] },
    },
    fpsWidget: new FakeWidget("fps", 24),
    durationWidget: new FakeWidget("duration_seconds", 2),
    calls: { checkpoint: [], status: [], render: 0, serialize: 0, frames: [] },
    checkpoint(label) { this.calls.checkpoint.push(label); },
    syncActiveCameraTrack() {
      const active = this.state.cameras.find((item) => item.id === this.state.active_camera_id);
      this.state.keyframes = active.keyframes;
    },
    activateCamera(id) {
      const camera = this.state.cameras.find((item) => item.id === id);
      if (!camera) return;
      this.state.active_camera_id = camera.id;
      this.state.keyframes = camera.keyframes;
    },
    setFrame(frame) { this.calls.frames.push(frame); },
    refreshKeys() {},
    render() { this.calls.render += 1; },
    serialize() { this.calls.serialize += 1; },
    scheduleSerialize() { this.calls.serialize += 1; },
    setStatus(message) { this.calls.status.push(message); },
  };
  if (node) node.__majoorOmniCam = ui;
  return ui;
}

function solvedMessage(fingerprint = "fp-1", overrides = {}) {
  return {
    text: [JSON.stringify({
      kind: RESULT_ENVELOPE_KIND,
      fingerprint,
      track: extractorTrack(fingerprint, overrides),
      confidence: 0.98,
      report: "OmniCam Extractor",
    })],
  };
}

function linkedPair() {
  const graph = new FakeGraph();
  const extractor = graph.add(1, "MajoorOmniCamExtractor");
  const director = graph.add(2, "MajoorOmniCamDirector");
  graph.connect(extractor, director, "camera_track");
  return { graph, extractor, director, ui: makeDirectorUi(director) };
}

// --- result cache ----------------------------------------------------------

test("an execution message is parsed only when it is an extractor envelope", () => {
  const parsed = parseExtractorMessage(solvedMessage("fp-9"));
  assert.equal(parsed.fingerprint, "fp-9");
  assert.equal(parsed.track.keyframes.length, 3);

  assert.equal(parseExtractorMessage(undefined), null);
  assert.equal(parseExtractorMessage({ text: ["not json"] }), null);
  assert.equal(parseExtractorMessage({ text: [JSON.stringify({ kind: "something_else" })] }), null);
  assert.equal(parseExtractorMessage({ images: [{ filename: "a.png" }] }), null);
});

test("an execution envelope preserves only its managed source annotation", () => {
  const message = solvedMessage("fp-source");
  const envelope = JSON.parse(message.text[0]);
  envelope.source = "omnicam/extractor_runtime/runtime.mp4 [temp]";
  message.text[0] = JSON.stringify(envelope);
  assert.equal(
    parseExtractorMessage(message).source,
    "omnicam/extractor_runtime/runtime.mp4 [temp]",
  );
});

test("the cache widgets are hidden, serialized and created once", () => {
  const node = new FakeNode(1, "MajoorOmniCamExtractor", null);
  ensureCacheWidgets(node);
  ensureCacheWidgets(node);
  assert.deepEqual(node.widgets.map((w) => w.name), [TRACK_WIDGET, FINGERPRINT_WIDGET]);
  for (const widget of node.widgets) {
    assert.equal(widget.hidden, true);
    assert.deepEqual(widget.computeSize(), [0, -4]);
    assert.equal(widget.options.hideInVueNodes, true);
  }
});

test("executing the extractor caches the track and its fingerprint", () => {
  const node = new FakeNode(1, "MajoorOmniCamExtractor", null);
  const result = parseExtractorMessage(solvedMessage("fp-1"));
  assert.equal(cacheExtractorResult(node, result), true);
  assert.equal(cacheExtractorResult(node, result), false, "the same solve is not a new one");

  const cached = readCachedResult(node);
  assert.equal(cached.fingerprint, "fp-1");
  assert.equal(cached.track.keyframes.length, 3);
});

test("a node with nothing cached, or with junk cached, reads as empty", () => {
  const node = new FakeNode(1, "MajoorOmniCamExtractor", null);
  assert.equal(readCachedResult(node), null);
  ensureCacheWidgets(node);
  node.widgets[0].value = "{not json";
  node.widgets[1].value = "fp-1";
  assert.equal(readCachedResult(node), null);
});

test("the node status is one compact line, not the payload", () => {
  const line = statusLine(parseExtractorMessage(solvedMessage("fp-1")));
  assert.equal(line, "DPVO · 90 f · 3 keys · 98%");
  assert.ok(!line.includes("keyframes"));
});

// --- import ----------------------------------------------------------------

test("importing a canonical track replaces camera keys and adopts source fps", () => {
  const ui = makeDirectorUi(null);
  const imported = applyCanonicalTrack(ui, extractorTrack("fp-1"), {
    label: "Import Extractor camera", source: "omnicam_extractor", fingerprint: "fp-1",
  });
  assert.equal(imported, 3);
  assert.equal(ui.state.cameras[0].keyframes.length, 3);
  assert.equal(ui.state.keyframes, ui.state.cameras[0].keyframes, "state.keyframes must stay aliased");
  assert.equal(ui.state.fps, 30);
  assert.equal(ui.fpsWidget.value, 30);
  assert.equal(ui.state.duration_frames, 90);
  assert.equal(ui.durationWidget.value, 3);
  assert.equal(ui.state.metadata[UPSTREAM_METADATA_KEY].fingerprint, "fp-1");
  assert.deepEqual(ui.calls.checkpoint, ["Import Extractor camera"]);
});

test("importing a camera does not touch the Director scene", () => {
  const ui = makeDirectorUi(null);
  applyCanonicalTrack(ui, extractorTrack("fp-1"), { fingerprint: "fp-1" });
  assert.deepEqual(ui.state.objects.map((item) => item.id), ["subject"]);
  assert.equal(ui.state.objects[0].asset, "subject.png");
  assert.equal(ui.state.metadata.card_asset, "subject.png");
  assert.equal(ui.state.render_mode, "omni_ref");
  assert.equal(ui.state.width, 1280);
});

test("a file import keeps the Director frame rate", () => {
  const ui = makeDirectorUi(null);
  applyCanonicalTrack(ui, extractorTrack("fp-1"), { adoptFps: false });
  assert.equal(ui.state.fps, 24);
  assert.equal(ui.state.duration_frames, 90);
});

test("an empty track is refused rather than clearing the camera", () => {
  const ui = makeDirectorUi(null);
  assert.throws(() => applyCanonicalTrack(ui, { keyframes: [] }));
  assert.equal(ui.state.cameras[0].keyframes.length, 1);
});

// --- link ------------------------------------------------------------------

test("the linked extractor node is found through the camera_track input", () => {
  const { extractor, ui } = linkedPair();
  assert.equal(upstreamExtractorNode(ui), extractor);
});

test("a foreign node on camera_track is not treated as an extractor", () => {
  const graph = new FakeGraph();
  const other = graph.add(1, "SomeOtherTrackSource");
  const director = graph.add(2, "MajoorOmniCamDirector");
  graph.connect(other, director, "camera_track");
  assert.equal(upstreamExtractorNode(makeDirectorUi(director)), null);
});

test("a new fingerprint stages a preview and never touches an existing camera", () => {
  const { extractor, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));

  assert.equal(syncExtractorCameraTrack(ui), true);
  assert.equal(ui.state.cameras.length, 1, "no camera is created before commit");
  assert.equal(ui.state.cameras[0].keyframes.length, 1, "the existing camera is untouched");
  assert.equal(ui.pendingExtractorImport.fingerprint, "fp-1");
  // Marked "seen" the moment it is staged, not only on commit: see
  // resolve_director_camera_track() in omnicam/core/upstream_track.py for why
  // a queued render must not adopt a fingerprint the browser already noticed.
  assert.equal(importedFingerprint(ui), "fp-1");

  assert.equal(syncExtractorCameraTrack(ui), false, "re-syncing the same pending fingerprint changes nothing");
  assert.equal(syncExtractorCameraTrack(ui), false);
});

test("committing the preview adds a new camera, exactly like the + Camera button", () => {
  const { extractor, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));
  syncExtractorCameraTrack(ui);

  assert.equal(commitPendingExtractorImport(ui), true);
  assert.equal(ui.state.cameras.length, 2, "the original camera survives alongside the new one");
  assert.equal(ui.state.cameras[0].keyframes.length, 1, "the original camera's keys are untouched");
  assert.equal(ui.state.cameras[1].keyframes.length, 3);
  assert.equal(ui.state.active_camera_id, ui.state.cameras[1].id, "the new camera becomes active, like any other");
  assert.equal(ui.pendingExtractorImport, null);
  assert.deepEqual(ui.calls.checkpoint, ["Import extracted camera"]);

  assert.equal(syncExtractorCameraTrack(ui), false, "a committed fingerprint does not restage");
});

test("dismissing the preview creates nothing and clears the banner", () => {
  const { extractor, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));
  syncExtractorCameraTrack(ui);

  assert.equal(dismissPendingExtractorImport(ui), true);
  assert.equal(ui.pendingExtractorImport, null);
  assert.equal(ui.state.cameras.length, 1);
});

test("local edits to a committed camera survive repeated syncing of the same fingerprint", () => {
  const { extractor, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));
  syncExtractorCameraTrack(ui);
  commitPendingExtractorImport(ui);

  const imported = ui.state.cameras[1];
  imported.keyframes[1].camera.position = [9, 9, 9];
  imported.keyframes.push(key(70, [1, 2, 3]));
  for (let index = 0; index < 5; index += 1) syncExtractorCameraTrack(ui);

  assert.equal(ui.state.cameras.length, 2, "re-syncing must not create a duplicate camera");
  assert.deepEqual(ui.state.cameras[1].keyframes[1].camera.position, [9, 9, 9]);
  assert.equal(ui.state.cameras[1].keyframes.length, 4);
});

test("a re-solve with a different fingerprint stages another preview, leaving the imported camera alone", () => {
  const { extractor, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));
  syncExtractorCameraTrack(ui);
  commitPendingExtractorImport(ui);
  ui.state.cameras[1].keyframes[1].camera.position = [9, 9, 9];

  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-2", { duration: 120 })));
  assert.equal(syncExtractorCameraTrack(ui), true);
  assert.equal(ui.state.cameras.length, 2, "the second solve is only a preview until committed");
  assert.deepEqual(ui.state.cameras[1].keyframes[1].camera.position, [9, 9, 9], "the earlier import is untouched");
  assert.equal(ui.pendingExtractorImport.fingerprint, "fp-2");
  assert.equal(importedFingerprint(ui), "fp-2");

  commitPendingExtractorImport(ui);
  assert.equal(ui.state.cameras.length, 3, "each committed solve is its own camera");
});

test("disconnecting the cable keeps a committed import and drops an unconfirmed preview", () => {
  const { extractor, director, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));
  syncExtractorCameraTrack(ui);
  commitPendingExtractorImport(ui);
  const frozen = ui.state.cameras[1].keyframes;

  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-2")));
  syncExtractorCameraTrack(ui);
  assert.ok(ui.pendingExtractorImport, "fp-2 is staged before disconnecting");

  director.inputs[0].link = null;
  assert.equal(syncExtractorCameraTrack(ui), true, "disconnecting drops the unconfirmed preview");
  assert.equal(ui.pendingExtractorImport, null);
  assert.equal(ui.state.cameras.length, 2, "no camera was ever created for the dropped preview");
  assert.equal(ui.state.cameras[1].keyframes, frozen, "the committed import is unaffected");
  assert.equal(importedFingerprint(ui), "fp-2", "the marker itself is not rolled back -- see the module docstring");
});

test("an extractor that has never run imports nothing", () => {
  const { ui } = linkedPair();
  assert.equal(syncExtractorCameraTrack(ui), false);
  assert.equal(ui.state.cameras[0].keyframes.length, 1);
});

test("a reloaded workflow does not re-import what it already holds", () => {
  const { extractor, ui } = linkedPair();
  cacheExtractorResult(extractor, parseExtractorMessage(solvedMessage("fp-1")));
  syncExtractorCameraTrack(ui);

  // Reload: the widgets and the Director metadata both came back from JSON.
  const reloaded = makeDirectorUi(ui.node);
  reloaded.state.metadata = { ...reloaded.state.metadata, ...ui.state.metadata };
  assert.equal(syncExtractorCameraTrack(reloaded), false);
  assert.deepEqual(reloaded.calls.checkpoint, []);
});

test("a finished solve nudges every Director it feeds, without re-queueing", () => {
  const { extractor, ui } = linkedPair();
  let synced = 0;
  ui.syncUpstreamInputs = () => { synced += 1; };
  assert.equal(notifyDownstreamDirectors(extractor), 1);
  assert.equal(synced, 1);
});

test("notifying tolerates a graph with no downstream Director", () => {
  const graph = new FakeGraph();
  const extractor = graph.add(1, "MajoorOmniCamExtractor");
  const consumer = graph.add(2, "SomeAdapter");
  graph.connect(extractor, consumer, "camera_track");
  assert.equal(notifyDownstreamDirectors(extractor), 0);
});
