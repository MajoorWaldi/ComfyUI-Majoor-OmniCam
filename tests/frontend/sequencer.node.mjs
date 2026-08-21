import assert from "node:assert/strict";
import test from "node:test";

import { recalculateTimeline, splitShotAt } from "../../web-src/sequencer/state.js";

function shot(id, duration = 24, fps = 24) {
  return {
    id,
    name: id,
    enabled: true,
    source: { duration_frames: duration, fps_num: fps, fps_den: 1 },
    trim: { in_frame: 0, out_frame: duration - 1 },
    retime: { enabled: false },
    timeline: { start_frame: 0, duration_frames: duration, end_frame: duration - 1 },
  };
}

test("sequencer timeline converts source FPS to timeline FPS", () => {
  const state = {
    timeline: { fps_num: 24, fps_den: 1, ripple: true },
    shot_order: ["one"],
    shots: { one: shot("one", 30, 30) },
  };
  assert.equal(recalculateTimeline(state), 24);
  assert.equal(state.shots.one.timeline.duration_frames, 24);
});

test("non-ripple clips preserve authored starts", () => {
  const state = {
    timeline: { fps_num: 24, fps_den: 1, ripple: false },
    shot_order: ["one", "two"],
    shots: { one: shot("one"), two: { ...shot("two"), timeline: { start_frame: 40 } } },
  };
  recalculateTimeline(state);
  assert.equal(state.shots.two.timeline.start_frame, 40);
});

test("repeated split operations do not overwrite existing shots", () => {
  const original = shot("shot");
  const state = {
    timeline: { fps_num: 24, fps_den: 1, ripple: true },
    selected_clip_id: "shot",
    shot_order: ["shot"],
    shots: { shot: original, shot_a: shot("reserved_a"), shot_b: shot("reserved_b") },
  };
  const result = splitShotAt(state, "shot", 12);
  assert.ok(result);
  assert.notEqual(result.idA, "shot_a");
  assert.equal(state.shots.shot_a.id, "reserved_a");
});
