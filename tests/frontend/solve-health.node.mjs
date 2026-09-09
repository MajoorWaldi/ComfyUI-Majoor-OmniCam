import test from "node:test";
import assert from "node:assert/strict";

import { normalizeSolveHealth, SOLVE_HEALTH_STATES } from "../../web-src/scene/solve-health.js";

test("missing metadata produces one unknown entry per frame", () => {
  const frames = normalizeSolveHealth(undefined, 4);
  assert.deepEqual(frames, [
    { frame: 0, state: "unknown", score: null },
    { frame: 1, state: "unknown", score: null },
    { frame: 2, state: "unknown", score: null },
    { frame: 3, state: "unknown", score: null },
  ]);
});

test("valid states and scores are preserved, gaps stay unknown", () => {
  const frames = normalizeSolveHealth(
    { solve_health_v1: { source: "extractor", frames: [
      { frame: 0, state: "good", score: 0.98 },
      { frame: 2, state: "bad" },
    ] } },
    4,
  );
  assert.deepEqual(frames[0], { frame: 0, state: "good", score: 0.98 });
  assert.deepEqual(frames[1], { frame: 1, state: "unknown", score: null });
  assert.deepEqual(frames[2], { frame: 2, state: "bad", score: null });
});

test("scores clamp to [0,1] and invalid states fall back to unknown", () => {
  const frames = normalizeSolveHealth(
    { solve_health_v1: { frames: [
      { frame: 0, state: "good", score: 1.5 },
      { frame: 1, state: "sideways", score: -0.2 },
      { frame: 2, state: "warning", score: "nope" },
    ] } },
    3,
  );
  assert.equal(frames[0].score, 1);
  assert.equal(frames[1].state, "unknown");
  assert.equal(frames[1].score, 0);
  assert.equal(frames[2].score, null);
});

test("out-of-range and non-integer frame entries are ignored", () => {
  const frames = normalizeSolveHealth(
    { solve_health_v1: { frames: [
      { frame: -1, state: "good" },
      { frame: 9, state: "good" },
      { frame: 1.5, state: "good" },
      { frame: 1, state: "good" },
    ] } },
    3,
  );
  assert.equal(frames.filter((f) => f.state === "good").length, 1);
  assert.equal(frames[1].state, "good");
});

test("a zero or negative duration yields an empty array", () => {
  assert.deepEqual(normalizeSolveHealth({ solve_health_v1: { frames: [] } }, 0), []);
  assert.deepEqual(normalizeSolveHealth(null, -5), []);
});

test("the state vocabulary is exactly the four traffic-light values", () => {
  assert.deepEqual([...SOLVE_HEALTH_STATES].sort(), ["bad", "good", "unknown", "warning"]);
});
