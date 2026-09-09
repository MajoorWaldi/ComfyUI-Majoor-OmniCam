// Transaction-envelope and per-operation structural validation.
//
// Entity existence and value-range checks that need live state live in apply.js
// (they throw DirectorApiError with the right operationIndex). This module only
// rejects malformed input: bad version, bad id, empty description, a non-array
// or wrong-sized operation list, unknown op types, non-finite numbers,
// malformed vectors and unsupported interpolation.

import { INTERPOLATION_MODES } from "../director/core.js";
import {
  DIRECTOR_API_VERSION,
  DIRECTOR_OPS,
  DIRECTOR_OP_VALUES,
  MAX_OPERATIONS_PER_TRANSACTION,
} from "./constants.js";
import { DirectorApiError } from "./errors.js";

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

function assertString(value, label, operationIndex) {
  if (typeof value !== "string" || value.length === 0) {
    throw new DirectorApiError("BAD_ID", `${label} must be a non-empty string`, operationIndex);
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
    case DIRECTOR_OPS.CAMERA_SET_ACTIVE:
      assertString(operation.cameraId, "cameraId", index);
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
  const seen = (ui._directorApiTxIds ||= new Set());
  if (seen.has(input.id)) {
    throw new DirectorApiError("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${input.id}`);
  }
  if (typeof input.description !== "string" || input.description.trim().length === 0) {
    throw new DirectorApiError("EMPTY_DESCRIPTION", "transaction description must not be empty");
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
    description: input.description.trim(),
    operations: input.operations,
    validateOnly: input.validateOnly === true,
  };
}
