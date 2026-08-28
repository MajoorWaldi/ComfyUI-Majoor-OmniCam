// Settings, localisation and the panelled-layout helper modules.
// Split out of director-modules.node.mjs to stay under the 800-line ceiling.

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getLocale, registerLocale, setLocale, t } from "../../web-src/i18n.js";
import { OMNICAM_SETTINGS, directorDefaults, registerOmniCamLocales } from "../../web-src/settings.js";
import { FR } from "../../web-src/locales/fr.js";
import { LENS_PRESETS, focalLengthToFov, formatFocalLength, formatFov, fovToFocalLength } from "../../web-src/lens.js";
import { DOPE_CHANNELS, dopeSheetRows } from "../../web-src/dope-sheet.js";
import { captureBaseline, smoothKeyframes } from "../../web-src/path-smoothing.js";
import { axisOpacity, axisScreenDirections, sortedByDepth } from "../../web-src/axis-gizmo.js";
import { DEFAULT_QUALITY, QUALITY_PRESETS, qualityPreset } from "../../web-src/viewport/studio.js";
import { SAMPLE_SIZE, createQualityMonitor, nextLevelDown, recordFrame, resetMonitor } from "../../web-src/viewport/adaptive-quality.js";
import { interpolationAfterDrag, pathKeyFromHit, screenToPlane } from "../../web-src/viewport/path-editing.js";
import { project } from "../../web-src/director/core.js";

test("OmniCam settings expose ComfyUI-compatible definitions", () => {
  const ids = OMNICAM_SETTINGS.map((setting) => setting.id);
  assert.deepEqual(new Set(ids).size, ids.length, "setting ids must be unique");
  for (const setting of OMNICAM_SETTINGS) {
    assert.ok(setting.id.startsWith("MajoorOmniCam."), `${setting.id} must be namespaced`);
    assert.ok(setting.name && setting.type, `${setting.id} needs a name and a type`);
    assert.notEqual(setting.defaultValue, undefined, `${setting.id} needs a defaultValue`);
    assert.ok(Array.isArray(setting.category), `${setting.id} needs a category path`);
  }
});

test("director defaults fall back cleanly when the settings store is unavailable", () => {
  registerOmniCamLocales({});
  assert.deepEqual(directorDefaults(), { fps: 24, renderMode: "omni_ref", encoder: "auto" });
});

test("director defaults read the ComfyUI settings store when present", () => {
  const values = {
    "MajoorOmniCam.Defaults.Fps": 30,
    "MajoorOmniCam.Defaults.RenderMode": "graybox",
    "MajoorOmniCam.Defaults.Encoder": "realtime",
  };
  registerOmniCamLocales({ extensionManager: { setting: { get: (id) => values[id] } } });
  assert.deepEqual(directorDefaults(), { fps: 30, renderMode: "graybox", encoder: "realtime" });
});

test("viewport language follows ComfyUI locale unless overridden", () => {
  registerOmniCamLocales({ extensionManager: { setting: { get: (id) => (id === "Comfy.Locale" ? "fr-FR" : "auto") } } });
  assert.equal(getLocale(), "fr");
  assert.equal(t("Playblast camera"), "Caméra de playblast");

  registerOmniCamLocales({ extensionManager: { setting: { get: (id) => (id === "MajoorOmniCam.Locale" ? "en" : "fr") } } });
  assert.equal(getLocale(), "en");
  assert.equal(t("Playblast camera"), "Playblast camera");
});

test("the French catalogue translates every UI string it declares", () => {
  registerLocale("fr", FR);
  setLocale("fr");
  for (const [source, translated] of Object.entries(FR)) {
    assert.equal(typeof translated, "string", `${source} must map to a string`);
    assert.notEqual(translated.trim(), "", `${source} must not map to an empty string`);
    assert.equal(t(source), translated);
  }
  setLocale("en");
});

