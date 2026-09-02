// Extractor panel state, derived from the server's job state.
//
// The server owns the truth; this file only decides what the panel shows and
// which buttons are live. Keeping that as a pure reducer means the button rules
// -- which are genuinely fiddly, because STOPPING is not STOPPED and STOPPED
// is not COMPLETED -- are testable without a browser.

export const SOLVE_STATES = [
  "IDLE", "PREPARING", "TRACKING", "SOLVING", "REFINING",
  "STOPPING", "STOPPED", "COMPLETED", "FAILED",
];

const ACTIVE = new Set(["PREPARING", "TRACKING", "SOLVING", "REFINING", "STOPPING"]);

// Absent/non-numeric fields fall back to what is already known, not to zero:
// coercing them reset a completed solve's progress bar to 0% the instant its
// result arrived.
const keep = (value, fallback) => (
  value === undefined || value === null || Number.isNaN(Number(value))
    ? fallback
    : Number(value)
);

// Status-pill colour families, matching the shared Director tokens.
const TONES = {
  IDLE: "neutral", PREPARING: "info", TRACKING: "active", SOLVING: "active", REFINING: "active",
  STOPPING: "warn", STOPPED: "neutral",
  COMPLETED: "ok", FAILED: "danger",
};

export function createExtractorState() {
  return {
    solveState: "IDLE",
    jobId: "",
    progress: 0,
    stageProgress: 0,
    frame: 0,
    frameCount: 0,
    backend: "",
    poseCount: 0,
    error: "",
    warnings: [],
    anomalies: [],
    quality: [],
    source: { available: false, reason: "", label: "", ref: null, info: null },
    viewerMode: "source",
    trackMode: "refined",
    applied: { fingerprint: "", outdated: false },
    refinedFingerprint: "",
  };
}

export function reduceExtractorState(state, action) {
  switch (action.type) {
    case "SOURCE":
      return { ...state, source: { ...state.source, ...action.source } };
    case "SOURCE_RESET":
      return {
        ...state,
        solveState: "IDLE", jobId: "", progress: 0, stageProgress: 0,
        backend: "", poseCount: 0, error: "",
        warnings: [], anomalies: [], quality: [], refinedFingerprint: "",
        source: { ...state.source, ...action.source, info: null },
      };
    case "QUEUED_RESULT":
      // A queued execution has no interactive job to refine. Keeping the
      // previous id here could send a cleanup request to unrelated footage.
      return { ...state, jobId: "", solveState: "COMPLETED" };
    case "JOB_STARTED":
      return {
        ...state, jobId: action.status.job_id, solveState: action.status.state,
        progress: 0, stageProgress: 0,
        error: "", warnings: [], anomalies: [], quality: [], poseCount: 0,
        refinedFingerprint: "",
      };
    case "JOB_STATE":
      return { ...state, solveState: action.state, error: action.state === "FAILED" ? state.error : "" };
    case "PROGRESS":
      return {
        ...state,
        solveState: action.progress.state || state.solveState,
        progress: Number(action.progress.progress) || 0,
        stageProgress: Number(action.progress.stage_progress) || 0,
        backend: action.progress.backend || state.backend,
      };
    case "QUALITY":
      return { ...state, quality: [...state.quality, ...(action.samples || [])] };
    case "POSE":
      return { ...state, poseCount: state.poseCount + 1 };
    case "FRAME":
      return { ...state, frame: Math.max(0, Math.round(Number(action.frame) || 0)) };
    case "FRAME_COUNT":
      return { ...state, frameCount: Math.max(0, Math.round(Number(action.frameCount) || 0)) };
    case "STATUS": {
      // A status may be partial -- the panel dispatches one carrying just the
      // anomalies after a solve finishes. Absent fields must fall back to what
      // is already known, not to zero: coercing them reset a completed solve's
      // progress bar to 0% the instant its result arrived.
      const status = action.status || {};
      return {
        ...state,
        solveState: status.state || state.solveState,
        jobId: status.job_id || state.jobId,
        progress: keep(status.progress, state.progress),
        backend: status.backend || state.backend,
        poseCount: keep(status.pose_count, state.poseCount),
        warnings: Array.isArray(status.warnings) ? status.warnings : state.warnings,
        anomalies: Array.isArray(status.anomalies) ? status.anomalies : state.anomalies,
        error: status.error === undefined ? state.error : String(status.error || ""),
      };
    }
    case "COMPLETED":
      return {
        ...state, solveState: "COMPLETED", progress: 1,
        refinedFingerprint: String(action.result?.fingerprint || ""),
        backend: action.result?.backend || state.backend,
        // The live counter increments once per POSE event, and those are
        // throttled to at most one per THROTTLE_SECONDS -- every backend
        // hands its poses over in one tight loop once the solve itself is
        // done, so a fast solve (or a lot of frames) throttles most of them
        // away. completion_payload's own pose_count is the server's real
        // count of what it kept, not of what the socket let through.
        poseCount: keep(action.result?.pose_count, state.poseCount),
      };
    case "FAILED":
      return { ...state, solveState: "FAILED", error: String(action.error || "The solve failed") };
    case "REFINED":
      return {
        ...state,
        refinedFingerprint: String(action.fingerprint || ""),
        // Changing the cleanup after applying does not push anything to the
        // Director; it marks the applied result stale until Apply is pressed.
        applied: state.applied.fingerprint
          ? { ...state.applied, outdated: state.applied.fingerprint !== action.fingerprint }
          : state.applied,
      };
    case "APPLIED":
      return { ...state, applied: { fingerprint: String(action.fingerprint || ""), outdated: false } };
    case "VIEWER_MODE":
      return { ...state, viewerMode: action.mode };
    case "TRACK_MODE":
      return { ...state, trackMode: action.mode };
    default:
      return state;
  }
}

/** Which controls are live, given the solve state and what the source offers. */
export function controlAvailability(state) {
  const solve = state.solveState;
  const busy = ACTIVE.has(solve);
  const completed = solve === "COMPLETED";
  return {
    track: !busy && state.source.available,
    stop: busy,
    // A partial solve is reviewable, never shippable.
    apply: completed && Boolean(state.refinedFingerprint),
    refine: completed,
    retry: solve === "STOPPED" || solve === "FAILED",
  };
}

export function statusTone(solveState) {
  return TONES[solveState] || "neutral";
}

/** The header pill text: state plus the one number that matters right now. */
export function statusLabel(state) {
  const percent = Math.round(Math.max(0, Math.min(1, state.progress)) * 100);
  switch (state.solveState) {
    case "TRACKING":
    case "SOLVING":
      return `${state.solveState} ${percent}%`;
    case "STOPPING":
      return "STOPPING…";
    default:
      return state.solveState;
  }
}

/** The progress block under the viewer. No ETA: V1 cannot honestly predict one. */
export function progressLabel(state) {
  if (!state.frameCount) return state.solveState === "IDLE" ? "Ready to track" : state.solveState;
  return `${state.frame} / ${state.frameCount} frames`;
}

export function appliedLabel(state) {
  if (!state.applied.fingerprint) return "NOT APPLIED";
  return state.applied.outdated ? "OUTDATED" : "APPLIED";
}
