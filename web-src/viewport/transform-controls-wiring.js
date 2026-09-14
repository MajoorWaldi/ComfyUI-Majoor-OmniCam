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
import {
  pathCentroid,
  trackHasActiveLookAt,
  transformPathKeys,
  transformSelectedPathKeys,
  transformSelectedPathTargets,
} from "../director/camera-path-transform.js";
import { applyTrackingOffset } from "../viewport-controls/drag-helpers.js";
import { selectedTransformObjects } from "../viewport-controls/modal-transform.js";

const LIVE_TYPES = new Set([
  "object", "camera", "camera_target", "path_point", "path_group", "camera_path", "path_point_target",
]);

export function createTransformControlsWiring(ui, { controlsFactory, anchorFactory } = {}) {
  let adapter = null;
  let dragBase = null; // { type, ...frozen snapshot captured at mouseDown }
  let snapKeyListenersBound = false;
  // The type of the last target sync() resolved as live-wired (or null). Cached
  // so gizmoGeometry() (viewport-controls.js) can skip its own, otherwise
  // fully redundant, resolveTransformTarget() call for the common case where
  // the current selection is already live-wired -- sync() always runs once per
  // render tick, before drawOverlays()/drawTransformGizmo() in the same tick
  // (see director/methods/render.js), so this is fresh by the time it's read.
  let lastLiveType = null;
  // Tracked independently of dragging state: Ctrl/Cmd may already be held
  // *before* the drag starts (three.js's TransformControls onDragStart
  // callback carries no keyboard-modifier info of its own), so handleDragStart
  // needs an up-to-date value to seed the very first snap application.
  let ctrlActive = false;

  // Ctrl/Cmd snapping (plan section 5.2/5.4): held while dragging, or the
  // persistent Grid Snap toggle, snaps translation to the spatial grid size
  // and rotation to 15deg -- same condition the legacy canvas gizmo already
  // used (viewport-controls/interactions.js). three.js's TransformControls
  // reads its snap value live on every pointer move, so updating it mid-drag
  // (not just at drag start) makes holding/releasing Ctrl take effect
  // immediately, without restarting the gesture.
  function applyLiveSnap(ctrl) {
    if (!adapter) return;
    const gridActive = ctrl || ui.state.spatial_snap_mode === "grid";
    adapter.setTranslationSnap(gridActive ? Math.max(0.01, Number(ui.state.spatial_grid_size) || 0.5) : null);
    adapter.setRotationSnap(gridActive ? Math.PI / 12 : null);
    // Matches the legacy canvas gizmo's `snapValue(next, 0.1)` for scale
    // (viewport-controls/interactions.js) -- without this, scale drags through
    // the live TransformControls gizmo never snap even with Ctrl held/Grid
    // Snap enabled, a silent regression from the old gizmo's behavior.
    adapter.setScaleSnap(gridActive ? 0.1 : null);
  }

  function onSnapKeyChange(event) {
    ctrlActive = Boolean(event.ctrlKey || event.metaKey);
    if (!adapter?.isDragging?.()) return;
    applyLiveSnap(ctrlActive);
  }

  function bindSnapKeyListeners() {
    if (snapKeyListenersBound || typeof window === "undefined") return;
    snapKeyListenersBound = true;
    window.addEventListener("keydown", onSnapKeyChange, true);
    window.addEventListener("keyup", onSnapKeyChange, true);
  }

  function unbindSnapKeyListeners() {
    if (!snapKeyListenersBound) return;
    snapKeyListenersBound = false;
    window.removeEventListener("keydown", onSnapKeyChange, true);
    window.removeEventListener("keyup", onSnapKeyChange, true);
  }

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
    bindSnapKeyListeners();
    return adapter;
  }

  function handleDragStart({ targetSpec }) {
    if (!targetSpec) return;
    // Baseline snap for the fresh drag; a live Ctrl press/release during the
    // drag itself is picked up by onSnapKeyChange above.
    applyLiveSnap(ctrlActive);
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
        lookAtActive: trackHasActiveLookAt(track, ui.state.objects),
      };
      return;
    }
    if (targetSpec.type === "path_point_target") {
      // sync() already refuses to attach a live gizmo when targetSpec.readOnly
      // is set (an active Look-At constraint), but guard here too in case a
      // stale drag start ever raced a constraint toggle.
      const track = targetSpec.track;
      if (!track || track.locked || targetSpec.readOnly) return;
      ui.checkpoint("Move camera path target");
      dragBase = {
        type: "path_point_target",
        trackId: track.id,
        frame: targetSpec.frame,
        baseKeys: track.keyframes.map((key) => ({ ...key, camera: cloneCamera(key.camera) })),
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

  // Translate-only: moves a single key's camera.target, its position and
  // every other key untouched. Never reached while the track's Look-At is an
  // active constraint -- both sync() and handleDragStart() refuse before
  // this point, per plan section 12.2 ("do not silently break a constraint").
  function applyPathTargetDelta(delta) {
    const track = ui.state.cameras.find((camera) => camera.id === dragBase.trackId);
    if (!track) return;
    track.keyframes = transformSelectedPathTargets(dragBase.baseKeys, [dragBase.frame], { delta: delta.position });
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
    } else if (dragBase.type === "path_point_target") {
      applyPathTargetDelta(delta);
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
    // A read-only target (a look-at target driven by an active Look-At
    // constraint, plan section 12.2) never gets a live gizmo: there is
    // nothing safe to write, so no handle is offered instead of one that
    // silently does nothing.
    const live = Boolean(spec) && !spec.readOnly && LIVE_TYPES.has(spec.type) && spec.allowedModes.includes(mode);
    lastLiveType = live ? spec.type : null;
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

  /** The TargetSpec type sync() most recently attached a live gizmo for, or
   * null if the current selection isn't live-wired. See `lastLiveType` above. */
  function currentLiveType() {
    return lastLiveType;
  }

  function dispose() {
    unbindSnapKeyListeners();
    adapter?.dispose();
    adapter = null;
    dragBase = null;
    lastLiveType = null;
  }

  return { sync, isPointerOverHandle, cancelDrag, currentLiveType, dispose };
}
