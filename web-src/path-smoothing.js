// Path smoothing for the Motion card and Director timeline.
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

const CAMERA_VECTORS = ["position", "target"];
const CAMERA_SCALARS = ["fov", "zoom"];
const CAMERA_ANGLES = ["roll"];

const OBJECT_VECTORS = ["position", "size"];
const OBJECT_ANGLES = ["rotation"];

function wrapAngleDelta(delta) {
  return ((delta + 540) % 360 + 360) % 360 - 180;
}

function averageVector(prevVal, curVal, nextVal, t) {
  const linear = [0, 1, 2].map((axis) => Number(prevVal[axis] || 0) + (Number(nextVal[axis] || 0) - Number(prevVal[axis] || 0)) * t);
  if (!Array.isArray(curVal)) return linear;
  return [0, 1, 2].map((axis) => (2 * linear[axis] + Number(curVal[axis] || 0)) / 3);
}

function averageScalar(prevVal, curVal, nextVal, t) {
  const linear = Number(prevVal || 0) + (Number(nextVal || 0) - Number(prevVal || 0)) * t;
  if (curVal == null) return linear;
  return (2 * linear + Number(curVal || 0)) / 3;
}

function averageAngle(prevVal, curVal, nextVal, t) {
  const delta = wrapAngleDelta(Number(nextVal || 0) - Number(prevVal || 0));
  const linear = Number(prevVal || 0) + delta * t;
  if (curVal == null) return linear;
  const curDelta = wrapAngleDelta(Number(curVal || 0) - linear);
  return linear + curDelta / 3;
}

function blendVector(from, to, amount) {
  return from.map((value, index) => value + (to[index] - value) * amount);
}

function blendScalar(from, to, amount) {
  return from + (to - from) * amount;
}

function blendAngle(from, to, amount) {
  return from + wrapAngleDelta(to - from) * amount;
}

/**
 * @param {Array<{frame:number, camera?:object, position?:number[], rotation?:number[], size?:number[], interpolation?:string}>} baseline untouched keys
 * @param {number} amount 0..1 blend toward the neighbour average
 * @returns {Array} new keys; the baseline is never mutated
 */
export function smoothKeyframes(baseline, amount) {
  const keys = (baseline || []).map((key) => ({
    ...key,
    ...(key.camera ? { camera: { ...key.camera } } : {}),
  }));
  const strength = Math.min(1, Math.max(0, Number(amount) || 0));
  if (strength === 0 || keys.length < 3) return keys;

  for (let index = 1; index < keys.length - 1; index++) {
    const previous = baseline[index - 1];
    const current = baseline[index];
    const next = baseline[index + 1];
    const frameSpan = next.frame - previous.frame;
    const t = frameSpan !== 0 ? (current.frame - previous.frame) / frameSpan : 0.5;

    // 1. Camera keys
    if (current.camera) {
      for (const field of CAMERA_VECTORS) {
        const prevVal = previous.camera?.[field];
        const curVal = current.camera?.[field];
        const nextVal = next.camera?.[field];
        if (Array.isArray(prevVal) && Array.isArray(nextVal) && Array.isArray(curVal)) {
          const avg = averageVector(prevVal, curVal, nextVal, t);
          keys[index].camera[field] = blendVector(curVal.map(Number), avg, strength);
        }
      }
      for (const field of CAMERA_SCALARS) {
        const prevVal = previous.camera?.[field];
        const curVal = current.camera?.[field];
        const nextVal = next.camera?.[field];
        if (prevVal != null && nextVal != null && curVal != null) {
          const avg = averageScalar(prevVal, curVal, nextVal, t);
          keys[index].camera[field] = blendScalar(Number(curVal), avg, strength);
        }
      }
      for (const field of CAMERA_ANGLES) {
        const prevVal = previous.camera?.[field];
        const curVal = current.camera?.[field];
        const nextVal = next.camera?.[field];
        if (prevVal != null && nextVal != null && curVal != null) {
          const avg = averageAngle(prevVal, curVal, nextVal, t);
          keys[index].camera[field] = blendAngle(Number(curVal), avg, strength);
        }
      }
    }

    // 2. Object keys (when keys are object keyframes directly)
    if (Array.isArray(current.position) && Array.isArray(previous.position) && Array.isArray(next.position)) {
      for (const field of OBJECT_VECTORS) {
        const prevVal = previous[field];
        const curVal = current[field];
        const nextVal = next[field];
        if (Array.isArray(prevVal) && Array.isArray(nextVal) && Array.isArray(curVal)) {
          const avg = averageVector(prevVal, curVal, nextVal, t);
          keys[index][field] = blendVector(curVal.map(Number), avg, strength);
        }
      }
      for (const field of OBJECT_ANGLES) {
        const prevVal = previous[field];
        const curVal = current[field];
        const nextVal = next[field];
        if (Array.isArray(prevVal) && Array.isArray(nextVal) && Array.isArray(curVal)) {
          const avg = [0, 1, 2].map((axis) => averageAngle(prevVal[axis], curVal[axis], nextVal[axis], t));
          keys[index][field] = curVal.map((val, axis) => blendAngle(Number(val), avg[axis], strength));
        }
      }
    }
  }
  return keys;
}

/** Deep-enough copy to serve as an immutable smoothing baseline. */
export function captureBaseline(keys) {
  return (keys || []).map((key) => ({
    ...key,
    ...(key.camera ? {
      camera: {
        ...key.camera,
        position: [...(key.camera.position || [])],
        target: [...(key.camera.target || [])],
      },
    } : {}),
    ...(Array.isArray(key.position) ? { position: [...key.position] } : {}),
    ...(Array.isArray(key.rotation) ? { rotation: [...key.rotation] } : {}),
    ...(Array.isArray(key.size) ? { size: [...key.size] } : {}),
  }));
}
