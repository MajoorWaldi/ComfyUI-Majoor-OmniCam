// The Extractor's dope sheet, and the source viewer's loading rules.
//
// Two things are pinned here because both were silently wrong in a way no
// screenshot would show: a channel lane that keys on every frame regardless of
// whether the channel moved, and a `<video>` reloaded on every graph change,
// which blanked the stage at the moment the user pressed TRACK.

import assert from "node:assert/strict";
import test from "node:test";

import {
  CHANNEL_COLORS,
  GRADE_COLORS,
  TRACK_CHANNELS,
  channelKeys,
  drawTrackTimeline,
  frameAtTimelineX,
  healthSummary,
  timelineHeight,
  trackHealth,
} from "../../web-src/extractor/track-timeline.js";
import { SourceViewer, mediaErrorMessage } from "../../web-src/extractor/source-viewer.js";
import { renderSourceStageMedia } from "../../web-src/extractor/source-stage.js";

const BASE = { fov: 53, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };

function key(frame, camera) {
  return { frame, interpolation: "linear", camera: { ...BASE, ...camera } };
}

function track(keyframes, extra = {}) {
  return {
    schema_version: 1, fps: 24, duration_frames: 30, width: 1920, height: 1080,
    render_mode: "omni_ref", objects: [], metadata: {}, keyframes, ...extra,
  };
}

const DOLLY = track([
  key(0, { position: [0, 1, 5], target: [0, 1, 0] }),
  key(10, { position: [0, 1, 4], target: [0, 1, 0] }),
  key(20, { position: [0, 1, 3], target: [0, 1, 0], roll: 4 }),
  key(29, { position: [6, 1, 3], target: [0, 1, 0], roll: 4 }),
]);

// --- channel lanes ---------------------------------------------------------

test("a lane keys only where its own channel moved", () => {
  const keys = channelKeys(DOLLY);
  // Position changes on every key; the look-at never does, so it keys once.
  assert.deepEqual(keys.position, [0, 10, 20, 29]);
  assert.deepEqual(keys.target, [0], "a static look-at must not paint four identical diamonds");
  assert.deepEqual(keys.fov, [0], "a lens that never racks keys once");
  assert.deepEqual(keys.roll, [0, 20], "roll keys where the roll actually changes");
});

test("every declared channel gets a lane, even an empty one", () => {
  const keys = channelKeys(track([]));
  for (const { key: name } of TRACK_CHANNELS) assert.deepEqual(keys[name], [], `${name} lane`);
});

test("the timeline is tall enough for its bands, lanes and ruler", () => {
  assert.ok(timelineHeight() >= TRACK_CHANNELS.length * 18);
});

// --- grading ---------------------------------------------------------------

test("nothing is graded without limits, rather than passing by accident", () => {
  assert.equal(trackHealth(DOLLY, null), null, "no limit table means no grade");
  assert.equal(trackHealth(track([]), { max_speed: 1 }), null, "no keys means no grade");
  assert.equal(healthSummary(null), "No solved track yet");
});

test("the motion band flags the frames a real limit is exceeded on", () => {
  const report = trackHealth(DOLLY, { max_speed: 1 }, "generic");
  assert.ok(report, "a track with limits must produce a report");
  const flagged = report.frame_grades.filter((grade) => grade !== "ok").length;
  assert.ok(flagged > 0, "the 6-unit lurch in the last 9 frames must be flagged");
  assert.match(healthSummary(report), /over the motion limits/);
  // A generous limit must clear the same track: the band grades, it does not
  // just colour anything with movement in it.
  const relaxed = trackHealth(DOLLY, { max_speed: 1000 }, "generic");
  assert.deepEqual([...new Set(relaxed.frame_grades)], ["ok"]);
  assert.match(healthSummary(relaxed), /within limits/);
});

test("solve health and motion health stay separate colour scales", () => {
  // They answer different questions, so sharing a palette entry would make one
  // readable as the other.
  assert.equal(Object.keys(GRADE_COLORS).sort().join(","), "ok,over,warn");
  assert.equal(Object.keys(CHANNEL_COLORS).sort().join(","), "fov,position,roll,target");
});

// --- hit testing -----------------------------------------------------------

test("a click in the label gutter is frame zero, not a negative frame", () => {
  assert.equal(frameAtTimelineX(0, 900, 100), 0);
  assert.equal(frameAtTimelineX(-40, 900, 100), 0);
});

test("scrubbing spans the whole clip and never runs past the last frame", () => {
  assert.equal(frameAtTimelineX(900, 900, 100), 99);
  assert.equal(frameAtTimelineX(5000, 900, 100), 99);
  const middle = frameAtTimelineX((900 + 78) / 2, 900, 100);
  assert.ok(middle > 20 && middle < 80, `expected a mid-clip frame, got ${middle}`);
});

test("drawing without a canvas still reports the lanes it would have drawn", () => {
  const layout = drawTrackTimeline(null, { track: DOLLY, frameCount: 30 });
  assert.equal(layout.total, 30);
  assert.deepEqual(layout.keys.position, [0, 10, 20, 29]);
});

// --- the source viewer -----------------------------------------------------

class FakeVideo {
  constructor() {
    this.listeners = new Map();
    this.loads = 0;
    this.paused = true;
    this.currentTime = 0;
    this.readyState = 0;
    this.duration = 0;
    this.src = "";
  }

