// Camera-path timing weight + retiming (plan section 26 Task 10, spec section 14).
//
// Canonical truth for playback stays keyframe `frame` values (plan section
// 14.1). `key.timing.weight` is an optional, model-independent *authoring
// preference* consumed only by redistributeCameraPathTiming() -- it never
// changes playback speed by itself, and it is dropped from a key entirely
// when it is absent, invalid, or at the implicit default of 1.0 so an
// untouched key still serializes byte-identical (mirrors how core.js's
// sanitizeState() already drops `tangents` when it carries nothing new).
//
// Pure maths, no DOM: unit-tested on its own.

export const DEFAULT_TIMING_WEIGHT = 1.0;
export const MIN_TIMING_WEIGHT = 0.1;
export const MAX_TIMING_WEIGHT = 10.0;

function isValidWeight(value) {
  return Number.isFinite(value) && value >= MIN_TIMING_WEIGHT && value <= MAX_TIMING_WEIGHT;
}

/**
 * A camera path key's authoring timing weight, validated and clamped to
 * `0.1..10`. Missing, non-finite or out-of-range values fall back to the
 * implicit default of `1.0`.
 */
export function cameraPathTimingWeight(key) {
  const raw = key?.timing?.weight;
  const value = Number(raw);
  return isValidWeight(value) ? value : DEFAULT_TIMING_WEIGHT;
}

/**
 * Set a key's timing weight, returning a new key object (`key` is never
 * mutated). An absent/invalid/default-value weight drops `timing` entirely
 * rather than persisting an inert `{ weight: 1 }`, so an untouched key keeps
 * serializing byte-identical.
 */
export function setCameraPathTimingWeight(key, weight) {
  const next = { ...key };
  const value = Number(weight);
  if (!isValidWeight(value) || value === DEFAULT_TIMING_WEIGHT) {
    delete next.timing;
    return next;
  }
  next.timing = { ...(key?.timing && typeof key.timing === "object" ? key.timing : {}), weight: value };
  return next;
}

function positionOf(key) {
  const position = key?.camera?.position;
  return Array.isArray(position) ? position : [0, 0, 0];
}

function distance3(a, b) {
  const dx = (a[0] || 0) - (b[0] || 0);
  const dy = (a[1] || 0) - (b[1] || 0);
  const dz = (a[2] || 0) - (b[2] || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Redistribute the frames of `keys` across `[startFrame, endFrame]` (plan
 * section 14.3): the first key is placed at `startFrame` and the last at
 * `endFrame` (neither moves again once placed -- "preserve first and last
 * frame" means relative to the requested range, not their original absolute
 * frame numbers), interior keys are placed proportionally to a per-segment
 * cost of spatial distance times the average of the two adjacent keys'
 * timing weights, results are rounded and bumped forward on collision, and
 * frames are guaranteed strictly increasing.
 *
 * A static path (every segment cost zero) falls back to distributing frames
 * evenly by key count so the operation still produces a valid, evenly-spaced
 * result instead of collapsing every interior key onto the first frame.
 *
 * @returns {{ ok: true, keys } | { ok: false, reason }}
 */
export function redistributeCameraPathTiming(keys, { startFrame, endFrame } = {}) {
  if (!Array.isArray(keys) || keys.length < 2) return { ok: false, reason: "not_enough_keys" };
  const start = Number(startFrame);
  const end = Number(endFrame);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return { ok: false, reason: "invalid_range" };
  }

  const sorted = [...keys].sort((a, b) => a.frame - b.frame);

  const availableSlots = Math.floor(end) - Math.floor(start) + 1;
  if (availableSlots < sorted.length) {
    return { ok: false, reason: "insufficient_frame_slots" };
  }

  const weights = sorted.map((keyframe) => cameraPathTimingWeight(keyframe));
  const segmentCosts = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const spatialDistance = distance3(positionOf(sorted[i - 1]), positionOf(sorted[i]));
    const averageWeight = (weights[i - 1] + weights[i]) / 2;
    segmentCosts.push(spatialDistance * averageWeight);
  }

  const totalCost = segmentCosts.reduce((sum, cost) => sum + cost, 0);
  const totalSpan = end - start;
  const cumulativeFraction = [0];
  if (totalCost > 0) {
    let running = 0;
    for (const cost of segmentCosts) {
      running += cost;
      cumulativeFraction.push(running / totalCost);
    }
  } else {
    // Every segment has zero cost (identical positions and/or zero weight):
    // fall back to even spacing by key index so keys stay strictly ordered.
    for (let i = 1; i < sorted.length; i += 1) cumulativeFraction.push(i / (sorted.length - 1));
  }

  const nextFrames = cumulativeFraction.map((fraction) => Math.round(start + fraction * totalSpan));
  nextFrames[0] = start;
  nextFrames[nextFrames.length - 1] = end;
  for (let i = 1; i < nextFrames.length; i += 1) {
    if (nextFrames[i] <= nextFrames[i - 1]) nextFrames[i] = nextFrames[i - 1] + 1;
  }
  // Bumping forward on collision can push the tail past `end`; pull the
  // whole run back down from the end while preserving strict ordering. This
  // only triggers when availableSlots was exactly sorted.length (the
  // tightest legal packing), so the result still respects the endpoints.
  for (let i = nextFrames.length - 1; i > 0; i -= 1) {
    if (nextFrames[i] > end - (nextFrames.length - 1 - i)) nextFrames[i] = end - (nextFrames.length - 1 - i);
  }
  nextFrames[nextFrames.length - 1] = end;
  nextFrames[0] = start;

  const nextKeys = sorted.map((keyframe, index) => ({ ...keyframe, frame: nextFrames[index] }));
  return { ok: true, keys: nextKeys };
}
