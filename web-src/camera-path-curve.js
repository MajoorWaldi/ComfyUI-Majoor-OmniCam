// Spatial Bézier handles for camera-path keyframes.
//
// A camera keyframe is a control point on the trajectory. Its incoming and
// outgoing tangent handles are stored as per-axis deltas on the existing
// `key.tangents.channels.pos_x/pos_y/pos_z` structure that `sampleChannel()`
// already understands: for a segment A->B and channel `pos_x`,
//
//   p1 = A.x + channels(A).pos_x.out_y      (x-handle fixed at 1/3)
//   p2 = B.x + channels(B).pos_x.in_y       (x-handle fixed at -1/3)
//
// so writing `out_y = Hout.x - A.x` for every axis makes the three position
// channels trace one spatial cubic Bézier with control points A, Hout, Hin, B.
//
// The channels are always stored with `mode: "free"` so the resolver in core.js
// is a pure pass-through of the vectors computed here; the user-facing handle
// mode (Auto Smooth / Aligned / Free / Corner) lives on `key.tangents.spatial_mode`
// and all mode coupling is done in 3D in this module. This keeps the spatial
// mode fully independent of the timeline F-curve editor's `tangents.mode`.
//
// No DOM / THREE / Director dependencies: the maths is unit-tested on its own.

const AXES = ["x", "y", "z"];
const CHANNELS = ["pos_x", "pos_y", "pos_z"];
const EPSILON = 1e-9;

