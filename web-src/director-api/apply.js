// Operation handlers. Each mutates a cloned draft of ui.state in place and
// returns { dirtyMask, warning? }. Entity-existence and range checks throw
// DirectorApiError so the transaction aborts atomically before anything is
// committed.

import { UI_DIRTY } from "../director/ui-dirty.js";
import { INTERPOLATION_MODES } from "../director/core.js";
import { sanitizeAnnotation, sanitizeTags } from "../assets/labels.js";
import { normalizeQuaternion, sanitizePose, withJointRotation } from "../assets/character/pose-state.js";
import { sanitizeMotion } from "../assets/character/motion-state.js";
import { compileInstance } from "../assets/instantiate.js";
import { DIRECTOR_OPS } from "./constants.js";
import { DirectorApiError } from "./errors.js";
import {
  createCamera,
  createObject,
  deleteCamera,
  deleteObject,
  duplicateCamera,
  duplicateObject,
  removeCut,
  renameCamera,
  renameObject,
  setCutCamera,
  setObjectParent,
  setPlayblastCamera,
  upsertCut,
} from "./entity-ops.js";

function findCamera(state, cameraId) {
  const id = cameraId || state.active_camera_id;
  const camera = (state.cameras || []).find((item) => item.id === id);
  if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `${id} does not exist`);
  return camera;
}

function findObject(state, objectId) {
  const object = (state.objects || []).find((item) => item.id === objectId);
  if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `${objectId} does not exist`);
  return object;
}

function requireCharacter(state, objectId) {
  const object = requireUnlockedObject(state, objectId);
  if (object.asset_kind !== "character") {
    throw new DirectorApiError("NOT_A_CHARACTER", `${objectId} is not a character`);
  }
  return object;
}

function requireUnlockedCamera(state, cameraId) {
  const camera = findCamera(state, cameraId);
  if (camera.locked) {
    throw new DirectorApiError("ENTITY_LOCKED", `${camera.id} is locked`);
  }
  return camera;
}

function requireUnlockedObject(state, objectId) {
  const object = findObject(state, objectId);
  if (object.locked) {
    throw new DirectorApiError("ENTITY_LOCKED", `${object.id} is locked`);
  }
  return object;
}

function ensureBaseCamera(track) {
  if (!track.camera || typeof track.camera !== "object") track.camera = {};
  return track.camera;
}

function keyframeAt(track, frame) {
  return (track.keyframes || []).find((key) => key.frame === frame) || null;
}

