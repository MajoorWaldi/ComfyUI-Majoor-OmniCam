// Transaction-envelope and per-operation structural validation.
//
// Entity existence and value-range checks that need live state live in apply.js
// (they throw DirectorApiError with the right operationIndex). This module only
// rejects malformed input: bad version, bad id, empty description, a non-array
// or wrong-sized operation list, unknown op types, non-finite numbers,
// malformed vectors and unsupported interpolation.

import { INTERPOLATION_MODES } from "../director/core.js";
import {
  CAMERA_TYPES,
  DIRECTOR_API_VERSION,
  DIRECTOR_OPS,
  DIRECTOR_OP_VALUES,
  MAX_ENTITY_ID_LENGTH,
  MAX_ENTITY_NAME_LENGTH,
  MAX_OPERATIONS_PER_TRANSACTION,
} from "./constants.js";
import { AGENT_OBJECT_TYPES } from "./entity-ops.js";
import { DirectorApiError } from "./errors.js";
import { hasRecentTransactionId } from "./tx-id-cache.js";

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

function assertVec3(value, label, operationIndex) {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(isFiniteNumber)) {
    throw new DirectorApiError("BAD_VECTOR", `${label} must be [x,y,z] of finite numbers`, operationIndex);
  }
}

function assertFrame(value, label, operationIndex) {
  if (!Number.isInteger(value) || value < 0) {
    throw new DirectorApiError("BAD_FRAME", `${label} must be a non-negative integer frame`, operationIndex);
  }
}

function assertString(value, label, operationIndex, maxLength) {
  if (typeof value !== "string" || value.length === 0) {
    throw new DirectorApiError("BAD_ID", `${label} must be a non-empty string`, operationIndex);
  }
  if (maxLength !== undefined && value.length > maxLength) {
    throw new DirectorApiError("BAD_ID", `${label} exceeds ${maxLength} characters`, operationIndex);
  }
}

function assertFiniteNumber(value, label, operationIndex) {
  if (!isFiniteNumber(value)) {
    throw new DirectorApiError("BAD_VALUE", `${label} must be a finite number`, operationIndex);
  }
}

const CAMERA_FIELDS = new Set([
  "position",
  "target",
  "up",
  "fov",
  "roll",
  "zoom",
  "near",
  "far",
  "camera_type",
]);

function assertCameraPayload(camera, operationIndex) {
  for (const key of Object.keys(camera)) {
    if (!CAMERA_FIELDS.has(key)) {
      throw new DirectorApiError("BAD_VALUE", `camera.create: unsupported camera field "${key}"`, operationIndex);
    }
  }
  if (camera.position !== undefined) assertVec3(camera.position, "camera.position", operationIndex);
  if (camera.target !== undefined) assertVec3(camera.target, "camera.target", operationIndex);
  if (camera.up !== undefined) assertVec3(camera.up, "camera.up", operationIndex);
  if (camera.fov !== undefined) {
    assertFiniteNumber(camera.fov, "camera.fov", operationIndex);
    if (camera.fov < 1 || camera.fov > 179) {
      throw new DirectorApiError("BAD_VALUE", "camera.fov must be within 1..179", operationIndex);
    }
  }
  if (camera.roll !== undefined) assertFiniteNumber(camera.roll, "camera.roll", operationIndex);
  if (camera.zoom !== undefined) {
    assertFiniteNumber(camera.zoom, "camera.zoom", operationIndex);
    if (camera.zoom <= 0) {
      throw new DirectorApiError("BAD_VALUE", "camera.zoom must be > 0", operationIndex);
    }
  }
  if (camera.near !== undefined) {
    assertFiniteNumber(camera.near, "camera.near", operationIndex);
    if (camera.near <= 0) {
      throw new DirectorApiError("BAD_VALUE", "camera.near must be > 0", operationIndex);
    }
  }
  if (camera.far !== undefined) {
    assertFiniteNumber(camera.far, "camera.far", operationIndex);
    if (camera.near !== undefined && camera.far <= camera.near) {
      throw new DirectorApiError("BAD_VALUE", "camera.far must be greater than camera.near", operationIndex);
    }
  }
  if (camera.camera_type !== undefined && !CAMERA_TYPES.includes(camera.camera_type)) {
    throw new DirectorApiError("BAD_VALUE", `Unsupported camera_type: ${camera.camera_type}`, operationIndex);
  }
}

