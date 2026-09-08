// Pure keyframe operations: simplify / reduce / clean a track, and the batch
// primitives (delete / shift / set interpolation) the multi-select tools drive.
//
// No DOM, no Director: everything takes a plain keyframe array plus a `kind`
// ("camera" | "object") and returns a new array. The caller assigns the result
// back onto the track (and, for the active camera, onto state.keyframes too --
// see director/methods/keyframe-batch.js).
//
// A "sample vector" flattens a key's animated channels into one Euclidean
// point so a curve-fitting metric can treat position metres, degrees and FOV
// on one footing: each channel is scaled by its own span across the track
// before any distance is measured.

const EPS = 1e-9;

/** Flatten a key's animated channels to a plain number[]. */
export function sampleVector(key, kind) {
  if (kind === "object") {
    const tr = key.transform || {};
    return [
      ...(tr.position || [0, 0, 0]).map(Number),
      ...(tr.rotation || [0, 0, 0]).map(Number),
      ...(tr.size || [1, 1, 1]).map(Number),
    ];
  }
  const c = key.camera || {};
  return [
    ...(c.position || [0, 0, 0]).map(Number),
    ...(c.target || [0, 0, 0]).map(Number),
    Number(c.fov) || 0,
    Number(c.roll) || 0,
    Number(c.zoom) || 1,
  ];
}

function channelScales(vectors) {
  const dims = vectors[0]?.length || 0;
  const scales = new Array(dims).fill(1);
  for (let d = 0; d < dims; d += 1) {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of vectors) {
      const value = Number.isFinite(v[d]) ? v[d] : 0;
      if (value < lo) lo = value;
      if (value > hi) hi = value;
    }
    const span = hi - lo;
    scales[d] = span > EPS ? 1 / span : 0;
  }
  return scales;
}

/** Points in normalised (time, value…) space, so the fit metric is uniform. */
function normalisedPoints(keys, kind) {
  const vectors = keys.map((key) => sampleVector(key, kind));
  const scales = channelScales(vectors);
  const frames = keys.map((key) => key.frame);
  const frameSpan = Math.max(1, frames[frames.length - 1] - frames[0]);
  return vectors.map((v, index) => [
    (frames[index] - frames[0]) / frameSpan,
    ...v.map((value, d) => (Number.isFinite(value) ? value : 0) * scales[d]),
  ]);
}

function distance(a, b) {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += (a[i] - b[i]) ** 2;
  return Math.sqrt(total);
}

/** Perpendicular distance of `p` from the segment `a`–`b` in N-D space. */
function pointSegmentDistance(p, a, b) {
  let denom = 0;
  for (let i = 0; i < a.length; i += 1) denom += (b[i] - a[i]) ** 2;
  if (denom <= EPS) return distance(p, a);
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) dot += (p[i] - a[i]) * (b[i] - a[i]);
  const t = Math.max(0, Math.min(1, dot / denom));
  const proj = a.map((value, i) => value + (b[i] - value) * t);
  return distance(p, proj);
}

function rdpKeepIndices(points, tolerance, keep) {
  const kept = new Set([0, points.length - 1]);
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [from, to] = stack.pop();
    if (to - from < 2) continue;
    let maxDist = -1;
    let split = -1;
    for (let i = from + 1; i < to; i += 1) {
      const d = pointSegmentDistance(points[i], points[from], points[to]);
      if (d > maxDist) {
        maxDist = d;
        split = i;
      }
    }
    if (split < 0) continue;
    if (maxDist > tolerance || keep.has(split)) {
      kept.add(split);
      stack.push([from, split], [split, to]);
    }
  }
  return kept;
}

/**
 * Drop keys whose removal moves the sampled curve less than `tolerance`
 * (normalised units, ~0..1). Endpoints and any frame in `keepFrames` survive.
 */
export function simplifyKeyframes(keys, kind, { tolerance = 0.02, keepFrames = [] } = {}) {
  const sorted = [...keys].sort((a, b) => a.frame - b.frame);
  if (sorted.length <= 2 || tolerance <= 0) return { keys: sorted, removed: 0 };
  const points = normalisedPoints(sorted, kind);
  const keepSet = new Set();
  const keepFrameSet = new Set(keepFrames);
  sorted.forEach((key, index) => {
    if (keepFrameSet.has(key.frame)) keepSet.add(index);
  });
  const kept = rdpKeepIndices(points, tolerance, keepSet);
  for (const index of keepSet) kept.add(index);
  const next = sorted.filter((_, index) => kept.has(index));
  return { keys: next, removed: sorted.length - next.length };
}

/**
 * Greedily remove the lowest-deviation interior key until `target` remain.
 * Endpoints and `keepFrames` are never removed.
 */
