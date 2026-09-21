// Unit tests for subject card aspect ratio adapter and placeholder design.

import test from "node:test";
import assert from "node:assert/strict";

import * as THREE from "../../web-src/three-runtime.js";
import {
  applyMediaAspectToCard,
  createSubjectPlaceholderCanvas,
  getSubjectPlaceholderCanvas,
  getSubjectPlaceholderTexture,
} from "../../web-src/viewport/subject-placeholder.js";

test("applyMediaAspectToCard updates card width to match 16:9 media aspect ratio", () => {
  const card = { id: "subject", type: "card", size: [2, 3, 0.01] };
  const media = { naturalWidth: 1920, naturalHeight: 1080 };

  const changed = applyMediaAspectToCard(card, media);
  assert.equal(changed, true, "should report changed");
  // Height should remain 3.0, width should become 3.0 * (16/9) = 5.333
  assert.equal(card.size[1], 3);
  assert.ok(Math.abs(card.size[0] - 5.333) < 0.01, `expected width ~5.333, got ${card.size[0]}`);

  // Re-applying same aspect should return false (idempotent)
  const reapply = applyMediaAspectToCard(card, media);
  assert.equal(reapply, false, "should be idempotent");
});

test("applyMediaAspectToCard updates card width to match 1:1 square media", () => {
  const card = { id: "subject", type: "card", size: [2, 3, 0.01] };
  const media = { videoWidth: 1024, videoHeight: 1024 };

  const changed = applyMediaAspectToCard(card, media);
  assert.equal(changed, true);
  assert.equal(card.size[1], 3);
  assert.equal(card.size[0], 3);
});

test("applyMediaAspectToCard updates card width to match 9:16 portrait media", () => {
  const card = { id: "subject", type: "card", size: [2, 3, 0.01] };
  const media = { width: 1080, height: 1920 };

  const changed = applyMediaAspectToCard(card, media);
  assert.equal(changed, true);
  assert.equal(card.size[1], 3);
  assert.ok(Math.abs(card.size[0] - (3 * 9 / 16)) < 0.01);
});

test("applyMediaAspectToCard safely handles missing/zero dimensions", () => {
  const card = { id: "subject", type: "card", size: [2, 3, 0.01] };
  assert.equal(applyMediaAspectToCard(card, null), false);
  assert.equal(applyMediaAspectToCard(null, { width: 100, height: 100 }), false);
  assert.equal(applyMediaAspectToCard(card, { naturalWidth: 0, naturalHeight: 100 }), false);
  assert.deepEqual(card.size, [2, 3, 0.01]);
});

test("createSubjectPlaceholderCanvas handles node/mock environment without throwing", () => {
  // In Node environment without global document
  const canvas = createSubjectPlaceholderCanvas(512, 768);
  // Returns null or canvas safely
  assert.ok(canvas === null || canvas.width === 512);
});

test("getSubjectPlaceholderTexture safely handles THREE runtime", () => {
  const texture = getSubjectPlaceholderTexture(THREE);
  // In Node environment without canvas, gracefully returns null
  assert.ok(texture === null || texture instanceof THREE.CanvasTexture);
});
