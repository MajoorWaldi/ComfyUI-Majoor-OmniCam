import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeState } from "../../web-src/director/core.js";

// Colours are the one free-form string in the editor state that reaches CSS.
// They live in their own module because that is a single, nameable
// responsibility, not because director-modules ran out of room.
test("state sanitization keeps only hex colours out of workflow JSON", () => {
  // These colours land in CSS custom properties that feed url()-capable
  // shorthands, so a crafted workflow must not be able to smuggle a remote
  // fetch into the viewport.
  const hostile = 'url("https://example.invalid/pixel.png")';
  const state = sanitizeState({
    cameras: [{ id: "camera_1", name: "Camera 1", color: hostile }],
    objects: [{ id: "subject", type: "card", color: hostile }],
    point_color: hostile,
    viewport_bg_color: hostile,
    duration_frames: 100,
    markers: [{ frame: 5, name: "Cut", color: hostile }],
  });

  assert.equal(state.cameras[0].color, null);
  assert.equal(state.objects[0].color, null);
  assert.equal(state.point_color, "#cbd5e1");
  assert.equal(state.viewport_bg_color, "#121212");
  assert.equal(state.markers[0].color, "#f2d06b");
});

test("state sanitization preserves every hex colour the editor can author", () => {
  const state = sanitizeState({
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef" }],
    objects: [{ id: "subject", type: "card", color: "#8C929B" }],
    point_color: "#abc",
    viewport_bg_color: "#11223344",
    duration_frames: 100,
    markers: [{ frame: 5, name: "Cut", color: "#f2d06b" }],
  });

  assert.equal(state.cameras[0].color, "#4aa3ef");
  assert.equal(state.objects[0].color, "#8C929B");
  assert.equal(state.point_color, "#abc");
  assert.equal(state.viewport_bg_color, "#11223344");
  assert.equal(state.markers[0].color, "#f2d06b");
});