function validateOperationShape(operation, index) {
  if (!operation || typeof operation !== "object" || Array.isArray(operation)) {
    throw new DirectorApiError("BAD_OPERATION", "operation must be an object", index);
  }
  const { type } = operation;
  if (!DIRECTOR_OP_VALUES.includes(type)) {
    throw new DirectorApiError("UNKNOWN_OPERATION", `Unknown operation type: ${type}`, index);
  }

  switch (type) {
    case DIRECTOR_OPS.ASSET_INSTANTIATE: {
      const asset = operation.asset;
      if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
        throw new DirectorApiError("BAD_VALUE", "asset.instantiate needs a resolved asset object", index);
      }
      assertString(asset.id, "asset.id", index);
      assertString(asset.kind, "asset.kind", index);
      if (String(asset.id).length > 120 || String(asset.kind).length > 32) {
        throw new DirectorApiError("BAD_VALUE", "asset.id / asset.kind exceed their bounds", index);
      }
      if (asset.tags !== undefined && (!Array.isArray(asset.tags) || asset.tags.length > 32)) {
        throw new DirectorApiError("BAD_VALUE", "asset.tags must be a list of at most 32", index);
      }
      if (asset.animations !== undefined && (!Array.isArray(asset.animations) || asset.animations.length > 256)) {
        throw new DirectorApiError("BAD_VALUE", "asset.animations must be a list of at most 256", index);
      }
      if (asset.rig !== undefined && asset.rig !== null) {
        if (typeof asset.rig !== "object" || Array.isArray(asset.rig)) {
          throw new DirectorApiError("BAD_VALUE", "asset.rig must be an object", index);
        }
        if (asset.rig.bone_map && Object.keys(asset.rig.bone_map).length > 128) {
          throw new DirectorApiError("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", index);
        }
      }
      if (operation.point !== undefined) assertVec3(operation.point, "point", index);
      if (operation.id !== undefined) assertString(operation.id, "id", index);
      break;
    }

    case DIRECTOR_OPS.CAMERA_SET_ACTIVE:
      assertString(operation.cameraId, "cameraId", index);
      break;

    case DIRECTOR_OPS.CAMERA_SET_LOCKED:
      assertString(operation.cameraId, "cameraId", index);
      if (typeof operation.value !== "boolean") {
        throw new DirectorApiError("BAD_VALUE", "camera.set_locked needs a boolean value", index);
      }
      break;

    case DIRECTOR_OPS.CAMERA_CREATE:
      if (operation.id !== undefined) assertString(operation.id, "id", index, MAX_ENTITY_ID_LENGTH);
      if (operation.name !== undefined) assertString(operation.name, "name", index, MAX_ENTITY_NAME_LENGTH);
      if (operation.camera !== undefined) {
        if (typeof operation.camera !== "object" || Array.isArray(operation.camera) || operation.camera === null) {
          throw new DirectorApiError("BAD_VALUE", "camera.create camera must be an object", index);
        }
        assertCameraPayload(operation.camera, index);
      }
      if (operation.interpolation !== undefined && !INTERPOLATION_MODES.includes(operation.interpolation)) {
        throw new DirectorApiError("BAD_INTERPOLATION", `Unsupported interpolation: ${operation.interpolation}`, index);
      }
      break;

    case DIRECTOR_OPS.CAMERA_DUPLICATE:
      assertString(operation.cameraId, "cameraId", index, MAX_ENTITY_ID_LENGTH);
      if (operation.id !== undefined) assertString(operation.id, "id", index, MAX_ENTITY_ID_LENGTH);
      if (operation.name !== undefined) assertString(operation.name, "name", index, MAX_ENTITY_NAME_LENGTH);
      break;

    case DIRECTOR_OPS.CAMERA_DELETE:
    case DIRECTOR_OPS.CAMERA_SET_PLAYBLAST:
      assertString(operation.cameraId, "cameraId", index, MAX_ENTITY_ID_LENGTH);
      break;

    case DIRECTOR_OPS.CAMERA_RENAME:
      assertString(operation.cameraId, "cameraId", index, MAX_ENTITY_ID_LENGTH);
      assertString(operation.name, "name", index, MAX_ENTITY_NAME_LENGTH);
      break;

    case DIRECTOR_OPS.OBJECT_CREATE:
      assertString(operation.objectType, "objectType", index);
      if (!AGENT_OBJECT_TYPES.has(operation.objectType)) {
        throw new DirectorApiError("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${operation.objectType}`, index);
      }
      if (operation.asset !== undefined || operation.url !== undefined || operation.path !== undefined) {
        throw new DirectorApiError("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", index);
      }
      if (operation.id !== undefined) assertString(operation.id, "id", index, MAX_ENTITY_ID_LENGTH);
      if (operation.name !== undefined) assertString(operation.name, "name", index, MAX_ENTITY_NAME_LENGTH);
      if (operation.position !== undefined) assertVec3(operation.position, "position", index);
      if (operation.rotation !== undefined) assertVec3(operation.rotation, "rotation", index);
      break;

    case DIRECTOR_OPS.OBJECT_DUPLICATE:
      assertString(operation.objectId, "objectId", index, MAX_ENTITY_ID_LENGTH);
      if (operation.id !== undefined) assertString(operation.id, "id", index, MAX_ENTITY_ID_LENGTH);
      if (operation.name !== undefined) assertString(operation.name, "name", index, MAX_ENTITY_NAME_LENGTH);
      if (operation.offset !== undefined) assertVec3(operation.offset, "offset", index);
      break;

    case DIRECTOR_OPS.OBJECT_DELETE:
      assertString(operation.objectId, "objectId", index, MAX_ENTITY_ID_LENGTH);
      break;

    case DIRECTOR_OPS.OBJECT_RENAME:
      assertString(operation.objectId, "objectId", index, MAX_ENTITY_ID_LENGTH);
      assertString(operation.name, "name", index, MAX_ENTITY_NAME_LENGTH);
      break;

    case DIRECTOR_OPS.OBJECT_SET_PARENT:
      assertString(operation.objectId, "objectId", index, MAX_ENTITY_ID_LENGTH);
      if (operation.parentId !== null && operation.parentId !== undefined) {
        assertString(operation.parentId, "parentId", index, MAX_ENTITY_ID_LENGTH);
      }
      break;

    case DIRECTOR_OPS.CAMERA_TRANSFORM:
      if (operation.cameraId !== undefined) assertString(operation.cameraId, "cameraId", index);
      if (operation.position !== undefined) assertVec3(operation.position, "position", index);
      if (operation.target !== undefined) assertVec3(operation.target, "target", index);
      if (operation.frame !== undefined) assertFrame(operation.frame, "frame", index);
      if (operation.position === undefined && operation.target === undefined) {
        throw new DirectorApiError("EMPTY_OPERATION", "camera.transform needs position and/or target", index);
      }
      break;

    case DIRECTOR_OPS.CAMERA_LOOK_AT:
      if (operation.cameraId !== undefined) assertString(operation.cameraId, "cameraId", index);
      if (operation.point !== undefined) assertVec3(operation.point, "point", index);
      if (operation.objectId !== undefined && operation.objectId !== null) {
        assertString(operation.objectId, "objectId", index);
      }
      if (operation.point === undefined && operation.objectId === undefined) {
        throw new DirectorApiError("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", index);
      }
      break;

    case DIRECTOR_OPS.OBJECT_TRANSFORM:
      assertString(operation.objectId, "objectId", index);
      if (operation.position !== undefined) assertVec3(operation.position, "position", index);
      if (operation.rotation !== undefined) assertVec3(operation.rotation, "rotation", index);
      if (operation.scale !== undefined) assertVec3(operation.scale, "scale", index);
      if (
        operation.position === undefined &&
        operation.rotation === undefined &&
        operation.scale === undefined
      ) {
        throw new DirectorApiError("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", index);
      }
      break;

    case DIRECTOR_OPS.OBJECT_SET_ENABLED:
    case DIRECTOR_OPS.OBJECT_SET_LOCKED:
      assertString(operation.objectId, "objectId", index);
      if (typeof operation.value !== "boolean") {
        throw new DirectorApiError("BAD_VALUE", `${type} needs a boolean value`, index);
      }
      break;

    case DIRECTOR_OPS.OBJECT_SET_TAGS:
      assertString(operation.objectId, "objectId", index);
      if (!Array.isArray(operation.tags) || operation.tags.some((tag) => typeof tag !== "string")) {
        throw new DirectorApiError("BAD_VALUE", "object.set_tags needs a string array", index);
      }
      if (operation.tags.length > 64) {
        throw new DirectorApiError("BAD_VALUE", "object.set_tags: too many tags", index);
      }
      break;

    case DIRECTOR_OPS.OBJECT_SET_ANNOTATION:
      assertString(operation.objectId, "objectId", index);
      if (operation.annotation !== null && (typeof operation.annotation !== "object" || Array.isArray(operation.annotation))) {
        throw new DirectorApiError("BAD_VALUE", "object.set_annotation needs an object or null", index);
      }
      break;

    case DIRECTOR_OPS.CHARACTER_SET_POSE:
      assertString(operation.objectId, "objectId", index);
      if (operation.pose !== null && (typeof operation.pose !== "object" || Array.isArray(operation.pose))) {
        throw new DirectorApiError("BAD_VALUE", "character.set_pose needs a pose object or null", index);
      }
      break;

    case DIRECTOR_OPS.CHARACTER_SET_JOINT_ROTATION:
      assertString(operation.objectId, "objectId", index);
      assertString(operation.joint, "joint", index);
      if (
        !Array.isArray(operation.rotation) ||
        operation.rotation.length !== 4 ||
        !operation.rotation.every(isFiniteNumber)
      ) {
        throw new DirectorApiError("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", index);
      }
      break;

    case DIRECTOR_OPS.CHARACTER_SET_MOTION: {
      assertString(operation.objectId, "objectId", index);
      const motion = operation.motion;
      if (!motion || typeof motion !== "object" || Array.isArray(motion)) {
        throw new DirectorApiError("BAD_VALUE", "character.set_motion needs a motion object", index);
      }
      assertString(motion.clip_id, "motion.clip_id", index);
      for (const key of ["start_frame", "end_frame", "speed", "offset_seconds"]) {
        if (motion[key] !== undefined && !isFiniteNumber(motion[key])) {
          throw new DirectorApiError("BAD_VALUE", `motion.${key} must be a finite number`, index);
        }
      }
      if (isFiniteNumber(motion.start_frame) && isFiniteNumber(motion.end_frame)
        && motion.end_frame > 0 && motion.end_frame <= motion.start_frame) {
        throw new DirectorApiError("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", index);
      }
      break;
    }

    case DIRECTOR_OPS.CHARACTER_CLEAR_MOTION:
      assertString(operation.objectId, "objectId", index);
      break;

    case DIRECTOR_OPS.KEYFRAME_UPSERT:
      if (operation.cameraId !== undefined) assertString(operation.cameraId, "cameraId", index);
      assertFrame(operation.frame, "frame", index);
      if (operation.interpolation !== undefined && !INTERPOLATION_MODES.includes(operation.interpolation)) {
        throw new DirectorApiError("BAD_INTERPOLATION", `Unsupported interpolation: ${operation.interpolation}`, index);
      }
      if (operation.camera !== undefined) {
        if (!operation.camera || typeof operation.camera !== "object") {
          throw new DirectorApiError("BAD_VALUE", "keyframe.upsert camera must be an object", index);
        }
        if (operation.camera.position !== undefined) assertVec3(operation.camera.position, "camera.position", index);
        if (operation.camera.target !== undefined) assertVec3(operation.camera.target, "camera.target", index);
        for (const scalar of ["fov", "roll", "zoom", "near", "far"]) {
          if (operation.camera[scalar] !== undefined && !isFiniteNumber(operation.camera[scalar])) {
            throw new DirectorApiError("BAD_VALUE", `camera.${scalar} must be finite`, index);
          }
        }
      }
      break;

    case DIRECTOR_OPS.KEYFRAME_REMOVE:
      if (operation.cameraId !== undefined) assertString(operation.cameraId, "cameraId", index);
      assertFrame(operation.frame, "frame", index);
      break;

    case DIRECTOR_OPS.KEYFRAME_SET_INTERPOLATION:
      if (operation.cameraId !== undefined) assertString(operation.cameraId, "cameraId", index);
      assertFrame(operation.frame, "frame", index);
      if (!INTERPOLATION_MODES.includes(operation.interpolation)) {
        throw new DirectorApiError("BAD_INTERPOLATION", `Unsupported interpolation: ${operation.interpolation}`, index);
      }
      break;

    case DIRECTOR_OPS.TIMELINE_SET_RANGE:
      assertFrame(operation.start, "start", index);
      assertFrame(operation.end, "end", index);
      if (operation.end < operation.start) {
        throw new DirectorApiError("BAD_RANGE", "range end is before start", index);
      }
      break;

    case DIRECTOR_OPS.TIMELINE_SET_DURATION:
      if (!Number.isInteger(operation.frames) || operation.frames < 1) {
        throw new DirectorApiError("BAD_VALUE", "timeline.set_duration needs frames >= 1", index);
      }
      break;

    case DIRECTOR_OPS.CUT_UPSERT:
      assertFrame(operation.start, "start", index);
      assertString(operation.cameraId, "cameraId", index);
      break;

    case DIRECTOR_OPS.CUT_REMOVE:
      assertFrame(operation.start, "start", index);
      break;

    case DIRECTOR_OPS.CUT_SET_CAMERA:
      assertFrame(operation.start, "start", index);
      assertString(operation.cameraId, "cameraId", index);
      break;

    default:
      throw new DirectorApiError("UNKNOWN_OPERATION", `Unknown operation type: ${type}`, index);
  }
}