test("focal length and FOV round-trip through the 24mm vertical gate", () => {
  for (const mm of LENS_PRESETS) {
    const fov = focalLengthToFov(mm);
    assert.ok(Math.abs(fovToFocalLength(fov) - mm) < 1e-6, `${mm}mm should round-trip`);
  }
  // The track's fov is vertical (THREE.PerspectiveCamera / projection.py), so
  // the 35mm-equivalent reference is the 24mm gate height: a 24mm lens is
  // exactly 53.13 degrees vertically.
  assert.ok(Math.abs(focalLengthToFov(24) - 53.1301) < 1e-3);
  assert.ok(Math.abs(fovToFocalLength(53.1301) - 24) < 1e-3);
});

test("every lens readout in the UI uses the same conversion", async () => {
  // cameras.js used to carry its own copy and render.js an 18/tan() variant, so
  // the presets, the Lens card and the HUD disagreed about the same camera.
  const cameras = await import("../../web-src/cameras.js");
  assert.equal(cameras.focalLengthToFov, focalLengthToFov);
  const sources = await Promise.all(
    ["cameras.js", "director/methods/render.js"].map((file) =>
      readFile(new URL(`../../web-src/${file}`, import.meta.url), "utf8")),
  );
  for (const source of sources) assert.ok(!/18\s*\/\s*Math\.tan/.test(source), "no ad-hoc mm formula");
});

test("focal length conversion clamps to the FOV range the track allows", () => {
  assert.equal(focalLengthToFov(0.0001), 150);
  assert.equal(focalLengthToFov(100000), 5);
  assert.equal(fovToFocalLength(1), fovToFocalLength(5));
  assert.equal(fovToFocalLength(400), fovToFocalLength(150));
});

test("lens readouts stay compact", () => {
  assert.equal(formatFocalLength(focalLengthToFov(50)), "50.0");
  assert.equal(formatFocalLength(focalLengthToFov(135)), "135");
  assert.equal(formatFocalLength(53.1301), "24.0");
  assert.equal(formatFov(39.6), "39.6°");
});

test("the dope sheet marks a channel only where it changes", () => {
  const keys = [
    { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 35, roll: 0 } },
    { frame: 10, camera: { position: [1, 0, 0], target: [0, 0, 0], fov: 35, roll: 0 } },
    { frame: 20, camera: { position: [2, 0, 0], target: [1, 0, 0], fov: 35, roll: 0 } },
    { frame: 30, camera: { position: [3, 0, 0], target: [1, 0, 0], fov: 50, roll: 12 } },
  ];
  const rows = Object.fromEntries(dopeSheetRows(keys).map((row) => [row.id, row.frames]));
  assert.deepEqual(rows.camera, [0, 10, 20, 30], "every key belongs to the master row");
  assert.deepEqual(rows.look_at, [0, 20], "look-at moves once");
  assert.deepEqual(rows.focal_length, [0, 30], "focal length moves once");
  assert.deepEqual(rows.roll, [0, 30], "roll moves once");
});

test("dope sheet rows honour the visibility filter and unsorted input", () => {
  const keys = [
    { frame: 20, camera: { position: [2, 0, 0], target: [0, 0, 0], fov: 35, roll: 0 } },
    { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 35, roll: 0 } },
  ];
  const rows = dopeSheetRows(keys, new Set(["camera", "roll"]));
  assert.deepEqual(rows.map((row) => row.id), ["camera", "roll"]);
  assert.deepEqual(rows[0].frames, [0, 20], "frames come back ascending");
});

test("dope sheet tolerates an empty or absent key list", () => {
  assert.deepEqual(dopeSheetRows([]).map((row) => row.frames), [[], [], [], []]);
  assert.deepEqual(dopeSheetRows(undefined).map((row) => row.id), DOPE_CHANNELS.map((c) => c.id));
});

const smoothingKeys = () => [
  { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 35 } },
  { frame: 10, camera: { position: [10, 0, 0], target: [0, 0, 0], fov: 35 } },
  { frame: 20, camera: { position: [2, 0, 0], target: [0, 0, 0], fov: 35 } },
  { frame: 30, camera: { position: [3, 0, 0], target: [0, 0, 0], fov: 35 } },
];

test("path smoothing never moves the first and last key", () => {
  const baseline = smoothingKeys();
  const smoothed = smoothKeyframes(baseline, 1);
  assert.deepEqual(smoothed[0].camera.position, [0, 0, 0]);
  assert.deepEqual(smoothed.at(-1).camera.position, [3, 0, 0]);
  assert.deepEqual(smoothed.map((key) => key.frame), [0, 10, 20, 30], "timing is untouched");
});

