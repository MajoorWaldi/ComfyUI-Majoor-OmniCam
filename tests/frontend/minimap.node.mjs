import test from "node:test";
import assert from "node:assert/strict";

import {
  getCameraHeightColor,
  getCameraHeightLabel,
  getMinimapBounds,
  toRadarCoords,
  fromRadarCoords,
  hitTestMinimapButton,
  hitTestMinimapEntity,
  handleMinimapPointerDown,
  handleMinimapPointerMove,
  handleMinimapPointerUp,
  handleMinimapWheel,
  drawTopDownRadar,
} from "../../web-src/viewport/minimap.js";

function createMockUi(options = {}) {
  const cam = {
    position: options.camPos || [0, 1.5, 5],
    target: options.camTgt || [0, 0, 0],
    fov: 35,
  };
  return {
    state: {
      show_radar: true,
      active_camera_id: "cam_1",
      cameras: [
        {
          id: "cam_1",
          name: "Main Camera",
          keyframes: [
            { frame: 0, camera: { position: [0, 1.5, 5], target: [0, 0, 0] } },
            { frame: 24, camera: { position: [2, 1.8, 4], target: [0, 0, 0] } },
          ],
        },
      ],
      objects: [
        { id: "obj_1", name: "Subject Card", type: "card", position: [0, 0, 0], rotation: [0, 0, 0], enabled: true },
      ],
      ...options.state,
    },
    canvas: { width: 800, height: 600 },
    frame: 0,
    checkpoints: [],
    checkpoint(msg) { this.checkpoints.push(msg); },
    viewportCamera() { return cam; },
    activeCameraTrack() { return this.state.cameras[0]; },
    camera: cam,
    beginCameraEdit() { this.beganEdit = true; },
    commitCameraEdit() { this.committedEdit = true; },
    finishCameraEdit() { this.finishedEdit = true; },
    seekFrame(f) { this.seekedFrame = f; },
    selectObject(id) { this.selectedObjId = id; },
    render() { this.rendered = true; },
    setFrame(f) { this.currentFrame = f; },
  };
}

test("getCameraHeightColor returns proper elevation badges", () => {
  assert.equal(getCameraHeightColor(-1.5), "#38bdf8", "sub-ground level is cyan");
  assert.equal(getCameraHeightColor(0.0), "#2dd4bf", "ground level is teal");
  assert.equal(getCameraHeightColor(1.5), "#4ade80", "eye level is green");
  assert.equal(getCameraHeightColor(3.5), "#facc15", "low crane is yellow");
  assert.equal(getCameraHeightColor(7.0), "#fb923c", "high crane is orange");
  assert.equal(getCameraHeightColor(12.0), "#f43f5e", "aerial is magenta");
});

test("getCameraHeightLabel formats altitude cleanly", () => {
  assert.equal(getCameraHeightLabel(1.5), "+1.5m");
  assert.equal(getCameraHeightLabel(0.0), "0.0m");
  assert.equal(getCameraHeightLabel(-2.4), "-2.4m");
});

test("getMinimapBounds calculates radar geometry and scale", () => {
  const ui = createMockUi();
  const bounds = getMinimapBounds(ui, 800, 600);
  assert.ok(bounds);
  assert.equal(bounds.radarSize, 138, "compact default size is 138");
  assert.equal(bounds.rx, 800 - 138 - 10, "positioned at bottom right");
  assert.equal(bounds.ry, 600 - 138 - 10);
  assert.ok(bounds.scale > 0, "positive projection scale");
  assert.equal(bounds.worldCenterX, 0, "origin center default");
  assert.equal(bounds.worldCenterZ, 0);
});

test("toRadarCoords and fromRadarCoords round-trip accurately", () => {
  const ui = createMockUi();
  const bounds = getMinimapBounds(ui, 800, 600);
  const [rx, rz] = toRadarCoords(bounds, 2.5, -3.5);
  const [wx, wz] = fromRadarCoords(bounds, rx, rz);
  assert.ok(Math.abs(wx - 2.5) < 1e-4, "round-trip X coordinate matches");
  assert.ok(Math.abs(wz - -3.5) < 1e-4, "round-trip Z coordinate matches");
});

