// Pure, deterministic structural helpers for the semantic Director API:
// create/duplicate/delete/rename entities and edit the sequence's cuts.
//
// This module operates only on a draft state object. It must never import
// DOM, three.js, ui-services (promptText/confirmAction), or any LLM code --
// entity-ops.js is called from apply.js inside an atomic transaction, before
// anything is committed, and has to stay safe to unit test headlessly.

import { cloneCamera, defaultCamera } from "../director/core.js";
import { defaultSequence } from "../director/sequence.js";
import { DirectorApiError } from "./errors.js";

export const AGENT_OBJECT_TYPES = new Set([
  "cube",
  "sphere",
  "cylinder",
  "torus",
  "pyramid",
  "ground",
  "human",
  "card",
  "null",
  "sun_light",
  "point_light",
  "spot_light",
]);

function uniqueId(existingIds, prefix, requested = "") {
  const clean = String(requested || "")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .slice(0, 120);

  if (clean) {
    if (existingIds.has(clean)) {
      throw new DirectorApiError("DUPLICATE_ID", `${clean} already exists`);
    }
    return clean;
  }

  let index = 1;
  let id = `${prefix}_${index}`;

  while (existingIds.has(id)) {
    index += 1;
    id = `${prefix}_${index}`;
  }

  return id;
}

function primitiveDefaults(type) {
  const ground = type === "ground";
  const isHuman = type === "human";
  const isCard = type === "card";
  const isSunLight = type === "sun_light";
  const isPointLight = type === "point_light";
  const isSpotLight = type === "spot_light";

  let size;
  if (ground) size = [12, 0.1, 12];
  else if (isHuman) size = [0.7, 1.8, 0.4];
  else if (isCard) size = [2, 3];
  else size = [1.5, 1.5, 1.5];

  let position = [0, 0, 0];
  let rotation = [0, 0, 0];
  let color = "#8c929b";
  let intensity;
  let cast_shadow;
  let cone_angle;
  let penumbra;

  if (isSunLight) {
    position = [5.0, 8.5, 4.0];
    rotation = [-55, 35, 0];
    color = "#fff6ec";
    intensity = 2.2;
    cast_shadow = true;
  } else if (isPointLight) {
    position = [0, 3, 0];
    color = "#ffffff";
    intensity = 2.0;
    cast_shadow = false;
  } else if (isSpotLight) {
    position = [0, 4, 0];
    rotation = [-60, 0, 0];
    color = "#ffffff";
    intensity = 3.0;
    cone_angle = 45;
    penumbra = 0.25;
    cast_shadow = true;
  }

  return {
    position,
    rotation,
    size,
    color,
    material_mode: ground ? "checker" : "textured",
    ...(intensity !== undefined ? { intensity } : {}),
    ...(cast_shadow !== undefined ? { cast_shadow } : {}),
    ...(cone_angle !== undefined ? { cone_angle } : {}),
    ...(penumbra !== undefined ? { penumbra } : {}),
  };
}

// -- Cameras -----------------------------------------------------------------

export function createCamera(state, op) {
  state.cameras ||= [];
  const existingIds = new Set(state.cameras.map((item) => item.id));
  const id = uniqueId(existingIds, "camera", op.id);

  const camera = { ...defaultCamera(), ...(op.camera || {}) };
  const track = {
    id,
    name: op.name || id,
    color: "#4aa3ef",
    locked: false,
    muted: false,
    solo: false,
    camera,
    keyframes: [{ frame: 0, camera: cloneCamera(camera), interpolation: op.interpolation || "ease" }],
  };
  state.cameras.push(track);
  return { cameraId: id };
}

export function duplicateCamera(state, op) {
  const source = (state.cameras || []).find((item) => item.id === op.cameraId);
  if (!source) throw new DirectorApiError("UNKNOWN_CAMERA", `${op.cameraId} does not exist`);

  const existingIds = new Set(state.cameras.map((item) => item.id));
  const id = uniqueId(existingIds, "camera", op.id);
  const clone = JSON.parse(JSON.stringify(source));
  clone.id = id;
  clone.name = op.name || `${source.name || source.id} copy`;
  state.cameras.push(clone);
  return { cameraId: id };
}

