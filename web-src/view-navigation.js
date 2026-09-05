import { add, clamp, length, mul, sub } from "./director/core.js";

export const QUICK_VIEW_MODES = Object.freeze(["camera", "perspective", "front", "right", "top", "iso"]);

const AXIS_VIEWS = Object.freeze({
  x: ["right", "left"],
  y: ["top", "bottom"],
  z: ["front", "back"],
});

// The view each orthographic mode is looking at from the far side, for the
// "opposite view" flip on Numpad 9.
const OPPOSITE_VIEWS = Object.freeze({
  front: "back", back: "front", right: "left", left: "right", top: "bottom", bottom: "top",
});

export function axisViewFor(axis, currentMode) {
  const views = AXIS_VIEWS[axis];
  if (!views) return null;
  return currentMode === views[0] ? views[1] : views[0];
}

export function oppositeViewFor(currentMode) {
  return OPPOSITE_VIEWS[currentMode] || null;
}

/**
 * Orbit the current viewport camera around its target by fixed steps, for the
 * numpad orbit keys. Same yaw/pitch parameterisation and pitch clamp as the
 * pointer orbit in viewport-controls/interactions.js, so keyboard and mouse
 * orbiting cannot drift apart or gimbal-flip against each other.
 */
export function orbitView(ui, yawStep, pitchStep) {
  const camera = ui.viewportCamera();
  const editorView = ui.state.view_mode !== "camera";
  const offset = sub(camera.position, camera.target);
  const radius = length(offset);
  if (!(radius > 1e-4)) return;
  const yaw = Math.atan2(offset[0], offset[2]) + yawStep;
  const pitch = clamp(Math.asin(clamp(offset[1] / radius, -0.999, 0.999)) + pitchStep, -1.45, 1.45);
  if (!editorView) ui.beginCameraEdit();
  camera.position = add(camera.target, mul([
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  ], radius));
  if (editorView) { ui.serialize(); ui.render(); } else { ui.commitCameraEdit(); ui.finishCameraEdit(); }
}
