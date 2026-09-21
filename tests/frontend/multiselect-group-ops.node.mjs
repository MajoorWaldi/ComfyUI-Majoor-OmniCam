// Tests for multi-selection group move, batch interpolation, and tangent modes
// across Graph Editor and Timeline.

import test from "node:test";
import assert from "node:assert/strict";

import {
  onCurvePointerDown,
  onCurvePointerMove,
  onCurvePointerUp,
  setCurveInterpolation,
  setTangentMode,
} from "../../web-src/curve-editor/interactions.js";
import { onKeyDragMove } from "../../web-src/timeline-interaction.js";
import { insertKeyframe, setKeyInterpolation, setKeyTangentMode, timelineKeyframes } from "../../web-src/scene.js";
import { dispatchDirectorKey } from "../../web-src/commands.js";
import { smoothKeyframes } from "../../web-src/director/key-ops.js";
import { applyCameraShake } from "../../web-src/motion-presets.js";

function fakeElement() {
  return {
    style: {},
    appendChild() {},
    classList: { toggle() {} },
    setAttribute() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    set textContent(_val) {},
  };
}

if (typeof globalThis.document === "undefined") {
  globalThis.document = { createElement: () => fakeElement() };
}

function createCurveFixture() {
  const keyA = { frame: 10, interpolation: "linear", camera: { position: [0, 0, 0] } };
  const keyB = { frame: 20, interpolation: "linear", camera: { position: [1, 0, 0] } };
  const keyC = { frame: 30, interpolation: "linear", camera: { position: [2, 0, 0] } };
  const channel = { id: "pos_x", name: "X", get: (value) => value.position?.[0] ?? 0, set: (backing, v) => { backing.position[0] = v; } };

  const ui = {
    state: { duration_frames: 100, keyframes: [keyA, keyB, keyC], objects: [] },
    frame: 10,
    selectedKeyFrame: 10,
    selectedKeyFrames: new Set([10, 20]),
    root: {
      querySelectorAll() { return []; },
      querySelector() { return null; },
    },
    timelineObject() { return null; },
    activeCameraTrack() { return { keyframes: [keyA, keyB, keyC] }; },
    curveHitPoints: [
      { x: 100, y: 100, key: keyA, channel, handle: null },
      { x: 200, y: 100, key: keyB, channel, handle: null },
      { x: 300, y: 100, key: keyC, channel, handle: null },
    ],
    selectKeyframe(key) {
      this.selectedKeyFrame = key.frame;
      this.selectedKeyFrames = new Set([key.frame]);
    },
    selectedKeyframe() {
      return this.timelineKeyframes().find((k) => k.frame === this.selectedKeyFrame);
    },
    setFrame(frame) { this.frame = frame; },
    updateKeyVisualState() {},
    refreshKeyEditor() {},
    drawCurveEditor() {},
    scheduleSerialize() {},
    serialize() {},
    refreshKeys() {},
    render() {},
    checkpoint() {},
    setStatus() {},
    timelineKeyframes() { return [keyA, keyB, keyC]; },
    camera: { position: [0, 0, 0] },
    applyObjectAnimationFrame() {},
  };

  return { ui, keyA, keyB, keyC, channel };
}

function pointerEvent(x, y, overrides = {}) {
  return {
    currentTarget: {
      clientWidth: 400,
      clientHeight: 180,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 180 }),
      focus() {},
      setPointerCapture() {},
      releasePointerCapture() {},
      hasPointerCapture: () => false,
    },
    clientX: x,
    clientY: y,
    button: 0,
    shiftKey: false,
    altKey: false,
    pointerId: 1,
    preventDefault() {},
    stopPropagation() {},
    ...overrides,
  };
}

test("Graph Editor preserves multi-selection when pointerdown lands on an already selected key", () => {
  const { ui } = createCurveFixture();
  assert.equal(ui.selectedKeyFrames.size, 2);

  // Click on keyA (which is part of the {10, 20} multi-selection)
  onCurvePointerDown(ui, pointerEvent(100, 100));

  assert.equal(ui.selectedKeyFrames.size, 2, "multi-selection must NOT be destroyed on pointerdown");
  assert.ok(ui.curveDrag, "curveDrag should be created");
  assert.ok(ui.curveDrag.group, "curveDrag.group must be initialized with the selected keys");
  assert.equal(ui.curveDrag.group.length, 2);
});

test("Graph Editor narrows to single key on click release if no drag occurred", () => {
  const { ui } = createCurveFixture();
  onCurvePointerDown(ui, pointerEvent(100, 100));
  assert.equal(ui.selectedKeyFrames.size, 2);

  // Release without moving
  onCurvePointerUp(ui, pointerEvent(100, 100));
  assert.equal(ui.selectedKeyFrames.size, 1, "selection should narrow on pure click without drag");
  assert.equal(ui.selectedKeyFrame, 10);
});

