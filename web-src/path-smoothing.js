// Path smoothing for the Motion card.
//
// The Python helper `smooth_camera_path` bakes one key per frame, which is the
// right shape for an offline export but the wrong one for a slider: dragging it
// would shred the animator's keys and there would be no way back.
//
// Here smoothing is a *blend*, applied to the existing keys only. Each interior
// key moves a fraction of the way toward the average of itself and its two
// neighbours; the first and last keys are anchors and never move. Because the
// result is always computed from an untouched baseline, dragging back to 0%
// restores the original keys exactly.

const SMOOTHED_FIELDS = ["position", "target"];

// A plain (prev+current+next)/3 average -- as if the three keys were always
// one frame apart -- is only correct when they actually are evenly spaced.
// Real keyframe spacing is rarely even (a held pose sits for dozens of
// frames, then a quick move follows), and a naive average lets whichever
// neighbour happens to be temporally *farther away* pull just as hard as the
// close one, dragging the curve toward a point in time that barely matters.
// Weighting by where `current` actually falls between previous and next
// (linear interpolation at its own frame) fixes that, and reduces to the
// exact same (prev+current+next)/3 result when spacing happens to be even,
// so evenly-spaced animation is unaffected.
function averageOfThree(previous, current, next, field) {
  const prevVal = previous.camera?.[field];
  const curVal = current.camera?.[field];
  const nextVal = next.camera?.[field];
  const frameSpan = next.frame - previous.frame;
  if (Array.isArray(prevVal) && Array.isArray(nextVal) && frameSpan !== 0) {
    const t = (current.frame - previous.frame) / frameSpan;
    const linear = [0, 1, 2].map((axis) => Number(prevVal[axis] || 0) + (Number(nextVal[axis] || 0) - Number(prevVal[axis] || 0)) * t);
    if (!Array.isArray(curVal)) return linear;
    return [0, 1, 2].map((axis) => (2 * linear[axis] + Number(curVal[axis] || 0)) / 3);
  }
  const values = [previous, current, next].map((key) => key.camera?.[field]).filter(Array.isArray);
  if (!values.length) return null;
  return [0, 1, 2].map((axis) => values.reduce((total, vector) => total + Number(vector[axis] || 0), 0) / values.length);
}

function blend(from, to, amount) {
  return from.map((value, index) => value + (to[index] - value) * amount);
}

/**
 * @param {Array<{frame:number, camera:object, interpolation?:string}>} baseline untouched keys
 * @param {number} amount 0..1 blend toward the neighbour average
 * @returns {Array} new keys; the baseline is never mutated
 */
export function smoothKeyframes(baseline, amount) {
  const keys = (baseline || []).map((key) => ({ ...key, camera: { ...(key.camera || {}) } }));
  const strength = Math.min(1, Math.max(0, Number(amount) || 0));
  if (strength === 0 || keys.length < 3) return keys;

  for (let index = 1; index < keys.length - 1; index++) {
    const previous = baseline[index - 1];
    const current = baseline[index];
    const next = baseline[index + 1];
    for (const field of SMOOTHED_FIELDS) {
      const source = current.camera?.[field];
      const average = averageOfThree(previous, current, next, field);
      if (!Array.isArray(source) || !average) continue;
      keys[index].camera[field] = blend(source.map(Number), average, strength);
    }
  }
  return keys;
}

/** Deep-enough copy to serve as an immutable smoothing baseline. */
export function captureBaseline(keys) {
  return (keys || []).map((key) => ({
    ...key,
    camera: { ...(key.camera || {}), position: [...(key.camera?.position || [])], target: [...(key.camera?.target || [])] },
  }));
}