export function deleteCamera(state, op) {
  const cameras = state.cameras || [];
  const index = cameras.findIndex((item) => item.id === op.cameraId);
  if (index === -1) throw new DirectorApiError("UNKNOWN_CAMERA", `${op.cameraId} does not exist`);
  if (cameras.length <= 1) throw new DirectorApiError("LAST_CAMERA", "cannot delete the only camera");
  if (cameras[index].locked) throw new DirectorApiError("ENTITY_LOCKED", `${op.cameraId} is locked`);

  const cuts = state.sequence?.cuts || [];
  if (cuts.some((cut) => cut.camera_id === op.cameraId)) {
    throw new DirectorApiError("CAMERA_IN_USE", `${op.cameraId} is referenced by a cut`);
  }

  cameras.splice(index, 1);
  if (state.active_camera_id === op.cameraId) state.active_camera_id = cameras[0].id;
  if (state.playblast_camera_id === op.cameraId) state.playblast_camera_id = cameras[0].id;
  return { cameraId: op.cameraId };
}

export function renameCamera(state, op) {
  const camera = (state.cameras || []).find((item) => item.id === op.cameraId);
  if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `${op.cameraId} does not exist`);
  camera.name = String(op.name || "").trim().slice(0, 80) || camera.name;
  return { cameraId: camera.id };
}

export function setPlayblastCamera(state, op) {
  const SEQUENCE_TARGET = "__sequence__";
  if (op.cameraId === SEQUENCE_TARGET) {
    const cuts = state.sequence?.cuts || [];
    if (!cuts.length) {
      throw new DirectorApiError("NO_CUTS", "the sequence has no cuts to play back");
    }
    state.playblast_camera_id = SEQUENCE_TARGET;
    return { cameraId: SEQUENCE_TARGET };
  }
  const camera = (state.cameras || []).find((item) => item.id === op.cameraId);
  if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `${op.cameraId} does not exist`);
  state.playblast_camera_id = camera.id;
  return { cameraId: camera.id };
}

// -- Objects ------------------------------------------------------------------

export function createObject(state, op) {
  if (!AGENT_OBJECT_TYPES.has(op.objectType)) {
    throw new DirectorApiError("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${op.objectType}`);
  }
  state.objects ||= [];
  const existingIds = new Set(state.objects.map((item) => item.id));
  const id = uniqueId(existingIds, op.objectType, op.id);
  const defaults = primitiveDefaults(op.objectType);

  const object = {
    id,
    type: op.objectType,
    name: op.name || id,
    ...defaults,
    ...(op.position ? { position: [...op.position] } : {}),
    ...(op.rotation ? { rotation: [...op.rotation] } : {}),
    keyframes: [],
    enabled: true,
    locked: false,
  };
  state.objects.push(object);
  return { objectId: id };
}

export function duplicateObject(state, op) {
  const source = (state.objects || []).find((item) => item.id === op.objectId);
  if (!source) throw new DirectorApiError("UNKNOWN_OBJECT", `${op.objectId} does not exist`);

  const existingIds = new Set(state.objects.map((item) => item.id));
  const id = uniqueId(existingIds, source.type || "object", op.id);
  const offset = Array.isArray(op.offset) ? op.offset : [0.35, 0, 0.35];
  const clone = JSON.parse(JSON.stringify(source));
  clone.id = id;
  clone.name = op.name || `${source.name || source.id} copy`;
  clone.locked = false;
  const base = Array.isArray(source.position) ? source.position : [0, 0, 0];
  clone.position = [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]];
  state.objects.push(clone);
  return { objectId: id, resourceRefresh: Boolean(source.asset_id) };
}

