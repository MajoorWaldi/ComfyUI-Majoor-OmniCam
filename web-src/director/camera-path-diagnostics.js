// Pure camera path diagnostics (plan section 26 Task 12, spec section 16).
//
// A read-only analysis layer: it never mutates keys, never writes to editor
// state, and produces the same result for the same input every time. The
// speed heatmap (spec section 15.3) already exists in viewport-overlays.js's
// drawSpeedHeatmap() and is untouched by this module -- this only adds the
// textual diagnostic list plan section 16 asks for.
//
// Pure maths, no DOM: unit-tested on its own.

import { dot, length, sub } from "./core.js";

export const CAMERA_PATH_DIAGNOSTIC_CODES = [
  "STATIC_SEGMENT",
  "SPEED_SPIKE",
  "HARD_DIRECTION_CHANGE",
  "NEAR_ZERO_DURATION",
  "ORBIT_NOT_CLOSED",
  "CAMERA_NEAR_OBJECT",
];

// A segment this many integer frames apart (or fewer) is treated as an
// authoring mistake (near-duplicate frames) rather than a fast, intentional
// move -- frame-count-based, not time-based, so it means the same thing at
// any fps.
const NEAR_ZERO_DURATION_MAX_FRAMES = 1;
// Below this world-space distance, two keys are considered "the same spot".
const STATIC_DISTANCE_EPSILON = 0.01;
// A static segment shorter than this is just a normal hold/settle, not
// worth flagging.
const STATIC_MIN_DURATION_SECONDS = 0.4;
// A segment more than this many times the path's average speed is a spike.
const SPEED_SPIKE_FACTOR = 3;
// An interior key where the path folds back sharper than this angle.
const HARD_DIRECTION_ANGLE_DEGREES = 120;
// A path is "trying" to close an orbit when start/end sit within this many
// degrees of each other (as seen from the path's own XZ centroid) but do not
// coincide.
const ORBIT_CLOSURE_ANGLE_TOLERANCE_DEGREES = 20;
const ORBIT_MIN_KEYS = 4;
// How much clearance beyond an object's own radius still counts as "near".
const CAMERA_NEAR_OBJECT_MARGIN = 0.25;
const DEFAULT_OBJECT_RADIUS = 0.5;

/** World-space distance, elapsed seconds and derived speed for one segment
 * (spec 15.3: speed = worldDistance / ((frameB - frameA) / fps)). */
function segmentStats(a, b, fps) {
  const distance = length(sub(b.camera.position, a.camera.position));
  const frames = b.frame - a.frame;
  const duration = frames / fps;
  const speed = duration > 1e-9 ? distance / duration : Infinity;
  return { distance, frames, duration, speed };
}

/** Per-segment { frameStart, frameEnd, distance, duration, speed } for a
 * sorted camera track -- the same derived speed the heatmap draws. */
export function cameraPathSegmentSpeeds(keys, fps = 24) {
  const sorted = Array.isArray(keys) ? [...keys].sort((a, b) => a.frame - b.frame) : [];
  const segments = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const stats = segmentStats(sorted[i - 1], sorted[i], fps);
    segments.push({ frameStart: sorted[i - 1].frame, frameEnd: sorted[i].frame, ...stats });
  }
  return segments;
}

function angleDegreesXZ(point, centerX, centerZ) {
  return (Math.atan2(point[2] - centerZ, point[0] - centerX) * 180) / Math.PI;
}

/**
 * Analyze a camera track for authoring issues (plan section 26 Task 12 /
 * spec section 16). Never mutates `keys` or anything else -- diagnostics are
 * derived and re-computed on demand, purely informational.
 *
 * `objects` (optional) enables CAMERA_NEAR_OBJECT: each needs a `position`
 * and an optional `radius` (a plain sphere proxy -- this makes no claim of
 * exact mesh-accurate collision).
 *
 * @returns {Array<{ code, severity, frameStart, frameEnd, message }>}
 *   sorted by `frameStart`.
 */
