// Camera-path point selection model.
//
// Selection is transient editor/UI state (plan section 7), never MotionScene
// data: a `Set` must never be serialized directly into workflow/OMNICAM_MOTION_SCENE
// output. Canonical keyframes have no persistent IDs, so a selected point is
// identified by `{cameraId, frame}` and must be renormalized after every
// retime/delete/insert and whenever the active camera changes.
//
// Pure maths, no DOM: unit-tested on its own.

/** A fresh, empty path selection. */
export function createPathSelection() {
  return {
    cameraId: null,
    frames: new Set(),
    primaryFrame: null,
    component: "position", // "position" | "target"
  };
}

/**
 * Select a path key, returning a new selection object (`selection` is never
 * mutated).
 *
 * - A plain click (`additive: false`) or a click on a different camera's path
 *   replaces the selection with just that one key.
 * - Shift+click (`additive: true`) on the same camera toggles the key in the
 *   current selection; toggling off the primary key promotes the next
 *   highest remaining frame to primary, or clears `primaryFrame` when the
 *   selection becomes empty.
 */
export function selectPathKey(selection, { cameraId, frame, additive = false } = {}) {
  const current = selection || createPathSelection();
  const sameCamera = current.cameraId === cameraId;

  if (!additive || !sameCamera) {
    return { cameraId, frames: new Set([frame]), primaryFrame: frame, component: current.component || "position" };
  }

  const frames = new Set(current.frames);
  if (frames.has(frame)) {
    frames.delete(frame);
    let primaryFrame = current.primaryFrame;
    if (!frames.size) primaryFrame = null;
    else if (primaryFrame === frame) primaryFrame = Math.max(...frames);
    return { ...current, frames, primaryFrame };
  }

  frames.add(frame);
  return { ...current, cameraId, frames, primaryFrame: frame };
}

/**
 * Switch the selection's edited component between the path's position keys
 * and their look-at targets (plan section 12). Returns a new selection
 * object; an unrecognized `component` is a no-op.
 */
export function setPathSelectionComponent(selection, component) {
  const current = selection || createPathSelection();
  if (component !== "position" && component !== "target") return current;
  return { ...current, component };
}

/** A fresh, empty selection (the current selection's component is not preserved). */
export function clearPathSelection(_selection) {
  return createPathSelection();
}

/**
 * Drop any selected frame that no longer exists on `camera`'s keyframes, and
 * clear the whole selection outright when it belongs to a different camera.
 * Call this after every retime/delete/insert and on active-camera switch.
 */
export function normalizePathSelection(selection, camera) {
  if (!selection || !camera || selection.cameraId !== camera.id) return createPathSelection();

  const existing = new Set((camera.keyframes || []).map((key) => key.frame));
  const frames = new Set([...selection.frames].filter((frame) => existing.has(frame)));
  if (!frames.size) return createPathSelection();

  const primaryFrame = frames.has(selection.primaryFrame) ? selection.primaryFrame : Math.max(...frames);
  return { cameraId: selection.cameraId, frames, primaryFrame, component: selection.component || "position" };
}

/** The selected camera's keyframes that are currently selected, sorted by frame. */
export function selectedPathKeys(selection, camera) {
  if (!selection || !camera || selection.cameraId !== camera.id || !selection.frames.size) return [];
  return (camera.keyframes || [])
    .filter((key) => selection.frames.has(key.frame))
    .sort((a, b) => a.frame - b.frame);
}