const HANDLERS = {
  [DIRECTOR_OPS.ASSET_INSTANTIATE](state, op) {
    // The caller resolves the catalog entry (HTTP) *before* the transaction and
    // hands the resolved AssetDefinition in here; compileInstance is pure and
    // deterministic given the same asset, point and id seed (design spec
    // section 28).
    const existingIds = new Set((state.objects || []).map((item) => item.id));
    let object;
    try {
      object = compileInstance(op.asset, { point: op.point, idSeed: op.id, existingIds });
    } catch (error) {
      throw new DirectorApiError("BAD_ASSET", `asset.instantiate could not compile: ${error.message}`);
    }
    (state.objects ||= []).push(object);
    return {
      dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.outliner | UI_DIRTY.inspector,
      outcome: { objectId: object.id, assetId: object.asset_id || null },
    };
  },

  [DIRECTOR_OPS.CAMERA_SET_ACTIVE](state, op) {
    findCamera(state, op.cameraId);
    state.active_camera_id = op.cameraId;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector | UI_DIRTY.outliner | UI_DIRTY.timeline };
  },

  [DIRECTOR_OPS.CAMERA_SET_LOCKED](state, op) {
    findCamera(state, op.cameraId).locked = op.value;
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector | UI_DIRTY.viewport };
  },

  [DIRECTOR_OPS.CAMERA_CREATE](state, op) {
    const outcome = createCamera(state, op);
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline, outcome };
  },

  [DIRECTOR_OPS.CAMERA_DUPLICATE](state, op) {
    const outcome = duplicateCamera(state, op);
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline, outcome };
  },

  [DIRECTOR_OPS.CAMERA_DELETE](state, op) {
    const outcome = deleteCamera(state, op);
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline, outcome };
  },

  [DIRECTOR_OPS.CAMERA_RENAME](state, op) {
    const outcome = renameCamera(state, op);
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector, outcome };
  },

  [DIRECTOR_OPS.CAMERA_SET_PLAYBLAST](state, op) {
    const outcome = setPlayblastCamera(state, op);
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector | UI_DIRTY.status, outcome };
  },

  [DIRECTOR_OPS.CAMERA_TRANSFORM](state, op) {
    const track = requireUnlockedCamera(state, op.cameraId);
    const camera = ensureBaseCamera(track);
    if (op.position) camera.position = [...op.position];
    if (op.target) camera.target = [...op.target];
    if (Number.isInteger(op.frame)) {
      const key = keyframeAt(track, op.frame);
      if (!key) throw new DirectorApiError("UNKNOWN_KEYFRAME", `camera has no key at frame ${op.frame}`);
      key.camera = { ...key.camera };
      if (op.position) key.camera.position = [...op.position];
      if (op.target) key.camera.target = [...op.target];
    }
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector | UI_DIRTY.timeline };
  },

  [DIRECTOR_OPS.CAMERA_LOOK_AT](state, op) {
    const track = requireUnlockedCamera(state, op.cameraId);
    if (op.objectId !== undefined) {
      if (op.objectId === null || op.objectId === "") {
        track.target_object_id = null;
        if (track.id === state.active_camera_id) state.target_object_id = null;
      } else {
        findObject(state, op.objectId);
        track.target_object_id = op.objectId;
        if (track.id === state.active_camera_id) state.target_object_id = op.objectId;
      }
    }
    if (op.point) {
      const camera = ensureBaseCamera(track);
      camera.target = [...op.point];
      for (const key of track.keyframes || []) {
        key.camera = { ...key.camera, target: [...op.point] };
      }
    }
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector | UI_DIRTY.timeline };
  },

  [DIRECTOR_OPS.OBJECT_CREATE](state, op) {
    const outcome = createObject(state, op);
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.outliner | UI_DIRTY.inspector, outcome };
  },

  [DIRECTOR_OPS.OBJECT_DUPLICATE](state, op) {
    const outcome = duplicateObject(state, op);
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.outliner | UI_DIRTY.inspector, outcome };
  },

  [DIRECTOR_OPS.OBJECT_DELETE](state, op) {
    const outcome = deleteObject(state, op);
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.outliner | UI_DIRTY.inspector, outcome };
  },

  [DIRECTOR_OPS.OBJECT_RENAME](state, op) {
    const outcome = renameObject(state, op);
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector, outcome };
  },

  [DIRECTOR_OPS.OBJECT_SET_PARENT](state, op) {
    const outcome = setObjectParent(state, op);
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.outliner | UI_DIRTY.inspector, outcome };
  },

  [DIRECTOR_OPS.OBJECT_TRANSFORM](state, op) {
    const object = requireUnlockedObject(state, op.objectId);
    if (op.position) object.position = [...op.position];
    if (op.rotation) object.rotation = [...op.rotation];
    if (op.scale) object.size = [...op.scale];
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.OBJECT_SET_ENABLED](state, op) {
    requireUnlockedObject(state, op.objectId).enabled = op.value;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.outliner | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.OBJECT_SET_LOCKED](state, op) {
    findObject(state, op.objectId).locked = op.value;
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.OBJECT_SET_TAGS](state, op) {
    const object = requireUnlockedObject(state, op.objectId);
    const tags = sanitizeTags(op.tags);
    const warning = tags.length !== op.tags.length ? "some tags were dropped or normalised" : undefined;
    if (tags.length) object.tags = tags;
    else delete object.tags;
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector | UI_DIRTY.viewport, warning };
  },

  [DIRECTOR_OPS.OBJECT_SET_ANNOTATION](state, op) {
    const object = requireUnlockedObject(state, op.objectId);
    const annotation = op.annotation === null ? null : sanitizeAnnotation(op.annotation);
    if (op.annotation && !annotation) {
      throw new DirectorApiError("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    }
    if (annotation) object.annotation = annotation;
    else delete object.annotation;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.outliner | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.CHARACTER_SET_POSE](state, op) {
    const object = requireCharacter(state, op.objectId);
    if (object.character?.motion) {
      throw new DirectorApiError("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    }
    object.character = {
      ...(object.character || {}),
      pose: op.pose === null ? sanitizePose(null) : sanitizePose(op.pose),
    };
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.CHARACTER_SET_JOINT_ROTATION](state, op) {
    const object = requireCharacter(state, op.objectId);
    if (object.character?.motion) {
      throw new DirectorApiError("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    }
    if (!normalizeQuaternion(op.rotation)) {
      throw new DirectorApiError("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    }
    object.character = {
      ...(object.character || {}),
      pose: withJointRotation(object.character?.pose, op.joint, op.rotation),
    };
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.CHARACTER_SET_MOTION](state, op) {
    const object = requireCharacter(state, op.objectId);
    const motion = sanitizeMotion(op.motion);
    if (!motion) throw new DirectorApiError("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    // Pose and motion are mutually exclusive (design spec section 27): drop any
    // stale FK joint overrides so they cannot reappear when the clip is cleared.
    const priorPose = object.character?.pose || {};
    object.character = {
      ...(object.character || {}),
      pose: { preset_id: priorPose.preset_id || "neutral", root_offset: priorPose.root_offset || [0, 0, 0], joints: {} },
      motion,
    };
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.CHARACTER_CLEAR_MOTION](state, op) {
    const object = requireCharacter(state, op.objectId);
    if (!object.character) return { dirtyMask: 0 };
    object.character = { ...object.character, motion: null };
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.KEYFRAME_UPSERT](state, op) {
    const track = requireUnlockedCamera(state, op.cameraId);
    if (op.frame >= (state.duration_frames || 0)) {
      throw new DirectorApiError("FRAME_OUT_OF_RANGE", `frame ${op.frame} is past the timeline`);
    }
    track.keyframes ||= [];
    let key = keyframeAt(track, op.frame);
    if (!key) {
      const base = keyframeAt(track, 0)?.camera || track.camera || {};
      key = { frame: op.frame, camera: JSON.parse(JSON.stringify(base)), interpolation: "ease" };
      track.keyframes.push(key);
      track.keyframes.sort((a, b) => a.frame - b.frame);
    }
    if (op.camera) key.camera = { ...key.camera, ...JSON.parse(JSON.stringify(op.camera)) };
    if (op.interpolation) key.interpolation = op.interpolation;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.KEYFRAME_REMOVE](state, op) {
    const track = requireUnlockedCamera(state, op.cameraId);
    const before = (track.keyframes || []).length;
    track.keyframes = (track.keyframes || []).filter((key) => key.frame !== op.frame);
    if (track.keyframes.length === before) {
      throw new DirectorApiError("UNKNOWN_KEYFRAME", `camera has no key at frame ${op.frame}`);
    }
    const warning = track.keyframes.length === 0 ? "camera has no keyframes left" : undefined;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline | UI_DIRTY.inspector, warning };
  },

  [DIRECTOR_OPS.KEYFRAME_SET_INTERPOLATION](state, op) {
    const track = requireUnlockedCamera(state, op.cameraId);
    const key = keyframeAt(track, op.frame);
    if (!key) throw new DirectorApiError("UNKNOWN_KEYFRAME", `camera has no key at frame ${op.frame}`);
    if (!INTERPOLATION_MODES.includes(op.interpolation)) {
      throw new DirectorApiError("BAD_INTERPOLATION", `Unsupported interpolation: ${op.interpolation}`);
    }
    key.interpolation = op.interpolation;
    return { dirtyMask: UI_DIRTY.timeline | UI_DIRTY.viewport | UI_DIRTY.previews };
  },

  [DIRECTOR_OPS.TIMELINE_SET_RANGE](state, op) {
    const last = Math.max(0, (state.duration_frames || 1) - 1);
    if (op.start > last || op.end > last) {
      throw new DirectorApiError("FRAME_OUT_OF_RANGE", `range must stay within 0..${last}`);
    }
    state.playback_range = [op.start, op.end];
    return { dirtyMask: UI_DIRTY.timeline | UI_DIRTY.status };
  },

  [DIRECTOR_OPS.TIMELINE_SET_DURATION](state, op) {
    state.duration_frames = op.frames;
    if (Array.isArray(state.playback_range)) {
      const last = op.frames - 1;
      state.playback_range = [
        Math.min(state.playback_range[0], last),
        Math.min(state.playback_range[1], last),
      ];
    }
    return { dirtyMask: UI_DIRTY.timeline | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.status };
  },

  [DIRECTOR_OPS.CUT_UPSERT](state, op) {
    const outcome = upsertCut(state, op);
    return { dirtyMask: UI_DIRTY.timeline | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.status, outcome };
  },

  [DIRECTOR_OPS.CUT_REMOVE](state, op) {
    const outcome = removeCut(state, op);
    return { dirtyMask: UI_DIRTY.timeline | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.status, outcome };
  },

  [DIRECTOR_OPS.CUT_SET_CAMERA](state, op) {
    const outcome = setCutCamera(state, op);
    return { dirtyMask: UI_DIRTY.timeline | UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.status, outcome };
  },
};

export function applyDirectorOperation({ state, operation }) {
  const handler = HANDLERS[operation.type];
  if (!handler) throw new DirectorApiError("UNKNOWN_OPERATION", `Unknown operation type: ${operation.type}`);
  return handler(state, operation) || { dirtyMask: 0 };
}
