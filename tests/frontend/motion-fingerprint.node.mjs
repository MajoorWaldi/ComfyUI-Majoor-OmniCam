import test from "node:test";
import assert from "node:assert/strict";
import { motionFingerprint, motionFingerprintInput } from "../../web-src/shared/motion-fingerprint.js";

function baseState() {
  return {
    fps: 24, duration_frames: 120, render_mode: "omni_ref",
    playblast_camera_id: "camera_1",
    cameras: [{ id: "camera_1", camera: { position: [0, 1, 5] }, keyframes: [{ frame: 0 }] }],
    objects: [{ id: "subject", position: [0, 1.5, 0] }],
    active_camera_id: "camera_1",
    metadata: {},
  };
}

test("moving a keyframe changes the fingerprint", () => {
  const a = baseState();
  const b = baseState();
  b.cameras[0].camera.position = [0, 1, 6];
  assert.notEqual(motionFingerprint(a), motionFingerprint(b));
});

test("adding an object changes the fingerprint", () => {
  const a = baseState();
  const b = baseState();
  b.objects.push({ id: "extra", position: [1, 0, 0] });
  assert.notEqual(motionFingerprint(a), motionFingerprint(b));
});

test("render settings that shape the recorded frame change the fingerprint", () => {
  const a = baseState();
  const b = baseState();
  b.render_mode = "graybox";
  assert.notEqual(motionFingerprint(a), motionFingerprint(b));
  const c = baseState();
  c.fps = 30;
  assert.notEqual(motionFingerprint(a), motionFingerprint(c));
});

test("switching which camera you are editing does not change the fingerprint", () => {
  const a = baseState();
  const b = baseState();
  b.active_camera_id = "some_other_camera";
  assert.equal(motionFingerprint(a), motionFingerprint(b));
});

test("gizmo, snap and viewport-layout chrome do not change the fingerprint", () => {
  const a = baseState();
  const b = { ...baseState(), gizmo_mode: "rotate", spatial_snap_mode: "vertex", ui_density: "basic", view_mode: "top" };
  assert.equal(motionFingerprint(a), motionFingerprint(b));
});

test("a previous playblast's own manifest does not feed back into the fingerprint", () => {
  const a = baseState();
  const recorded = motionFingerprint(a);
  const b = baseState();
  b.metadata = {
    playblast: { format: "majoor.omnicam.playblast.v1", motion_scene_fingerprint: "deadbeef" },
    playblast_camera_id: "camera_1",
    playblast_camera_name: "Camera 1",
  };
  assert.equal(motionFingerprint(b), recorded);
});

test("the live fingerprint mirrored into metadata does not feed back on itself", () => {
  const a = baseState();
  const recorded = motionFingerprint(a);
  const b = baseState();
  b.metadata = { motion_scene_fingerprint_live: "whatever-was-here-before" };
  assert.equal(motionFingerprint(b), recorded);
});

test("unrelated production metadata still changes the fingerprint", () => {
  const a = baseState();
  const b = baseState();
  b.metadata = { production: "shot_04" };
  assert.notEqual(motionFingerprint(a), motionFingerprint(b));
});

test("key order never affects the fingerprint", () => {
  const ordered = { fps: 24, render_mode: "omni_ref", cameras: [] };
  const reordered = { cameras: [], render_mode: "omni_ref", fps: 24 };
  assert.equal(motionFingerprint(ordered), motionFingerprint(reordered));
});

test("motionFingerprintInput strips chrome without mutating the source state", () => {
  const state = baseState();
  const snapshot = JSON.stringify(state);
  motionFingerprintInput(state);
  assert.equal(JSON.stringify(state), snapshot);
});

test("a missing or malformed state fingerprints as the empty scene, not a crash", () => {
  assert.equal(typeof motionFingerprint(null), "string");
  assert.equal(motionFingerprint(undefined), motionFingerprint({}));
});

test("the same state always produces the same fingerprint", () => {
  const state = baseState();
  assert.equal(motionFingerprint(state), motionFingerprint(state));
  assert.equal(motionFingerprint(state), motionFingerprint(JSON.parse(JSON.stringify(state))));
});

test("recording a playblast does not change the fingerprint it is about to be compared against", () => {
  // Regression: uploadDirectorPlayblast() writes camera.recording_path (or
  // sequence.recording_path) onto the state *after* storePlayblastManifest()
  // takes its snapshot -- so a fingerprint that hashed recording_path would
  // read every playblast as outdated the instant it finished recording.
  const beforeUpload = {
    fps: 24,
    cameras: [{ id: "camera_1", position: [0, 1, 5] }],
  };
  const recordedFingerprint = motionFingerprint(beforeUpload);

  const afterUpload = {
    fps: 24,
    cameras: [{ id: "camera_1", position: [0, 1, 5], recording_path: "clip.webm [temp]" }],
  };
  assert.equal(motionFingerprint(afterUpload), recordedFingerprint);
});

test("a sequence recording's path is likewise excluded", () => {
  const before = { fps: 24, cameras: [], sequence: { enabled: true, cuts: [] } };
  const after = { fps: 24, cameras: [], sequence: { enabled: true, cuts: [], recording_path: "edit.webm [temp]" } };
  assert.equal(motionFingerprint(before), motionFingerprint(after));
});

test("a camera's actual geometry still changes the fingerprint alongside its recording_path", () => {
  const a = { cameras: [{ id: "camera_1", position: [0, 1, 5], recording_path: "a.webm [temp]" }] };
  const b = { cameras: [{ id: "camera_1", position: [0, 1, 9], recording_path: "a.webm [temp]" }] };
  assert.notEqual(motionFingerprint(a), motionFingerprint(b));
});
