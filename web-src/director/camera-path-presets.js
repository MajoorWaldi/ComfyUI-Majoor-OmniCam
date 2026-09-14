// Model-independent camera path presets (plan section 26 Task 11, spec
// section 17). Every preset generates ordinary camera keyframes -- the same
// shape hand-authored keys already have -- so the result is fully editable by
// the regular point/curve/timing tools afterward and needs no separate
// validation path. No H3/Wan/LTX-specific semantics live here.
//
// Pure maths, no DOM: unit-tested on its own.

import { add, cross, length, mul, norm, sub } from "./core.js";

const WORLD_UP = [0, 1, 0];

export const CAMERA_PATH_PRESET_TYPES = [
  "static",
  "dolly_in",
  "dolly_out",
  "truck_left",
  "truck_right",
  "pedestal_up",
  "pedestal_down",
  "crane_up",
  "crane_down",
  "arc_left",
  "arc_right",
  "orbit",
  "spiral",
];

// Human-readable labels for the compact preset dialog (plan: "do not add one
// toolbar button per preset" -- a single dialog lists these instead).
export const CAMERA_PATH_PRESET_LABELS = {
  static: "Static",
  dolly_in: "Dolly In",
  dolly_out: "Dolly Out",
  truck_left: "Truck Left",
  truck_right: "Truck Right",
  pedestal_up: "Pedestal Up",
  pedestal_down: "Pedestal Down",
  crane_up: "Crane Up",
  crane_down: "Crane Down",
  arc_left: "Arc Left",
  arc_right: "Arc Right",
  orbit: "Orbit",
  spiral: "Spiral",
};

/** Position/right/up/forward basis derived from a camera pose, optionally
 * pivoting around an overridden world-space target instead of camera.target. */
function basisFromCamera(camera, targetOverride) {
  const position = [...camera.position];
  const target = Array.isArray(targetOverride) ? [...targetOverride] : [...camera.target];
  const rawForward = sub(target, position);
  const forward = length(rawForward) > 1e-9 ? norm(rawForward) : [0, 0, -1];
  let right = cross(forward, WORLD_UP);
  // Looking straight up/down makes forward x worldUp degenerate.
  if (length(right) < 1e-6) right = [1, 0, 0];
  right = norm(right);
  const up = norm(cross(right, forward));
  return { position, target, forward, right, up };
}

function baseCameraFields(camera) {
  return {
    fov: camera.fov,
    roll: camera.roll || 0,
    zoom: camera.zoom || 1,
    near: camera.near,
    far: camera.far,
    camera_type: camera.camera_type || "perspective",
  };
}

// --- per-preset point generators -------------------------------------------
// Each returns an ordered array of { position, target } world-space pairs.

function genStatic(basis) {
  return [
    { position: basis.position, target: basis.target },
    { position: basis.position, target: basis.target },
  ];
}

// Dolly moves the camera along its own view axis while the world-space
// target point stays fixed -- unlike Truck/Pedestal, framing is expected to
// change as the camera approaches/recedes from the subject.
function genDolly(basis, distance, direction) {
  const sign = direction === "out" ? -1 : 1;
  const end = add(basis.position, mul(basis.forward, sign * distance));
  return [
    { position: basis.position, target: basis.target },
    { position: end, target: basis.target },
  ];
}

// Truck slides the camera sideways; the target moves by the same delta so
// the look direction (and framing) is preserved, camera and subject both
// sliding in parallel.
function genTruck(basis, distance, direction) {
  const sign = direction === "right" ? 1 : -1;
  const delta = mul(basis.right, sign * distance);
  return [
    { position: basis.position, target: basis.target },
    { position: add(basis.position, delta), target: add(basis.target, delta) },
  ];
}

// Pedestal translates camera and target together along world-up: the look
// angle is unchanged, the whole shot just rises or sinks.
function genPedestal(basis, distance, direction) {
  const sign = direction === "down" ? -1 : 1;
  const delta = mul(WORLD_UP, sign * distance);
  return [
    { position: basis.position, target: basis.target },
    { position: add(basis.position, delta), target: add(basis.target, delta) },
  ];
}

// Crane raises/lowers only the camera along world-up while the target point
// stays fixed, so the look angle tilts as the arm swings -- the standard
// crane/pedestal distinction.
function genCrane(basis, distance, direction) {
  const sign = direction === "down" ? -1 : 1;
  const end = add(basis.position, mul(WORLD_UP, sign * distance));
  return [
    { position: basis.position, target: basis.target },
    { position: end, target: basis.target },
  ];
}