/** User-facing handle modes, in menu order. */
export const SPATIAL_HANDLE_MODES = ["auto", "aligned", "free", "corner"];

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function position(key) {
  const source = key?.camera?.position;
  return [finiteNumber(source?.[0]), finiteNumber(source?.[1]), finiteNumber(source?.[2])];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function magnitude(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function scale(vector, factor) {
  return [vector[0] * factor, vector[1] * factor, vector[2] * factor];
}

/**
 * Auto (Catmull-Rom style) tangent for `key`, as a world-space delta from the
 * key to its outgoing handle tip. The incoming handle is the mirror scaled by
 * the previous span. Matches the `getAuto()` branch of resolveChannelHandles()
 * but computed directly in 3D.
 */
function autoTangent(key, previousKey, nextKey) {
  const here = position(key);
  const previous = previousKey ? position(previousKey) : here;
  const next = nextKey ? position(nextKey) : here;
  const prevSpan = Math.max(EPSILON, finiteNumber(key?.frame) - finiteNumber(previousKey?.frame, finiteNumber(key?.frame) - 1));
  const nextSpan = Math.max(EPSILON, finiteNumber(nextKey?.frame, finiteNumber(key?.frame) + 1) - finiteNumber(key?.frame));

  const out = [0, 0, 0];
  const incoming = [0, 0, 0];
  for (let axis = 0; axis < 3; axis += 1) {
    const dPrev = (here[axis] - previous[axis]) / prevSpan;
    const dNext = (next[axis] - here[axis]) / nextSpan;
    let slope = (dPrev + dNext) * 0.5;
    if (!previousKey) slope = dNext;
    else if (!nextKey) slope = dPrev;
    else if (dPrev * dNext <= 0) slope = 0;
    out[axis] = slope * nextSpan * (1 / 3);
    incoming[axis] = -slope * prevSpan * (1 / 3);
  }
  return { out, in: incoming };
}

/**
 * Vector tangent: handles point one third of the way straight at each
 * neighbour, giving a near-linear segment either side of the key (a corner).
 */
function vectorTangent(key, previousKey, nextKey) {
  const here = position(key);
  const previous = previousKey ? position(previousKey) : here;
  const next = nextKey ? position(nextKey) : here;
  return {
    out: scale(subtract(next, here), 1 / 3),
    in: scale(subtract(previous, here), 1 / 3),
  };
}

function readStoredDelta(key, side) {
  const channels = key?.tangents?.channels;
  if (!channels) return null;
  const field = side === "out" ? "out_y" : "in_y";
  const delta = [0, 0, 0];
  let seen = false;
  for (let axis = 0; axis < 3; axis += 1) {
    const channel = channels[CHANNELS[axis]];
    if (channel && Number.isFinite(Number(channel[field]))) {
      delta[axis] = Number(channel[field]);
      seen = true;
    }
  }
  return seen ? delta : null;
}

/** The stored user-facing handle mode for a key (default "auto"). */
export function spatialHandleMode(key) {
  const mode = key?.tangents?.spatial_mode;
  return SPATIAL_HANDLE_MODES.includes(mode) ? mode : "auto";
}

/**
 * Resolve both tangent handles of `key` as absolute world points, honouring the
 * stored mode. Always safe to call (used to draw the overlay even for keys that
 * have never had a handle edited).
 */
export function spatialHandlePoints(key, previousKey = null, nextKey = null) {
  const mode = spatialHandleMode(key);
  const here = position(key);

  if (mode === "corner") {
    const vector = vectorTangent(key, previousKey, nextKey);
    return { in: add(here, vector.in), out: add(here, vector.out), mode };
  }

  const auto = autoTangent(key, previousKey, nextKey);
  const outDelta = (mode === "free" || mode === "aligned") ? (readStoredDelta(key, "out") || auto.out) : auto.out;
  const inDelta = (mode === "free" || mode === "aligned") ? (readStoredDelta(key, "in") || auto.in) : auto.in;
  return { in: add(here, inDelta), out: add(here, outDelta), mode };
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function ensureChannels(key) {
  key.tangents = key.tangents && typeof key.tangents === "object" ? key.tangents : {};
  key.tangents.channels = key.tangents.channels && typeof key.tangents.channels === "object"
    ? key.tangents.channels
    : {};
  return key.tangents.channels;
}

function writeDelta(key, side, delta) {
  const channels = ensureChannels(key);
  for (let axis = 0; axis < 3; axis += 1) {
    const id = CHANNELS[axis];
    const channel = channels[id] && typeof channels[id] === "object" ? channels[id] : {};
    channel.mode = "free";
    channel.out_x = 1 / 3;
    channel.in_x = -1 / 3;
    if (side === "out") channel.out_y = delta[axis];
    else channel.in_y = delta[axis];
    if (channel.out_y === undefined) channel.out_y = 0;
    if (channel.in_y === undefined) channel.in_y = 0;
    channels[id] = channel;
  }
}

/** True once at least one bounding key of any segment needs the Bézier path. */
function promoteToBezier(key) {
  if (key.interpolation !== "bezier") key.interpolation = "bezier";
}

/**
 * Freeze both handles of `key` from the current resolved shape, so a following
 * single-side edit does not snap the untouched side back to auto.
 */
function seedBothHandles(key, previousKey, nextKey) {
  const here = position(key);
  const points = spatialHandlePoints(key, previousKey, nextKey);
  writeDelta(key, "out", subtract(points.out, here));
  writeDelta(key, "in", subtract(points.in, here));
}

/**
 * Drag one tangent handle of `key` to `worldPoint`. Applies mode coupling in 3D:
 *  - free    : only the dragged side changes
 *  - aligned : the opposite side is kept colinear-opposite, its length preserved
 *  - auto    : first drag promotes the key to "aligned"
 *  - corner  : handles are slaved to the neighbours; a drag is ignored
 * Mutates `key` in place and returns it.
 */
export function writeSpatialHandle(key, side, worldPoint, { prevKey = null, nextKey = null } = {}) {
  if (!key || (side !== "in" && side !== "out")) return key;
  let mode = spatialHandleMode(key);
  if (mode === "corner") return key;

  if (mode === "auto") {
    mode = "aligned";
    key.tangents = key.tangents && typeof key.tangents === "object" ? key.tangents : {};
    key.tangents.spatial_mode = "aligned";
    seedBothHandles(key, prevKey, nextKey);
  }

  const here = position(key);
  const dragged = subtract([
    finiteNumber(worldPoint?.[0]),
    finiteNumber(worldPoint?.[1]),
    finiteNumber(worldPoint?.[2]),
  ], here);

  promoteToBezier(key);
  writeDelta(key, side, dragged);

  if (mode === "aligned") {
    const oppositeSide = side === "out" ? "in" : "out";
    const opposite = readStoredDelta(key, oppositeSide) || (oppositeSide === "out"
      ? autoTangent(key, prevKey, nextKey).out
      : autoTangent(key, prevKey, nextKey).in);
    const draggedLength = magnitude(dragged);
    const oppositeLength = magnitude(opposite) || draggedLength || 1;
    const mirrored = draggedLength > EPSILON
      ? scale(dragged, -oppositeLength / draggedLength)
      : scale(opposite, 1);
    writeDelta(key, oppositeSide, mirrored);
  }

  return key;
}

/**
 * Set the user-facing handle mode of `key`.
 *  - auto   : drop the stored spatial handles so the resolver recomputes live
 *  - corner : freeze vector-style handles (near-linear either side)
 *  - aligned/free : freeze the current resolved shape as the editable start point
 * Mutates `key` in place and returns it.
 */
export function setSpatialHandleMode(key, uiMode, { prevKey = null, nextKey = null } = {}) {
  if (!key || !SPATIAL_HANDLE_MODES.includes(uiMode)) return key;
  key.tangents = key.tangents && typeof key.tangents === "object" ? key.tangents : {};
  key.tangents.spatial_mode = uiMode;

  if (uiMode === "auto") {
    if (key.tangents.channels) {
      for (const id of CHANNELS) delete key.tangents.channels[id];
      if (!Object.keys(key.tangents.channels).length) delete key.tangents.channels;
    }
    if (key.interpolation === "bezier") key.interpolation = "smooth";
    return key;
  }

  if (uiMode === "corner") {
    const vector = vectorTangent(key, prevKey, nextKey);
    promoteToBezier(key);
    writeDelta(key, "out", vector.out);
    writeDelta(key, "in", vector.in);
    return key;
  }

  // aligned / free: capture the current shape so handles start where the curve is.
  promoteToBezier(key);
  seedBothHandles(key, prevKey, nextKey);
  return key;
}
