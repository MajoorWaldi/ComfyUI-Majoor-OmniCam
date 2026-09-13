// Wires the generic TransformControls adapter (transform-controls-adapter.js)
// into OmniCam's canonical object / camera / camera-target state.
//
// Scope (plan Task 4, docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md
// section 26): only the "ordinary" transform targets -- object, camera,
// camera_target. Camera path targets (path_point / path_group / camera_path)
// stay on the legacy canvas-drawn gizmo in viewport-controls.js until Task 6
// gives them the same adapter.
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
import { add, cloneTransform, rotateEuler, sub } from "../director/core.js";
import { applyTrackingOffset } from "../viewport-controls/drag-helpers.js";
import { selectedTransformObjects } from "../viewport-controls/modal-transform.js";

// Path-related target types stay on the legacy canvas gizmo for now (Task 6).
const LIVE_TYPES = new Set(["object", "camera", "camera_target"]);

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
    }
  }

  function handleTransform({ delta }) {
    if (!dragBase) return;
    if (dragBase.type === "object") {
      applyObjectDelta(delta);
    } else if (dragBase.type === "camera") {
      applyCameraDelta(delta);
    } else if (dragBase.type === "camera_target") {
      applyCameraTargetDelta(delta);
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