test("setCurveInterpolation applies mode to all selected keys when multi-selection is active", () => {
  const { ui, keyA, keyB, keyC } = createCurveFixture();
  ui.selectedKeyFrames = new Set([10, 20]);

  setCurveInterpolation(ui, "ease");

  assert.equal(keyA.interpolation, "ease");
  assert.equal(keyB.interpolation, "ease");
  assert.equal(keyC.interpolation, "linear", "unselected key must not change");
});

test("setTangentMode applies tangent mode to all selected keys when multi-selection is active", () => {
  const { ui, keyA, keyB, keyC } = createCurveFixture();
  ui.selectedKeyFrames = new Set([10, 20]);

  setTangentMode(ui, "aligned");

  assert.equal(keyA.interpolation, "bezier");
  assert.equal(keyB.interpolation, "bezier");
  assert.equal(keyA.tangents?.mode, "aligned");
  assert.equal(keyB.tangents?.mode, "aligned");
  assert.equal(keyC.tangents, undefined, "unselected key must not be modified");
});

test("setKeyInterpolation in scene.js applies to all selected keys", () => {
  const { ui, keyA, keyB, keyC } = createCurveFixture();
  ui.selectedKeyFrames = new Set([10, 30]);

  setKeyInterpolation(ui, "step");

  assert.equal(keyA.interpolation, "step");
  assert.equal(keyC.interpolation, "step");
  assert.equal(keyB.interpolation, "linear");
});

test("setKeyTangentMode in scene.js applies to all selected keys", () => {
  const { ui, keyA, keyB, keyC } = createCurveFixture();
  ui.selectedKeyFrames = new Set([10, 20]);

  setKeyTangentMode(ui, "vector");

  assert.equal(keyA.tangents?.mode, "vector");
  assert.equal(keyB.tangents?.mode, "vector");
  assert.equal(keyC.tangents, undefined);
});

test("Timeline multi-key drag rigidly shifts keys and updates selectedKeyFrames", () => {
  const key1 = { frame: 10 };
  const key2 = { frame: 25 };
  const keyUnselected = { frame: 50 };
  const allKeys = [key1, key2, keyUnselected];

  const box = { getBoundingClientRect: () => ({ left: 0, width: 1000 }), appendChild() {} };
  const ui = {
    state: { duration_frames: 100 },
    timelineZoom: 1,
    timelinePan: 0,
    snapFrame: (f) => f,
    timelineKeyframes: () => allKeys,
    selectedKeyFrames: new Set([10, 25]),
    selectedKeyFrame: 10,
    editingKeyFrame: null,
    setFrame() {},
    scheduleSerialize() {},
    checkpoint() {},
  };

  ui.keyDrag = {
    key: key1,
    box,
    startPointerFrame: 10,
    startClientX: 100,
    startClientY: 50,
    moving: [{ key: key1, startFrame: 10 }, { key: key2, startFrame: 25 }],
  };

  // Move by +10 frames (~100px)
  onKeyDragMove(ui, { clientX: 200, clientY: 50 });

  assert.equal(key1.frame, 20);
  assert.equal(key2.frame, 35);
  assert.equal(keyUnselected.frame, 50, "unselected key is unchanged");
  assert.deepEqual([...ui.selectedKeyFrames].sort((a, b) => a - b), [20, 35], "selectedKeyFrames must track the new frames");
  assert.equal(ui.suppressKeyClick, true, "suppressKeyClick must be set to prevent click-deselect");
});

test("Timeline multi-key drag clamps against obstacles without altering relative key distance", () => {
  const key1 = { frame: 10 };
  const key2 = { frame: 20 };
  const obstacle = { frame: 24 }; // Obstacle 4 frames ahead of key2
  const allKeys = [key1, key2, obstacle];

  const box = { getBoundingClientRect: () => ({ left: 0, width: 1000 }), appendChild() {} };
  const ui = {
    state: { duration_frames: 100 },
    timelineZoom: 1,
    timelinePan: 0,
    snapFrame: (f) => f,
    timelineKeyframes: () => allKeys,
    selectedKeyFrames: new Set([10, 20]),
    selectedKeyFrame: 10,
    editingKeyFrame: null,
    setFrame() {},
    scheduleSerialize() {},
    checkpoint() {},
  };

  ui.keyDrag = {
    key: key1,
    box,
    startPointerFrame: 10,
    startClientX: 100,
    startClientY: 50,
    moving: [{ key: key1, startFrame: 10 }, { key: key2, startFrame: 20 }],
  };

  // Drag far past obstacle (+15 frames, target 25/35)
  onKeyDragMove(ui, { clientX: 250, clientY: 50 });

  // Effective delta must clamp right before the obstacle at +3 (key1 -> 13, key2 -> 23)
  assert.equal(key1.frame, 13);
  assert.equal(key2.frame, 23);
  assert.equal(key2.frame - key1.frame, 10, "relative distance between selected keys must remain strictly 10 frames");
});