export function deleteObject(state, op) {
  const objects = state.objects || [];
  const index = objects.findIndex((item) => item.id === op.objectId);
  if (index === -1) throw new DirectorApiError("UNKNOWN_OBJECT", `${op.objectId} does not exist`);
  const object = objects[index];
  if (object.id === "subject") throw new DirectorApiError("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (object.locked) throw new DirectorApiError("ENTITY_LOCKED", `${op.objectId} is locked`);

  for (const child of objects) {
    if (child.parent_id === op.objectId) child.parent_id = null;
  }
  objects.splice(index, 1);
  return { objectId: op.objectId, resourceRefresh: Boolean(object.asset_id) };
}

export function renameObject(state, op) {
  const object = (state.objects || []).find((item) => item.id === op.objectId);
  if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `${op.objectId} does not exist`);
  object.name = String(op.name || "").trim().slice(0, 80) || object.name;
  return { objectId: object.id };
}

export function setObjectParent(state, op) {
  const object = (state.objects || []).find((item) => item.id === op.objectId);
  if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `${op.objectId} does not exist`);

  if (op.parentId === null || op.parentId === undefined) {
    object.parent_id = null;
    return { objectId: object.id };
  }

  if (op.parentId === op.objectId) {
    throw new DirectorApiError("INVALID_PARENT", "an object cannot be its own parent");
  }

  const parent = (state.objects || []).find((item) => item.id === op.parentId);
  if (!parent) throw new DirectorApiError("UNKNOWN_OBJECT", `${op.parentId} does not exist`);

  // Walk the candidate parent's own ancestry: if op.objectId shows up, wiring
  // this parent in would create a cycle.
  const byId = new Map(state.objects.map((item) => [item.id, item]));
  let cursor = parent;
  const seen = new Set();
  while (cursor) {
    if (cursor.id === op.objectId) {
      throw new DirectorApiError("INVALID_PARENT", "assigning this parent would create a cycle");
    }
    if (seen.has(cursor.id)) break;
    seen.add(cursor.id);
    cursor = cursor.parent_id ? byId.get(cursor.parent_id) : null;
  }

  object.parent_id = op.parentId;
  return { objectId: object.id };
}

// -- Sequence cuts -------------------------------------------------------------

export function upsertCut(state, op) {
  state.sequence ||= defaultSequence();
  const cuts = (state.sequence.cuts ||= []);
  const lastFrame = Math.max(0, (state.duration_frames || 1) - 1);

  if (!Number.isInteger(op.start) || op.start < 0 || op.start > lastFrame) {
    throw new DirectorApiError("FRAME_OUT_OF_RANGE", `cut start must be within 0..${lastFrame}`);
  }
  const camera = (state.cameras || []).find((item) => item.id === op.cameraId);
  if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `${op.cameraId} does not exist`);

  const existing = cuts.find((cut) => cut.start === op.start);
  if (existing) existing.camera_id = op.cameraId;
  else cuts.push({ start: op.start, camera_id: op.cameraId });
  cuts.sort((a, b) => a.start - b.start);
  state.sequence.enabled = true;
  return { start: op.start, cameraId: op.cameraId };
}

export function removeCut(state, op) {
  state.sequence ||= defaultSequence();
  const cuts = state.sequence.cuts || [];
  const index = cuts.findIndex((cut) => cut.start === op.start);
  if (index === -1) throw new DirectorApiError("UNKNOWN_CUT", `no cut starts at frame ${op.start}`);
  cuts.splice(index, 1);
  if (cuts.length) cuts[0].start = 0;
  state.sequence.enabled = cuts.length > 0;
  return { start: op.start };
}

export function setCutCamera(state, op) {
  state.sequence ||= defaultSequence();
  const cuts = state.sequence.cuts || [];
  const cut = cuts.find((item) => item.start === op.start);
  if (!cut) throw new DirectorApiError("UNKNOWN_CUT", `no cut starts at frame ${op.start}`);
  const camera = (state.cameras || []).find((item) => item.id === op.cameraId);
  if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `${op.cameraId} does not exist`);
  cut.camera_id = op.cameraId;
  return { start: op.start, cameraId: op.cameraId };
}
