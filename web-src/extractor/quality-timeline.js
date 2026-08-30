// The solve-quality strip under the viewer.
//
// It shows what the backend measured, frame by frame, and nothing else. There
// is deliberately no single "confidence" number here: coverage and inlier
// counts mean different things for different solvers, and averaging them into
// one bar would invent a metric that does not exist.
//
// Frames the backend never reported stay grey. Unknown is a real answer.

export const QUALITY_COLORS = {
  good: "#46a758",
  weak: "#e5a23c",
  bad: "#e5484d",
  unknown: "#3a3a48",
};

export const QUALITY_STATES = Object.keys(QUALITY_COLORS);

/** Bucket a coverage reading the way the backend labels it. */
export function qualityState(sample) {
  if (!sample) return "unknown";
  const state = String(sample.state || "").toLowerCase();
  if (QUALITY_COLORS[state]) return state;
  const coverage = Number(sample.coverage);
  if (!Number.isFinite(coverage)) return "unknown";
  if (coverage >= 0.7) return "good";
  if (coverage >= 0.35) return "weak";
  return "bad";
}

/**
 * One entry per timeline frame, so the strip lines up with the video scrubber.
 *
 * Frames are decimated for display only when there are more of them than
 * pixels; the underlying samples are never modified.
 */
export function qualityBuckets(samples, frameCount, maxBuckets = 600) {
  const total = Math.max(1, Number(frameCount) || 0);
  const byFrame = new Map();
  for (const sample of samples || []) {
    byFrame.set(Number(sample.frame), sample);
  }
  const buckets = Math.max(1, Math.min(total, maxBuckets));
  const span = total / buckets;
  const result = [];
  for (let index = 0; index < buckets; index += 1) {
    const start = Math.floor(index * span);
    const end = Math.max(start + 1, Math.floor((index + 1) * span));
    let worst = "unknown";
    let sample = null;
    for (let frame = start; frame < end; frame += 1) {
      const found = byFrame.get(frame);
      if (!found) continue;
      const state = qualityState(found);
      // The worst reading in a bucket wins: a weak frame hidden inside an
      // averaged-away bucket is exactly what the user is looking for.
      if (rank(state) > rank(worst) || worst === "unknown") {
        worst = state;
        sample = found;
      }
    }
    result.push({ frame: start, state: worst, sample });
  }
  return result;
}

function rank(state) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[state] ?? 0;
}

/** Which frame a click at ``x`` in a strip of ``width`` pixels refers to. */
export function frameAtPosition(x, width, frameCount) {
  const total = Math.max(1, Number(frameCount) || 0);
  const ratio = Math.max(0, Math.min(1, Number(x) / Math.max(1, Number(width) || 1)));
  return Math.max(0, Math.min(total - 1, Math.round(ratio * (total - 1))));
}

/** Paint the strip. Returns the buckets it drew, for tests and hit-testing. */
export function drawQualityTimeline(canvas, samples, frameCount, { currentFrame = -1 } = {}) {
  const context = canvas?.getContext?.("2d");
  const width = canvas?.width || 0;
  const height = canvas?.height || 0;
  const buckets = qualityBuckets(samples, frameCount, Math.max(1, width));
  if (!context || !width || !height) return buckets;

  context.clearRect(0, 0, width, height);
  const barWidth = width / buckets.length;
  for (let index = 0; index < buckets.length; index += 1) {
    context.fillStyle = QUALITY_COLORS[buckets[index].state];
    context.fillRect(index * barWidth, 0, Math.max(1, barWidth), height);
  }
  if (currentFrame >= 0 && frameCount > 0) {
    const x = (currentFrame / Math.max(1, frameCount - 1)) * (width - 1);
    context.fillStyle = "#8b7bd8";
    context.fillRect(Math.round(x), 0, 2, height);
  }
  return buckets;
}

/** The detail lines for one frame; absent measurements are simply absent. */
export function qualityDetails(samples, frame) {
  const sample = (samples || []).find((item) => Number(item.frame) === Number(frame));
  const rows = [["Frame", String(frame)]];
  if (!sample) {
    rows.push(["Tracking state", "UNKNOWN"]);
    return rows;
  }
  rows.push(["Tracking state", qualityState(sample).toUpperCase()]);
  if (Number.isFinite(Number(sample.coverage))) {
    rows.push(["Coverage", `${Math.round(Number(sample.coverage) * 100)}%`]);
  }
  if (sample.inliers != null) rows.push(["Inliers", String(sample.inliers)]);
  return rows;
}
