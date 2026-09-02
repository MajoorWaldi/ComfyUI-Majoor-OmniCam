import assert from "node:assert/strict";
import test from "node:test";

import {
  FINGERPRINT_WIDGET,
  SCENE_WIDGET,
  SOURCE_WIDGET,
  ensureCacheWidgets,
  readCachedResult,
  restoreLateWidgetValues,
} from "../../web-src/extractor/result-cache.js";

function node(widgets = []) {
  return {
    widgets,
    addWidget(_type, name, value, callback, options) {
      const widget = { name, value, callback, options };
      this.widgets.push(widget);
      return widget;
    },
  };
}

const TRACK = {
  schema_version: 1,
  fps: 24,
  duration_frames: 124,
  width: 840,
  height: 472,
  render_mode: "omni_ref",
  keyframes: [{ frame: 0, camera: { position: [0, 1, 5], target: [0, 1, 0], fov: 45, roll: 0 } }],
  objects: [],
  metadata: { extractor_fingerprint: "fp-124" },
};

const SCENE = {
  version: 1,
  cameras: [{ id: "extracted_camera", label: "Extracted", enabled: true, track: TRACK }],
  active_camera_id: "extracted_camera",
  playblast_camera_id: "extracted_camera",
};

test("a solve saved in a workflow survives the reload that rebuilds the widgets late", () => {
  // The panel is imported lazily, so its cache widgets are created after
  // configure() has already placed widgets_values. Without the recovery the
  // saved solve is serialized correctly and then dropped on the way back in --
  // which is a browser refresh losing the camera and the cleaned track.
  const reloaded = node([
    { name: "method", value: "dpvo" },
    { name: "max_dimension", value: 840 },
  ]);
  reloaded.widgets_values = [
    "dpvo", 840, JSON.stringify(SCENE), "fp-124", "managed:shot.mp4",
  ];

  ensureCacheWidgets(reloaded);
  reloaded.addWidget("text", SOURCE_WIDGET, "", () => {}, { serialize: true });

  assert.equal(readCachedResult(reloaded), null); // nothing yet: this is the bug

  const restored = restoreLateWidgetValues(reloaded);

  assert.equal(restored, 3);
  const cached = readCachedResult(reloaded);
  assert.ok(cached, "the solve should be readable again");
  assert.equal(cached.fingerprint, "fp-124");
  assert.equal(cached.track.duration_frames, 124);
  assert.equal(cached.track.keyframes.length, 1);
});

test("a solve that landed during the load is never overwritten by the saved one", () => {
  const live = node([{ name: "method", value: "dpvo" }]);
  live.widgets_values = ["dpvo", JSON.stringify(SCENE), "fp-old", ""];
  ensureCacheWidgets(live);
  const fingerprint = live.widgets.find((widget) => widget.name === FINGERPRINT_WIDGET);
  fingerprint.value = "fp-new";

  restoreLateWidgetValues(live);

  assert.equal(fingerprint.value, "fp-new");
});

test("a node with nothing saved is left exactly as it is", () => {
  const fresh = node([{ name: "method", value: "dpvo" }]);
  ensureCacheWidgets(fresh);

  assert.equal(restoreLateWidgetValues(fresh), 0);
  assert.equal(fresh.widgets.find((w) => w.name === SCENE_WIDGET).value, "");
});

test("a malformed widgets_values cannot break the load", () => {
  const odd = node([{ name: "method", value: "dpvo" }]);
  odd.widgets_values = { not: "an array" };
  ensureCacheWidgets(odd);

  assert.equal(restoreLateWidgetValues(odd), 0);
  assert.equal(restoreLateWidgetValues({}), 0);
});
