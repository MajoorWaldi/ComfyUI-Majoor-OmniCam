import test from "node:test";
import assert from "node:assert/strict";

import { EditorHistory } from "../../web/omnicam-history.js";
import { cameraBasis, bezierEaseWithHandles, cloneCamera, defaultState, lerpAngle, project, resolveHandles, sampleCamera, sanitizeState, worldTransform } from "../../web/omnicam-core.js";
import { uploadPlayblast } from "../../web/omnicam-playblast.js";
import { ObjectUrlRegistry, uploadManagedFile } from "../../web/omnicam-media.js";
import { getLocale, registerLocale, setLocale, t } from "../../web/omnicam-i18n.js";
import { activeCameraTrack, playblastCameraTrack, serializeEditorState } from "../../web/omnicam-state-sync.js";

test("director state sanitization preserves the canonical default camera", () => {
  const state = sanitizeState({});
  assert.equal(state.cameras.length, 1);
  assert.equal(state.active_camera_id, "camera_1");
  assert.deepEqual(sampleCamera(state, 0), cloneCamera(defaultState().camera));
});

test("orthographic editor projection does not depend on depth scale", () => {
  const camera = { position: [0, 0, 10], target: [0, 0, 0], up: [0, 1, 0], fov: 35, roll: 0, camera_type: "orthographic", zoom: 1, near: 0.01, far: 1000 };
  const near = project([1, 0, 0], camera, 1000, 500);
  const far = project([1, 0, -10], camera, 1000, 500);
  assert.equal(near[0], far[0]);
});

test("editor history restores undo and redo snapshots", () => {
  let value = "initial";
  const history = new EditorHistory({ capture: () => value, restore: (snapshot) => { value = snapshot; } });
  history.checkpoint("Rename"); value = "renamed";
  assert.equal(history.undo(), "Rename"); assert.equal(value, "initial");
  assert.equal(history.redo(), "Rename"); assert.equal(value, "renamed");
});

test("playblast upload uses the managed OmniCam route", async () => {
  let request;
  const api = { fetchApi: async (...args) => { request = args; return { ok: true, json: async () => ({ path: "omnicam/playblasts/test.webm [input]" }) }; } };
  const result = await uploadPlayblast(api, new Blob(["video"], { type: "video/webm" }));
  assert.equal(request[0], "/majoor/omnicam/upload_playblast");
  assert.equal(request[1].method, "POST");
  assert.equal(result.path, "omnicam/playblasts/test.webm [input]");
});

test("object URL registry revokes replaced and cleared blob URLs", () => {
  const revoked = []; let serial = 0; const registry = new ObjectUrlRegistry({ createObjectURL: () => `blob:${++serial}`, revokeObjectURL: (url) => revoked.push(url) });
  registry.replace("subject", {}); registry.replace("subject", {}); registry.clear();
  assert.deepEqual(revoked, ["blob:1", "blob:2"]); assert.equal(registry.urls.size, 0);
});

test("managed media upload reports backend errors", async () => {
  const api = { fetchApi: async () => ({ ok: false, text: async () => "invalid model" }) };
  await assert.rejects(() => uploadManagedFile(api, { route: "/upload", file: new File(["x"], "bad.glb") }), /invalid model/);
});

test("editor camera basis stays orthonormal for vertical cameras", () => {
  const { right, up, forward } = cameraBasis({ position: [0, 10, 0], target: [0, 0, 0], roll: 0 });
  const len = (v) => Math.hypot(v[0], v[1], v[2]);
  for (const vector of [right, up, forward]) {
    assert.ok(vector.every(Number.isFinite));
    assert.ok(Math.abs(len(vector) - 1) < 1e-6);
  }
  assert.deepEqual(forward, [0, -1, 0]);
});

test("editor camera basis survives coincident position and target", () => {
  const { forward } = cameraBasis({ position: [1, 2, 3], target: [1, 2, 3], roll: 0 });
  assert.deepEqual(forward, [0, 0, -1]);
  assert.ok(project([1, 2, 2], { position: [1, 2, 3], target: [1, 2, 3], fov: 35, near: 0.01, far: 100 }, 640, 360));
});

test("roll interpolation follows the shortest arc", () => {
  const norm = (v) => ((v % 360) + 360) % 360;
  assert.equal(norm(lerpAngle(350, 10, 0.5)), 0);
  assert.equal(norm(lerpAngle(10, 350, 0.5)), 0);
  const state = { keyframes: [
    { frame: 0, camera: { position: [0, 0, 5], target: [0, 0, 0], roll: 350, camera_type: "perspective" }, interpolation: "linear" },
    { frame: 10, camera: { position: [0, 0, 5], target: [0, 0, 0], roll: 10, camera_type: "perspective" }, interpolation: "linear" },
  ] };
  assert.equal(norm(sampleCamera(state, 5).roll), 0);
});

test("projection changes cut at the key boundary", () => {
  const state = { keyframes: [
    { frame: 0, camera: { position: [0, 0, 5], target: [0, 0, 0], camera_type: "perspective" }, interpolation: "linear" },
    { frame: 10, camera: { position: [0, 0, 5], target: [0, 0, 0], camera_type: "orthographic" }, interpolation: "linear" },
  ] };
  assert.equal(sampleCamera(state, 9).camera_type, "perspective");
  assert.equal(sampleCamera(state, 10).camera_type, "orthographic");
});

