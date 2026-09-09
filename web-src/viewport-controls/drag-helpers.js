// Pure-ish helpers shared by the pointer / drag / wheel handlers in
// interactions.js: undo-checkpoint gating, look-at "maintain offset" writes,
// world-grid snapping, and the screen-space bounds a marquee tests against.
// Split out so interactions.js stays focused on the handlers themselves and
// under the project's source-line ceiling.

import { project, sampleObjectTransform } from "../director/core.js";
import { viewportCamera } from "../viewport-controls.js";
import { t } from "../i18n.js";

export function checkpointDrag(ui, drag, label) {
  if (!drag || drag.historyCheckpointed) return;
  ui.checkpoint(label);
  drag.historyCheckpointed = true;
}

// Writes a dragged camera-target position as the "maintain offset" on top of
// an active look-at constraint, instead of the raw target sampleCamera would
// immediately discard (see the camera_target drag sites in interactions.js).
// Re-deriving via setFrame folds in applyAimConstraint too, so a bone-aimed
// camera gets the same live feedback as a plain object-tracked one.
export function applyTrackingOffset(ui, offset) {
  const track = ui.activeCameraTrack?.();
  if (!track) return;
  track.target_offset = offset;
  if (track.id === ui.state.active_camera_id) ui.state.target_offset = offset;
  ui.setFrame(ui.frame, false, false);
}

export function checkpointWheelGesture(ui) {
  const now = globalThis.performance?.now?.() ?? Date.now();
  if (!Number.isFinite(ui.lastViewportWheelAt) || now - ui.lastViewportWheelAt > 300) {
    ui.checkpoint("Dolly viewport");
  }
  ui.lastViewportWheelAt = now;
}

export const snapValue = (value, step) => Math.round(value / step) * step;
export const snapVector = (value, step) => value.map((component) => snapValue(component, step));

/** The screen-space AABB of an object's world bounds, for marquee overlap
 * tests. Falls back to a box built from position +/- size/2 when there is no
 * WebGL mesh to measure (nulls, primitives the renderer draws procedurally). */
export function projectedObjectScreenBounds(ui, object, camera) {
  const transform = object.keyframes?.length ? sampleObjectTransform(object, ui.frame) : object;
  const position = transform.position || [0, 0, 0];
  const worldBounds = ui.webgl?.getObjectWorldBounds?.(object.id);
  let min, max;
  if (worldBounds) {
    ({ min, max } = worldBounds);
  } else {
    const half = (transform.size || [1, 1, 1]).map((value) => Math.max(0.01, Math.abs(value)) / 2);
    min = half.map((h, i) => position[i] - h);
    max = half.map((h, i) => position[i] + h);
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) {
    const point = project([x, y, z], camera, ui.canvas.width, ui.canvas.height);
    if (!point) continue;
    minX = Math.min(minX, point[0]); maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]); maxY = Math.max(maxY, point[1]);
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

// `axisLock` restricts snapping to a single-axis drag ({ base, axis }): only
// the coordinate(s) that axis actually moves get snapped to the world grid,
// same absolute grid lines the free drag snaps onto; any coordinate the axis
// doesn't touch is pinned to its exact pre-drag value instead of being run
// through the grid too. Without this, grid snap (Ctrl, or the Grid snap mode)
// rewrote every component of the position, so an axis-constrained drag could
// visibly jump off its axis the moment an idle coordinate wasn't already
// grid-aligned.
export function spatiallySnap(ui, position, pointer, excludedIds = [], axisLock = null) {
  const temporaryGrid = ui.currentTransformEvent?.ctrlKey || ui.currentTransformEvent?.metaKey;
  const mode = temporaryGrid ? "grid" : ui.state.spatial_snap_mode;
  const gridSize = ui.state.spatial_grid_size || 0.5;
  if (mode === "grid") {
    if (axisLock) return position.map((value, i) => (Math.abs(axisLock.axis[i]) > 1e-6 ? snapValue(value, gridSize) : axisLock.base[i]));
    return snapVector(position, gridSize);
  }
  if (mode === "vertex" && pointer && !axisLock) {
    const hit = ui.webgl?.pickSubElement?.(pointer[0], pointer[1], ui.canvas.width, ui.canvas.height, "vertex");
    if (hit?.point && !excludedIds.includes(hit.objectId)) return [...hit.point];
  }
  return position;
}

export function finishBoxSelection(ui) {
  if (!ui.boxSelection) return false;
  const selection = ui.boxSelection;
  const camera = viewportCamera(ui);
  const minX = Math.min(selection.start[0], selection.current[0]), maxX = Math.max(selection.start[0], selection.current[0]);
  const minY = Math.min(selection.start[1], selection.current[1]), maxY = Math.max(selection.start[1], selection.current[1]);
  const ids = selection.additive ? new Set(selection.initial) : new Set();
  for (const object of ui.state.objects) {
    if (object.enabled === false) continue;
    const screenBox = projectedObjectScreenBounds(ui, object, camera);
    if (screenBox && screenBox.maxX >= minX && screenBox.minX <= maxX && screenBox.maxY >= minY && screenBox.minY <= maxY) ids.add(object.id);
  }
  ui.selectedObjectIds = ids;
  ui.selectedObjectId = [...ids].at(-1) || null;
  ui.selectedEntity = ids.size ? "object" : "camera";
  ui.boxSelection = null;
  ui.boxSelectMode = false;
  if (ui.interactionElement?.style) ui.interactionElement.style.cursor = "";
  ui.refreshObjects();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t("{count} object(s) selected").replace("{count}", String(ids.size)));
  return true;
}
