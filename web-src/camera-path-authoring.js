// Pure camera-path authoring helpers for OmniCam Director.
//
// This module deliberately has no DOM or Director dependencies so drawing,
// simplification and timing can be tested independently from the viewport.

const EPSILON = 1e-9;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function finitePoint(value) {
  return Array.isArray(value)
    && value.length >= 3
    && Number.isFinite(Number(value[0]))
    && Number.isFinite(Number(value[1]))
    && Number.isFinite(Number(value[2]));
}

function point(value) {
  return [finiteNumber(value[0]), finiteNumber(value[1]), finiteNumber(value[2])];
}

function distance(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

function cloneCamera(camera = {}) {
  return {
    ...camera,
    position: point(camera.position || [0, 0, 0]),
    target: point(camera.target || [0, 0, -1]),
    up: Array.isArray(camera.up) ? point(camera.up) : [0, 1, 0],
  };
}

function cumulativeDistances(points) {
  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulative.push(cumulative[index - 1] + distance(points[index - 1], points[index]));
  }
  return cumulative;
}

function pointSegmentDistance(value, start, end) {
  const ab = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
  const av = [value[0] - start[0], value[1] - start[1], value[2] - start[2]];
  const denominator = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
  if (denominator <= EPSILON) return distance(value, start);
  const t = Math.max(0, Math.min(1, (av[0] * ab[0] + av[1] * ab[1] + av[2] * ab[2]) / denominator));
  const projected = [start[0] + ab[0] * t, start[1] + ab[1] * t, start[2] + ab[2] * t];
  return distance(value, projected);
}

function rdp(points, tolerance) {
  if (points.length <= 2 || tolerance <= 0) return points.map((value) => [...value]);
  let maxDistance = -1;
  let split = -1;
  const first = points[0], last = points[points.length - 1];
  for (let index = 1; index < points.length - 1; index += 1) {
    const deviation = pointSegmentDistance(points[index], first, last);
    if (deviation > maxDistance) {
      maxDistance = deviation;
      split = index;
    }
  }
  if (maxDistance <= tolerance || split < 0) return [[...first], [...last]];
  const left = rdp(points.slice(0, split + 1), tolerance);
  const right = rdp(points.slice(split), tolerance);
  return [...left.slice(0, -1), ...right];
}

function samplePolyline(points, count) {
  if (points.length <= count) return points.map((value) => [...value]);
  if (count <= 1) return [[...points[0]]];
  const cumulative = cumulativeDistances(points);
  const total = cumulative.at(-1);
  if (total <= EPSILON) {
    return Array.from({ length: count }, (_, index) => {
      const sourceIndex = Math.round((points.length - 1) * index / (count - 1));
      return [...points[sourceIndex]];
    });
  }
  const result = [];
  let segment = 1;
  for (let index = 0; index < count; index += 1) {
    const targetDistance = total * index / (count - 1);
    while (segment < cumulative.length - 1 && cumulative[segment] < targetDistance) segment += 1;
    const startDistance = cumulative[segment - 1];
    const endDistance = cumulative[segment];
    const span = Math.max(EPSILON, endDistance - startDistance);
    const t = Math.max(0, Math.min(1, (targetDistance - startDistance) / span));
    const a = points[segment - 1], b = points[segment];
    result.push([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]);
  }
  result[0] = [...points[0]];
  result[result.length - 1] = [...points.at(-1)];
  return result;
}

/** Resolve the frame range used by a newly drawn path. */
export function resolveCameraPathRange(state = {}) {
  const duration = Math.max(1, Math.round(finiteNumber(state.duration_frames, 1)));
  const lastFrame = duration - 1;
  const range = Array.isArray(state.playback_range) && state.playback_range.length >= 2
    ? state.playback_range
    : [0, lastFrame];
  let start = Math.max(0, Math.min(lastFrame, Math.round(finiteNumber(range[0], 0))));
  let end = Math.max(0, Math.min(lastFrame, Math.round(finiteNumber(range[1], lastFrame))));
  if (end < start) [start, end] = [end, start];
  return [start, end];
}