test("path smoothing pulls an interior key toward its neighbours", () => {
  const baseline = smoothingKeys();
  // The spike at frame 10 averages with 0 and 2 -> 4.
  assert.equal(smoothKeyframes(baseline, 1)[1].camera.position[0], 4);
  // Half strength lands halfway between the original 10 and that average.
  assert.equal(smoothKeyframes(baseline, 0.5)[1].camera.position[0], 7);
});

test("path smoothing at zero returns the baseline untouched", () => {
  const baseline = smoothingKeys();
  const smoothed = smoothKeyframes(baseline, 0);
  assert.deepEqual(smoothed.map((key) => key.camera.position), baseline.map((key) => key.camera.position));
});

test("path smoothing is non-destructive, so dragging back to zero restores exactly", () => {
  const original = smoothingKeys();
  const baseline = captureBaseline(original);
  smoothKeyframes(baseline, 1);
  smoothKeyframes(baseline, 0.42);
  assert.deepEqual(smoothKeyframes(baseline, 0), original, "baseline survives repeated smoothing");
  assert.deepEqual(baseline[1].camera.position, [10, 0, 0], "the baseline itself is never mutated");
});

test("path smoothing clamps its strength and tolerates short tracks", () => {
  const baseline = smoothingKeys();
  assert.deepEqual(smoothKeyframes(baseline, 5)[1].camera.position, smoothKeyframes(baseline, 1)[1].camera.position);
  assert.deepEqual(smoothKeyframes(baseline, -3)[1].camera.position, [10, 0, 0]);
  const twoKeys = baseline.slice(0, 2);
  assert.deepEqual(smoothKeyframes(twoKeys, 1).map((key) => key.camera.position), [[0, 0, 0], [10, 0, 0]]);
  assert.deepEqual(smoothKeyframes([], 1), []);
});

const lookFrom = (position, target = [0, 0, 0]) => ({ position, target, roll: 0, fov: 35 });

test("the axis gizmo places each world axis where the camera sees it", () => {
  // Looking down -Z from +Z: world +X is screen right, world +Y is screen up.
  const dirs = Object.fromEntries(axisScreenDirections(lookFrom([0, 0, 10])).map((a) => [a.id, a]));
  assert.ok(dirs.x.x > 0.99, "world +X points right");
  assert.ok(Math.abs(dirs.x.y) < 1e-6);
  assert.ok(dirs.y.y < -0.99, "world +Y points up, which is -y on screen");
  assert.ok(dirs.z.depth > 0.99, "world +Z points straight at the viewer");
});

test("the axis gizmo follows the camera around the subject", () => {
  // From +X looking back at the origin, world +X now points at the viewer.
  const dirs = Object.fromEntries(axisScreenDirections(lookFrom([10, 0, 0])).map((a) => [a.id, a]));
  assert.ok(dirs.x.depth > 0.99, "world +X now faces the viewer");
  assert.ok(Math.abs(dirs.z.x) > 0.99, "world +Z has swung to the side");
});

test("the axis gizmo respects camera roll", () => {
  const upright = Object.fromEntries(axisScreenDirections(lookFrom([0, 0, 10])).map((a) => [a.id, a]));
  const rolled = Object.fromEntries(
    axisScreenDirections({ ...lookFrom([0, 0, 10]), roll: 90 }).map((a) => [a.id, a]));
  assert.ok(Math.abs(upright.x.x - 1) < 1e-6 && Math.abs(rolled.x.x) < 1e-6, "+X leaves the horizontal");
  assert.ok(Math.abs(Math.abs(rolled.x.y) - 1) < 1e-6, "+X has rotated onto the vertical");
});

test("axes pointing away are drawn first and dimmed", () => {
  const dirs = axisScreenDirections(lookFrom([0, 0, 10]));
  const order = sortedByDepth(dirs).map((a) => a.depth);
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "painter's order, far to near");
  assert.ok(axisOpacity(1) > axisOpacity(-1), "the far tip is the faint one");
  assert.ok(axisOpacity(-1) >= 0.45 && axisOpacity(1) <= 1, "opacity stays in range");
});

