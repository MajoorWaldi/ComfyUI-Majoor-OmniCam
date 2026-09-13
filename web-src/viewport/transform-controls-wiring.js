// Wires the generic TransformControls adapter (transform-controls-adapter.js)
// into OmniCam's canonical object / camera / camera-target / camera-path
// state.
//
// Scope (plan Task 4 + Task 6, docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md
// section 26): Task 4 covered the "ordinary" transform targets -- object,
// camera, camera_target. Task 6 adds the camera-path targets -- path_point,
// path_group, camera_path (whole path) -- onto the same adapter, retiring the
// legacy canvas-drawn path gizmo (viewport-controls/path-gizmo.js's
// beginPathGizmoDrag/applyPathGizmoDrag) from live interactive use; those
// functions and camera-path-transform.js's pure maths stay as-is and are
// still exercised directly by their own unit tests.
//
// Canonical mutation rule (section 18.3): the adapter only ever moves a
// disconnected proxy anchor and reports a delta relative to a frozen
// drag-start snapshot. This module is the only thing that turns that delta
// into a write against real OmniCam camera / object state, through the exact
// same begin/commit*Edit history lifecycle the legacy canvas gizmo already
// used in viewport-controls/interactions.js -- so undo, locks and keyframing
// all keep working unchanged, and one drag is still one undo step.
//
// Event-routing note: three.js's TransformControls does not call
// preventDefault/stopPropagation on the pointer events it handles, so the
// existing onPointerDown/onPointerMove in viewport-controls/interactions.js
// keep receiving every event too. `isPointerOverHandle()` lets those handlers
// bail out completely (no selection change, no navigation, no box-select)
// whenever the cursor is over a live handle, so the two systems never fight
// over the same drag; `ui.transformControlsDragging` (set from
// onDraggingChanged) is the same signal for "a drag is already in progress".

import * as THREE from "../three-runtime.js";
import { createTransformControlsAdapter } from "./transform-controls-adapter.js";
import { resolveTransformTarget } from "../viewport-controls/transform-target.js";
import { add, cloneCamera, cloneTransform, rotateEuler, sampleCamera, sub } from "../director/core.js";
import { pathCentroid, transformPathKeys, transformSelectedPathKeys } from "../director/camera-path-transform.js";
import { applyTrackingOffset } from "../viewport-controls/drag-helpers.js";
import { selectedTransformObjects } from "../viewport-controls/modal-transform.js";

const LIVE_TYPES = new Set(["object", "camera", "camera_target", "path_point", "path_group", "camera_path"]);

// Mirrors sampleCamera's own "is this track's look-at an active, explicit
// constraint" test (director/core/camera.js) -- the closest thing this
// codebase has to a per-key "orientation mode" (plan section 8): while it is
// active, sampleCamera ignores every key's stored `camera.target` and drives
// it live from the constrained object instead, so a transform must move that
// stored target rigidly with the position (there is no path tangent to speak
// of); otherwise a key is Follow Path and its target is free to be
// recomputed from the (possibly reshaped) path after the transform.
function trackHasActiveLookAt(track) {
  const lookAt = track?.constraints?.look_at;
  const constraintActive = lookAt?.status === undefined || lookAt?.status === "active";
  return Boolean(constraintActive && (lookAt?.object_id || track?.target_object_id));
}

