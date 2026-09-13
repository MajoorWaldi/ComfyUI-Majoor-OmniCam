// Unified transform target resolution.
//
// One place decides "what would the gizmo attach to right now, and which
// modes may it use" -- locks, editor-view-vs-camera-view, current selection
// and per-type mode restrictions all live here instead of being re-derived
// ad hoc by every gizmo/drag call site. No pointer event logic belongs in
// this module: it only reads `ui` selection/state and returns a plain
// TargetSpec (or null when nothing is transformable right now).
//
// See docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md
// sections 18.2 and 19.

import { pathCentroid } from "../director/camera-path-transform.js";
import { sampleCamera, sampleObjectTransform } from "../director/core.js";

// Which TransformControls modes a given target type may use. Cameras have no
// size to scale; a camera target is a bare look-at point with neither a
// meaningful rotation nor a size. Objects and whole paths support all three.
const ALLOWED_MODES = {
  object: ["translate", "rotate", "scale"],
  camera: ["translate", "rotate"],
  camera_target: ["translate"],
  camera_path: ["translate", "rotate", "scale"],
};

/**
 * Resolve the current transform target as a plain TargetSpec:
 * `{ id, type, position, rotation, scale, allowedModes }`.
 *
 * Returns `null` when nothing is currently transformable -- no selection, a
 * locked object/camera track, an empty camera path, or a selection kind that
 * has no spatial representation in the active view.
 */
export function resolveTransformTarget(ui) {
  if (ui.selectedEntity === "object") {
    const object = ui.selectedObject();
    if (!object || object.locked) return null;
    const transform = object.keyframes?.length ? sampleObjectTransform(object, ui.frame) : object;
    const position = transform.position || [0, 0, 0];
    return {
      id: `object:${object.id}`,
      type: "object",
      position,
      rotation: transform.rotation || [0, 0, 0],
      scale: transform.size || [1, 1, 1],
      allowedModes: ALLOWED_MODES.object,
      // Legacy fields some existing call sites still read directly.
      object,
      origin: position,
      size: transform.size || [1, 1, 1],
    };
  }

  if (ui.state.view_mode !== "camera") {
    const activeCam = ui.activeCameraTrack();
    if (activeCam?.locked) return null;

    if (ui.selectedEntity === "camera_target") {
      const camData = sampleCamera(activeCam, ui.frame, ui.state.objects);
      const position = camData.target || ui.camera.target || [0, 1.5, 0];
      return {
        id: `camera_target:${activeCam?.id || "camera"}`,
        type: "camera_target",
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: ALLOWED_MODES.camera_target,
      };
    }

    if (ui.selectedEntity === "camera") {
      const camData = sampleCamera(activeCam, ui.frame, ui.state.objects);
      const position = camData.position || ui.camera.position || [6, 4, 6];
      return {
        id: `camera:${activeCam?.id || "camera"}`,
        type: "camera",
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: ALLOWED_MODES.camera,
      };
    }

    if (ui.selectedEntity === "camera_path" && (activeCam?.keyframes?.length || 0) >= 1) {
      return {
        id: `camera_path:${activeCam.id}`,
        type: "camera_path",
        position: pathCentroid(activeCam.keyframes),
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: ALLOWED_MODES.camera_path,
        // Legacy field: the whole-path gizmo wiring reads the track directly.
        track: activeCam,
      };
    }
  }

  return null;
}