test("the axis gizmo survives a degenerate camera", () => {
  const dirs = axisScreenDirections({ position: [0, 0, 0], target: [0, 0, 0] });
  assert.equal(dirs.length, 3);
  for (const axis of dirs) {
    assert.ok(Number.isFinite(axis.x) && Number.isFinite(axis.y) && Number.isFinite(axis.depth));
  }
});

test("applyCinemaLens resolves its conversion (regression: re-export left no local binding)", async () => {
  // `export { focalLengthToFov } from "./lens.js"` re-exports without creating a
  // local binding, so the call inside applyCinemaLens threw a ReferenceError and
  // every lens preset silently did nothing.
  const cameras = await import("../../web-src/cameras.js");
  assert.equal(typeof cameras.focalLengthToFov, "function");

  const fields = new Map([["camera-fov", { value: "" }], ["camera-focal", { value: "" }]]);
  const key = { frame: 0, camera: { fov: 35 } };
  const ui = {
    camera: { fov: 35 },
    activeCameraTrack: () => ({ keyframes: [key] }),
    activeKeyframe: () => key,
    scheduleSerialize() {}, render() {}, refreshKeyEditor() {}, setStatus() {},
    root: { querySelectorAll: (selector) => [fields.get(selector.match(/data-role="([^"]+)"/)[1])] },
  };
  cameras.applyCinemaLens(ui, 85);
  assert.equal(Math.round(Number(fields.get("camera-focal").value)), 85);
  assert.ok(Math.abs(key.camera.fov - focalLengthToFov(85)) < 1e-9, "the key took the new FOV");
});

test("activeKeyframe returns the camera key under the playhead (regression: it never existed)", async () => {
  // Five call sites used ui.activeKeyframe() -- the FOV field, the Roll field,
  // the lens presets and the new-key interpolation select -- but nothing ever
  // defined it, so all of them threw as soon as the camera had a keyframe.
  const { createSceneMethods } = await import("../../web-src/director/methods/scene.js");
  const methods = createSceneMethods(new Proxy({}, { get: () => () => {} }));
  assert.equal(typeof methods.activeKeyframe, "function", "the method must exist");

  const keys = [{ frame: 0, camera: {} }, { frame: 12, camera: {} }];
  const context = { frame: 12, activeCameraTrack: () => ({ keyframes: keys }) };
  assert.equal(methods.activeKeyframe.call(context), keys[1], "parked on a key returns it");
  assert.equal(methods.activeKeyframe.call({ ...context, frame: 7 }), null, "between keys returns null");
  assert.equal(methods.activeKeyframe.call({ frame: 0, activeCameraTrack: () => null }), null);
});

test("studio quality presets only ever change resolution, never the caster", () => {
  // Toggling castShadow or renderer.shadowMap.enabled after the first frame
  // changes shader defines that three.js will not recompile, which silently
  // removed every shadow. Quality must therefore stay resolution-only.
  for (const name of Object.keys(QUALITY_PRESETS)) {
    assert.equal(QUALITY_PRESETS[name].shadows, true, `${name} must keep a shadow caster`);
    assert.ok(QUALITY_PRESETS[name].shadowSize >= 512, `${name} needs a usable shadow map`);
  }
  assert.equal(qualityPreset("nonsense"), QUALITY_PRESETS[DEFAULT_QUALITY]);
});

test("the viewport never keeps a logarithmic depth buffer", async () => {
  // It is incompatible with shadow mapping; see the note in viewport.js.
  const source = await readFile(new URL("../../web-src/viewport.js", import.meta.url), "utf8");
  assert.match(source, /logarithmicDepthBuffer:\s*false/);
});

test("adaptive quality steps down only after a sustained slow run", () => {
  const monitor = createQualityMonitor("high");
  for (let i = 0; i < SAMPLE_SIZE - 1; i++) assert.equal(recordFrame(monitor, 40), null, "not enough samples yet");
  assert.equal(recordFrame(monitor, 40), "balanced", "a full slow window steps down once");
  assert.equal(monitor.quality, "balanced");
});

test("adaptive quality ignores a handful of slow frames", () => {
  const monitor = createQualityMonitor("high");
  let result = null;
  for (let i = 0; i < SAMPLE_SIZE * 2; i++) result = recordFrame(monitor, i % 5 === 0 ? 60 : 8) || result;
  assert.equal(result, null, "20% slow frames must not trigger a downgrade");
});

test("adaptive quality never climbs back up and stops at the bottom", () => {
  assert.equal(nextLevelDown("high"), "balanced");
  assert.equal(nextLevelDown("balanced"), "low");
  assert.equal(nextLevelDown("low"), null);
  const monitor = createQualityMonitor("low");
  for (let i = 0; i < SAMPLE_SIZE; i++) recordFrame(monitor, 100);
  assert.equal(monitor.quality, "low", "already at the bottom");
});

test("picking a quality by hand restarts the measurement", () => {
  const monitor = createQualityMonitor("high");
  for (let i = 0; i < SAMPLE_SIZE - 1; i++) recordFrame(monitor, 40);
  resetMonitor(monitor, "high");
  assert.equal(recordFrame(monitor, 40), null, "the previous slow run was discarded");
  assert.equal(monitor.downgraded, false);
});

const viewCam = (over = {}) => ({
  position: [0, 0, 10], target: [0, 0, 0], fov: 35, roll: 0,
  camera_type: "perspective", zoom: 1, near: 0.01, far: 10000, ...over,
});

test("dragging a path key round-trips through the projection", () => {
  // screenToPlane must be the exact inverse of project() on the key's own plane,
  // otherwise the handle drifts away from the cursor as you drag.
  const camera = viewCam();
  const anchor = [1.5, -0.75, 2];
  const [sx, sy] = project(anchor, camera, 800, 450);
  const world = screenToPlane([sx, sy], camera, anchor, 800, 450);
  for (let axis = 0; axis < 3; axis++) {
    assert.ok(Math.abs(world[axis] - anchor[axis]) < 1e-6, `axis ${axis} should round-trip`);
  }
});

test("dragging a path key slides it across the view without changing its depth", () => {
  const camera = viewCam();          // at z = +10, looking down -Z
  const anchor = [0, 0, 2];
  const moved = screenToPlane([700, 100], camera, anchor, 800, 450);
  // The drag plane faces the camera, so the component along the view direction
  // is what stays fixed -- the straight-line distance necessarily grows as the
  // point slides outward, exactly as a screen-space drag should behave.
  assert.ok(Math.abs(moved[2] - anchor[2]) < 1e-6, "depth along the view axis is preserved");
  assert.ok(moved[0] > anchor[0], "moving right in screen space moves right in world space");
  assert.ok(moved[1] > anchor[1], "moving up in screen space moves up in world space");
});

test("orthographic path drags follow the cursor too", () => {
  const camera = viewCam({ camera_type: "orthographic", zoom: 2 });
  const anchor = [0, 0, 0];
  const [sx, sy] = project(anchor, camera, 800, 450);
  const world = screenToPlane([sx, sy], camera, anchor, 800, 450);
  for (let axis = 0; axis < 3; axis++) assert.ok(Math.abs(world[axis] - anchor[axis]) < 1e-6);
});

test("a dragged key becomes a curve, and an authored bezier keeps its handles", () => {
  assert.equal(interpolationAfterDrag("linear"), "smooth");
  assert.equal(interpolationAfterDrag("hold"), "smooth");
  assert.equal(interpolationAfterDrag("ease"), "smooth");
  assert.equal(interpolationAfterDrag("bezier"), "bezier", "explicit handles survive");
});

test("only tagged markers resolve to a keyframe handle", () => {
  const tag = { cameraId: "camera_1", frame: 12 };
  assert.deepEqual(pathKeyFromHit({ object: { userData: { omnicamPathKey: tag } } }), tag);
  // The tag is found through parents, since a marker may be nested in a group.
  const child = { userData: {}, parent: { userData: { omnicamPathKey: tag } } };
  assert.deepEqual(pathKeyFromHit({ object: child }), tag);
  assert.equal(pathKeyFromHit({ object: { userData: {} } }), null);
  assert.equal(pathKeyFromHit(null), null);
});
