// The read-only 3D track viewer, plus the quality timeline and the overlay.
//
// The viewer's job is to be trusted: a mirrored path or a frustum pointing
// backwards would send someone chasing a solver bug that does not exist. So the
// geometry is asserted numerically here rather than left to a screenshot.

import assert from "node:assert/strict";
import test from "node:test";

import {
  QUALITY_COLORS,
  frameAtPosition,
  qualityBuckets,
  qualityDetails,
  qualityState,
} from "../../web-src/extractor/quality-timeline.js";
import {
  MAX_POINTS,
  MAX_VECTORS,
  decimate,
  projectPoint,
} from "../../web-src/extractor/tracking-overlay.js";
import { TrackControls, VIEWS } from "../../web-src/viewer/track-controls.js";
import { TrackViewer } from "../../web-src/viewer/track-viewer.js";
import {
  MAX_PASSIVE_FRUSTUMS,
  cameraBasis,
  frustumFrames,
  frustumPoints,
} from "../../web-src/viewer/track-frustums.js";
import { gridSpacing } from "../../web-src/viewer/track-grid.js";
import { TrackScene, pathBounds, samplePath, trackFrames } from "../../web-src/viewer/track-scene.js";
import { MAX_TRACK_POINTS, buildTrackPoints } from "../../web-src/viewer/track-points.js";

const BASE = { fov: 53, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };

function key(frame, position, target) {
  return { frame, interpolation: "linear", camera: { ...BASE, position, target } };
}

function track(keyframes, extra = {}) {
  return {
    schema_version: 1, fps: 24, duration_frames: 60, width: 1920, height: 1080,
    render_mode: "omni_ref", objects: [], metadata: {}, keyframes, ...extra,
  };
}

const DOLLY = track([
  key(0, [0, 1, 4], [0, 1, 0]),
  key(30, [0, 1, 2], [0, 1, 0]),
  key(59, [0, 1, 0.5], [0, 1, 0]),
]);

// --- frustum geometry ------------------------------------------------------

test("the camera basis points where the target is", () => {
  const { forward, right, up } = cameraBasis({ ...BASE, position: [0, 0, 5], target: [0, 0, 0] });
  assert.deepEqual(forward.map((v) => Math.round(v)), [0, 0, -1]);
  assert.ok(Math.abs(right[1]) < 1e-9, "right must stay level for a level camera");
  assert.ok(up[1] > 0.99, "up must point up");
});

test("roll rotates the basis around the viewing direction", () => {
  const { right, up, forward } = cameraBasis({ ...BASE, position: [0, 0, 5], target: [0, 0, 0], roll: 90 });
  assert.ok(Math.abs(right[1] - 1) < 1e-6 || Math.abs(right[1] + 1) < 1e-6, "right rolls onto the vertical");
  // The viewing direction itself is untouched by roll.
  assert.deepEqual(forward.map((v) => Math.round(v)), [0, 0, -1]);
  assert.ok(Math.abs(up[0]) > 0.99);
});

test("a frustum opens away from the camera, never behind it", () => {
  const { apex, corners } = frustumPoints({ ...BASE, position: [0, 0, 5], target: [0, 0, 0] }, { scale: 1 });
  assert.deepEqual(apex, [0, 0, 5]);
  for (const corner of corners) {
    assert.ok(corner[2] < apex[2], `corner ${corner} must sit in front of the camera`);
  }
});

test("a wider lens makes a wider frustum", () => {
  const narrow = frustumPoints({ ...BASE, fov: 20, position: [0, 0, 0], target: [0, 0, -1] }, { scale: 1 });
  const wide = frustumPoints({ ...BASE, fov: 90, position: [0, 0, 0], target: [0, 0, -1] }, { scale: 1 });
  assert.ok(Math.abs(wide.corners[0][1]) > Math.abs(narrow.corners[0][1]));
});

