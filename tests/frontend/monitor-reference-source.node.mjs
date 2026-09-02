import test from "node:test";
import assert from "node:assert/strict";
import {
  describeReferenceSource,
  directorPlayblastSource,
  isUnrecordedDirector,
  referenceSourceWarnLevel,
} from "../../web-src/monitor/reference-source.js";
import { motionFingerprint } from "../../web-src/shared/motion-fingerprint.js";

const fakeApi = { apiURL: (path) => `https://comfy.local${path}` };

function directorNode({ recordingPath = "", manifest = null, scene = {} } = {}) {
  const state = { ...scene, metadata: { ...(scene.metadata || {}), ...(manifest ? { playblast: manifest } : {}) } };
  return {
    comfyClass: "MajoorOmniCamDirector",
    widgets: [
      { name: "recording_path", value: recordingPath },
      { name: "state_json", value: JSON.stringify(state) },
    ],
  };
}

test("a Director with a recorded playblast resolves a real managed-file URL, not its viewport", () => {
  const node = directorNode({
    recordingPath: "omnicam_playblasts/shot.webm [temp]",
    manifest: { fps: 24, frame_count: 120, width: 1280, height: 720, duration_seconds: 5, encoder: "webcodecs" },
  });

  const source = directorPlayblastSource(fakeApi, node);

  assert.ok(source);
  assert.equal(source.kind, "director_playblast");
  assert.match(source.url, /^https:\/\/comfy\.local\/view\?/);
  assert.match(source.url, /filename=shot\.webm/);
  assert.match(source.url, /subfolder=omnicam_playblasts/);
  assert.match(source.url, /type=temp/);
  assert.equal(source.fps, 24);
  assert.equal(source.frameCount, 120);
  assert.equal(source.width, 1280);
  assert.equal(source.height, 720);
  assert.equal(source.durationSeconds, 5);
});

test("a Director with no recording_path yet resolves nothing to play", () => {
  const node = directorNode({ recordingPath: "" });
  assert.equal(directorPlayblastSource(fakeApi, node), null);
});

test("a non-Director origin never routes through the Director resolution", () => {
  const loadVideo = { comfyClass: "LoadVideo", widgets: [{ name: "video", value: "clip.mp4" }] };
  assert.equal(directorPlayblastSource(fakeApi, loadVideo), null);
});

test("no origin at all resolves nothing", () => {
  assert.equal(directorPlayblastSource(fakeApi, null), null);
});

test("a malformed state_json does not throw, just yields no manifest", () => {
  const node = {
    comfyClass: "MajoorOmniCamDirector",
    widgets: [
      { name: "recording_path", value: "clip.webm [temp]" },
      { name: "state_json", value: "{not json" },
    ],
  };
  const source = directorPlayblastSource(fakeApi, node);
  assert.ok(source);
  assert.equal(source.fps, undefined);
});

test("isUnrecordedDirector is true only for a connected Director with nothing recorded", () => {
  assert.equal(isUnrecordedDirector(directorNode({ recordingPath: "" })), true);
  assert.equal(isUnrecordedDirector(directorNode({ recordingPath: "clip.webm [temp]" })), false);
  assert.equal(isUnrecordedDirector({ comfyClass: "LoadVideo", widgets: [] }), false);
  assert.equal(isUnrecordedDirector(null), false);
});

test("the reference-source label names the recorded playblast's real metrics", () => {
  const node = directorNode({ recordingPath: "clip.webm [temp]" });
  const source = directorPlayblastSource(fakeApi, {
    ...node,
    widgets: [
      ...node.widgets.filter((w) => w.name !== "state_json"),
      { name: "state_json", value: JSON.stringify({
        metadata: { playblast: { fps: 24, frame_count: 120, width: 1280, height: 720, duration_seconds: 5 } },
      }) },
    ],
  });
  assert.equal(
    describeReferenceSource(source, node),
    "● Director playblast · 1280x720 · 24fps · 120 frames · 5.00s",
  );
});

test("the reference-source label warns instead of claiming a recording exists", () => {
  const node = directorNode({ recordingPath: "" });
  assert.equal(
    describeReferenceSource(null, node),
    "⚠ Director connected, no playblast recorded yet — showing the live viewport.",
  );
});

test("the reference-source label is silent for an unrelated upstream node", () => {
  const loadVideo = { comfyClass: "LoadVideo", widgets: [] };
  assert.equal(describeReferenceSource(null, loadVideo), "");
});

test("a fingerprint matching the current scene is fresh, not outdated", () => {
  const scene = { fps: 24, cameras: [{ id: "a", position: [0, 1, 5] }] };
  const node = directorNode({
    recordingPath: "clip.webm [temp]",
    scene,
    manifest: { fps: 24, motion_scene_fingerprint: motionFingerprint(scene) },
  });
  const source = directorPlayblastSource(fakeApi, node);
  assert.equal(source.outdated, false);
  assert.equal(referenceSourceWarnLevel(source, node), "");
  assert.doesNotMatch(describeReferenceSource(source, node), /outdated/i);
});

test("moving a key after recording marks the playblast outdated", () => {
  const recordedScene = { fps: 24, cameras: [{ id: "a", position: [0, 1, 5] }] };
  const editedScene = { fps: 24, cameras: [{ id: "a", position: [0, 1, 9] }] };
  const node = directorNode({
    recordingPath: "clip.webm [temp]",
    scene: editedScene,
    manifest: { fps: 24, motion_scene_fingerprint: motionFingerprint(recordedScene) },
  });
  const source = directorPlayblastSource(fakeApi, node);
  assert.equal(source.outdated, true);
  assert.equal(referenceSourceWarnLevel(source, node), "2");
  assert.match(describeReferenceSource(source, node), /⚠ Playblast outdated \(re-record before compiling\)/);
  // Still names the actual video that will be sent, outdated or not.
  assert.match(describeReferenceSource(source, node), /24fps/);
});

test("a playblast recorded before this check existed is not treated as outdated", () => {
  const node = directorNode({
    recordingPath: "clip.webm [temp]",
    scene: { fps: 24, cameras: [{ id: "a" }] },
    manifest: { fps: 24, frame_count: 24 }, // no motion_scene_fingerprint at all
  });
  const source = directorPlayblastSource(fakeApi, node);
  assert.equal(source.outdated, false);
  assert.equal(referenceSourceWarnLevel(source, node), "");
});

test("editing a different camera than the one recorded does not flag outdated", () => {
  const scene = { fps: 24, active_camera_id: "a", cameras: [{ id: "a" }] };
  const node = directorNode({
    recordingPath: "clip.webm [temp]",
    scene: { ...scene, active_camera_id: "somewhere_else" },
    manifest: { motion_scene_fingerprint: motionFingerprint(scene) },
  });
  assert.equal(directorPlayblastSource(fakeApi, node).outdated, false);
});
