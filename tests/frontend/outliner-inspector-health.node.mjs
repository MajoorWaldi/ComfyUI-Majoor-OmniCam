import test from "node:test";
import assert from "node:assert/strict";

import { outlinerPanel } from "../../web-src/template/panels/outliner-panel.js";
import { leftPanelMarkup } from "../../web-src/template/left-panel.js";
import { inspectorPanel } from "../../web-src/template/panels/inspector-panel.js";
import { shotPanel } from "../../web-src/template/panels/shot-panel.js";
import { healthPanel } from "../../web-src/template/panels/health-panel.js";
import { calculateQualityScore } from "../../web-src/motion-health/panel.js";
import { LENS_PRESETS } from "../../web-src/lens.js";
import { setupAxisResetButtons } from "../../web-src/scene/axis-scrub.js";

test("category filter chips live in the left scene panel", () => {
  const left = leftPanelMarkup();
  assert.match(left, /data-role="outliner-filter-chips"/);
  assert.match(left, /data-filter="all"/);
  assert.match(left, /data-filter="cameras"/);
  assert.match(left, /data-filter="objects"/);
  assert.match(left, /data-filter="hidden"/);
});

test("outlinerPanel includes axis tags and reset buttons", () => {
  const html = outlinerPanel();
  assert.match(html, /class="oc-axis-tag"/);
  assert.match(html, /data-act="reset-vector"\s+data-target="position"/);
  assert.match(html, /data-act="reset-vector"\s+data-target="rotation"/);
  assert.match(html, /data-act="reset-vector"\s+data-target="scale"/);
});

test("inspectorPanel includes 18mm lens preset, axis tags, and reset buttons", () => {
  assert.ok(LENS_PRESETS.includes(18), "LENS_PRESETS includes 18mm");
  const html = inspectorPanel();
  assert.match(html, /data-lens="18"/);
  assert.match(html, /data-act="reset-vector"\s+data-target="camera-pos"/);
  assert.match(html, /data-act="reset-vector"\s+data-target="camera-target"/);
  assert.match(html, /data-act="reset-vector"\s+data-target="rotation"/);
});

test("shotPanel includes all 12 interpolations and 6 tangent modes", () => {
  const html = shotPanel();
  const expectedInterps = [
    "ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold",
    "sine", "cubic", "quintic", "expo", "back",
  ];
  for (const interp of expectedInterps) {
    assert.match(html, new RegExp(`value="${interp}"`), `select contains ${interp}`);
    assert.match(html, new RegExp(`data-interp="${interp}"`), `button contains ${interp}`);
  }

  const expectedTangents = ["auto", "clamped", "vector", "free", "aligned", "flat"];
  for (const tangent of expectedTangents) {
    assert.match(html, new RegExp(`value="${tangent}"`), `select contains tangent ${tangent}`);
    assert.match(html, new RegExp(`data-tangent="${tangent}"`), `button contains tangent ${tangent}`);
  }

  assert.match(html, /data-act="shot-prev-key"/);
  assert.match(html, /data-act="shot-next-key"/);
  assert.match(html, /data-act="shot-prev-frame"/);
  assert.match(html, /data-act="shot-next-frame"/);
  assert.match(html, /data-role="key-timecode"/);
});

test("healthPanel includes quality score badge", () => {
  const html = healthPanel();
  assert.match(html, /data-role="health-score-badge"/);
  assert.match(html, /data-role="health-badge"/);
});

test("calculateQualityScore computes proper score and grades A-D", () => {
  const optimalReport = {
    limits: {
      max_speed: 10,
      max_angular_speed: 5,
      max_acceleration: 20,
      max_jerk: 40,
      max_fov_change: 15,
    },
    max_speed: 5,
    max_angular_speed: 2,
    max_acceleration: 10,
    max_jerk: 20,
    max_fov_change: 5,
    framing_loss_frames: 0,
    duration_frames: 100,
  };
  const resOptimal = calculateQualityScore(optimalReport);
  assert.equal(resOptimal.score, 100);
  assert.equal(resOptimal.letter, "A");

  const cautionReport = {
    limits: {
      max_speed: 10,
      max_angular_speed: 5,
      max_acceleration: 20,
      max_jerk: 40,
      max_fov_change: 15,
    },
    max_speed: 12, // 1.2 ratio -> ~64
    max_angular_speed: 6, // 1.2 ratio -> ~64
    max_acceleration: 24, // 1.2 ratio -> ~64
    max_jerk: 48, // 1.2 ratio -> ~64
    max_fov_change: 18, // 1.2 ratio -> ~64
    framing_loss_frames: 0,
    duration_frames: 100,
  };
  const resCaution = calculateQualityScore(cautionReport);
  assert.ok(resCaution.score < 75 && resCaution.score >= 50);
  assert.equal(resCaution.letter, "C");

  const criticalReport = {
    limits: {
      max_speed: 10,
      max_angular_speed: 5,
      max_acceleration: 20,
      max_jerk: 40,
      max_fov_change: 15,
    },
    max_speed: 30, // 3.0 ratio -> 0
    max_angular_speed: 15, // 3.0 ratio -> 0
    max_acceleration: 60,
    max_jerk: 120,
    max_fov_change: 45,
    framing_loss_frames: 30,
    duration_frames: 100,
  };
  const resCritical = calculateQualityScore(criticalReport);
  assert.ok(resCritical.score < 50);
  assert.equal(resCritical.letter, "D");
});

test("setupAxisResetButtons restores default vector values", () => {
  // Setup fake DOM structure
  const root = {
    listeners: {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    dispatchEvent(event) {
      const handler = this.listeners[event.type];
      if (handler) handler(event);
    },
  };

  const checkpoints = [];
  const fakeUi = {
    root,
    checkpoint: (msg) => checkpoints.push(msg),
    serialize: () => {},
    render: () => {},
    setStatus: () => {},
  };

  setupAxisResetButtons(fakeUi);

  const inputs = [
    { value: "10", dispatched: [] },
    { value: "20", dispatched: [] },
    { value: "30", dispatched: [] },
  ];
  for (const input of inputs) {
    input.dispatchEvent = (e) => input.dispatched.push(e.type);
  }

  const row = {
    querySelectorAll: (sel) => (sel === "input[type=number]" ? inputs : []),
  };

  const btn = {
    dataset: { target: "camera-pos" },
    closest: (sel) => {
      if (sel === '[data-act="reset-vector"]') return btn;
      if (sel === ".oc-vec-row") return row;
      return null;
    },
  };

  const fakeClickEvent = {
    type: "click",
    target: btn,
    preventDefault: () => {},
    stopPropagation: () => {},
  };

  root.dispatchEvent(fakeClickEvent);

  assert.equal(inputs[0].value, "6");
  assert.equal(inputs[1].value, "4");
  assert.equal(inputs[2].value, "6");
  assert.deepEqual(inputs[0].dispatched, ["input", "change"]);
  assert.ok(checkpoints.length > 0);
});
