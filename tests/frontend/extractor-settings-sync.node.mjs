// The real Extractor node widgets are the single settings source a queued
// execute() reads. This proves the panel-to-widget sync:
//   - pushes the extract mode and the cleanup-desk controls it owns;
//   - never clobbers the widgets it has no control over (method, lens_mode,
//     fov_degrees, focal_length_mm, sensor_width_mm, max_dimension,
//     frame_step) -- those round-trip untouched.

import assert from "node:assert/strict";
import test from "node:test";

import {
  CAMERA_TRACK_REFINE_WIDGETS,
  syncExtractorPanelToWidgets,
} from "../../web-src/extractor/queue/widget-sync.js";
import { RECON_PANEL_FIELDS } from "../../web-src/extractor/reconstruction/settings-sync.js";

// Every input a queued execute() reads, with a value the panel must not change
// unless it owns that input.
const ALL_EXECUTE_WIDGETS = {
  extract_mode: "camera_track",
  method: "dpvo",
  lens_mode: "fixed",
  fov_degrees: 42,
  focal_length_mm: 35,
  sensor_width_mm: 36,
  max_dimension: 1280,
  frame_step: 2,
  normalize_origin: false,
  motion_scale: 3,
  position_smoothing: 0.9,
  rotation_smoothing: 0.8,
  simplify_keys: false,
  position_tolerance: 0.5,
  rotation_tolerance_deg: 7,
};

function fakeNode(values = ALL_EXECUTE_WIDGETS) {
  let dirty = 0;
  return {
    widgets: Object.entries(values).map(([name, value]) => ({ name, value })),
    setDirtyCanvas() {
      dirty += 1;
    },
    get dirtyCount() {
      return dirty;
    },
    value(name) {
      return this.widgets.find((w) => w.name === name)?.value;
    },
  };
}

test("the panel-owned widget list matches the schema names", () => {
  assert.deepEqual(CAMERA_TRACK_REFINE_WIDGETS, [
    "normalize_origin",
    "motion_scale",
    "position_smoothing",
    "rotation_smoothing",
    "simplify_keys",
    "position_tolerance",
    "rotation_tolerance_deg",
  ]);
});

test("camera_track sync pushes the cleanup desk and the mode, nothing else", () => {
  const node = fakeNode();
  const refineSettings = {
    normalize_origin: true,
    motion_scale: 1.0,
    position_smoothing: 0.15,
    rotation_smoothing: 0.1,
    simplify_keys: true,
    position_tolerance: 0.01,
    rotation_tolerance_deg: 0.25,
    // RefineController also carries these; they are not node widgets and must
    // be ignored rather than written.
    trim_start_frame: 4,
    global_rotation_xyzw: [0, 0, 0, 1],
    estimate_up: true,
    spike_actions: { 3: "hold" },
  };

  syncExtractorPanelToWidgets({ node, mode: "camera_track", refineSettings });

  // Owned widgets now hold the panel's values.
  for (const name of CAMERA_TRACK_REFINE_WIDGETS) {
    assert.equal(node.value(name), refineSettings[name], name);
  }
  assert.equal(node.value("extract_mode"), "camera_track");

  // Un-owned widgets are exactly as they started.
  for (const name of [
    "method", "lens_mode", "fov_degrees", "focal_length_mm",
    "sensor_width_mm", "max_dimension", "frame_step",
  ]) {
    assert.equal(node.value(name), ALL_EXECUTE_WIDGETS[name], name);
  }
  // Nothing from the controller that is not a widget leaked on.
  assert.equal(node.value("trim_start_frame"), undefined);
  assert.equal(node.value("global_rotation_xyzw"), undefined);
});

test("round-trip: syncing values already on the widgets changes nothing", () => {
  const node = fakeNode();
  const refineSettings = Object.fromEntries(
    CAMERA_TRACK_REFINE_WIDGETS.map((name) => [name, ALL_EXECUTE_WIDGETS[name]]),
  );
  const changed = syncExtractorPanelToWidgets({
    node,
    mode: "camera_track",
    refineSettings,
  });
  assert.equal(changed, false);
  assert.equal(node.dirtyCount, 0);
  for (const [name, value] of Object.entries(ALL_EXECUTE_WIDGETS)) {
    assert.equal(node.value(name), value, name);
  }
});

test("switching to scene_reconstruct writes the mode widget", () => {
  const node = fakeNode();
  // No panel root -> the recon DOM bridge is a no-op, but the mode still flips.
  const changed = syncExtractorPanelToWidgets({
    node,
    root: null,
    mode: "scene_reconstruct",
    refineSettings: {},
  });
  assert.equal(node.value("extract_mode"), "scene_reconstruct");
  assert.equal(changed, true);
});

test("scene_reconstruct drives the recon_* widgets from the panel DOM", () => {
  const values = { ...ALL_EXECUTE_WIDGETS, extract_mode: "scene_reconstruct" };
  for (const field of RECON_PANEL_FIELDS) {
    values[field.widget] = field.kind === "boolean" ? false : field.kind === "number" ? 0 : "";
  }
  const node = fakeNode(values);

  // Minimal fake panel root: one control per recon panel field.
  const controls = new Map(
    RECON_PANEL_FIELDS.map((f) => [
      f.role,
      f.kind === "boolean"
        ? { checked: true }
        : { value: f.kind === "number" ? "5" : "picked" },
    ]),
  );
  const root = {
    querySelector: (sel) => {
      const role = sel.match(/data-role="([^"]+)"/)?.[1];
      return controls.get(role) || null;
    },
  };

  syncExtractorPanelToWidgets({ node, root, mode: "scene_reconstruct", refineSettings: {} });

  for (const f of RECON_PANEL_FIELDS) {
    const expected = f.kind === "boolean" ? true : f.kind === "number" ? 5 : "picked";
    assert.equal(node.value(f.widget), expected, f.widget);
  }
});
