// Operation handlers. Each mutates a cloned draft of ui.state in place and
// returns { dirtyMask, warning? }. Entity-existence and range checks throw
// DirectorApiError so the transaction aborts atomically before anything is
// committed.

import { UI_DIRTY } from "../director/ui-dirty.js";
import { INTERPOLATION_MODES } from "../director/core.js";
import { DIRECTOR_OPS } from "./constants.js";
import { DirectorApiError } from "./errors.js";

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

function ensureBaseCamera(track) {
  if (!track.camera || typeof track.camera !== "object") track.camera = {};
  return track.camera;
}

function keyframeAt(track, frame) {
  return (track.keyframes || []).find((key) => key.frame === frame) || null;
}

const HANDLERS = {
  [DIRECTOR_OPS.CAMERA_SET_ACTIVE](state, op) {
    findCamera(state, op.cameraId);
    state.active_camera_id = op.cameraId;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector | UI_DIRTY.outliner | UI_DIRTY.timeline };
  },

  [DIRECTOR_OPS.CAMERA_TRANSFORM](state, op) {
    const track = findCamera(state, op.cameraId);
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
    const track = findCamera(state, op.cameraId);
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

  [DIRECTOR_OPS.OBJECT_TRANSFORM](state, op) {
    const object = findObject(state, op.objectId);
    if (op.position) object.position = [...op.position];
    if (op.rotation) object.rotation = [...op.rotation];
    if (op.scale) object.size = [...op.scale];
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.OBJECT_SET_ENABLED](state, op) {
    findObject(state, op.objectId).enabled = op.value;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.outliner | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.OBJECT_SET_LOCKED](state, op) {
    findObject(state, op.objectId).locked = op.value;
    return { dirtyMask: UI_DIRTY.outliner | UI_DIRTY.inspector };
  },

  [DIRECTOR_OPS.KEYFRAME_UPSERT](state, op) {
    const track = findCamera(state, op.cameraId);
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
    const track = findCamera(state, op.cameraId);
    const before = (track.keyframes || []).length;
    track.keyframes = (track.keyframes || []).filter((key) => key.frame !== op.frame);
    if (track.keyframes.length === before) {
      throw new DirectorApiError("UNKNOWN_KEYFRAME", `camera has no key at frame ${op.frame}`);
    }
    const warning = track.keyframes.length === 0 ? "camera has no keyframes left" : undefined;
    return { dirtyMask: UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.timeline | UI_DIRTY.inspector, warning };
  },

  [DIRECTOR_OPS.KEYFRAME_SET_INTERPOLATION](state, op) {
    const track = findCamera(state, op.cameraId);
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
};

export function applyDirectorOperation({ state, operation }) {
  const handler = HANDLERS[operation.type];
  if (!handler) throw new DirectorApiError("UNKNOWN_OPERATION", `Unknown operation type: ${operation.type}`);
  return handler(state, operation) || { dirtyMask: 0 };
}
