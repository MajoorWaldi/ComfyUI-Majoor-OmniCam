// Continuous playback used to call setFrame() with its expensive default
// (refreshTimeline=true) on every frame -- rebuilding the whole keyframe lane,
// re-creating the audio waveform canvas and recomputing the O(duration_frames)
// Camera Health report from scratch, 24-120 times a second. The scrub drag was
// already protected (see timeline-scrub-perf.node.mjs); this guards the play
// loop the same way.

import test from "node:test";
import assert from "node:assert/strict";

import { togglePlay, stopPlay } from "../../web-src/playback-transport.js";

function withFakeRaf(run) {
  const realPerf = globalThis.performance;
  const realRaf = globalThis.requestAnimationFrame;
  const realCaf = globalThis.cancelAnimationFrame;
  let nowValue = 0;
  let pending = null;
  globalThis.performance = { now: () => nowValue };
  globalThis.requestAnimationFrame = (cb) => { pending = cb; return 1; };
  globalThis.cancelAnimationFrame = () => { pending = null; };
  try {
    run({
      setNow: (value) => { nowValue = value; },
      pump: () => { const cb = pending; pending = null; cb?.(nowValue); },
      hasPending: () => Boolean(pending),
    });
  } finally {
    globalThis.performance = realPerf;
    globalThis.requestAnimationFrame = realRaf;
    globalThis.cancelAnimationFrame = realCaf;
  }
}

function fixture() {
  const calls = [];
  const renders = [];
  return {
    ui: {
      playing: false,
      frame: 0,
      state: { fps: 24, duration_frames: 300, playback_range: null, loop_playback: false },
      root: { querySelectorAll: () => [] },
      setFrame(frame, fromPlayback, refreshTimeline) {
        this.frame = frame;
        calls.push({ frame, fromPlayback, refreshTimeline });
      },
      requestRender(reason) { renders.push(reason); },
      render() { renders.push("sync"); },
    },
    calls,
    renders,
  };
}

test("a playing frame tick advances the frame through the light setFrame path", () => {
  withFakeRaf(({ setNow, pump }) => {
    const { ui, calls } = fixture();
    togglePlay(ui);
    assert.equal(ui.playing, true);
    setNow(1000); // ~24 frame steps at 24fps
    pump();
    assert.ok(calls.length > 0, "the tick must have advanced the frame");
    for (const call of calls) {
      assert.equal(call.fromPlayback, true, "every playback tick sets fromPlayback");
      assert.equal(call.refreshTimeline, false, "and must never trigger the full timeline rebuild");
    }
    stopPlay(ui);
    assert.equal(ui.playing, false);
  });
});

test("stopPlay halts the rAF loop so no further ticks land", () => {
  withFakeRaf(({ setNow, pump }) => {
    const { ui, calls } = fixture();
    togglePlay(ui);
    setNow(100);
    pump();
    const afterFirst = calls.length;
    stopPlay(ui);
    setNow(5000);
    pump();
    assert.equal(calls.length, afterFirst, "a stopped transport must not keep stepping frames");
  });
});
