import assert from "node:assert/strict";
import test from "node:test";

import { FrameCoordinator } from "../../web-src/extractor/frame-coordinator.js";

function makeCoordinator({ frameCount = 10, fps = 10, loop = false } = {}) {
  const mediaFrames = [];
  const viewerFrames = [];
  const diagnosticFrames = [];
  const actions = [];
  const follow = [];
  const scheduled = [];
  const cancelled = [];
  let nextId = 0;
  const coordinator = new FrameCoordinator({
    media: { seekFrame: (frame) => mediaFrames.push(frame), pause() {} },
    getViewer: () => ({ setFrame: (frame) => viewerFrames.push(frame) }),
    showDiagnostics: (frame) => diagnosticFrames.push(frame),
    dispatch: (action) => actions.push(action),
    setFollow: (enabled) => follow.push(enabled),
    frameCount,
    fps,
    loop,
    requestAnimationFrame: (callback) => {
      const id = ++nextId;
      scheduled.push({ id, callback });
      return id;
    },
    cancelAnimationFrame: (id) => cancelled.push(id),
  });
  return { coordinator, mediaFrames, viewerFrames, diagnosticFrames, actions, follow, scheduled, cancelled };
}

test("a seek fans one clamped frame to media, 3-D, diagnostics, and serializable state", () => {
  const fixture = makeCoordinator({ frameCount: 8 });

  const frame = fixture.coordinator.seek(99, "manual");

  assert.equal(frame, 7);
  assert.deepEqual(fixture.mediaFrames, [7]);
  assert.deepEqual(fixture.viewerFrames, [7]);
  assert.deepEqual(fixture.diagnosticFrames, [7]);
  assert.deepEqual(fixture.actions, [{ type: "FRAME", frame: 7 }]);
  assert.deepEqual(fixture.follow, [false]);
});

test("manual seeking clamps without wrapping while playback wraps only with loop enabled", () => {
  const fixture = makeCoordinator({ frameCount: 4, fps: 2, loop: true });

  fixture.coordinator.seek(12, "manual");
  assert.equal(fixture.coordinator.frame, 3);

  fixture.coordinator.seek(2, "manual");
  fixture.coordinator.play();
  fixture.scheduled.shift().callback(1000);
  fixture.scheduled.shift().callback(2000);

  assert.equal(fixture.coordinator.frame, 0, "playback can wrap from the last frame to frame zero");
  assert.equal(fixture.actions.at(-1).frame, 0);
});

test("backend and media follow events retain follow-solve while manual seeks disable it", () => {
  const fixture = makeCoordinator();

  fixture.coordinator.seek(3, "backend");
  fixture.coordinator.seek(4, "media");
  assert.deepEqual(fixture.follow, []);

  fixture.coordinator.seek(5, "timeline");
  assert.deepEqual(fixture.follow, [false]);
});

test("the coordinator is the owner of media rate and frame-count configuration", () => {
  const settings = [];
  const coordinator = new FrameCoordinator({
    media: {
      setRate: (fps) => settings.push(["rate", fps]),
      setFrameCount: (frameCount) => settings.push(["frameCount", frameCount]),
    },
  });

  coordinator.setRate(30);
  coordinator.setFrameCount(240);

  assert.deepEqual(settings, [["rate", 30], ["frameCount", 240]]);
});

test("playback advances from requestAnimationFrame elapsed time and disposal cancels its pending frame", () => {
  const fixture = makeCoordinator({ frameCount: 20, fps: 10 });
  fixture.coordinator.seek(1, "manual");
  fixture.coordinator.play();
  fixture.scheduled.shift().callback(100);
  fixture.scheduled.shift().callback(450);

  assert.equal(fixture.coordinator.frame, 4, "350 ms at 10 fps advances three whole frames");
  fixture.coordinator.dispose();
  assert.equal(fixture.coordinator.playing, false);
  assert.deepEqual(fixture.cancelled, [3]);
});
