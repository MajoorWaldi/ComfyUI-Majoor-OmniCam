// Bounded pagination and plain-JSON entity summaries shared by the read side
// of the semantic Director API. No DOM, no three.js: pure data shaping.

import { DirectorApiError } from "./errors.js";

export const DEFAULT_QUERY_LIMIT = 25;
export const MAX_QUERY_LIMIT = 100;

export function queryWindow(request, total) {
  const offset = request?.offset === undefined
    ? 0
    : Number(request.offset);

  const limit = request?.limit === undefined
    ? DEFAULT_QUERY_LIMIT
    : Number(request.limit);

  if (!Number.isInteger(offset) || offset < 0) {
    throw new DirectorApiError(
      "BAD_QUERY",
      "offset must be a non-negative integer",
    );
  }

  if (
    !Number.isInteger(limit)
    || limit < 1
    || limit > MAX_QUERY_LIMIT
  ) {
    throw new DirectorApiError(
      "BAD_QUERY",
      `limit must be between 1 and ${MAX_QUERY_LIMIT}`,
    );
  }

  return {
    offset,
    limit,
    end: Math.min(total, offset + limit),
  };
}

export function objectSummary(object) {
  return {
    id: object.id,
    name: object.name || object.id,
    type: object.type || null,
    asset_id: object.asset_id || null,
    asset_kind: object.asset_kind || null,
    tags: Array.isArray(object.tags) ? [...object.tags] : [],
    enabled: object.enabled !== false,
    locked: Boolean(object.locked),
    parent_id: object.parent_id || null,
    position: Array.isArray(object.position)
      ? [...object.position]
      : [0, 0, 0],
  };
}

export function cameraSummary(camera) {
  return {
    id: camera.id,
    name: camera.name || camera.id,
    color: camera.color || null,
    locked: Boolean(camera.locked),
    muted: Boolean(camera.muted),
    solo: Boolean(camera.solo),
    target_object_id: camera.target_object_id || null,
    keyframe_count: Array.isArray(camera.keyframes)
      ? camera.keyframes.length
      : 0,
  };
}