  addEventListener(name, handler) {
    this.listeners.set(name, [...(this.listeners.get(name) || []), handler]);
  }

  removeEventListener(name, handler) {
    this.listeners.set(name, (this.listeners.get(name) || []).filter((item) => item !== handler));
  }

  removeAttribute() { this.src = ""; }

  load() { this.loads += 1; }

  emit(name) {
    for (const handler of this.listeners.get(name) || []) handler();
  }
}

test("re-resolving the same source does not reload the element", () => {
  const video = new FakeVideo();
  const viewer = new SourceViewer(video, { fps: 24 });

  assert.equal(viewer.setSource("/view?filename=a.mp4"), true);
  assert.equal(video.loads, 1);
  // What refreshSource() does on every connection change and on TRACK.
  assert.equal(viewer.setSource("/view?filename=a.mp4"), false);
  assert.equal(viewer.setSource("/view?filename=a.mp4"), false);
  assert.equal(video.loads, 1, "the decoded frame must survive a re-resolve");

  assert.equal(viewer.setSource("/view?filename=b.mp4"), true);
  assert.equal(video.loads, 2, "a genuinely different source must load");
});

test("priming waits for a decoded frame instead of seeking metadata", () => {
  const video = new FakeVideo();
  const viewer = new SourceViewer(video, { fps: 24 });
  viewer.setSource("/view?filename=a.mp4");

  video.duration = 2;
  video.readyState = 1; // HAVE_METADATA: nothing to paint yet.
  video.emit("loadedmetadata");
  assert.equal(video.currentTime, 0, "seeking before a frame exists paints nothing");
  assert.equal(viewer.primed, false, "the viewer must stay ready to retry");

  video.readyState = 2; // HAVE_CURRENT_DATA: frame zero exists.
  video.emit("loadeddata");
  assert.ok(video.currentTime > 0, "the first frame must be decoded onto the stage");
  assert.equal(viewer.primed, true);
});

test("a video the browser cannot decode is reported, not left black", () => {
  const video = new FakeVideo();
  const failures = [];
  const viewer = new SourceViewer(video, { onError: (message) => failures.push(message) });
  viewer.setSource("/view?filename=prores.mov");

  video.error = { code: 4 };
  video.emit("error");
  assert.equal(failures.length, 1);
  assert.match(failures[0], /cannot play this container or codec/);
  assert.match(failures[0], /solve can still read it/,
    "the panel must not imply a preview failure lost the solve");
  assert.equal(viewer.error, failures[0]);

  // Setting the same URL again after a failure has to retry rather than be
  // deduplicated away, or a transient fetch error would be permanent.
  assert.equal(viewer.setSource("/view?filename=prores.mov"), true);
});

test("a decode error switches to a decoded fallback frame without rejecting the source", async () => {
  const video = new FakeVideo();
  const failures = [];
  const loads = [];
  const fallbackViewer = {
    async load(source, frame) {
      loads.push({ source, frame });
      return true;
    },
    dispose() {},
  };
  const viewer = new SourceViewer(video, { fallbackViewer, onError: (message) => failures.push(message) });
  const source = { kind: "managed", value: "omnicam/extractor_sources/prores.mov" };
  viewer.setSource("/view?filename=prores.mov", { source });

  video.error = { code: 3 };
  video.emit("error");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(viewer.mode, "fallback");
  assert.deepEqual(loads, [{ source, frame: 0 }]);
  assert.deepEqual(failures, []);
});


test("a fetch error remains an error instead of claiming fallback playback", () => {
  const video = new FakeVideo();
  const failures = [];
  const fallbackViewer = { load: async () => true, dispose() {} };
  const viewer = new SourceViewer(video, { fallbackViewer, onError: (message) => failures.push(message) });
  viewer.setSource("/view?filename=missing.mov", {
    source: { kind: "managed", value: "omnicam/extractor_sources/missing.mov" },
  });

  video.error = { code: 2 };
  video.emit("error");

  assert.equal(viewer.mode, "error");
  assert.equal(failures.length, 1);
  assert.match(failures[0], /could not be fetched/);
});

test("source mode exposes exactly one native, fallback, or upstream visual", () => {
  const elements = Object.fromEntries(["source-video", "fallback-preview", "upstream-preview"].map((role) => [role, {}]));
  const ui = { upstreamPreviewActive: false, sourceViewer: { mode: "native" }, $: (role) => elements[role] };
  assert.equal(renderSourceStageMedia(ui, true), "native");
  assert.deepEqual(Object.values(elements).map(({ hidden }) => hidden), [false, true, true]);

  ui.sourceViewer.mode = "fallback";
  assert.equal(renderSourceStageMedia(ui, true), "fallback");
  assert.deepEqual(Object.values(elements).map(({ hidden }) => hidden), [true, false, true]);

  ui.upstreamPreviewActive = true;
  assert.equal(renderSourceStageMedia(ui, true), "upstream");
  assert.deepEqual(Object.values(elements).map(({ hidden }) => hidden), [true, true, false]);
});

test("every MediaError code says something a user can act on", () => {
  for (const code of [1, 2, 3, 4]) {
    assert.ok(mediaErrorMessage({ code }, "/view?x").length > 20, `code ${code}`);
  }
  assert.match(mediaErrorMessage(null, ""), /no source URL was set/);
});
