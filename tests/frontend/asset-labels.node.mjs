import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_TAGS_PER_OBJECT,
  labelAnchorWorld,
  labelText,
  parseTagInput,
  primaryTag,
  sanitizeAnnotation,
  sanitizeLabelSettings,
  sanitizeTags,
  shouldShowLabel,
} from "../../web-src/assets/labels.js";

test("sanitizeTags lowercases, trims, dedupes, slug-checks and caps", () => {
  assert.deepEqual(sanitizeTags([" Hero ", "SUBJECT", "hero", "bad tag", "x".repeat(65)]), ["hero", "subject"]);
  assert.deepEqual(sanitizeTags("notarray"), []);
  assert.equal(sanitizeTags(Array.from({ length: 40 }, (_, i) => `t${i}`)).length, MAX_TAGS_PER_OBJECT);
});

test("parseTagInput accepts a comma / newline string or an array", () => {
  assert.deepEqual(parseTagInput("hero, subject\nforeground"), ["hero", "subject", "foreground"]);
  assert.deepEqual(parseTagInput(["A", "b"]), ["a", "b"]);
});

test("sanitizeAnnotation normalises and rejects unsafe text", () => {
  assert.deepEqual(sanitizeAnnotation({ text: " HERO ", color: "#8D7EE8", anchor: "top" }),
    { text: "HERO", visible: true, color: "#8d7ee8", anchor: "top" });
  assert.equal(sanitizeAnnotation({ text: "" }), null);
  assert.equal(sanitizeAnnotation({ text: "<b>x</b>" }), null);
  assert.equal(sanitizeAnnotation({ text: "see http://x" }), null);
  assert.equal(sanitizeAnnotation({ text: "x".repeat(129) }), null);
  // bad colour / anchor fall back, they do not fail the whole annotation
  assert.deepEqual(sanitizeAnnotation({ text: "ok", color: "red", anchor: "sideways" }),
    { text: "ok", visible: true, color: "#8d7ee8", anchor: "top" });
});

test("sanitizeLabelSettings clamps mode and content", () => {
  assert.deepEqual(sanitizeLabelSettings({ mode: "x", content: "y" }), { mode: "selected", content: "annotation" });
  assert.deepEqual(sanitizeLabelSettings({ mode: "all", content: "tag" }), { mode: "all", content: "tag" });
});

test("labelText resolves per content mode", () => {
  const object = { name: "John", type: "glb", tags: ["hero", "subject"], annotation: { text: "HERO", visible: true } };
  assert.equal(labelText(object, "annotation"), "HERO");
  assert.equal(labelText(object, "name"), "John");
  assert.equal(labelText(object, "tag"), "hero");
  assert.equal(labelText({ ...object, annotation: { text: "HERO", visible: false } }, "annotation"), "");
  assert.equal(primaryTag(object), "hero");
});

test("shouldShowLabel honours mode and selection", () => {
  const object = { id: "o1", enabled: true };
  assert.equal(shouldShowLabel(object, { mode: "off" }), false);
  assert.equal(shouldShowLabel(object, { mode: "all" }), true);
  assert.equal(shouldShowLabel(object, { mode: "selected", selectedIds: new Set(["o1"]) }), true);
  assert.equal(shouldShowLabel(object, { mode: "selected", selectedIds: new Set(["other"]) }), false);
  assert.equal(shouldShowLabel({ ...object, enabled: false }, { mode: "all" }), false);
});

test("labelAnchorWorld lifts above bounds, less for helpers", () => {
  const mesh = labelAnchorWorld({ position: [1, 2, 3], size: [1, 2, 1] }, "glb");
  assert.deepEqual([mesh[0], mesh[2]], [1, 3]);
  assert.ok(mesh[1] > 2 + 1); // above the top of a 2-tall box
  const cam = labelAnchorWorld({ position: [0, 0, 0], size: [1, 1, 1] }, "camera");
  assert.ok(cam[1] > 0 && cam[1] < 0.5);
});
