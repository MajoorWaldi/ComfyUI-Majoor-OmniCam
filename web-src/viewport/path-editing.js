// Dragging camera-path keyframes directly in the viewport.
//
// The path markers are the keyframe positions. Grabbing one and moving it is
// the fastest way to reshape a move, so the marker has to behave like a handle
// rather than a decoration.
//
// The drag happens on the plane through the key that faces the view camera:
// that is the only plane where the point follows the cursor exactly, with no
// surprise depth change. The component along the view direction is preserved,
// so a key never jumps toward or away from the viewer while being slid.

import { cameraBasis } from "../omnicam-core.js";

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Screen point -> world point on the view-facing plane through `anchor`.
 *
 * @param {number[]} screen  [x, y] in canvas pixels
 * @param {object} camera    the *view* camera (position, target, fov, roll, ...)
 * @param {number[]} anchor  world point whose depth the result keeps
 * @param {number} width     canvas width in pixels
 * @param {number} height    canvas height in pixels
 * @returns {number[]} world position
 */
export function screenToPlane(screen, camera, anchor, width, height) {
  const { right, up, forward } = cameraBasis(camera);
  const origin = camera.position;
  const relative = [anchor[0] - origin[0], anchor[1] - origin[1], anchor[2] - origin[2]];
  const depth = dot(relative, forward);

  let offsetX;
  let offsetY;
  if (camera.camera_type === "orthographic") {
    const halfHeight = 5 / Math.max(0.01, camera.zoom || 1);
    const halfWidth = (halfHeight * width) / Math.max(1, height);
    offsetX = ((screen[0] / Math.max(1, width)) - 0.5) * 2 * halfWidth;
    offsetY = (0.5 - (screen[1] / Math.max(1, height))) * 2 * halfHeight;
  } else {
    const focal = (0.5 * height) / Math.tan((Math.max(0.001, camera.fov) * Math.PI) / 360);
    offsetX = ((screen[0] - width / 2) * depth) / focal;
    offsetY = ((height / 2 - screen[1]) * depth) / focal;
  }

  return [0, 1, 2].map((axis) =>
    origin[axis] + forward[axis] * depth + right[axis] * offsetX + up[axis] * offsetY);
}

/**
 * Interpolation to give a key that has just been dragged.
 *
 * A hand-placed waypoint should join the move as a curve, not a corner, so a
 * linear or hold key is promoted to smooth. Keys the animator deliberately set
 * to bezier keep their handles.
 */
export function interpolationAfterDrag(current) {
  if (current === "bezier") return "bezier";
  return "smooth";
}

/** The camera keyframe a marker refers to, or null when the hit is not a marker. */
export function pathKeyFromHit(hit) {
  for (let object = hit?.object; object; object = object.parent) {
    if (object.userData?.omnicamPathKey) return object.userData.omnicamPathKey;
  }
  return null;
}