export function validateDirectorTransaction(ui, input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new DirectorApiError("BAD_TRANSACTION", "transaction must be an object");
  }
  if (input.version !== DIRECTOR_API_VERSION) {
    throw new DirectorApiError("UNSUPPORTED_VERSION", `Unsupported API version: ${input.version}`);
  }
  if (typeof input.id !== "string" || input.id.length === 0) {
    throw new DirectorApiError("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  }
  if (hasRecentTransactionId(ui, input.id)) {
    throw new DirectorApiError("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${input.id}`);
  }
  if (typeof input.description !== "string" || input.description.trim().length === 0) {
    throw new DirectorApiError("EMPTY_DESCRIPTION", "transaction description must not be empty");
  }
  if (
    input.baseRevision !== undefined
    && (!Number.isInteger(input.baseRevision) || input.baseRevision < 0)
  ) {
    throw new DirectorApiError(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer",
    );
  }
  if (!Array.isArray(input.operations)) {
    throw new DirectorApiError("BAD_OPERATIONS", "operations must be an array");
  }
  if (input.operations.length === 0) {
    throw new DirectorApiError("NO_OPERATIONS", "transaction has no operations");
  }
  if (input.operations.length > MAX_OPERATIONS_PER_TRANSACTION) {
    throw new DirectorApiError(
      "TOO_MANY_OPERATIONS",
      `transaction has ${input.operations.length} operations (max ${MAX_OPERATIONS_PER_TRANSACTION})`,
    );
  }

  input.operations.forEach((operation, index) => validateOperationShape(operation, index));

  return {
    version: DIRECTOR_API_VERSION,
    id: input.id,
    baseRevision: input.baseRevision,
    description: input.description.trim(),
    operations: input.operations,
    validateOnly: input.validateOnly === true,
  };
}
