// The solved track's timeline: the Director's dope sheet, read-only.
//
// The Extractor had a scrubber and a quality strip, which answers "how well did
// the solve go" but not "what did it actually author". This draws the channels
// the solve produced -- position, look-at, lens and roll -- as key lanes on the
// same frame axis as the video, so a spike in the trajectory is visible at the
// frame it happens on rather than three panels away.
//
// Two grading bands sit above the lanes and mean different things on purpose:
//
// * SOLVE is the backend's own per-frame health (coverage, inliers). It says
//   whether the tracker could see.
// * MOTION is `motionHealthReport`, the same grading the Director's Health
//   panel runs. It says whether the resulting camera is shootable.
//
// A solve can be green and the motion red -- that is a clean track of a camera
// that moves too fast for the target model, and it is exactly the case a single
// merged bar would hide.
//
// Nothing here edits: the Extractor corrects a track through Refine, and a
// timeline you can drag keys on would be a second, silently disagreeing editor.

import { motionHealthReport } from "../motion-health.js";

import { QUALITY_COLORS, qualityState } from "./quality-timeline.js";

export const GRADE_COLORS = {
  ok: "#46a758",
  warn: "#e5a23c",
  over: "#e5484d",
};

export const CHANNEL_COLORS = {
  position: "#8b7bd8",
  target: "#e5a23c",
  fov: "#5aa9e6",
  roll: "#e2649a",
};

/** The lanes, in the Director's order so the two panels read the same way. */
export const TRACK_CHANNELS = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "fov", label: "Focal Length" },
  { key: "roll", label: "Roll" },
];

const LANE_HEIGHT = 18;
const BAND_HEIGHT = 9;
const BAND_GAP = 2;
const LABEL_WIDTH = 78;

const BAND_LABELS = { solve: "SOLVE", motion: "MOTION" };

/**
 * The compact strip: its own label gutter, thin bands, its own ruler.
 *
 * This is what the Monitor's card draws, where the canvas is the whole widget
 * and so has nowhere else to put a lane name.
 */
export const COMPACT_LAYOUT = {
  bands: ["solve", "motion"],
  labels: true,
  labelWidth: LABEL_WIDTH,
  bandHeight: BAND_HEIGHT,
  bandGap: BAND_GAP,
  laneTopGap: BAND_GAP + 2,
  laneHeight: LANE_HEIGHT,
  laneGap: 0,
  rowChrome: false,
  ruler: true,
  playhead: true,
  topPad: 1,
  bottomPad: 12,
};

/**
 * The Director's dope-sheet geometry, for a canvas that sits inside one.
 *
 * The Extractor's strip lives in an `.oc-dope-body`, which already supplies the
 * label gutter, the ruler and the playhead. Painting our own inside the canvas
 * duplicated all three: a second, smaller set of lane names printed over the
 * first, on rows that lined up with none of them. Here the canvas draws lanes
 * and nothing else, on the Director's row pitch, so every lane sits on the
 * label the gutter gives it.
 *
 * SOLVE is absent on purpose too: the quality strip directly above the canvas
 * is that same band, and drawing it twice made the two disagree at a glance.
 */
export const DOPE_LAYOUT = {
  bands: [],
  labels: false,
  labelWidth: 0,
  bandHeight: 28,
  bandGap: 4,
  laneTopGap: 4,
  laneHeight: 28,
  laneGap: 4,
  rowChrome: true,
  ruler: false,
  playhead: false,
  topPad: 0,
  bottomPad: 0,
};

/** The rows a layout draws, top to bottom, and the height they add up to. */
export function timelineRows(channels = TRACK_CHANNELS, layout = COMPACT_LAYOUT) {
  const style = { ...COMPACT_LAYOUT, ...layout };
  const rows = [];
  let y = style.topPad;
  for (const band of style.bands || []) {
    if (rows.length) y += style.bandGap;
    rows.push({
      kind: "band",
      key: band,
      label: BAND_LABELS[band] || String(band).toUpperCase(),
      top: y,
      height: style.bandHeight,
    });
    y += style.bandHeight;
  }
  for (const channel of channels) {
    if (rows.length) y += rows[rows.length - 1].kind === "band" ? style.laneTopGap : style.laneGap;
    rows.push({ kind: "lane", key: channel.key, label: channel.label, top: y, height: style.laneHeight });
    y += style.laneHeight;
  }
  return { rows, style, height: y + style.bottomPad };
}

/** Total canvas height for the bands, the lanes and the ruler. */
export function timelineHeight(channels = TRACK_CHANNELS, layout = COMPACT_LAYOUT) {
  return timelineRows(channels, layout).height;
}

