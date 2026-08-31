import assert from "node:assert/strict";
import test from "node:test";

import { hasRegisteredTest } from "../../scripts/run_node_tests.mjs";

test("node test discovery rejects empty and comment-only modules", () => {
  assert.equal(hasRegisteredTest(""), false);
  assert.equal(hasRegisteredTest("// test('pretend', () => {})"), false);
  assert.equal(hasRegisteredTest("/* test('pretend', () => {}) */"), false);
});

test("node test discovery recognises a real top-level registration", () => {
  assert.equal(hasRegisteredTest('test("real", () => {});'), true);
});
