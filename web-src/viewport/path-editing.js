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

import { cameraBasis, project } from "../director/core.js";
import { selectPathKey } from "../director/camera-path-selection.js";

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

/**
 * The spatial-curve tangent handle a hit refers to
 * (`{ cameraId, frame, side }`), or null when the hit is not a handle knob.
 */
export function curveHandleFromHit(hit) {
  for (let object = hit?.object; object; object = object.parent) {
    if (object.userData?.omnicamCurveHandle) return object.userData.omnicamCurveHandle;
  }
  return null;
}

/**
 * Apply a click (or Shift+click) on a path-key marker to the Director's
 * spatial path selection (plan section 7), mirroring the result into the
 * pre-existing `selectedKeyFrame(s)` fields so the Inspector and timeline --
 * which already read those -- pick it up with no further wiring.
 *
 * A plain click also scrubs the playhead to the newly primary key, matching
 * every other single-keyframe click path in the viewport (activateCamera +
 * setFrame + selectKeyframe). An additive Shift+click only moves the
 * playhead when the toggle leaves a (possibly different) primary key behind,
 * never when the whole selection empties out.
 */
export function selectPathKeyFromClick(ui, { cameraId, frame, additive = false }) {
  ui.pathSelection = selectPathKey(ui.pathSelection, { cameraId, frame, additive });
  ui.selectedKeyFrames = new Set(ui.pathSelection.frames);
  ui.selectedKeyFrame = ui.pathSelection.primaryFrame;
  ui.editingKeyFrame = null;
  if (ui.pathSelection.primaryFrame != null) ui.setFrame(ui.pathSelection.primaryFrame);
  ui.refreshKeys();
  ui.refreshInspector();
}

/**
 * The whole `pointerdown`-on-a-path-marker branch: pick, (re)activate the
 * marker's own camera, then either toggle it into the selection (Shift) or
 * select it and arm a drag (plain click). Kept out of interactions.js, which
 * is already at the source-line cap.
 *
 * Returns `true` once handled (the caller should stop processing the event),
 * `false` when the pointer did not land on a path-key marker.
 */
export function handlePathKeyPointerDown(ui, { pointerX, pointerY, shiftKey, altKey }) {
  if (altKey || !ui.webgl?.pickPathKey) return false;
  const handle = ui.webgl.pickPathKey([pointerX, pointerY]);
  if (!handle) return false;
  // The active camera is explicitly selected as itself, not as a path, right
  // now (e.g. "cannot scale a camera" -- no gizmo attaches, and this marker
  // shouldn't quietly take over the click instead): its own marker only
  // behaves like a path handle once the user is actually editing the path.
  if (ui.selectedEntity === "camera" && handle.cameraId === ui.state.active_camera_id) return false;
  const track = (ui.state.cameras || []).find((camera) => camera.id === handle.cameraId);
  const key = (track?.keyframes || []).find((item) => item.frame === handle.frame);
  if (!key) return false;

  // A marker on a different camera's path becomes the active track, same as
  // clicking its body/target/whole-path elsewhere in this file.
  if (track.id !== ui.state.active_camera_id) ui.activateCamera(track.id);

  if (shiftKey) {
    selectPathKeyFromClick(ui, { cameraId: track.id, frame: key.frame, additive: true });
    ui.render();
    return true;
  }

  ui.pathDrag = { cameraId: handle.cameraId, frame: handle.frame, anchor: [...key.camera.position], startX: pointerX, startY: pointerY, moved: false, historyCheckpointed: false };
  if (ui.interactionElement.style) ui.interactionElement.style.cursor = "grabbing";
  selectPathKeyFromClick(ui, { cameraId: track.id, frame: key.frame, additive: false });
  ui.render();
  return true;
}

// A handle whose tip projects within a few screen pixels of its own key's
// marker -- whether from a genuinely zero tangent (a single-key track, no
// neighbour on either side) or merely a small one that happens to look
// coincident at the current camera distance/zoom (an edge key's one-sided
// auto tangent, see autoTangent() in camera-path-curve.js) -- is not visually
// distinguishable from the key itself right now, so a click can't really
// mean "grab the handle, not the key/gizmo" here. World-space distance would
// get this wrong in both directions (perspective can make a large 3D offset
// invisible, or a tiny one loom large up close), so this compares projected
// screen pixels instead, the same space pickCurveHandle's own hit-test uses.
const SCREEN_DEGENERATE_PIXELS = 3;
function looksDegenerate(knobPosition, keyPosition, viewCamera, width, height) {
  const knobScreen = project(knobPosition, viewCamera, width, height);
  const keyScreen = project(keyPosition, viewCamera, width, height);
  // Off-screen/behind-camera: can't judge visual separation, so don't guess.
  if (!knobScreen || !keyScreen) return false;
  return Math.hypot(knobScreen[0] - keyScreen[0], knobScreen[1] - keyScreen[1]) < SCREEN_DEGENERATE_PIXELS;
}

/**
 * The whole curve-tangent-knob `pointerdown` branch. Kept out of
 * interactions.js, which is already at the source-line cap.
 *
 * `overHandle` (already known by the caller) tells whether the pointer is
 * also over a live TransformControls handle right now -- if so, that sibling
 * native listener gets stopImmediatePropagation()'d so it can't also start
 * its own competing drag on the same event once this knob wins instead.
 *
 * Returns `true` once handled (the caller should stop processing the event),
 * `false` when the pointer did not land on a visually distinct knob.
 */
export function handleCurveHandlePointerDown(ui, { pointerX, pointerY, overHandle, viewCamera, e }) {
  if (!ui.webgl?.pickCurveHandle) return false;
  const knob = ui.webgl.pickCurveHandle([pointerX, pointerY]);
  if (!knob) return false;
  const track = (ui.state.cameras || []).find((camera) => camera.id === knob.cameraId);
  const keyIndex = (track?.keyframes || []).findIndex((item) => item.frame === knob.frame);
  const key = keyIndex >= 0 ? track.keyframes[keyIndex] : null;
  if (!key) return false;
  if (looksDegenerate(knob.position, key.camera.position, viewCamera, ui.canvas.width, ui.canvas.height)) return false;
  if (overHandle) e.stopImmediatePropagation?.();
  ui.curveHandleDrag = {
    cameraId: knob.cameraId,
    frame: knob.frame,
    side: knob.side,
    anchor: [...key.camera.position],
    prevKey: track.keyframes[keyIndex - 1] || null,
    nextKey: track.keyframes[keyIndex + 1] || null,
    startX: pointerX,
    startY: pointerY,
    moved: false,
    historyCheckpointed: false,
  };
  if (ui.interactionElement.style) ui.interactionElement.style.cursor = "grabbing";
  ui.selectKeyframe?.(key);
  return true;
}
