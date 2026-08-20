import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { EditorHistory } from "../../web/omnicam-history.js";
import { applyCameraShake, cameraBasis, bezierEaseWithHandles, cloneCamera, defaultState, generateCameraPreset, lerpAngle, project, resolveChannelHandles, resolveHandles, sampleCamera, sanitizeState, worldTransform } from "../../web/omnicam-core.js";
import { uploadPlayblast } from "../../web/omnicam-playblast.js";
import { ObjectUrlRegistry, uploadManagedFile } from "../../web/omnicam-media.js";
import { getLocale, registerLocale, setLocale, t } from "../../web/omnicam-i18n.js";
import { activeCameraTrack, playblastCameraTrack, serializeEditorState } from "../../web/omnicam-state-sync.js";
import { captureRealtimePlayblast } from "../../web/omnicam-playblast.js";
import { onPointerDown } from "../../web/omnicam-viewport-controls.js";
import { findEditableKey } from "../../web-src/scene/edit-target.js";

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

test("viewport backgrounds use managed assets instead of serialized blob URLs", async () => {
  const source = await readFile(new URL("../../web-src/background-manager.js", import.meta.url), "utf8");
  assert.match(source, /uploadManagedFile/);
  assert.match(source, /uploaded\.path/);
  assert.doesNotMatch(source, /createObjectURL/);
});

test("background uploads discard stale requests and clean partial managed files", async () => {
  const source = await readFile(new URL("../../web-src/background-manager.js", import.meta.url), "utf8");
  assert.match(source, /backgroundRequestId/);
  assert.match(source, /cleanupUploads/);
  assert.match(source, /\/majoor\/omnicam\/cleanup/);
});

test("viewport background textures are bounded and stale loads are disposed", async () => {
  const source = await readFile(new URL("../../web-src/viewport/render.js", import.meta.url), "utf8");
  assert.match(source, /bgTextureCache\.size > 8/);
  assert.match(source, /generation !== this\.bgLoadGeneration/);
  assert.match(source, /tex\.dispose\(\)/);
});

test("fly navigation keeps Q for vertical movement", async () => {
  const source = await readFile(new URL("../../web-src/commands.js", import.meta.url), "utf8");
  assert.match(source, /key === "q" && !ui\.isNavigatingFly/);
});

test("upstream media preserves managed annotations and cancels stale work", async () => {
  const source = await readFile(new URL("../../web-src/dom-media.js", import.meta.url), "utf8");
  assert.match(source, /upstreamAssetValue/);
  assert.ok(source.includes("(input|output|temp)"));
  assert.match(source, /upstreamSyncId/);
  assert.match(source, /AbortController/);
});