test("passive frustums are capped and evenly spread", () => {
  const frames = Array.from({ length: 500 }, (_, index) => index);
  const picked = frustumFrames(frames);
  assert.ok(picked.length <= MAX_PASSIVE_FRUSTUMS);
  assert.equal(picked[0], 0);
  assert.equal(picked[picked.length - 1], 499);
});

test("a short solve keeps every frustum", () => {
  assert.deepEqual(frustumFrames([0, 5, 10]), [0, 5, 10]);
});

// --- path sampling ---------------------------------------------------------

test("a sampled path is bounded regardless of duration", () => {
  const long = track([key(0, [0, 0, 0], [0, 0, -1]), key(9999, [0, 0, -50], [0, 0, -51])],
    { duration_frames: 10000 });
  assert.ok(samplePath(long).length <= 2000);
});

test("the sampled path starts and ends on the solved camera", () => {
  const points = samplePath(DOLLY);
  assert.deepEqual(points[0].map((v) => Math.round(v * 100) / 100), [0, 1, 4]);
  assert.deepEqual(points[points.length - 1].map((v) => Math.round(v * 100) / 100), [0, 1, 0.5]);
});

test("bounds describe the solve rather than the world", () => {
  const bounds = pathBounds([[0, 0, 0], [2, 0, 0], [2, 4, 0]]);
  assert.deepEqual(bounds.centre, [1, 2, 0]);
  assert.ok(bounds.extent > 4 && bounds.extent < 5);
});

test("an empty track samples to nothing rather than throwing", () => {
  assert.deepEqual(samplePath(null), []);
  assert.deepEqual(samplePath(track([])), []);
  assert.equal(pathBounds([]).extent, 1);
});

test("track frames come back sorted", () => {
  assert.deepEqual(trackFrames(track([key(30, [0, 0, 0]), key(0, [0, 0, 0])])), [0, 30]);
});

// --- scene -----------------------------------------------------------------

test("the scene holds raw and refined at once and switches between them", () => {
  const scene = new TrackScene();
  const refined = track([key(0, [0, 1, 4], [0, 1, 0]), key(59, [0, 1, 1], [0, 1, 0])]);
  scene.setRawTrack(DOLLY);
  scene.setRefinedTrack(refined);

  scene.setMode("raw");
  assert.equal(scene.activeTrack(), DOLLY);
  scene.setMode("refined");
  assert.equal(scene.activeTrack(), refined);
  scene.setMode("compare");
  assert.ok(scene.pathGroup.children.length >= 2, "compare draws both paths");
  scene.dispose();
});

test("an unknown mode falls back to refined rather than blanking the view", () => {
  const scene = new TrackScene();
  scene.setRefinedTrack(DOLLY);
  scene.setMode("nonsense");
  assert.equal(scene.mode, "refined");
  scene.dispose();
});

test("setting a frame moves the marker without touching the track", () => {
  const scene = new TrackScene();
  const snapshot = JSON.stringify(DOLLY);
  scene.setRefinedTrack(DOLLY);
  const camera = scene.setFrame(30);
  assert.ok(camera);
  assert.equal(JSON.stringify(DOLLY), snapshot, "the viewer must never mutate a track");
  assert.ok(Math.abs(scene.currentMarker.position.z - 2) < 0.01);
  scene.dispose();
});

test("the viewer exposes no way to edit a solved camera", () => {
  const scene = new TrackScene();
  for (const forbidden of ["setCameraPosition", "moveKey", "insertKey", "deleteKey", "setTangent"]) {
    assert.equal(typeof scene[forbidden], "undefined", `${forbidden} must not exist here`);
  }
  scene.dispose();
});

test("disposing the scene releases its groups", () => {
  const scene = new TrackScene();
  scene.setRefinedTrack(DOLLY);
  scene.dispose();
  assert.equal(scene.pathGroup.children.length, 0);
  assert.equal(scene.frustumGroup.children.length, 0);
  assert.equal(scene.tracks.refined, null);
});