function channelValue(camera, key) {
  if (!camera) return null;
  if (key === "position" || key === "target") {
    const vector = camera[key];
    return Array.isArray(vector) ? vector.map(Number) : null;
  }
  const value = Number(camera[key === "fov" ? "fov" : "roll"]);
  return Number.isFinite(value) ? [value] : null;
}

function sameValue(a, b, epsilon = 1e-4) {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((value, index) => Math.abs(value - b[index]) <= epsilon);
}

/**
 * The frames each channel actually keys on.
 *
 * A solve writes every channel on every keyframe, so drawing all of them would
 * paint four identical rows. A key is therefore reported only where the channel
 * *changed*: a lens that never racks shows one key at the head, which is the
 * truth about that shot.
 */
export function channelKeys(track, channels = TRACK_CHANNELS) {
  const keyframes = Array.isArray(track?.keyframes) ? track.keyframes : [];
  const result = {};
  for (const { key } of channels) {
    const frames = [];
    let previous = null;
    for (const keyframe of keyframes) {
      const value = channelValue(keyframe?.camera, key);
      if (!value) continue;
      if (previous === null || !sameValue(value, previous)) frames.push(Number(keyframe.frame) || 0);
      previous = value;
    }
    result[key] = frames;
  }
  return result;
}

/**
 * Grade the solved track the way the Director's Health panel would.
 *
 * Returns null rather than an empty report when there is no track: an ungraded
 * band is drawn as "unknown", never as a pass.
 */
export function trackHealth(track, limits = null, profileId = "generic") {
  if (!track?.keyframes?.length || !limits) return null;
  try {
    return motionHealthReport(track, limits, null, profileId);
  } catch {
    // A malformed track is the solve's problem to report, not the timeline's.
    return null;
  }
}

/** Frame under an x position inside the lane area (past the label gutter). */
export function frameAtTimelineX(x, width, frameCount, labelWidth = LABEL_WIDTH) {
  const total = Math.max(1, Number(frameCount) || 0);
  const span = Math.max(1, (Number(width) || 1) - labelWidth);
  const ratio = Math.max(0, Math.min(1, (Number(x) - labelWidth) / span));
  return Math.max(0, Math.min(total - 1, Math.round(ratio * (total - 1))));
}

/** Usable lane width: past the gutter, with a right margin only if there is one. */
function laneSpan(width, style) {
  return Math.max(1, (Number(width) || 1) - style.labelWidth - (style.labelWidth ? 4 : 0));
}

function frameX(frame, width, frameCount, style) {
  const span = Math.max(1, (Number(frameCount) || 1) - 1);
  const usable = laneSpan(width, style);
  return style.labelWidth + (Math.max(0, Math.min(span, frame)) / span) * usable;
}

function drawBand(context, { y, height, width, frameCount, colorAt, style }) {
  const total = Math.max(1, Number(frameCount) || 0);
  const usable = laneSpan(width, style);
  const step = Math.max(1, Math.ceil(total / usable));
  const barWidth = Math.max(1, usable / Math.ceil(total / step));
  for (let frame = 0; frame < total; frame += step) {
    const color = colorAt(frame, Math.min(total, frame + step));
    if (!color) continue;
    context.fillStyle = color;
    context.fillRect(style.labelWidth + (frame / total) * usable, y, barWidth, height);
  }
}

