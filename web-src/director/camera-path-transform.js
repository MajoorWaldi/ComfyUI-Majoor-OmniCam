// Rigid / uniform transforms applied to a whole camera path at once.
//
// A camera track is a list of keyframes, each with camera.position and
// camera.target. "Select the path" and drag / scale / rotate moves every key
// together about the path centroid, the way grabbing a group of objects does.
// Pure maths, no DOM: unit-tested on its own.

import { add, mul, sub, rotateEuler } from "./core.js";

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
