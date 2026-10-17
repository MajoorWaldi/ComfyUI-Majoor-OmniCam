import test from "node:test";
import assert from "node:assert/strict";

import { playblastDimensions } from "../../web-src/playblast-size.js";

const ui = (resolution, canvas = { width: 692, height: 389 }) => ({
  canvas,
  state: { playblast_resolution: resolution, width: 1280, height: 720 },
});

test("viewport mode records whatever size the panel is", () => {
  assert.deepEqual(playblastDimensions(ui("viewport")), { width: 692, height: 389 });
});

test("output and half scale the node's width x height, double goes larger", () => {
  assert.deepEqual(playblastDimensions(ui("output")), { width: 1280, height: 720 });
  assert.deepEqual(playblastDimensions(ui("half")), { width: 640, height: 360 });
  assert.ok(playblastDimensions(ui("double")).width > 1280);
});

test("a recording started from the node never uses its small preview as the size", () => {
  assert.deepEqual(playblastDimensions(ui("viewport"), { inline: true }), { width: 1280, height: 720 });
  // Only "viewport" is overridden; an explicit choice stands.
  assert.deepEqual(playblastDimensions(ui("half"), { inline: true }), { width: 640, height: 360 });
});

test("the size is capped at 3840 on its long side and stays even", () => {
  const big = { canvas: { width: 100, height: 100 }, state: { playblast_resolution: "double", width: 3000, height: 1999 } };
  const size = playblastDimensions(big);
  assert.ok(Math.max(size.width, size.height) <= 3840);
  assert.equal(size.width % 2, 0);
  assert.equal(size.height % 2, 0);
});
