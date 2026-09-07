// Adoption of reconstructed scene assets and cameras into OmniCam Director.

import { annotatedAssetUrl } from "../../director/core/camera.js";
import { sampleCamera, sanitizeState } from "../../director/core.js";
import { reconstructionAdoptionDefaults } from "../../scene/reconstruction-inspector.js";

// The Result mode the scene was compiled with (blockout / hybrid / scan / …).
export function reconstructionModeOf(result) {
  return (
    result?.reconstruction?.recon_mode ||
    result?.motion_scene?.metadata?.reconstruction?.mode ||
    result?.metadata?.reconstruction?.mode ||
    ""
  );
}

// Apply the role-based lock / visibility defaults to one adopted object, in
// place. blockout_object -> unlocked; room / reference -> locked; the dense
// reference is hidden in Blockout mode and kept in Hybrid.
export function applyReconstructionAdoptionDefaults(object, mode) {
  const role = object?.reconstruction?.role;
  if (!role) return object;
  const defaults = reconstructionAdoptionDefaults(object, mode);
  if (object.locked === undefined || role === "room" || role === "reference") {
    object.locked = defaults.locked;
  }
  if (role === "reference") object.enabled = defaults.visible;
  return object;
}

// MotionScene v1 nests a camera's motion under `camera.track.keyframes[].camera`
// and its label under `camera.label`; the Director editor state is flat --
// `{id, name, camera, keyframes}` -- and reads scene size from top-level
// `width/height/fps/duration_frames`. Without this conversion sanitizeState
// drops the reconstructed framing (camera reads "undefined", view is the
// default) and the keyframes. Objects/metadata pass straight through.
export function motionSceneToEditorCameras(scene) {
  return (scene?.cameras || []).map((cam, index) => {
    const kfs = (cam?.track?.keyframes || cam?.keyframes || []).map((k) => ({
      frame: Math.max(0, Math.round(Number(k?.frame || 0))),
      camera: k?.camera || k,
      interpolation: k?.interpolation || "hold",
    }));
    const camera = kfs[0]?.camera || cam?.camera || null;
    return {
      id: String(cam?.id || `camera_${index + 1}`),
      name: String(cam?.label || cam?.name || "Source Camera"),
      enabled: cam?.enabled !== false,
      locked: Boolean(cam?.locked),
      color: cam?.color,
      camera,
      keyframes: kfs.length ? kfs : (camera ? [{ frame: 0, camera, interpolation: "hold" }] : []),
    };
  });
}

export function motionSceneToEditorState(scene) {
  const canvas = scene?.canvas || {};
  const timeline = scene?.timeline || {};
  const fps = Math.max(1, Math.round(Number(timeline.authoring_fps || scene?.fps || 24)));
  const durationSeconds = Number(timeline.duration_seconds || 0);
  return {
    ...scene,
    width: Number(canvas.width || scene?.width || 1280),
    height: Number(canvas.height || scene?.height || 720),
    fps,
    duration_frames: durationSeconds > 0
      ? Math.max(1, Math.round(durationSeconds * fps))
      : Number(scene?.duration_frames || fps * 5),
    cameras: motionSceneToEditorCameras(scene),
  };
}

export function uniqueSceneId(existingIds, baseId) {
  if (!existingIds || !existingIds.has(baseId)) return baseId;
  let suffix = 2;
  while (existingIds.has(`${baseId}_${suffix}`)) {
    suffix += 1;
  }
  return `${baseId}_${suffix}`;
}

export function isDirectorEmpty(directorUi) {
  const state = directorUi?.state;
  if (!state) return true;
  const objectCount = (state.objects || []).length;
  if (objectCount > 0) return false;

  const cameras = state.cameras || [];
  if (cameras.length <= 1) {
    const cam = cameras[0];
    const keyCount = (cam?.keyframes || []).length;
    return keyCount <= 1;
  }
  return false;
}

export function adoptReconstructedScene(directorUi, result, options = {}) {
  const scene = result?.motion_scene || result;
  if (!scene || !Array.isArray(scene.objects)) {
    throw new Error("Reconstruction result has no objects array");
  }

  const mode = options.mode || (isDirectorEmpty(directorUi) ? "replace" : "merge");
  const reconMode = options.reconMode || reconstructionModeOf(result);

  if (mode === "replace") {
    directorUi.checkpoint?.("Adopt reconstructed scene (replace)");
    directorUi.state = sanitizeState(
      motionSceneToEditorState(JSON.parse(JSON.stringify(scene))),
    );
    directorUi.camera = sampleCamera(directorUi.state, directorUi.frame || 0);

    for (const object of directorUi.state.objects || []) {
      applyReconstructionAdoptionDefaults(object, reconMode);
      if ((object.type === "glb" || object.type === "model") && object.asset) {
        directorUi.modelUrlsById?.set(object.id, annotatedAssetUrl(object.asset));
      }
    }
  } else {
    directorUi.checkpoint?.("Merge reconstructed environment");
    const existingObjIds = new Set((directorUi.state.objects || []).map((o) => o.id));
    const existingCamIds = new Set((directorUi.state.cameras || []).map((c) => c.id));

    for (const incomingObj of scene.objects) {
      const copy = JSON.parse(JSON.stringify(incomingObj));
      const safeId = uniqueSceneId(existingObjIds, copy.id);
      existingObjIds.add(safeId);
      copy.id = safeId;
      applyReconstructionAdoptionDefaults(copy, reconMode);
      directorUi.state.objects.push(copy);

      if ((copy.type === "glb" || copy.type === "model") && copy.asset) {
        directorUi.modelUrlsById?.set(copy.id, annotatedAssetUrl(copy.asset));
      }
    }

    for (const editorCam of motionSceneToEditorCameras(scene)) {
      const safeCamId = uniqueSceneId(existingCamIds, editorCam.id);
      existingCamIds.add(safeCamId);
      editorCam.id = safeCamId;
      editorCam.enabled = false; // Disabled secondary camera on merge
      directorUi.state.cameras.push(editorCam);
    }
  }

  directorUi.serialize?.();
  directorUi.refreshObjects?.();
  directorUi.render?.();
  directorUi.setStatus?.("Adopted reconstructed scene into Director");
}