export function analyzeCameraPath({ keys, fps = 24, objects = [] } = {}) {
  const sorted = Array.isArray(keys) ? [...keys].sort((a, b) => a.frame - b.frame) : [];
  const issues = [];
  if (sorted.length < 2) return issues;

  const segments = cameraPathSegmentSpeeds(sorted, fps);

  for (const segment of segments) {
    if (segment.frames <= NEAR_ZERO_DURATION_MAX_FRAMES) {
      issues.push({
        code: "NEAR_ZERO_DURATION",
        severity: "warning",
        frameStart: segment.frameStart,
        frameEnd: segment.frameEnd,
        message: `Keys at F${segment.frameStart} and F${segment.frameEnd} are only ${segment.frames} frame(s) apart`,
      });
    }
    if (segment.distance < STATIC_DISTANCE_EPSILON && segment.duration >= STATIC_MIN_DURATION_SECONDS) {
      issues.push({
        code: "STATIC_SEGMENT",
        severity: "info",
        frameStart: segment.frameStart,
        frameEnd: segment.frameEnd,
        message: `Camera barely moves from F${segment.frameStart} to F${segment.frameEnd}`,
      });
    }
  }

  const finiteSpeeds = segments.map((segment) => segment.speed).filter((speed) => Number.isFinite(speed));
  if (finiteSpeeds.length) {
    const average = finiteSpeeds.reduce((sum, speed) => sum + speed, 0) / finiteSpeeds.length;
    if (average > 1e-6) {
      for (const segment of segments) {
        if (Number.isFinite(segment.speed) && segment.speed > average * SPEED_SPIKE_FACTOR) {
          issues.push({
            code: "SPEED_SPIKE",
            severity: "warning",
            frameStart: segment.frameStart,
            frameEnd: segment.frameEnd,
            message: `Speed spike F${segment.frameStart}-F${segment.frameEnd}`,
          });
        }
      }
    }
  }

  for (let i = 1; i < sorted.length - 1; i += 1) {
    const inVec = sub(sorted[i].camera.position, sorted[i - 1].camera.position);
    const outVec = sub(sorted[i + 1].camera.position, sorted[i].camera.position);
    const inLength = length(inVec);
    const outLength = length(outVec);
    if (inLength < 1e-6 || outLength < 1e-6) continue;
    const cosAngle = Math.max(-1, Math.min(1, dot(inVec, outVec) / (inLength * outLength)));
    const angleDegrees = (Math.acos(cosAngle) * 180) / Math.PI;
    if (angleDegrees >= HARD_DIRECTION_ANGLE_DEGREES) {
      issues.push({
        code: "HARD_DIRECTION_CHANGE",
        severity: "notice",
        frameStart: sorted[i - 1].frame,
        frameEnd: sorted[i + 1].frame,
        message: `Sharp direction change at F${sorted[i].frame} (${Math.round(angleDegrees)}°)`,
      });
    }
  }

  if (sorted.length >= ORBIT_MIN_KEYS) {
    const centerX = sorted.reduce((sum, key) => sum + key.camera.position[0], 0) / sorted.length;
    const centerZ = sorted.reduce((sum, key) => sum + key.camera.position[2], 0) / sorted.length;
    const first = sorted[0].camera.position;
    const last = sorted[sorted.length - 1].camera.position;
    let deltaAngle = Math.abs(angleDegreesXZ(last, centerX, centerZ) - angleDegreesXZ(first, centerX, centerZ)) % 360;
    if (deltaAngle > 180) deltaAngle = 360 - deltaAngle;
    const positionGap = length(sub(last, first));
    if (deltaAngle <= ORBIT_CLOSURE_ANGLE_TOLERANCE_DEGREES && positionGap > STATIC_DISTANCE_EPSILON) {
      issues.push({
        code: "ORBIT_NOT_CLOSED",
        severity: "notice",
        frameStart: sorted[0].frame,
        frameEnd: sorted[sorted.length - 1].frame,
        message: `Path nearly returns to its start but does not close (gap ${positionGap.toFixed(2)}m)`,
      });
    }
  }

  if (Array.isArray(objects) && objects.length) {
    for (const key of sorted) {
      for (const object of objects) {
        if (!object || !Array.isArray(object.position)) continue;
        const radius = Number.isFinite(Number(object.radius)) ? Number(object.radius) : DEFAULT_OBJECT_RADIUS;
        const distanceToObject = length(sub(key.camera.position, object.position));
        if (distanceToObject < radius + CAMERA_NEAR_OBJECT_MARGIN) {
          issues.push({
            code: "CAMERA_NEAR_OBJECT",
            severity: "warning",
            frameStart: key.frame,
            frameEnd: key.frame,
            message: `Camera passes near ${object.name || object.id || "an object"} at F${key.frame}`,
          });
        }
      }
    }
  }

  return issues.sort((a, b) => a.frameStart - b.frameStart);
}