/**
 * Reduce raw pointer samples to a stable editable path while preserving both
 * endpoints. The first pass removes jitter-sized duplicates; RDP removes
 * redundant collinear samples; the final cap keeps the viewport tractable.
 */
export function simplifyCameraStroke(points, {
  minDistance = 0.025,
  tolerance = 0.015,
  maxPoints = 48,
} = {}) {
  const valid = (points || []).filter(finitePoint).map(point);
  if (valid.length <= 1) return valid;

  const separated = [[...valid[0]]];
  for (let index = 1; index < valid.length - 1; index += 1) {
    if (distance(separated.at(-1), valid[index]) >= Math.max(0, minDistance)) {
      separated.push([...valid[index]]);
    }
  }
  if (distance(separated.at(-1), valid.at(-1)) > EPSILON || separated.length === 1) {
    separated.push([...valid.at(-1)]);
  } else {
    separated[separated.length - 1] = [...valid.at(-1)];
  }

  const simplified = rdp(separated, Math.max(0, finiteNumber(tolerance, 0)));
  const cap = Math.max(2, Math.round(finiteNumber(maxPoints, 48)));
  return simplified.length > cap ? samplePolyline(simplified, cap) : simplified;
}

function cameraFocusDistance(camera) {
  const source = cloneCamera(camera);
  const value = distance(source.position, source.target);
  return value > EPSILON ? value : 5;
}

function normalizedTangent(points, index, fallback) {
  let vector;
  if (points.length < 2) vector = fallback;
  else if (index === 0) vector = points[1].map((value, axis) => value - points[0][axis]);
  else if (index === points.length - 1) vector = points[index].map((value, axis) => value - points[index - 1][axis]);
  else vector = points[index + 1].map((value, axis) => value - points[index - 1][axis]);
  let magnitude = Math.hypot(...vector);
  if (magnitude <= EPSILON) {
    vector = fallback;
    magnitude = Math.hypot(...vector) || 1;
  }
  return vector.map((value) => value / magnitude);
}

function baseForward(camera) {
  const source = cloneCamera(camera);
  const vector = source.target.map((value, axis) => value - source.position[axis]);
  const magnitude = Math.hypot(...vector) || 1;
  return vector.map((value) => value / magnitude);
}

/**
 * Turn spatial path points into normal OmniCam camera keys. Timing follows arc
 * length, so the default move has constant world-space speed. Orientation is
 * Follow Path: each key looks down the local path tangent.
 */
export function buildCameraPathKeys({ points, startFrame = 0, endFrame = 0, camera = {} } = {}) {
  let path = (points || []).filter(finitePoint).map(point);
  if (path.length < 2) return [];

  let start = Math.round(finiteNumber(startFrame, 0));
  let end = Math.round(finiteNumber(endFrame, start));
  if (end < start) [start, end] = [end, start];
  const availableFrames = Math.max(1, end - start + 1);
  if (path.length > availableFrames) path = samplePolyline(path, availableFrames);

  const cumulative = cumulativeDistances(path);
  const total = cumulative.at(-1);
  const frameSpan = end - start;
  const frames = [];
  let previous = start - 1;
  for (let index = 0; index < path.length; index += 1) {
    let frame;
    if (index === 0) frame = start;
    else if (index === path.length - 1) frame = end;
    else {
      const progress = total > EPSILON ? cumulative[index] / total : index / (path.length - 1);
      const ideal = start + Math.round(frameSpan * progress);
      const remaining = path.length - 1 - index;
      frame = Math.max(previous + 1, Math.min(end - remaining, ideal));
    }
    frames.push(frame);
    previous = frame;
  }

  const source = cloneCamera(camera);
  const focusDistance = cameraFocusDistance(source);
  const fallback = baseForward(source);
  return path.map((position, index) => {
    const forward = normalizedTangent(path, index, fallback);
    const authored = cloneCamera(source);
    authored.position = [...position];
    authored.target = position.map((value, axis) => value + forward[axis] * focusDistance);
    return { frame: frames[index], camera: authored, interpolation: "smooth" };
  });
}