test("desktop dialogs never fall back to unavailable browser modal APIs", async () => {
  const source = await readFile(new URL("../../web-src/director/ui-services.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /window\.(prompt|confirm)/);
});

test("render and disposal paths use revisions and release asynchronous resources", async () => {
  const renderSource = await readFile(new URL("../../web-src/viewport/render.js", import.meta.url), "utf8");
  const directorSource = await readFile(new URL("../../web-src/director/methods/render.js", import.meta.url), "utf8");
  assert.match(renderSource, /state\.__omnicamRevision \?\?/);
  assert.match(directorSource, /audioContext\?\.close/);
  assert.match(directorSource, /cancelAnimationFrame/);
  assert.match(directorSource, /upstreamFetchController\?\.abort/);
});

test("realtime playblast fails clearly when MediaRecorder is absent", async () => {
  await assert.rejects(
    captureRealtimePlayblast({ canvas: { captureStream() {} }, fps: 24, frameCount: 1, renderFrame() {}, mediaRecorder: null }),
    /MediaRecorder unsupported/,
  );
});

test("selecting a viewport object keeps camera navigation active", () => {
  const object = { id: "subject", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
  const camera = { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
  const ui = {
    state: { view_mode: "camera", objects: [object], cameras: [], gizmo_mode: "translate", gizmo_space: "world" },
    camera,
    canvas: { width: 800, height: 450, classList: { add() {} } },
    interactionElement: {
      focus() {},
      setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    webgl: { pick: () => ({ type: "object", id: object.id }) },
    selectedEntity: "camera",
    selectedObjectId: null,
    selectedKeyFrame: null,
    closeMenus() {},
    finishCameraEdit() {},
    refreshObjects() {},
    refreshKeys() {},
    refreshInspector() {},
    render() {},
    setStatus() {},
    beginCameraEdit() {},
    selectedObject() { return this.state.objects.find((item) => item.id === this.selectedObjectId) || null; },
  };
  onPointerDown(ui, {
    button: 0,
    pointerId: 1,
    clientX: 400,
    clientY: 225,
    altKey: false,
    shiftKey: false,
    target: { closest: () => null },
    preventDefault() {},
    stopPropagation() {},
  });
  assert.equal(ui.selectedEntity, "object");
  assert.equal(ui.selectedObjectId, object.id);
  assert.ok(ui.drag, "the same pointer gesture should initialize camera navigation");
});

test("a selected object cannot capture a plain left-drag through its gizmo", async () => {
  const source = await readFile(new URL("../../web-src/viewport-controls/interactions.js", import.meta.url), "utf8");
  assert.match(source, /canEditGizmo = canPick && \(e\.ctrlKey \|\| e\.metaKey\)/);
  assert.match(source, /const picked = canEditGizmo \? pickGizmo/);
});

test("selection rendering and outliner expose visible, contextual object feedback", async () => {
  const selectionSource = await readFile(new URL("../../web-src/viewport/scene.js", import.meta.url), "utf8");
  const outlinerSource = await readFile(new URL("../../web-src/scene/outliner.js", import.meta.url), "utf8");
  assert.match(selectionSource, /Box3Helper/);
  assert.doesNotMatch(selectionSource, /wireframe: true/);
  assert.match(selectionSource, /nextSelectionKey/);
  assert.match(outlinerSource, /openObjectContext\(event, object\.id\)/);
  assert.match(outlinerSource, /event\.key === "Enter" \|\| event\.key === " "/);
});

test("secondary click is contained for the OmniCam context menu", () => {
  const calls = [];
  onPointerDown({ root: {}, interactionElement: {} }, {
    button: 2,
    altKey: false,
    target: { closest: () => null },
    preventDefault() { calls.push("default"); },
    stopPropagation() { calls.push("propagation"); },
    stopImmediatePropagation() { calls.push("immediate"); },
  });
  assert.deepEqual(calls, ["default", "propagation", "immediate"]);
});

test("middle-button navigation bypasses picking on a selected object", () => {
  let pickCalls = 0;
  const camera = { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
  const ui = {
    state: { view_mode: "camera", editor_views: {}, objects: [], cameras: [], gizmo_mode: "translate", gizmo_space: "world" },
    camera,
    canvas: { width: 800, height: 450, classList: { add() {} } },
    interactionElement: {
      focus() {}, setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    webgl: { pick() { pickCalls += 1; return { type: "object", id: "subject" }; } },
    closeMenus() {}, beginCameraEdit() {}, selectedObject() { return null; },
  };
  onPointerDown(ui, {
    button: 1, pointerId: 2, clientX: 400, clientY: 225,
    altKey: false, shiftKey: false, target: { closest: () => null },
    preventDefault() {}, stopPropagation() {},
  });
  assert.equal(pickCalls, 0);
  assert.equal(ui.drag?.shift, true);
});

test("camera movement edits the existing playhead key without auto-key", () => {
  const key = { frame: 0, camera: cloneCamera(defaultState().camera), interpolation: "ease" };
  assert.equal(findEditableKey([key], 0, null, null), key);
});

test("every template action has an implementation reference", async () => {
  const template = await readFile(new URL("../../web-src/template.js", import.meta.url), "utf8");
  const sources = await Promise.all([
    "event-bindings.js", "event-bindings/transport-media.js",
    "event-bindings/viewport-settings.js", "event-bindings/editor-global.js",
    "director.js", "commands.js", "cameras.js", "scene.js", "scene/objects.js",
  ].map((name) => readFile(new URL(`../../web-src/${name}`, import.meta.url), "utf8")));
  const actions = [...template.matchAll(/data-act="([^"]+)"/g)].map((match) => match[1]);
  const missing = [...new Set(actions)].filter((action) => !sources.some((source) => source.includes(action)));
  assert.deepEqual(missing, []);
});

test("user-controlled names are not interpolated into innerHTML", async () => {
  const sources = await Promise.all(["timeline.js", "scene.js", "director.js"].map((name) => readFile(new URL(`../../web-src/${name}`, import.meta.url), "utf8")));
  for (const source of sources) {
    assert.doesNotMatch(source, /innerHTML\s*=.*(?:camera|object|trackingObj|activeCam)\.name/);
  }
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

test("editable Bézier tangents: modes, 2-sided handles and independent per-channel sampling", () => {
  const key = {
    frame: 10,
    tangents: {
      mode: "auto",
      channels: {
        pos_x: { mode: "free", out_x: 0.33, out_y: 5.0, in_x: -0.33, in_y: -2.0 },
        pos_y: { mode: "flat", out_x: 0.33, out_y: 0.0, in_x: -0.33, in_y: 0.0 },
        pos_z: { mode: "aligned", out_x: 0.35, out_y: 1.0, in_x: -0.35, in_y: -1.0 },
      },
    },
  };

  const handlesX = resolveChannelHandles(key, "pos_x", null, null, () => 0);
  assert.equal(handlesX.out_y, 5.0);
  assert.equal(handlesX.in_y, -2.0);
  assert.equal(handlesX.mode, "free");

  const handlesY = resolveChannelHandles(key, "pos_y", null, null, () => 0);
  assert.equal(handlesY.out_y, 0.0);
  assert.equal(handlesY.in_y, 0.0);
  assert.equal(handlesY.mode, "flat");

  const handlesZ = resolveChannelHandles(key, "pos_z", null, null, () => 0);
  assert.equal(handlesZ.mode, "aligned");
  assert.ok(Math.sign(handlesZ.in_x) === -Math.sign(handlesZ.out_x));

  // Verify independent channel sampling: altering X tangents does not alter Y or Z
  const stateA = {
    keyframes: [
      { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 35, roll: 0, zoom: 1 }, interpolation: "bezier", tangents: { channels: { pos_x: { mode: "free", out_y: 10.0 } } } },
      { frame: 20, camera: { position: [10, 10, 10], target: [0, 0, 0], fov: 35, roll: 0, zoom: 1 }, interpolation: "bezier" },
    ],
  };
  const stateB = {
    keyframes: [
      { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 35, roll: 0, zoom: 1 }, interpolation: "bezier", tangents: { channels: { pos_x: { mode: "free", out_y: -10.0 } } } },
      { frame: 20, camera: { position: [10, 10, 10], target: [0, 0, 0], fov: 35, roll: 0, zoom: 1 }, interpolation: "bezier" },
    ],
  };
  const sampleA = sampleCamera(stateA, 10);
  const sampleB = sampleCamera(stateB, 10);
  // X must be significantly different due to opposite out_y handles
  assert.notEqual(sampleA.position[0], sampleB.position[0]);
  // Y and Z must remain identical because X handle modifications do not mutate Y or Z
  assert.equal(sampleA.position[1], sampleB.position[1]);
  assert.equal(sampleA.position[2], sampleB.position[2]);
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

test("camera presets generate valid trajectory keyframes", () => {
  const orbit = generateCameraPreset("orbit_360", { duration_frames: 120, target: [0, 1, 0] });
  assert.equal(orbit.length, 5);
  assert.equal(orbit[0].frame, 0);
  assert.equal(orbit[4].frame, 119);
  assert.deepEqual(orbit[0].camera.target, [0, 1, 0]);

  const vertigo = generateCameraPreset("dolly_zoom", { duration_frames: 90, target: [0, 1.5, 0] });
  assert.equal(vertigo.length, 2);
  assert.ok(vertigo[0].camera.fov < vertigo[1].camera.fov);
});

test("camera dynamic target tracking constraint follows moving target object along timeline", () => {
  const state = {
    keyframes: [{ frame: 0, camera: { position: [0, 5, 10], target: [0, 0, 0] }, interpolation: "linear" }],
    target_object_id: "car",
    objects: [
      {
        id: "car",
        type: "cube",
        keyframes: [
          { frame: 0, transform: { position: [0, 1, 0], rotation: [0, 0, 0], size: [1, 1, 1] }, interpolation: "linear" },
          { frame: 100, transform: { position: [50, 1, 100], rotation: [0, 0, 0], size: [1, 1, 1] }, interpolation: "linear" },
        ],
      },
    ],
  };
  const at0 = sampleCamera(state, 0);
  assert.deepEqual(at0.target, [0, 1, 0]);
  const at50 = sampleCamera(state, 50);
  assert.deepEqual(at50.target, [25, 1, 50]);
  const at100 = sampleCamera(state, 100);
  assert.deepEqual(at100.target, [50, 1, 100]);
});

test("cinema lens conversion matches 35mm full frame standard", async () => {
  const { focalLengthToFov, fovToFocalLength, CINEMA_LENSES } = await import("../../web/omnicam-cameras.js");
  assert.equal(CINEMA_LENSES.length, 8);
  const fov50 = focalLengthToFov(50);
  assert.ok(fov50 > 38 && fov50 < 41);
  const fl50 = fovToFocalLength(fov50);
  assert.ok(Math.abs(fl50 - 50) < 0.1);
});

test("blocking scene sets generate spatial parallax objects and camera paths", async () => {
  const { applyBlockingScenePreset } = await import("../../web/omnicam-motion-presets.js");
  const ui = {
    checkpoint: () => {},
    state: { duration_frames: 100, active_camera_id: "c1", objects: [] },
    activeCameraTrack: () => ({ id: "c1", keyframes: [] }),
    serialize: () => {},
    refreshObjects: () => {},
    refreshKeys: () => {},
    setFrame: () => {},
    render: () => {},
    setStatus: () => {},
  };
  applyBlockingScenePreset(ui, "foreground_reveal");
  assert.equal(ui.state.objects.length, 3);
  assert.equal(ui.state.keyframes.length, 2);
  assert.equal(ui.state.objects[0].id, "fg_pillar");
});
