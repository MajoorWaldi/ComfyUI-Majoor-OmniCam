// Rigid / uniform transforms applied to a whole camera path at once.
//
// A camera track is a list of keyframes, each with camera.position and
// camera.target. "Select the path" and drag / scale / rotate moves every key
// together about the path centroid, the way grabbing a group of objects does.
// Pure maths, no DOM: unit-tested on its own.

import { add, mul, sub, rotateEuler, length } from "./core.js";

// Mirrors sampleCamera's own "is this track's look-at an active, explicit
// constraint" test (director/core/camera.js) -- the closest thing this
// codebase has to a per-key "orientation mode" (plan section 8/12.2): while
// it is active, sampleCamera ignores every key's stored `camera.target` and
// drives it live from the constrained object instead, so:
//  - a position transform must move a key's stored target rigidly with it
//    (there is no path tangent to speak of);
//  - a *target*-component transform must refuse outright -- dragging a
//    target marker would silently write a value the constraint immediately
//    overrides on the next resample, corrupting the key with no visible
//    effect, so target-path editing goes read-only instead.
// `objects` is optional (and omitted by most call sites' unit tests): when
// given, this also mirrors sampleCamera's other precondition -- the
// constrained object must actually exist and not be disabled, or sampleCamera
// silently falls back to the keyframed target and the constraint is not
// really "active" at all. Without an object list there is no way to check
// that, so a bare object_id is still treated as active (the previous,
// permissive behavior) -- callers that have `state.objects` on hand should
// pass it for an accurate answer.
export function trackHasActiveLookAt(track, objects) {
  const lookAt = track?.constraints?.look_at;
  const constraintActive = lookAt?.status === undefined || lookAt?.status === "active";
  const targetObjId = constraintActive ? (lookAt?.object_id || track?.target_object_id) : null;
  if (!targetObjId) return false;
  if (!Array.isArray(objects)) return true;
  const targetObj = objects.find((o) => o.id === targetObjId);
  return Boolean(targetObj && targetObj.enabled !== false);
}

/** Mean of the keyframe positions (the path's transform pivot). */
export function pathCentroid(keys) {
  const list = Array.isArray(keys) ? keys.filter((k) => k?.camera?.position) : [];
  if (!list.length) return [0, 0, 0];
  const sum = list.reduce((acc, k) => add(acc, k.camera.position), [0, 0, 0]);
  return mul(sum, 1 / list.length);
}

/** Axis-aligned bounds of every keyframe position, or null when empty. */
export function pathBounds(keys) {
  const list = Array.isArray(keys) ? keys.filter((k) => k?.camera?.position) : [];
  if (!list.length) return null;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const key of list) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], key.camera.position[axis]);
      max[axis] = Math.max(max[axis], key.camera.position[axis]);
    }
  }
  return { min, max };
}

function transformPoint(point, { mode, origin, delta, factors, rotationDeg }) {
  if (mode === "translate") return add(point, delta);
  const relative = sub(point, origin);
  if (mode === "scale") {
    return add(origin, [relative[0] * factors[0], relative[1] * factors[1], relative[2] * factors[2]]);
  }
  // rotate: euler degrees about the path centroid
  return add(origin, rotateEuler(relative, rotationDeg));
}

/**
 * Apply one transform to a snapshot of the path's keyframes and return the new
 * keyframe array. `baseKeys` is never mutated -- pass the keys captured at drag
 * start so a live drag always re-derives from the same base.
 *
 * @param {object[]} baseKeys keyframes with `camera.position` / `camera.target`
 * @param {object} options
 *   - mode: "translate" | "scale" | "rotate"
 *   - origin: [x,y,z] pivot (centroid); ignored for translate
 *   - delta: [x,y,z] world offset (translate)
 *   - factors: [sx,sy,sz] per-axis scale about origin (scale)
 *   - rotationDeg: [rx,ry,rz] euler degrees about origin (rotate)
 */
export function transformPathKeys(baseKeys, options) {
  const list = Array.isArray(baseKeys) ? baseKeys : [];
  return list.map((key) => {
    const camera = { ...key.camera };
    if (Array.isArray(camera.position)) camera.position = transformPoint(camera.position, options);
    if (Array.isArray(camera.target)) camera.target = transformPoint(camera.target, options);
    return { ...key, camera };
  });
}