test("hitTestMinimapButton identifies radar controls", () => {
  const ui = createMockUi();
  const bounds = getMinimapBounds(ui, 800, 600);
  const { rx, ry } = bounds;

  assert.equal(hitTestMinimapButton(bounds, rx + 50, ry + 8), "zoom_out");
  assert.equal(hitTestMinimapButton(bounds, rx + 64, ry + 8), "zoom_in");
  assert.equal(hitTestMinimapButton(bounds, rx + 80, ry + 8), "center");
  assert.equal(hitTestMinimapButton(bounds, rx + 102, ry + 8), "size");
  assert.equal(hitTestMinimapButton(bounds, rx + 10, ry + 8), null);
});

test("hitTestMinimapEntity detects camera, target, keyframes, and objects", () => {
  const ui = createMockUi();
  const bounds = getMinimapBounds(ui, 800, 600);

  // Camera is at [0, 1.5, 5]
  const [camRx, camRz] = toRadarCoords(bounds, 0, 5);
  const hitCam = hitTestMinimapEntity(ui, bounds, camRx, camRz);
  assert.equal(hitCam?.type, "camera");

  // Target is at [0, 0, 0]
  const [tgtRx, tgtRz] = toRadarCoords(bounds, 0, 0);
  const hitTgt = hitTestMinimapEntity(ui, bounds, tgtRx, tgtRz);
  assert.ok(hitTgt?.type === "target" || hitTgt?.type === "object");

  // Keyframe 1 is at frame 24 at [2, 1.8, 4]
  const [kfRx, kfRz] = toRadarCoords(bounds, 2, 4);
  const hitKf = hitTestMinimapEntity(ui, bounds, kfRx, kfRz);
  assert.equal(hitKf?.type, "keyframe");
  assert.equal(hitKf?.frame, 24);
});

test("handleMinimapPointerDown handles button toggles and entity clicks", () => {
  const ui = createMockUi();
  const bounds = getMinimapBounds(ui, 800, 600);
  const { rx, ry } = bounds;

  // Click zoom in button
  const zoomInHandled = handleMinimapPointerDown(ui, {}, rx + 64, ry + 8);
  assert.equal(zoomInHandled, true);
  assert.equal(ui.rendered, true);

  // Click center toggle
  handleMinimapPointerDown(ui, {}, rx + 80, ry + 8);
  assert.equal(ui._minimapState.centerMode, "camera");

  // Click keyframe F24
  const camCenteredBounds = getMinimapBounds(ui, 800, 600);
  const [kfRx, kfRz] = toRadarCoords(camCenteredBounds, 2, 4);
  handleMinimapPointerDown(ui, {}, kfRx, kfRz);
  assert.equal(ui.seekedFrame, 24);

  // Click size expand toggle
  handleMinimapPointerDown(ui, {}, rx + 102, ry + 8);
  assert.equal(ui._minimapState.expanded, true);

  // Empty radar click sets camera position
  const newBounds = getMinimapBounds(ui, 800, 600);
  const emptyHandled = handleMinimapPointerDown(ui, {}, newBounds.cx + 20, newBounds.cy + 20);
  assert.equal(emptyHandled, true);
  assert.ok(ui.checkpoints.includes("Set camera via radar"));
});

test("handleMinimapWheel zooms radar range", () => {
  const ui = createMockUi();
  const bounds = getMinimapBounds(ui, 800, 600);
  const { rx, ry } = bounds;

  const wheelHandled = handleMinimapWheel(ui, { deltaY: -100 }, rx + 30, ry + 30);
  assert.equal(wheelHandled, true);
  assert.ok(ui._minimapState.rangeIndex >= 0);
  assert.equal(ui.rendered, true);
});

test("drawTopDownRadar executes cleanly without throwing", () => {
  const ui = createMockUi();
  const drawn = [];
  const mockContext = new Proxy({}, {
    get: (_, prop) => (...args) => {
      drawn.push({ prop, args });
      if (prop === "measureText") return { width: 40 };
      if (prop === "createRadialGradient") {
        return { addColorStop: () => {} };
      }
      return null;
    },
  });

  drawTopDownRadar(ui, mockContext, 800, 600);
  assert.ok(drawn.length > 20, "radar chrome and entities were drawn");
});