export function reduceKeyframes(keys, kind, { target = 2, keepFrames = [] } = {}) {
  let working = [...keys].sort((a, b) => a.frame - b.frame);
  const floor = Math.max(2, Math.round(target));
  if (working.length <= floor) return { keys: working, removed: 0 };
  const keepFrameSet = new Set(keepFrames);
  const before = working.length;

  while (working.length > floor) {
    const points = normalisedPoints(working, kind);
    let victim = -1;
    let victimError = Infinity;
    for (let i = 1; i < working.length - 1; i += 1) {
      if (keepFrameSet.has(working[i].frame)) continue;
      const error = pointSegmentDistance(points[i], points[i - 1], points[i + 1]);
      if (error < victimError) {
        victimError = error;
        victim = i;
      }
    }
    if (victim < 0) break;
    working = working.filter((_, index) => index !== victim);
  }
  return { keys: working, removed: before - working.length };
}

/**
 * Remove duplicate-frame keys, merge keys closer than `mergeWithin` frames, and
 * drop interior keys whose value is (within `epsilon`) the straight-line
 * interpolation of their neighbours.
 */
export function cleanKeyframes(keys, kind, { mergeWithin = 1, epsilon = 0.001, keepFrames = [] } = {}) {
  const sorted = [...keys].sort((a, b) => a.frame - b.frame);
  const before = sorted.length;
  const keepFrameSet = new Set(keepFrames);

  // Duplicate frames + near-frame merge (keep the earlier key).
  const spaced = [];
  for (const key of sorted) {
    const last = spaced[spaced.length - 1];
    if (last && key.frame - last.frame <= Math.max(0, mergeWithin) && !keepFrameSet.has(key.frame)) continue;
    spaced.push(key);
  }
  if (spaced.length <= 2) return { keys: spaced, removed: before - spaced.length };

  // Collinear / redundant value keys.
  const points = normalisedPoints(spaced, kind);
  const drop = new Set();
  for (let i = 1; i < spaced.length - 1; i += 1) {
    if (keepFrameSet.has(spaced[i].frame)) continue;
    const prev = drop.has(i - 1) ? null : i - 1;
    if (prev === null) continue;
    const d = pointSegmentDistance(points[i], points[prev], points[i + 1]);
    if (d <= epsilon) drop.add(i);
  }
  const next = spaced.filter((_, index) => !drop.has(index));
  return { keys: next, removed: before - next.length };
}

// --- batch primitives for the multi-select tools ---------------------------

/** Remove every key whose frame is in `frames`, keeping at least `minKeys`. */
export function deleteKeyframesByFrame(keys, frames, { minKeys = 0 } = {}) {
  const target = new Set(frames);
  const next = keys.filter((key) => !target.has(key.frame));
  if (next.length < minKeys) {
    // Give back the lowest-frame victims until the floor is met.
    const victims = keys.filter((key) => target.has(key.frame)).sort((a, b) => a.frame - b.frame);
    while (next.length < minKeys && victims.length) next.push(victims.shift());
    next.sort((a, b) => a.frame - b.frame);
  }
  return { keys: next, removed: keys.length - next.length };
}

/**
 * Rigidly shift the keys in `frames` by `delta`. All-or-nothing: if any selected
 * key would leave the timeline or land on an unselected key, nothing moves. This
 * keeps a multi-key nudge from ever collapsing two keys onto one frame.
 */
export function shiftKeyframes(keys, frames, delta, { lastFrame = Infinity } = {}) {
  const selectedFrames = [...frames].sort((a, b) => a - b);
  if (!delta || !selectedFrames.length) {
    return { keys: [...keys], moved: 0, frames: selectedFrames };
  }
  const selected = new Set(selectedFrames);
  const occupied = new Set(keys.filter((key) => !selected.has(key.frame)).map((key) => key.frame));
  const targets = selectedFrames.map((frame) => frame + delta);
  const blocked = targets.some((target) => target < 0 || target > lastFrame || occupied.has(target))
    || new Set(targets).size !== targets.length;
  if (blocked) return { keys: [...keys], moved: 0, frames: selectedFrames };

  const next = keys
    .map((key) => (selected.has(key.frame) ? { ...key, frame: key.frame + delta } : key))
    .sort((a, b) => a.frame - b.frame);
  return { keys: next, moved: selectedFrames.length, frames: targets.sort((a, b) => a - b) };
}

/** Set `interpolation` on every key whose frame is in `frames`. */
export function setKeyframeInterpolation(keys, frames, mode) {
  const target = new Set(frames);
  return keys.map((key) => (target.has(key.frame) ? { ...key, interpolation: mode } : key));
}

/** Set the tangent `mode` (and per-channel mode) on the selected keys. */
export function setKeyframeTangentMode(keys, frames, mode, channelIds = []) {
  const target = new Set(frames);
  return keys.map((key) => {
    if (!target.has(key.frame)) return key;
    const tangents = { mode, channels: { ...(key.tangents?.channels || {}) } };
    for (const id of channelIds) {
      tangents.channels[id] = { ...(tangents.channels[id] || {}), mode };
    }
    const interpolation = mode !== "auto" && key.interpolation !== "bezier" ? "bezier" : key.interpolation;
    return { ...key, interpolation, tangents };
  });
}