// Orbit/Arc/Spiral share one sampler: the camera moves along a horizontal
// circle (optionally spiraling in/out radially) around the fixed target
// point, always looking at it. `direction: "cw" | "ccw"` is as seen from
// above (looking down the world -Y axis); heightOffset is a constant applied
// to every sample, not a ramp.
function genOrbitLike(basis, { degrees = 180, direction = "cw", radius, radiusEnd, heightOffset = 0, samples = 5, close = false } = {}) {
  const target = basis.target;
  const dx = basis.position[0] - target[0];
  const dz = basis.position[2] - target[2];
  const currentRadius = Math.hypot(dx, dz) || 1e-6;
  const currentAngle = Math.atan2(dz, dx);
  const startRadius = Number.isFinite(radius) ? radius : currentRadius;
  const endRadius = Number.isFinite(radiusEnd) ? radiusEnd : startRadius;
  const sign = direction === "ccw" ? 1 : -1;
  const totalRadians = ((Math.abs(degrees) * Math.PI) / 180) * sign;
  const count = Math.max(2, Math.round(samples));
  const y = basis.position[1] + heightOffset;

  const points = [];
  for (let i = 0; i < count; i += 1) {
    // `close` means the arc is meant to loop back to its own start (e.g. a
    // full 360 orbit): the last sample stops one step short of repeating the
    // first point instead of duplicating it.
    const t = close ? i / count : i / (count - 1);
    const angle = currentAngle + totalRadians * t;
    const r = startRadius + (endRadius - startRadius) * t;
    points.push({
      position: [target[0] + Math.cos(angle) * r, y, target[2] + Math.sin(angle) * r],
      target: [...target],
    });
  }
  return points;
}

/**
 * Generate an ordinary, fully editable set of camera keyframes for one of
 * `CAMERA_PATH_PRESET_TYPES` (plan section 26 Task 11 / spec section 17).
 *
 * `camera` supplies the starting pose (position/target/fov/roll/...) and
 * lens/clipping defaults every generated key inherits; `target` optionally
 * overrides the pivot point for orbit/arc/spiral/dolly instead of
 * `camera.target`. Samples are spread evenly across `[startFrame, endFrame]`
 * (rounded, bumped to stay strictly increasing, endpoints pinned exactly).
 *
 * @returns {{ ok: true, keyframes } | { ok: false, reason }}
 */
export function createCameraPathPreset({ type, camera, target, startFrame, endFrame, params = {} } = {}) {
  if (!CAMERA_PATH_PRESET_TYPES.includes(type)) return { ok: false, reason: "unknown_preset" };
  if (!camera || !Array.isArray(camera.position) || !Array.isArray(camera.target)) return { ok: false, reason: "invalid_camera" };
  const start = Math.round(Number(startFrame));
  const end = Math.round(Number(endFrame));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return { ok: false, reason: "invalid_range" };

  const basis = basisFromCamera(camera, target);
  const distance = Number(params.distance) > 0 ? Number(params.distance) : 1;
  const arcParams = (defaultDegrees, direction, defaultSamples) => ({
    degrees: Number(params.degrees) || defaultDegrees,
    direction,
    radius: Number.isFinite(Number(params.radius)) ? Number(params.radius) : undefined,
    heightOffset: Number(params.heightOffset) || 0,
    samples: Number(params.samples) || defaultSamples,
  });

  let points;
  switch (type) {
    case "static": points = genStatic(basis); break;
    case "dolly_in": points = genDolly(basis, distance, "in"); break;
    case "dolly_out": points = genDolly(basis, distance, "out"); break;
    case "truck_left": points = genTruck(basis, distance, "left"); break;
    case "truck_right": points = genTruck(basis, distance, "right"); break;
    case "pedestal_up": points = genPedestal(basis, distance, "up"); break;
    case "pedestal_down": points = genPedestal(basis, distance, "down"); break;
    case "crane_up": points = genCrane(basis, distance, "up"); break;
    case "crane_down": points = genCrane(basis, distance, "down"); break;
    case "arc_left": points = genOrbitLike(basis, arcParams(45, "ccw", 5)); break;
    case "arc_right": points = genOrbitLike(basis, arcParams(45, "cw", 5)); break;
    case "orbit": points = genOrbitLike(basis, { ...arcParams(180, params.direction === "ccw" ? "ccw" : "cw", 5), close: Boolean(params.close) }); break;
    case "spiral": points = genOrbitLike(basis, {
      ...arcParams(360, params.direction === "ccw" ? "ccw" : "cw", 8),
      radiusEnd: Number.isFinite(Number(params.radiusEnd)) ? Number(params.radiusEnd) : undefined,
    }); break;
    default: return { ok: false, reason: "unknown_preset" };
  }

  if (end - start + 1 < points.length) return { ok: false, reason: "insufficient_frame_slots" };

  const frames = points.map((_, index) => (points.length <= 1 ? start : Math.round(start + ((end - start) * index) / (points.length - 1))));
  for (let i = 1; i < frames.length; i += 1) if (frames[i] <= frames[i - 1]) frames[i] = frames[i - 1] + 1;
  for (let i = frames.length - 1; i > 0; i -= 1) if (frames[i] > end - (frames.length - 1 - i)) frames[i] = end - (frames.length - 1 - i);
  frames[0] = start;
  frames[frames.length - 1] = end;

  const fields = baseCameraFields(camera);
  const keyframes = points.map((point, index) => ({
    frame: frames[index],
    interpolation: "smooth",
    camera: { position: point.position, target: point.target, ...fields },
  }));
  return { ok: true, keyframes };
}