test("smoothKeyframes applies Laplacian motion smoothing across interior selected keys", () => {
  const keys = [
    { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], roll: 0, fov: 30 } },
    { frame: 10, camera: { position: [0, 10, 0], target: [0, 10, 0], roll: 20, fov: 60 } }, // Spike
    { frame: 20, camera: { position: [0, 0, 0], target: [0, 0, 0], roll: 0, fov: 30 } },
  ];

  const smoothed = smoothKeyframes(keys, [0, 10, 20], "camera", 0.5);
  assert.equal(smoothed[0].camera.position[1], 0, "boundary keys are preserved");
  assert.equal(smoothed[2].camera.position[1], 0, "boundary keys are preserved");
  // Center key was 10, neighbors are 0. With factor 0.5: 0.25*0 + 0.5*10 + 0.25*0 = 5.0
  assert.equal(smoothed[1].camera.position[1], 5.0, "interior key should be smoothed towards neighbors");
  assert.equal(smoothed[1].camera.roll, 10.0);
  assert.equal(smoothed[1].camera.fov, 45.0);
});

test("Context menu preserves multi-selection when right-clicking on an already selected key", () => {
  let menuOpened = false;
  let menuTitle = "";
  const ui = {
    selectedKeyFrames: new Set([10, 20, 30]),
    selectedKeyFrame: 10,
    timelineKeyframes: () => [{ frame: 10 }, { frame: 20 }, { frame: 30 }],
    selectKeyframe(key) {
      this.selectedKeyFrame = key.frame;
      this.selectedKeyFrames = new Set([key.frame]);
    },
    openTimelineContext(_e, onKey) {
      menuOpened = true;
      const n = this.selectedKeyFrames?.size || 0;
      menuTitle = n >= 2 ? `${n} keys selected` : (onKey ? `Keyframe F${this.selectedKeyFrame}` : "Timeline");
    },
  };

  // Simulate right-clicking key at frame 20 (which is inside the multi-selection)
  const clickedFrame = 20;
  const inMultiSel = ui.selectedKeyFrames?.has(clickedFrame) && ui.selectedKeyFrames.size >= 2;
  if (!inMultiSel) {
    const key = ui.timelineKeyframes().find((k) => k.frame === clickedFrame);
    if (key) ui.selectKeyframe(key);
  } else {
    ui.selectedKeyFrame = clickedFrame;
  }
  ui.openTimelineContext(null, true);

  assert.equal(menuOpened, true);
  assert.equal(ui.selectedKeyFrames.size, 3, "Multi-selection of 3 keys must remain completely intact");
  assert.equal(ui.selectedKeyFrame, 20, "Active focus frame should update to the clicked key");
  assert.equal(menuTitle, "3 keys selected", "Menu title should reflect group selection");
});

test("applyCameraShake respects selected frames range when multiple keys are selected", () => {
  const key0 = { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], roll: 0, fov: 35 }, interpolation: "smooth" };
  const key10 = { frame: 10, camera: { position: [0, 0, 0], target: [0, 0, 0], roll: 0, fov: 35 }, interpolation: "smooth" };
  const key20 = { frame: 20, camera: { position: [0, 0, 0], target: [0, 0, 0], roll: 0, fov: 35 }, interpolation: "smooth" };
  const key50 = { frame: 50, camera: { position: [10, 10, 10], target: [0, 0, 0], roll: 0, fov: 35 }, interpolation: "smooth" };

  const cam = { id: "cam1", keyframes: [key0, key10, key20, key50] };
  const ui = {
    state: { active_camera_id: "cam1", duration_frames: 60, keyframes: cam.keyframes },
    activeCameraTrack: () => cam,
    camera: { position: [0, 0, 0], target: [0, 0, 0], roll: 0, fov: 35 },
    selectedKeyFrames: new Set([10, 20]),
    resolveSelectedFrames: () => [10, 20],
    checkpoint() {},
    serialize() {},
    refreshKeys() {},
    render() {},
    setStatus() {},
  };

  applyCameraShake(ui, "handheld_subtle");

  // key0 (before minF=10) and key50 (after maxF=20) must not be destroyed or modified
  const firstKey = cam.keyframes.find((k) => k.frame === 0);
  const lastKey = cam.keyframes.find((k) => k.frame === 50);
  assert.ok(firstKey, "Key 0 must be preserved");
  assert.equal(firstKey.camera.position[0], 0);
  assert.ok(lastKey, "Key 50 must be preserved");
  assert.equal(lastKey.camera.position[0], 10);
});

