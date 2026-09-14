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

import { pathCentroid, trackHasActiveLookAt } from "../director/camera-path-transform.js";
import { selectedPathKeys } from "../director/camera-path-selection.js";
import { sampleCamera, sampleObjectTransform } from "../director/core.js";

// Which TransformControls modes a given target type may use. Cameras have no
// size to scale; a camera target is a bare look-at point with neither a
// meaningful rotation nor a size. Objects and whole paths support all three.
// A single selected path point has no extent of its own to rotate or scale
// about (both are no-ops on a lone point), so -- like a camera target -- it
// only offers translate; a multi-point selection behaves like the whole path.
const ALLOWED_MODES = {
  object: ["translate", "rotate", "scale"],
  camera: ["translate", "rotate"],
  camera_target: ["translate"],
  camera_path: ["translate", "rotate", "scale"],
  path_point: ["translate"],
  path_group: ["translate", "rotate", "scale"],
  // A single key's look-at target (plan section 12): also a bare point, also
  // translate-only. Multi-point/whole-target-path editing is an explicit
  // Phase 2 (plan section 12.3), so there is no "target_group" here yet.
  path_point_target: ["translate"],
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
      // A path-point (multi-)selection takes priority over the whole path
      // while it is non-empty: it is a more specific target than "the whole
      // path", the way selecting a face beats selecting its whole mesh.
      // ui.pathSelection is transient editor state (plan section 7) that a
      // legacy-gizmo fixture `ui` may not define at all, so this reads it
      // defensively rather than assuming its shape.
      const selectedKeys = selectedPathKeys(ui.pathSelection, activeCam);
      if (selectedKeys.length === 1) {
        // Position/Target component toggle (plan section 12.1): a single
        // selected key can edit either its own position or the look-at
        // point it's aimed at, from `ui.pathSelection.component`. A target
        // driven by an active Look-At constraint is reported read-only
        // (`readOnly: true`) instead of silently letting a drag write a
        // value the constraint immediately overrides on the next resample
        // (plan section 12.2) -- transform-controls-wiring.js's sync() must
        // not attach a live gizmo while this is set.
        if (ui.pathSelection?.component === "target") {
          const key = selectedKeys[0];
          return {
            id: `path_point_target:${activeCam.id}:${key.frame}`,
            type: "path_point_target",
            position: [...(key.camera.target || [0, 0, 0])],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            allowedModes: ALLOWED_MODES.path_point_target,
            track: activeCam,
            frame: key.frame,
            readOnly: trackHasActiveLookAt(activeCam, ui.state.objects),
          };
        }
        return {
          id: `path_point:${activeCam.id}:${selectedKeys[0].frame}`,
          type: "path_point",
          position: [...selectedKeys[0].camera.position],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          allowedModes: ALLOWED_MODES.path_point,
          track: activeCam,
          frame: selectedKeys[0].frame,
        };
      }
      if (selectedKeys.length > 1) {
        return {
          id: `path_group:${activeCam.id}`,
          type: "path_group",
          position: pathCentroid(selectedKeys),
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          allowedModes: ALLOWED_MODES.path_group,
          track: activeCam,
          frames: selectedKeys.map((key) => key.frame),
        };
      }
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