/** Local tangent of a polyline at `index`, central difference in the middle
 * and one-sided at the ends -- same shape as the Follow Path derivation in
 * camera-path-authoring.js, but over already-transformed positions rather
 * than raw stroke points. Falls back to "looking down -Z" when the path has
 * no extent at that point (a single selected key with no neighbours). */
function localTangent(positions, index) {
  let vector;
  if (positions.length < 2) vector = null;
  else if (index === 0) vector = sub(positions[1], positions[0]);
  else if (index === positions.length - 1) vector = sub(positions[index], positions[index - 1]);
  else vector = sub(positions[index + 1], positions[index - 1]);
  const magnitude = vector ? length(vector) : 0;
  return magnitude > 1e-6 ? mul(vector, 1 / magnitude) : [0, 0, -1];
}

/**
 * Apply one transform to a subset of a path's keyframes -- the selected
 * `frames` -- leaving every other key untouched. `baseKeys` is the full,
 * frozen keyframe snapshot captured at drag start (plan section 20); this
 * never mutates it and always returns a freshly cloned array, so a live drag
 * always re-derives from the same base with no compounding (plan section 8).
 *
 * Position + target rule (plan section 8): when a key's camera has an
 * authored look-at target and the track's orientation is an explicit
 * look-at constraint (`lookAtActive: true`), the target moves rigidly with
 * the position -- same delta/rotation, so framing is preserved. Otherwise
 * the key is treated as Follow Path: its target is recomputed after the
 * transform from the *new* local path tangent, keeping the key's original
 * look-at distance, so a moved point still looks the way a Follow-Path
 * camera would down the reshaped path.
 *
 * @param {object[]} baseKeys frozen keyframes with `camera.position` / `camera.target`
 * @param {Set<number>|number[]} frames the `frame` values to transform
 * @param {object} options same shape as {@link transformPathKeys}'s options,
 *   plus `lookAtActive` (boolean, default false)
 */
export function transformSelectedPathKeys(baseKeys, frames, options) {
  const list = Array.isArray(baseKeys) ? baseKeys : [];
  const selected = frames instanceof Set ? frames : new Set(frames || []);
  const lookAtActive = Boolean(options?.lookAtActive);

  // Transformed positions for every key -- selected keys move, the rest stay
  // put -- so Follow Path retargeting below can read tangents from the whole,
  // already-transformed path shape rather than only the selected subset.
  const nextPositions = list.map((key) => {
    const position = key?.camera?.position;
    if (!Array.isArray(position)) return position;
    return selected.has(key.frame) ? transformPoint(position, options) : [...position];
  });

  return list.map((key, index) => {
    const camera = { ...key.camera };
    if (!selected.has(key.frame) || !Array.isArray(camera.position)) return { ...key, camera };

    const oldPosition = camera.position;
    const oldTarget = camera.target;
    camera.position = nextPositions[index];

    if (Array.isArray(oldTarget)) {
      if (lookAtActive) {
        camera.target = transformPoint(oldTarget, options);
      } else {
        const focusDistance = length(sub(oldTarget, oldPosition)) || 5;
        const tangent = localTangent(nextPositions, index);
        camera.target = add(camera.position, mul(tangent, focusDistance));
      }
    }
    return { ...key, camera };
  });
}

/**
 * Move only the `camera.target` of the selected keys by `delta`, leaving
 * `camera.position` untouched. Translate-only, matching the `path_point`
 * target component's allowed modes (plan section 12.1): a single target
 * point has no extent to rotate or scale about. The caller is responsible
 * for refusing this outright when {@link trackHasActiveLookAt} is true --
 * this function does not check the constraint itself, so it stays a pure,
 * unconditional data transform other callers (tests, future whole-target-
 * path editing) can also use directly.
 *
 * @param {object[]} baseKeys frozen keyframes with `camera.target`
 * @param {Set<number>|number[]} frames the `frame` values to move
 * @param {object} options `{ delta: [x,y,z] }`
 */
export function transformSelectedPathTargets(baseKeys, frames, { delta = [0, 0, 0] } = {}) {
  const list = Array.isArray(baseKeys) ? baseKeys : [];
  const selected = frames instanceof Set ? frames : new Set(frames || []);
  return list.map((key) => {
    if (!selected.has(key.frame) || !Array.isArray(key?.camera?.target)) return key;
    return { ...key, camera: { ...key.camera, target: add(key.camera.target, delta) } };
  });
}