export function createTransformControlsWiring(ui, { controlsFactory, anchorFactory } = {}) {
  let adapter = null;
  let dragBase = null; // { type, ...frozen snapshot captured at mouseDown }

  function ensureAdapter() {
    if (adapter) return adapter;
    if (!ui.webgl || !ui.interactionElement) return null;
    adapter = createTransformControlsAdapter({
      THREE,
      camera: ui.webgl.activeCamera,
      domElement: ui.interactionElement,
      scene: ui.webgl.scene,
      controlsFactory,
      anchorFactory,
      onDragStart: handleDragStart,
      onTransform: handleTransform,
      onDragEnd: handleDragEnd,
      onDraggingChanged: (dragging) => { ui.transformControlsDragging = dragging; },
    });
    return adapter;
  }

  function handleDragStart({ targetSpec }) {
    if (!targetSpec) return;
    if (targetSpec.type === "object") {
      ui.checkpoint("Transform object");
      const selected = selectedTransformObjects(ui);
      const group = (selected.length ? selected : [targetSpec.object]).map((object) => ({
        object,
        transform: cloneTransform(object),
      }));
      for (const item of group) ui.beginObjectEdit(item.object);
      const pivot = group
        .reduce((sum, item) => add(sum, item.transform.position), [0, 0, 0])
        .map((value) => value / group.length);
      dragBase = { type: "object", group, pivot };
      return;
    }
    if (targetSpec.type === "camera") {
      ui.checkpoint("Transform camera");
      ui.beginCameraEdit();
      dragBase = { type: "camera", position: [...ui.camera.position], target: [...ui.camera.target] };
      return;
    }
    if (targetSpec.type === "camera_target") {
      ui.checkpoint("Move camera target");
      ui.beginCameraEdit();
      const track = ui.activeCameraTrack?.();
      const tracking = Boolean(track?.target_object_id);
      dragBase = {
        type: "camera_target",
        tracking,
        base: tracking ? [...(track.target_offset || [0, 0, 0])] : [...ui.camera.target],
      };
      return;
    }
    if (targetSpec.type === "camera_path") {
      const track = targetSpec.track;
      if (!track || track.locked || !(track.keyframes?.length >= 1)) return;
      ui.checkpoint("Transform camera path");
      dragBase = {
        type: "camera_path",
        trackId: track.id,
        origin: pathCentroid(track.keyframes),
        baseKeys: track.keyframes.map((key) => ({ ...key, camera: cloneCamera(key.camera) })),
      };
      return;
    }
    if (targetSpec.type === "path_point" || targetSpec.type === "path_group") {
      const track = targetSpec.track;
      if (!track || track.locked) return;
      const frames = targetSpec.type === "path_point" ? [targetSpec.frame] : targetSpec.frames;
      ui.checkpoint(targetSpec.type === "path_point" ? "Transform path point" : "Transform path selection");
      dragBase = {
        type: targetSpec.type,
        trackId: track.id,
        origin: targetSpec.position,
        selectedFrames: new Set(frames),
        baseKeys: track.keyframes.map((key) => ({ ...key, camera: cloneCamera(key.camera) })),
        lookAtActive: trackHasActiveLookAt(track),
      };
    }
  }

  /** Delta -> transformPathKeys/transformSelectedPathKeys options for the
   * current gizmo mode -- shared by the whole-path and selection drag paths. */
  function pathTransformOptions(delta) {
    const mode = ui.state.gizmo_mode;
    if (mode === "translate") return { mode, delta: delta.position };
    if (mode === "scale") return { mode, origin: dragBase.origin, factors: delta.scaleFactors };
    return { mode, origin: dragBase.origin, rotationDeg: delta.rotationDeg };
  }

  function syncTrackAfterPathEdit(track) {
    if (track.id === ui.state.active_camera_id) ui.state.keyframes = track.keyframes;
    ui.camera = sampleCamera(track, ui.frame, ui.state.objects);
    track.camera = cloneCamera(ui.camera);
    ui.refreshKeys();
  }

  function applyCameraPathDelta(delta) {
    const track = ui.state.cameras.find((camera) => camera.id === dragBase.trackId);
    if (!track) return;
    track.keyframes = transformPathKeys(dragBase.baseKeys, pathTransformOptions(delta));
    syncTrackAfterPathEdit(track);
  }

  function applyPathSelectionDelta(delta) {
    const track = ui.state.cameras.find((camera) => camera.id === dragBase.trackId);
    if (!track) return;
    const options = { ...pathTransformOptions(delta), lookAtActive: dragBase.lookAtActive };
    track.keyframes = transformSelectedPathKeys(dragBase.baseKeys, dragBase.selectedFrames, options);
    syncTrackAfterPathEdit(track);
  }

  function handleTransform({ delta }) {
    if (!dragBase) return;
    if (dragBase.type === "object") {
      applyObjectDelta(delta);
    } else if (dragBase.type === "camera") {
      applyCameraDelta(delta);
    } else if (dragBase.type === "camera_target") {
      applyCameraTargetDelta(delta);
    } else if (dragBase.type === "camera_path") {
      applyCameraPathDelta(delta);
    } else if (dragBase.type === "path_point" || dragBase.type === "path_group") {
      applyPathSelectionDelta(delta);
    }
    ui.render();
  }

  function applyObjectDelta(delta) {
    const { group, pivot } = dragBase;
    const mode = ui.state.gizmo_mode;
    for (const item of group) {
      if (mode === "translate") {
        item.object.position = add(item.transform.position, delta.position);
      } else if (mode === "rotate") {
        item.object.position = add(pivot, rotateEuler(sub(item.transform.position, pivot), delta.rotationDeg));
        item.object.rotation = add(item.transform.rotation, delta.rotationDeg);
      } else if (mode === "scale") {
        const relative = sub(item.transform.position, pivot);
        item.object.position = add(pivot, relative.map((value, index) => value * delta.scaleFactors[index]));
        item.object.size = item.transform.size.map((value, index) => Math.max(0.01, value * delta.scaleFactors[index]));
      }
    }
    for (const item of group) ui.commitObjectEdit(item.object);
  }

  function applyCameraDelta(delta) {
    if (ui.state.gizmo_mode === "translate") {
      ui.camera.position = add(dragBase.position, delta.position);
    } else {
      const rel = sub(dragBase.target, dragBase.position);
      ui.camera.target = add(dragBase.position, rotateEuler(rel, delta.rotationDeg));
    }
    ui.commitCameraEdit();
  }

  function applyCameraTargetDelta(delta) {
    const result = add(dragBase.base, delta.position);
    if (dragBase.tracking) applyTrackingOffset(ui, result);
    else ui.camera.target = result;
    ui.commitCameraEdit();
  }

  function handleDragEnd({ cancelled }) {
    if (!dragBase) return;
    const type = dragBase.type;
    if (cancelled) {
      ui.undo();
      if (type === "camera" || type === "camera_target") ui.finishCameraEdit();
    } else {
      if (type === "camera" || type === "camera_target") ui.finishCameraEdit();
      else {
        ui.editingKeyFrame = null;
        ui.updateKeyVisualState?.();
        ui.drawCurveEditor?.();
      }
    }
    dragBase = null;
    ui.refreshInspector();
    ui.render();
  }

  /** Attach/detach/update the adapter for the current selection, mode and
   * space. Called once per Director render tick (renderViewportOnly). A live
   * drag is never touched: reattaching mid-drag would snap the anchor back to
   * its last-known canonical position and fight the user's own gesture. */
  function sync() {
    if (!ui.webgl || !ui.interactionElement) return;
    // Never bake the gizmo mesh into a playblast/clean-capture frame -- it is
    // an editor affordance, not scene content (plan Definition of Done).
    const spec = ui.recording ? null : resolveTransformTarget(ui);
    const mode = ui.state.gizmo_mode || "translate";
    const live = Boolean(spec) && LIVE_TYPES.has(spec.type) && spec.allowedModes.includes(mode);
    if (!live) {
      adapter?.detach();
      return;
    }
    if (!ensureAdapter()) return;
    if (adapter.isDragging()) return;
    adapter.setCamera(ui.webgl.activeCamera);
    adapter.setMode(mode);
    adapter.setSpace(ui.state.gizmo_space === "local" ? "local" : "world");
    adapter.attach(spec);
  }

  /** True while the pointer hovers a visible, attached handle -- the signal
   * onPointerDown uses to bail out entirely and let TransformControls' own
   * listener (registered on the same domElement) own the whole gesture. */
  function isPointerOverHandle() {
    return Boolean(adapter?.isHoveringHandle?.());
  }

  function cancelDrag() {
    adapter?.cancelDrag();
  }

  function dispose() {
    adapter?.dispose();
    adapter = null;
    dragBase = null;
  }

  return { sync, isPointerOverHandle, cancelDrag, dispose };
}
