import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { commitDrawnTrack, eraseAtPoint, simplifyDrawnPoints } from "../../web-src/motion-tracks/draw.js";
import { createMotionLayer, retimeLayer, setLayerInterpolation, setMotionTool } from "../../web-src/motion-tracks/editing.js";
import { normalizedPointer } from "../../web-src/motion-tracks/projection.js";
import { projectLayer } from "../../web-src/motion-tracks/interactions.js";

test("Director defaults include an empty serializable motion workspace", () => {
  const state = defaultState();
  assert.deepEqual(state.motion_layers, []);
  assert.equal(state.motion_tool, "select");
  assert.equal(state.selected_motion_layer_id, null);
});

test("sanitizeState bounds motion keys and keeps supported source kinds", () => {
  const state = sanitizeState({ fps: 24, duration_frames: 48, motion_tool: "track", motion_layers: [{ id: "face", label: "Face", enabled: true, source_kind: "object_point", keys: [{ time_seconds: 9, x: -2, y: 3, visible: false, interpolation: "smooth" }], source: { object_id: "subject" } }] });
  assert.equal(state.motion_tool, "track");
  assert.equal(state.selected_motion_layer_id, "face");
  assert.deepEqual(state.motion_layers[0].keys[0], { time_seconds: 2, x: 0, y: 1, visible: false, interpolation: "smooth" });
});

test("track drawing simplifies points and distributes sparse keys over in-out", () => {
  const state = { motion_layers: [], selected_motion_layer_id: null };
  const layer = commitDrawnTrack(state, [{ x: 0.1, y: 0.2 }, { x: 0.101, y: 0.201 }, { x: 0.8, y: 0.7 }], 1, 3);
  assert.equal(layer.keys.length, 2);
  assert.deepEqual(layer.keys.map((key) => key.time_seconds), [1, 3]);
  assert.equal(state.selected_motion_layer_id, layer.id);
  assert.equal(simplifyDrawnPoints([{ x: 0, y: 0 }, { x: 1, y: 1 }]).length, 2);
});

test("anchor editing supports interpolation, retime, tools and erase", () => {
  const state = { motion_layers: [], selected_motion_layer_id: null, motion_tool: "select" };
  const layer = createMotionLayer(state, { sourceKind: "static_anchor", keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }] });
  setLayerInterpolation(layer, "hold"); retimeLayer(layer, 2, 4); setMotionTool(state, "erase");
  assert.equal(layer.keys[0].interpolation, "hold");
  assert.equal(layer.keys[0].time_seconds, 2);
  assert.equal(state.motion_tool, "erase");
  assert.equal(eraseAtPoint(state, { x: 0.5, y: 0.5 }).id, layer.id);
  assert.deepEqual(state.motion_layers, []);
});

function projectUi(overrides = {}) {
  return {
    state: { fps: 24, motion_layers: [], objects: [{ id: "subject", name: "Subject" }] },
    selectedObjectId: "subject",
    motionCreationKind: "",
    frame: 0,
    canvas: { width: 1280, height: 720 },
    camera: { target: [0, 0, 0] },
    webgl: { intersectScenePoint: () => [1, 2, 3] },
    ...overrides,
  };
}

test("projectLayer honours the World Point card even with an object selected", () => {
  const ui = projectUi({ motionCreationKind: "world" });
  const layer = projectLayer(ui, { x: 0.5, y: 0.5 });
  assert.equal(layer.source_kind, "world_point");
  assert.ok(!("object_id" in layer.source));
});

test("projectLayer honours the Track Object card", () => {
  const ui = projectUi({ motionCreationKind: "object" });
  const layer = projectLayer(ui, { x: 0.5, y: 0.5 });
  assert.equal(layer.source_kind, "object_point");
  assert.equal(layer.source.object_id, "subject");
});

test("projectLayer without a card still infers object vs world from the selection", () => {
  const withObject = projectLayer(projectUi(), { x: 0.5, y: 0.5 });
  assert.equal(withObject.source_kind, "object_point");

  const noObject = projectLayer(projectUi({ selectedObjectId: null }), { x: 0.5, y: 0.5 });
  assert.equal(noObject.source_kind, "world_point");
});

test("normalized pointer coordinates are canvas-relative and bounded", () => {
  const element = { getBoundingClientRect: () => ({ left: 10, top: 20, width: 200, height: 100 }) };
  assert.deepEqual(normalizedPointer({ clientX: 110, clientY: 45 }, element), { x: 0.5, y: 0.25 });
  assert.deepEqual(normalizedPointer({ clientX: -20, clientY: 500 }, element), { x: 0, y: 1 });
});