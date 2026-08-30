// Camera frustum geometry for the read-only track viewer.
//
// The frustum is what makes a trajectory readable: a line through space says
// where the camera went, and only the frustum says where it was looking. The
// corner maths lives here as pure functions so the direction can be asserted in
// a test rather than eyeballed in a screenshot -- a mirrored frustum is exactly
// the kind of bug that survives a visual check.

import { BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial } from "../three-runtime.js";

//: Passive frustums are decoration; past this many they are visual noise and a
//: pointless draw-call bill.
export const MAX_PASSIVE_FRUSTUMS = 24;

/** Orthonormal camera basis for an OmniCam camera payload. */
export function cameraBasis(camera) {
  const position = (camera?.position || [0, 0, 0]).map(Number);
  const target = (camera?.target || [0, 0, -1]).map(Number);
  let forward = normalize([
    target[0] - position[0], target[1] - position[1], target[2] - position[2],
  ], [0, 0, -1]);
  let right = normalize(cross(forward, [0, 1, 0]), [1, 0, 0]);
  if (Math.abs(dot(forward, [0, 1, 0])) > 0.9999) {
    right = normalize(cross(forward, [0, 0, 1]), [1, 0, 0]);
  }
  let up = normalize(cross(right, forward), [0, 1, 0]);

  const roll = (Number(camera?.roll) || 0) * (Math.PI / 180);
  if (roll) {
    const cos = Math.cos(roll);
    const sin = Math.sin(roll);
    const rolledRight = right.map((value, axis) => value * cos + up[axis] * sin);
    up = up.map((value, axis) => value * cos - right[axis] * sin);
    right = rolledRight;
  }
  return { position, right, up, forward };
}

/**
 * The five points of a frustum: apex plus the four far corners.
 *
 * ``fov`` is vertical, matching the canonical track and Three.js.
 */
export function frustumPoints(camera, { scale = 0.35, aspect = 16 / 9 } = {}) {
  const { position, right, up, forward } = cameraBasis(camera);
  const fov = Math.max(1, Math.min(179, Number(camera?.fov) || 53));
  const halfHeight = Math.tan((fov * Math.PI) / 360) * scale;
  const halfWidth = halfHeight * Math.max(0.05, Number(aspect) || 1);
  const centre = position.map((value, axis) => value + forward[axis] * scale);
  const corner = (sx, sy) =>
    centre.map((value, axis) => value + right[axis] * halfWidth * sx + up[axis] * halfHeight * sy);
  return {
    apex: position,
    corners: [corner(-1, 1), corner(1, 1), corner(1, -1), corner(-1, -1)],
  };
}

/** Line segments drawing one frustum: four rays plus the far rectangle. */
export function frustumGeometry(camera, options) {
  const { apex, corners } = frustumPoints(camera, options);
  const vertices = [];
  for (const point of corners) vertices.push(...apex, ...point);
  for (let index = 0; index < corners.length; index += 1) {
    vertices.push(...corners[index], ...corners[(index + 1) % corners.length]);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  return geometry;
}

export function frustumLines(camera, { color = 0x8b7bd8, opacity = 1, ...options } = {}) {
  const material = new LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  return new LineSegments(frustumGeometry(camera, options), material);
}

/**
 * Evenly spaced frames to draw a passive frustum at.
 *
 * Even spacing rather than every key: a solve with 300 keys clustered in one
 * second would otherwise draw 300 frustums in one place and none anywhere else.
 */
export function frustumFrames(frames, limit = MAX_PASSIVE_FRUSTUMS) {
  const list = Array.from(frames || []);
  if (list.length <= limit) return list;
  const step = (list.length - 1) / Math.max(1, limit - 1);
  const picked = [];
  for (let index = 0; index < limit; index += 1) picked.push(list[Math.round(index * step)]);
  return [...new Set(picked)];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(vector, fallback) {
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  return length < 1e-9 ? [...fallback] : vector.map((value) => value / length);
}
