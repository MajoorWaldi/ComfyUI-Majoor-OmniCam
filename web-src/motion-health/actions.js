// The three repairs the Health panel offers, as keyframe edits.
//
// Their Python counterparts in camera_tools.py bake one key per frame, which is
// right for an export and wrong for an editor: it would shred the animator's
// keys with no way back. Everything here works on the authored keys instead,
// and every function returns a new array rather than mutating its input.

/** Chord length between two camera keys, in world units. */
function chord(a, b) {
  const p = a.camera?.position || [0, 0, 0], q = b.camera?.position || [0, 0, 0];
  return Math.sqrt((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2);
}

function cloneKeys(keys) {
  return (keys || []).map((key) => ({
    ...key,
    camera: { ...(key.camera || {}), position: [...(key.camera?.position || [])], target: [...(key.camera?.target || [])] },
  }));
}

/**
 * Respace keys so time is proportional to distance travelled: constant speed.
 *
 * The duration is preserved, which is what a fixed-length generation needs. For
 * a fixed path over a fixed duration the average speed cannot change, so this
 * lowers the peak to that average and no further -- see plan_speed_fix().
 */
export function retimeConstantSpeed(keys, lastFrame) {
  const source = cloneKeys(keys);
  if (source.length < 3 || lastFrame < 2) return source;
  const cumulative = [0];
  for (let index = 1; index < source.length; index++) {
    cumulative.push(cumulative[index - 1] + chord(source[index - 1], source[index]));
  }
  const total = cumulative[cumulative.length - 1];
  if (total <= 1e-9) return source;

  const first = source[0].frame ?? 0;
  const span = (source[source.length - 1].frame ?? lastFrame) - first;
  if (span <= 0) return source;
  let previousFrame = first;
  for (let index = 1; index < source.length - 1; index++) {
    const target = first + Math.round(span * (cumulative[index] / total));
    // Keys must stay strictly ordered: a collapsed pair would silently drop one.
    source[index].frame = Math.min(lastFrame - 1, Math.max(previousFrame + 1, target));
    previousFrame = source[index].frame;
  }
  return source;
}

function inAnyRange(frame, ranges) {
  return ranges.some((range) => frame >= range.start && frame <= range.end);
}

/**
 * Blend keys inside the flagged ranges toward the average of their neighbours.
 *
 * Only keys whose frame falls inside a flagged range move, so repairing one
 * rough segment never touches the framing the animator built elsewhere. First
 * and last keys are anchors and never move.
 */
export function smoothKeysInRanges(keys, ranges, amount = 0.6) {
  const source = cloneKeys(keys);
  const strength = Math.min(1, Math.max(0, Number(amount) || 0));
  if (!strength || source.length < 3 || !ranges?.length) return source;
  const result = cloneKeys(source);
  for (let index = 1; index < source.length - 1; index++) {
    if (!inAnyRange(source[index].frame ?? 0, ranges)) continue;
    for (const field of ["position", "target"]) {
      const vectors = [source[index - 1], source[index], source[index + 1]]
        .map((key) => key.camera?.[field]).filter((value) => Array.isArray(value) && value.length >= 3);
      const current = source[index].camera?.[field];
      if (vectors.length < 3 || !Array.isArray(current)) continue;
      const average = [0, 1, 2].map((axis) => vectors.reduce((sum, vector) => sum + Number(vector[axis] || 0), 0) / vectors.length);
      result[index].camera[field] = current.map((value, axis) => Number(value) + (average[axis] - Number(value)) * strength);
    }
  }
  return result;
}

/**
 * Aim the keys inside the flagged ranges at `subject`.
 *
 * Ranged on purpose: retargeting every key -- what constrain_look_at() does --
 * would flatten the framing of the whole shot to fix a few frames.
 */
export function recenterKeysInRanges(keys, ranges, subject) {
  const source = cloneKeys(keys);
  if (!ranges?.length || !Array.isArray(subject)) return source;
  const point = subject.slice(0, 3).map(Number);
  for (const key of source) {
    if (inAnyRange(key.frame ?? 0, ranges)) key.camera.target = [...point];
  }
  return source;
}

/** Ranges of the report's segments that were flagged for `metric`. */
export function rangesForMetric(report, metric) {
  return report.segments
    .filter((segment) => segment.grade !== "ok" && segment.metrics.includes(metric))
    .map((segment) => ({ start: segment.start, end: segment.end }));
}

/** Every flagged range, whatever the reason. */
export function flaggedRanges(report) {
  return report.segments
    .filter((segment) => segment.grade !== "ok")
    .map((segment) => ({ start: segment.start, end: segment.end }));
}