function label(context, text, y, color) {
  context.fillStyle = color;
  context.font = "9px system-ui, sans-serif";
  context.textBaseline = "middle";
  context.fillText(text, 2, y);
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

/**
 * The row plate the Director draws behind every dope-sheet lane.
 *
 * Same fill, border and centre rail as `.oc-dope-row`, so that a canvas lane
 * and a DOM lane are the same object to the eye.
 */
function drawRowChrome(context, { row, width, style }) {
  const x = style.labelWidth;
  const usable = Math.max(2, width - x);
  roundedRect(context, x + 0.5, row.top + 0.5, usable - 1, row.height - 1, 6);
  context.fillStyle = "#20202a";
  context.fill();
  context.strokeStyle = "#26262f";
  context.lineWidth = 1;
  context.stroke();
  if (row.kind !== "lane") return;
  context.fillStyle = "#2c2c38";
  context.fillRect(x + 1, Math.round(row.top + row.height / 2), usable - 2, 1);
}

/**
 * Paint the whole strip.
 *
 * Returns the geometry it drew so the panel can hit-test without re-deriving
 * the layout, and so the lanes are testable without a canvas that paints.
 */
export function drawTrackTimeline(canvas, {
  track = null,
  health = null,
  quality = [],
  frame = 0,
  frameCount = 0,
  channels = TRACK_CHANNELS,
  layout = COMPACT_LAYOUT,
} = {}) {
  const total = Math.max(1, Number(frameCount) || Number(track?.duration_frames) || 1);
  const keys = channelKeys(track, channels);
  const { rows, style } = timelineRows(channels, layout);
  const geometry = {
    total,
    labelWidth: style.labelWidth,
    lanes: rows.filter((row) => row.kind === "lane").map((row) => ({
      key: row.key,
      top: row.top,
      bottom: row.top + row.height,
      keys: keys[row.key] || [],
    })),
  };
  const context = canvas?.getContext?.("2d");
  const width = canvas?.width || 0;
  const height = canvas?.height || 0;
  if (!context || !width || !height) return { ...geometry, keys };

  context.clearRect(0, 0, width, height);

  const byFrame = new Map((quality || []).map((sample) => [Number(sample.frame), sample]));
  const grades = Array.isArray(health?.frame_grades) ? health.frame_grades : [];
  const bandColor = {
    solve: (start, end) => {
      let worst = null;
      for (let index = start; index < end; index += 1) {
        const sample = byFrame.get(index);
        if (!sample) continue;
        const state = qualityState(sample);
        if (!worst || rankQuality(state) > rankQuality(worst)) worst = state;
      }
      return QUALITY_COLORS[worst || "unknown"];
    },
    motion: (start, end) => {
      if (!grades.length) return QUALITY_COLORS.unknown;
      let worst = "ok";
      for (let index = start; index < end; index += 1) {
        const grade = grades[Math.min(grades.length - 1, index)] || "ok";
        if (rankGrade(grade) > rankGrade(worst)) worst = grade;
      }
      return GRADE_COLORS[worst];
    },
  };

  for (const row of rows) {
    if (style.rowChrome) drawRowChrome(context, { row, width, style });
    const centre = row.top + row.height / 2;
    if (style.labels) label(context, row.label, centre, "#9a9aad");

    if (row.kind === "band") {
      const colorAt = bandColor[row.key];
      if (!colorAt) continue;
      // Inset by the plate's border, so a full band never paints over it.
      const inset = style.rowChrome ? 2 : 0;
      drawBand(context, {
        y: row.top + inset,
        height: row.height - inset * 2,
        width,
        frameCount: total,
        colorAt,
        style,
      });
      continue;
    }

    const frames = keys[row.key] || [];
    // The plate already draws a centre rail; a second one over it would be a
    // slightly darker line at a slightly different length.
    if (frames.length > 1 && !style.rowChrome) {
      context.strokeStyle = "#2c2c38";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(frameX(frames[0], width, total, style), centre);
      context.lineTo(frameX(frames[frames.length - 1], width, total, style), centre);
      context.stroke();
    }
    context.fillStyle = CHANNEL_COLORS[row.key] || "#8b7bd8";
    const size = style.rowChrome ? 5.5 : 3.5;
    for (const keyFrame of frames) {
      // Clamped so the first and last diamonds stay whole instead of being
      // sliced by the canvas edge; the DOM dope sheet gets that from
      // overflow:visible, which a canvas has no equivalent of.
      const x = Math.max(
        style.labelWidth + size,
        Math.min(width - size, frameX(keyFrame, width, total, style)),
      );
      // Diamonds, like the Director's dope sheet: the same shape has to mean
      // the same thing in both panels.
      context.beginPath();
      context.moveTo(x, centre - size);
      context.lineTo(x + size, centre);
      context.lineTo(x, centre + size);
      context.lineTo(x - size, centre);
      context.closePath();
      context.fill();
    }
  }

  // The ruler last, so its ticks sit over the lanes rather than under them.
  if (style.ruler) {
    context.fillStyle = "#3a3a48";
    const ticks = Math.min(12, total);
    for (let index = 0; index <= ticks; index += 1) {
      const tickFrame = Math.round((index / Math.max(1, ticks)) * (total - 1));
      context.fillRect(frameX(tickFrame, width, total, style), height - 6, 1, 5);
    }
  }

  if (style.playhead) {
    const x = frameX(Math.max(0, Math.min(total - 1, Number(frame) || 0)), width, total, style);
    context.fillStyle = "#e6e6f0";
    context.fillRect(Math.round(x), 0, 1, height);
  }

  return { ...geometry, keys };
}

function rankQuality(state) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[state] ?? 0;
}

function rankGrade(grade) {
  return { ok: 0, warn: 1, over: 2 }[grade] ?? 0;
}

/** The one-line summary under the strip; deliberately says when it knows nothing. */
export function healthSummary(health) {
  if (!health) return "No solved track yet";
  const flagged = (health.frame_grades || []).filter((grade) => grade !== "ok").length;
  if (!flagged) return `Motion within limits · ${health.duration_frames} frames`;
  return `${flagged} of ${health.duration_frames} frames over the motion limits`;
}
