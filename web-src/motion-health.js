// Camera Health metrics: the JS mirror of omnicam/core/motion_health.py.
//
// The panel grades on every edit and every scrub, so a round trip to Python per
// keystroke is out of the question -- the maths runs here. That makes this file
// a second implementation of a formula Python also owns, which is exactly the
// kind of duplication that silently drifts, so tests/frontend/motion-health.node.mjs
// checks it against a committed Python golden. Change one side, regenerate the
// fixture, and the test tells you whether the other side still agrees.
//
// The limit *numbers* are never duplicated: they are fetched from
// /majoor/omnicam/motion_profiles, which serves the adapter tables.

import { cameraBasis, project, sampleCamera } from "./director/core.js";

export const FRAME_METRICS = ["speed", "angular_speed", "acceleration", "jerk"];
export const GRADES = ["ok", "warn", "over"];
export const WARN_RATIO = 0.8;
export const DEFAULT_SUBJECT = [0, 1.5, 0];

function derivative(values, fps) {
  const out = [0];
  for (let index = 1; index < values.length; index++) out.push(Math.abs(values[index] - values[index - 1]) * fps);
  return out;
}

export function translationSpeedProfile(cameras, fps) {
  const speeds = [0];
  for (let index = 1; index < cameras.length; index++) {
    const a = cameras[index - 1].position, b = cameras[index].position;
    speeds.push(Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2) * fps);
  }
  return speeds;
}

export function angularSpeedProfile(cameras, fps) {
  const speeds = [0];
  for (let index = 1; index < cameras.length; index++) {
    const a = cameraBasis(cameras[index - 1]), b = cameraBasis(cameras[index]);
    const relativeTrace = ["right", "up", "forward"].reduce(
      (total, axis) => total + a[axis][0] * b[axis][0] + a[axis][1] * b[axis][1] + a[axis][2] * b[axis][2],
      0,
    );
    const cosine = Math.max(-1, Math.min(1, (relativeTrace - 1) * 0.5));
    speeds.push((Math.acos(cosine) * 180 / Math.PI) * fps);
  }
  return speeds;
}

/** The point whose framing is checked: explicit, the "subject" object, or the default. */
export function resolveSubject(state, subject = null) {
  if (subject) return subject.map(Number);
  const found = (state.objects || []).find((object) => object?.id === "subject");
  if (Array.isArray(found?.position)) return found.position.slice(0, 3).map(Number);
  return [...DEFAULT_SUBJECT];
}

export function framingProfile(cameras, subject, width, height) {
  return cameras.map((camera) => {
    const point = project(subject, camera, width, height);
    return Boolean(point && point[0] >= 0 && point[0] < width && point[1] >= 0 && point[1] < height);
  });
}

function grade(value, recommended) {
  if (recommended === undefined || recommended === null || recommended <= 0) return "ok";
  if (value > recommended) return "over";
  return value > recommended * WARN_RATIO ? "warn" : "ok";
}

function worst(grades) {
  for (let index = GRADES.length - 1; index >= 0; index--) if (grades.includes(GRADES[index])) return GRADES[index];
  return "ok";
}

function sameMetrics(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function toSegments(frameGrades, frameReasons) {
  const segments = [];
  for (let frame = 0; frame < frameGrades.length; frame++) {
    const metrics = [...frameReasons[frame]].sort();
    const last = segments[segments.length - 1];
    if (last && last.grade === frameGrades[frame] && sameMetrics(last.metrics, metrics)) {
      last.end = frame;
      continue;
    }
    segments.push({ start: frame, end: frame, grade: frameGrades[frame], metrics });
  }
  return segments;
}

/**
 * Grade an editor state frame by frame against a profile's recommended limits.
 *
 * `fov_drift` is graded for the track only, never per frame: its limit is a
 * total excursion in degrees, so no single frame can honestly be blamed for it.
 *
 * @returns a report shaped exactly like motion_health_report() in Python.
 */
export function motionHealthReport(state, limits = {}, subject = null, profile = "generic") {
  const fps = Math.max(1, Number(state.fps) || 24);
  const frames = Math.max(1, Number(state.duration_frames) || 1);
  const width = Math.max(1, Number(state.width) || 1280);
  const height = Math.max(1, Number(state.height) || 720);
  const cameras = [];
  for (let frame = 0; frame < frames; frame++) cameras.push(sampleCamera(state, frame, state.objects));

  const speed = translationSpeedProfile(cameras, fps);
  const angular_speed = angularSpeedProfile(cameras, fps);
  const acceleration = derivative(speed, fps);
  const jerk = derivative(acceleration, fps);
  const series = { speed, angular_speed, acceleration, jerk };

  const resolvedSubject = resolveSubject(state, subject);
  const framing = framingProfile(cameras, resolvedSubject, width, height);
  const fovs = cameras.map((camera) => camera.fov);
  const allowFramingLoss = limits.allow_framing_loss === true;

  const frameGrades = [];
  const frameReasons = [];
  for (let frame = 0; frame < frames; frame++) {
    const grades = [], reasons = [];
    for (const metric of FRAME_METRICS) {
      const result = grade(series[metric][frame], limits[`max_${metric}`]);
      grades.push(result);
      if (result !== "ok") reasons.push(metric);
    }
    if (!framing[frame] && !allowFramingLoss) {
      grades.push("over");
      reasons.push("framing_loss");
    }
    frameGrades.push(worst(grades));
    frameReasons.push(reasons);
  }

  const framingLoss = framing.filter((visible) => !visible).length;
  const report = {
    profile,
    warn_ratio: WARN_RATIO,
    limits,
    subject: resolvedSubject,
    duration_frames: frames,
    fps,
    max_speed: Math.max(...speed),
    max_angular_speed: Math.max(...angular_speed),
    max_acceleration: Math.max(...acceleration),
    max_jerk: Math.max(...jerk),
    max_fov_change: Math.max(...fovs) - Math.min(...fovs),
    framing_loss_frames: framingLoss,
    series,
    framing,
    frame_grades: frameGrades,
    segments: toSegments(frameGrades, frameReasons),
    violations: [],
  };

  for (const metric of [...FRAME_METRICS, "fov_drift"]) {
    const key = metric === "fov_drift" ? "max_fov_change" : `max_${metric}`;
    const recommended = limits[key];
    if (recommended !== undefined && recommended !== null && report[key] > Number(recommended)) {
      report.violations.push({ metric: key, value: report[key], recommended_max: Number(recommended) });
    }
  }
  if (framingLoss && !allowFramingLoss) {
    report.violations.push({ metric: "framing_loss_frames", value: framingLoss, recommended_max: 0 });
  }

  const fovGrade = grade(report.max_fov_change, limits.max_fov_change);
  report.track_grades = { fov_drift: fovGrade };
  report.grade = worst([...frameGrades, fovGrade]);
  // Named for what it actually claims: the trajectory respects the envelope.
  // It is not a promise about the video a model will produce from it.
  report.trajectory_valid = report.violations.length === 0;
  report.ok = report.trajectory_valid;
  return report;
}

/** Contiguous ranges worth acting on, worst first, for the panel's fix buttons. */
export function problemZones(report) {
  return report.segments
    .filter((segment) => segment.grade !== "ok")
    .sort((a, b) => (b.grade === "over") - (a.grade === "over") || (b.end - b.start) - (a.end - a.start));
}