test("landmarks use one bounded buffer geometry", () => {
  const points = Array.from({ length: 9000 }, (_, index) => ({ x: index, y: 0, z: 1, confidence: 1 }));
  const cloud = buildTrackPoints(points, { limit: MAX_TRACK_POINTS });
  assert.equal(cloud.geometry.attributes.position.count, 8000);
  cloud.geometry.dispose();
  cloud.material.dispose();
});

test("camera inspection uses the solved pose and fov without changing the frame", () => {
  const canvas = {
    width: 320, height: 180, clientWidth: 320, clientHeight: 180,
    addEventListener() {}, removeEventListener() {},
  };
  const viewer = new TrackViewer(canvas, {
    rendererFactory: () => ({ setClearColor() {}, setSize() {}, render() {}, dispose() {} }),
  });
  viewer.setRefinedTrack(DOLLY);
  viewer.setFrame(30);
  viewer.setInspectionView("camera");

  assert.equal(viewer.frame, 30);
  assert.deepEqual(viewer.renderCamera.position.toArray(), [0, 1, 2]);
  assert.equal(viewer.renderCamera.fov, 53);
  viewer.dispose();
});

// --- grid ------------------------------------------------------------------

test("grid spacing adapts to the size of the solve", () => {
  assert.ok(gridSpacing(0.1) < gridSpacing(10));
  assert.ok(gridSpacing(10) < gridSpacing(1000));
  for (const extent of [0.05, 1, 37, 1200]) {
    const spacing = gridSpacing(extent);
    assert.ok(spacing > 0 && Number.isFinite(spacing));
    const divisions = extent / spacing;
    assert.ok(divisions >= 1 && divisions <= 64, `${extent} gave ${divisions} divisions`);
  }
});

// --- controls --------------------------------------------------------------

function fakeCamera() {
  return {
    fov: 50,
    position: { x: 0, y: 0, z: 0, set(x, y, z) { Object.assign(this, { x, y, z }); } },
    lookAt() {},
  };
}

test("the preset views look from where they say they do", () => {
  const controls = new TrackControls(fakeCamera());
  controls.target = [0, 0, 0];
  controls.distance = 10;

  const top = controls.setView("top");
  assert.ok(top[1] > 9.9, "Top looks down from above");

  const front = controls.setView("front");
  assert.ok(Math.abs(front[1]) < 0.1 && front[2] > 9.9, "Front looks along +Z");

  const side = controls.setView("side");
  assert.ok(Math.abs(side[1]) < 0.1 && side[0] > 9.9, "Side looks along +X");
  assert.deepEqual(VIEWS, ["perspective", "top", "front", "side"]);
});

test("Fit Track frames the whole solve", () => {
  const controls = new TrackControls(fakeCamera());
  controls.fit({ centre: [1, 2, 3], extent: 20 });
  assert.deepEqual(controls.target, [1, 2, 3]);
  assert.ok(controls.distance > 20, "a 20-unit solve needs more than 20 units of standoff");
});

test("orbit stays clear of the poles so the view never flips", () => {
  const controls = new TrackControls(fakeCamera());
  for (let index = 0; index < 200; index += 1) controls.orbit(0, 100);
  assert.ok(controls.phi > 0 && controls.phi < Math.PI);
});

test("dolly cannot pass through the target or run away", () => {
  const controls = new TrackControls(fakeCamera());
  for (let index = 0; index < 500; index += 1) controls.dolly(-100);
  assert.ok(controls.distance >= 0.05);
  for (let index = 0; index < 5000; index += 1) controls.dolly(100);
  assert.ok(Number.isFinite(controls.distance));
});

test("a drag orbits, and shift-drag pans", () => {
  const controls = new TrackControls(fakeCamera());
  const before = [...controls.target];
  controls.beginDrag({ clientX: 0, clientY: 0, button: 0 });
  controls.moveDrag({ clientX: 40, clientY: 0 });
  controls.endDrag();
  assert.deepEqual(controls.target, before, "orbit must not move the target");

  controls.beginDrag({ clientX: 0, clientY: 0, button: 0, shiftKey: true });
  controls.moveDrag({ clientX: 40, clientY: 0 });
  controls.endDrag();
  assert.notDeepEqual(controls.target, before);
});