test("editor state serializes the playblast camera as the primary track", () => {
  const camera = cloneCamera(defaultState().camera);
  const ui = {
    camera,
    state: {
      ...defaultState(),
      cameras: [
        { id: "camera_1", name: "Wide", camera: cloneCamera(camera), keyframes: [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }] },
        { id: "camera_2", name: "Close", camera: { ...cloneCamera(camera), position: [1, 1, 1] }, keyframes: [{ frame: 0, camera: { ...cloneCamera(camera), position: [1, 1, 1] }, interpolation: "linear" }] },
      ],
      active_camera_id: "camera_1",
      playblast_camera_id: "camera_2",
      keyframes: [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }],
    },
    stateWidget: { value: "" },
    node: {},
  };
  assert.equal(activeCameraTrack(ui).id, "camera_1");
  assert.equal(playblastCameraTrack(ui).id, "camera_2");
  serializeEditorState(ui);
  const payload = JSON.parse(ui.stateWidget.value);
  assert.equal(payload.metadata.playblast_camera_id, "camera_2");
  assert.equal(payload.keyframes[0].camera.position[0], 1);
  assert.equal(payload.keyframes[0].interpolation, "linear");
});

test("i18n catalogs translate and fall back to the source string", () => {
  assert.equal(t("Scene"), "Scene");
  registerLocale("fr", { Scene: "Scène" });
  setLocale("fr");
  assert.equal(getLocale(), "fr");
  assert.equal(t("Scene"), "Scène");
  assert.equal(t("Untranslated label"), "Untranslated label");
  setLocale("en");
});

test("editable Bézier tangents: modes and easing", () => {
  const key = { frame: 10, value: 5, tangents: { mode: "vector", out_x: 0.4, out_y: 3, in_x: -0.4, in_y: 3 } };
  const vector = resolveHandles(key, null, null);
  assert.equal(vector.out_y, 0); // vector ignores stored slopes
  const free = resolveHandles({ ...key, tangents: { ...key.tangents, mode: "free" } }, null, null);
  assert.equal(free.out_y, 3);
  const aligned = resolveHandles({ ...key, tangents: { mode: "aligned", out_x: 0.3, out_y: 2, in_x: -0.5, in_y: -4 } }, null, null);
  // aligned mirrors direction while preserving each side's length
  assert.ok(Math.sign(aligned.in_x) === -Math.sign(aligned.out_x));
  const eased = bezierEaseWithHandles(0.5, { frame: 0, value: 0, tangents: { mode: "vector" } }, null, { frame: 10, value: 1 }, 10, 10);
  assert.ok(Math.abs(eased - 0.5) < 0.02); // vector ≈ linear
});

test("editor state sanitizes markers, playback range and snapping", () => {
  const state = sanitizeState({ duration_frames: 100, markers: [{ frame: 250, name: "Late" }, { frame: 10, name: "Drop", color: "#ff0000" }, { frame: "bad" }], playback_range: [-5, 500], snap_frames: 0 });
  assert.deepEqual(state.markers.map((m) => m.frame), [99, 10]); // clamped to duration, invalid dropped
  assert.deepEqual(state.playback_range, [0, 99]);
  assert.equal(state.snap_frames, 1);
  assert.equal(state.timecode_mode, "time");
});

test("world transform resolves parent chains and survives cycles", () => {
  const objects = [
    { id: "root", position: [10, 0, 0], rotation: [0, 90, 0], size: [2, 2, 2] },
    { id: "child", parent_id: "root", position: [1, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
    { id: "grandchild", parent_id: "child", position: [0, 5, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
    { id: "cycle_a", parent_id: "cycle_b", position: [1, 2, 3], rotation: [0, 0, 0], size: [1, 1, 1] },
    { id: "cycle_b", parent_id: "cycle_a", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
  ];
  const child = worldTransform(objects, objects[1]);
  // child local [1,0,0] scaled by 2 then rotated 90° around Y → [0,0,-2], then + root position
  assert.ok(Math.abs(child.position[2] + 2) < 1e-6);
  assert.ok(Math.abs(child.position[0] - 10) < 1e-6);
  const grandchild = worldTransform(objects, objects[2]);
  assert.ok(Math.abs(grandchild.position[1] - 10) < 1e-6); // y=5 scaled by root 2
  const cycled = worldTransform(objects, objects[3]);
  assert.ok(cycled.position.every(Number.isFinite)); // no infinite loop
});

test("track flags sanitize locked/muted/solo and parent ids", () => {
  const state = sanitizeState({
    cameras: [{ id: "c1", name: "A", camera: defaultState().camera, keyframes: [], locked: true, muted: 1 }],
    objects: [{ id: "o1", type: "cube", locked: true, parent_id: "root" }, { id: "o2", type: "cube", parent_id: 42 }],
  });
  assert.equal(state.cameras[0].locked, true);
  assert.equal(state.cameras[0].muted, true);
  assert.equal(state.cameras[0].solo, false);
  assert.equal(state.objects[0].locked, true);
  assert.equal(state.objects[0].parent_id, "root");
  assert.equal(state.objects[1].parent_id, null);
});
