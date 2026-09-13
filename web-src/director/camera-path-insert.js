// Insert/delete camera-path control points (plan section 26 Task 8).
//
// Splitting an authored Bézier position segment uses a proper cubic
// De Casteljau split so the inserted point does not visibly reshape the
// path. web-src/camera-path-curve.js's spatial handles always pin their
// x-abscissa at +-1/3, and director/core.js's sampleChannel() solves the
// Bézier parameter `s` from the frame fraction `u` by binary search on that
// same fixed x-curve -- x(s) = (1-s)^2*s*(1/3) + 2*(1-s)*s^2*(2/3) + s^3
// reduces algebraically to exactly `s`, so u === s for every position
// channel here. That means splitting the 3D control polygon [A, A.out,
// B.in, B] at t = u reproduces the exact curve the animator already had,
// across both new segments.
//
// A linear/smooth (non-bezier) segment has no handles to preserve: the new
// key is simply the camera sampled at the exact target frame, so target,
// FOV, roll and zoom all interpolate exactly as they already did.
//
// No DOM / THREE / Director dependencies: pure array-in, array-out, so this
// is unit-tested on its own (tests/frontend/camera-path-insert.node.mjs).

import { setHandleWorldPoint, spatialHandleMode, spatialHandlePoints } from "../camera-path-curve.js";
import { cloneCamera, sampleCamera } from "./core.js";
import { deleteKeyframesByFrame } from "./key-ops.js";

function lerp3(a, b, t) {
  return [0, 1, 2].map((axis) => a[axis] + (b[axis] - a[axis]) * t);
}

/**
 * De Casteljau split of the cubic Bézier [p0, p1, p2, p3] at parameter `t`
 * (0..1). Returns the two resulting cubics plus the split point itself.
 * `left`/`right` each reproduce exactly the same curve as the original
 * cubic restricted to [0, t] / [t, 1] -- this is what keeps an inserted
 * control point from reshaping the path.
 */
export function splitCubicBezier3D(p0, p1, p2, p3, t) {
  const q0 = lerp3(p0, p1, t);
  const q1 = lerp3(p1, p2, t);
  const q2 = lerp3(p2, p3, t);
  const r0 = lerp3(q0, q1, t);
  const r1 = lerp3(q1, q2, t);
  const point = lerp3(r0, r1, t);
  return { left: [p0, q0, r0, point], right: [point, r1, q2, p3], point };
}

/** Nearest unused integer frame strictly between `leftFrame` and `rightFrame`, or -1. */
function nearestFreeFrame(sortedKeys, leftFrame, rightFrame, preferred) {
  const occupied = new Set(sortedKeys.map((key) => key.frame));
  const clamped = Math.min(rightFrame - 1, Math.max(leftFrame + 1, preferred));
  if (!occupied.has(clamped)) return clamped;
  const span = rightFrame - leftFrame;
  for (let offset = 1; offset < span; offset += 1) {
    for (const candidate of [clamped - offset, clamped + offset]) {
      if (candidate <= leftFrame || candidate >= rightFrame) continue;
      if (!occupied.has(candidate)) return candidate;
    }
  }
  return -1;
}

/**
 * Insert a new control point on the segment between the keys at
 * `leftFrame`/`rightFrame`, targeting parameter `t` (0..1, default the
 * segment midpoint). Refuses cleanly -- no duplicate-frame key is ever
 * created -- when the segment cannot be found or there is no free integer
 * frame between the neighbours.
 *
 * @returns {{ ok: true, keys, frame } | { ok: false, reason }}
 */
export function insertCameraPathKey(keys, { leftFrame, rightFrame, t = 0.5 } = {}) {
  const sorted = [...keys].sort((a, b) => a.frame - b.frame);
  const leftIndex = sorted.findIndex((key) => key.frame === leftFrame);
  const rightIndex = leftIndex >= 0 ? leftIndex + 1 : -1;
  if (leftIndex < 0 || rightIndex < 0 || rightIndex >= sorted.length || sorted[rightIndex].frame !== rightFrame) {
    return { ok: false, reason: "segment_not_found" };
  }
  if (rightFrame - leftFrame < 2) {
    return { ok: false, reason: "no_free_frame" };
  }

  const clampedT = Math.min(0.999, Math.max(0.001, Number.isFinite(t) ? t : 0.5));
  const preferredFrame = Math.round(leftFrame + clampedT * (rightFrame - leftFrame));
  const targetFrame = nearestFreeFrame(sorted, leftFrame, rightFrame, preferredFrame);
  if (targetFrame < 0) return { ok: false, reason: "no_free_frame" };
  const resolvedT = (targetFrame - leftFrame) / (rightFrame - leftFrame);

  const left = sorted[leftIndex];
  const right = sorted[rightIndex];
  const prevKey = leftIndex > 0 ? sorted[leftIndex - 1] : null;
  const nextKey = rightIndex + 1 < sorted.length ? sorted[rightIndex + 1] : null;
  const isBezier = left.interpolation === "bezier" || right.interpolation === "bezier";

  const sampled = sampleCamera({ keyframes: sorted }, targetFrame);
  const newKey = { frame: targetFrame, interpolation: isBezier ? "bezier" : left.interpolation, camera: sampled };

  if (isBezier) {
    const p0 = [...left.camera.position];
    const p1 = spatialHandlePoints(left, prevKey, right).out;
    const p2 = spatialHandlePoints(right, left, nextKey).in;
    const p3 = [...right.camera.position];
    const split = splitCubicBezier3D(p0, p1, p2, p3, resolvedT);
    // sampleCamera() already evaluated the exact same curve at this frame;
    // pin the new key's position to the split point so it matches bit for
    // bit (both derive from the same fixed 1/3 x-handles, see module doc).
    newKey.camera = { ...cloneCamera(sampled), position: [...split.point] };

    // Only rewrite a flank's handle when it already carries an explicit
    // "free"/"aligned" delta: an "auto" or "corner" key recomputes its own
    // tangent live from its (now different) immediate neighbour, which is
    // that mode's normal behaviour, not a reshape to guard against.
    const leftMode = spatialHandleMode(left);
    if (leftMode === "free" || leftMode === "aligned") setHandleWorldPoint(left, "out", split.left[1]);
    const rightMode = spatialHandleMode(right);
    if (rightMode === "free" || rightMode === "aligned") setHandleWorldPoint(right, "in", split.right[2]);

    setHandleWorldPoint(newKey, "in", split.left[2]);
    setHandleWorldPoint(newKey, "out", split.right[1]);
  }

  const nextKeys = [...sorted, newKey].sort((a, b) => a.frame - b.frame);
  return { ok: true, keys: nextKeys, frame: targetFrame };
}

/**
 * Remove every key at the given `frames` from a camera track's keys in one
 * atomic result, never leaving fewer than one control point.
 *
 * @returns {{ ok: boolean, keys, removed }}
 */
export function deleteCameraPathKeys(keys, frames) {
  const { keys: next, removed } = deleteKeyframesByFrame(keys, frames, { minKeys: 1 });
  return { ok: removed > 0, keys: next, removed };
}