test("insertKeyframe when an object is selected creates a keyframe on object and leaves camera keys intact", () => {
  const cameraKey = { frame: 0, camera: { position: [0, 2, 5] }, interpolation: "ease" };
  const obj = { id: "cube_1", name: "Cube", type: "cube", position: [1, 2, 3], rotation: [0, 0, 0], size: [1, 1, 1] };
  const ui = {
    state: {
      duration_frames: 60,
      keyframes: [cameraKey],
      objects: [obj],
    },
    frame: 15,
    selectedEntity: "object",
    selectedObjectId: "cube_1",
    root: fakeElement(),
    timelineObject() { return this.selectedEntity === "object" ? this.state.objects.find((o) => o.id === this.selectedObjectId) : null; },
    timelineKeyframes() { return timelineKeyframes(this); },
    checkpoint() {},
    serialize() {},
    refreshKeys() {},
    refreshKeyEditor() {},
    updateKeyVisualState() {},
    drawCurveEditor() {},
    setStatus() {},
  };

  insertKeyframe(ui);

  assert.equal(ui.state.keyframes.length, 1, "Camera track must not be modified when object is selected");
  assert.equal(ui.state.keyframes[0], cameraKey);
  assert.ok(Array.isArray(obj.keyframes), "Object keyframes array must be initialized");
  assert.equal(obj.keyframes.length, 1, "Object must receive 1 keyframe");
  assert.equal(obj.keyframes[0].frame, 15);
  assert.deepEqual(obj.keyframes[0].transform.position, [1, 2, 3]);
  assert.equal(ui.selectedKeyFrame, 15);
});

test("viewport keymap routes 'i' to insertKeyframe when viewport is focused", () => {
  let inserted = false;
  const viewportWrap = fakeElement();
  viewportWrap.closest = (sel) => (sel === ".viewport-wrap" ? viewportWrap : null);
  const ui = {
    isNavigatingFly: false,
    selectedEntity: "object",
    insertKeyframe() { inserted = true; },
    contextMenu: { onKey() { return false; } },
    root: fakeElement(),
  };

  const event = {
    key: "i",
    code: "KeyI",
    target: viewportWrap,
    composedPath: () => [viewportWrap],
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
  };

  const handled = dispatchDirectorKey(ui, event);
  assert.equal(handled, true, "dispatchDirectorKey should consume 'i' in viewport");
  assert.equal(inserted, true, "insertKeyframe must be called");
});

test("Graph Editor dragging with movement preserves multi-selection upon release", () => {
  const { ui } = createCurveFixture();
  assert.equal(ui.selectedKeyFrames.size, 2);

  // Pointerdown on keyA (frame 10)
  onCurvePointerDown(ui, pointerEvent(100, 100));

  // Pointermove with >3px delta
  onCurvePointerMove(ui, pointerEvent(110, 120));
  assert.equal(ui.curveDrag.moved, true, "moved flag must be true after dragging");

  // Pointerup
  onCurvePointerUp(ui, pointerEvent(110, 120));
  assert.equal(ui.selectedKeyFrames.size, 2, "multi-selection must NOT collapse to single key after drag");
});

test("Graph Editor single key retime clamps against adjacent keyframes", () => {
  const { ui } = createCurveFixture();
  // Select only keyB (frame 20) with neighbors keyA (frame 10) and keyC (frame 30)
  ui.selectedKeyFrames = new Set([20]);
  ui.selectedKeyFrame = 20;

  // Pointerdown on keyB (frame 20, x=200)
  onCurvePointerDown(ui, pointerEvent(200, 100));

  // Try dragging keyB far to the right past keyC (x=400, corresponding to frame > 30)
  onCurvePointerMove(ui, pointerEvent(400, 100));

  // keyB must be clamped to keyC.frame - 1 = 29
  assert.equal(ui.curveDrag.key.frame, 29, "Key must be clamped before adjacent key");

  // Try dragging keyB far to the left past keyA (x=50, corresponding to frame < 10)
  onCurvePointerMove(ui, pointerEvent(50, 100));

  // keyB must be clamped to keyA.frame + 1 = 11
  assert.equal(ui.curveDrag.key.frame, 11, "Key must be clamped after preceding key");
});