// --- quality timeline ------------------------------------------------------

test("quality states come from the backend label when it gives one", () => {
  assert.equal(qualityState({ state: "weak", coverage: 0.9 }), "weak");
  assert.equal(qualityState({ coverage: 0.9 }), "good");
  assert.equal(qualityState({ coverage: 0.5 }), "weak");
  assert.equal(qualityState({ coverage: 0.1 }), "bad");
});

test("a frame the backend never reported stays unknown, not good", () => {
  assert.equal(qualityState(null), "unknown");
  assert.equal(qualityState({}), "unknown");
  const buckets = qualityBuckets([{ frame: 0, coverage: 0.9 }], 10, 10);
  assert.equal(buckets[5].state, "unknown");
});

test("the worst reading in a bucket survives decimation", () => {
  const samples = [
    { frame: 0, coverage: 0.95 }, { frame: 1, coverage: 0.95 },
    { frame: 2, coverage: 0.1 }, { frame: 3, coverage: 0.95 },
  ];
  const buckets = qualityBuckets(samples, 4, 1);
  assert.equal(buckets[0].state, "bad", "a weak frame must not be averaged out of sight");
});

test("the timeline is bounded regardless of clip length", () => {
  const samples = Array.from({ length: 5000 }, (_, frame) => ({ frame, coverage: 0.9 }));
  assert.ok(qualityBuckets(samples, 5000, 600).length <= 600);
});

test("clicking the strip maps to a frame", () => {
  assert.equal(frameAtPosition(0, 100, 121), 0);
  assert.equal(frameAtPosition(100, 100, 121), 120);
  assert.equal(frameAtPosition(50, 100, 121), 60);
  assert.equal(frameAtPosition(-20, 100, 121), 0, "a click outside clamps rather than throwing");
});

test("frame details show only what the backend measured", () => {
  const rows = qualityDetails([{ frame: 68, coverage: 0.42, inliers: 63, state: "weak" }], 68);
  assert.deepEqual(rows, [
    ["Frame", "68"], ["Tracking state", "WEAK"], ["Coverage", "42%"], ["Inliers", "63"],
  ]);
});

test("a backend with no inlier count simply omits the row", () => {
  const rows = qualityDetails([{ frame: 3, coverage: 1, inliers: null, state: "good" }], 3);
  assert.ok(!rows.some(([label]) => label === "Inliers"));
});

test("every quality state has a colour", () => {
  for (const state of ["good", "weak", "bad", "unknown"]) {
    assert.match(QUALITY_COLORS[state], /^#[0-9a-f]{6}$/i);
  }
});

// --- tracking overlay ------------------------------------------------------

test("overlay diagnostics are capped", () => {
  const points = Array.from({ length: 4000 }, (_, index) => ({ x: index, y: index }));
  assert.equal(decimate(points, MAX_POINTS).length, MAX_POINTS);
  assert.equal(decimate(points, MAX_VECTORS).length, MAX_VECTORS);
});

test("decimation spreads across the frame rather than taking the first N", () => {
  const points = Array.from({ length: 1000 }, (_, index) => index);
  const kept = decimate(points, 10);
  assert.equal(kept[0], 0);
  assert.ok(kept[kept.length - 1] > 800, "the far end of the frame must be represented");
});

test("normalized and pixel feature coordinates both land on the canvas", () => {
  const projection = { sourceWidth: 1920, sourceHeight: 1080, width: 960, height: 540 };
  assert.deepEqual(projectPoint({ x: 0.5, y: 0.5 }, projection), [480, 270]);
  assert.deepEqual(projectPoint({ x: 960, y: 540 }, projection), [480, 270]);
});
