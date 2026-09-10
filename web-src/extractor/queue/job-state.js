// Map ComfyUI's execution / job lifecycle onto OmniCam's Extractor display
// states.
//
// ComfyUI owns the truth. A terminal Comfy state (completed / error /
// cancelled) always wins over any OmniCam telemetry: rich diagnostics
// (feature points, poses, quality) may refine a *non-terminal* display state
// but can never override "the job is done".

/** OmniCam Extractor presentation states, coarse-to-fine. */
export const QUEUE_DISPLAY_STATES = [
  "IDLE",
  "QUEUED",
  "PREPARING",
  "TRACKING",
  "SOLVING",
  "RECONSTRUCTING",
  "FINALIZING",
  "CANCELLING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

const TERMINAL = new Set(["COMPLETED", "FAILED", "CANCELLED"]);

/** Comfy Jobs API job status -> OmniCam display state, or null if unmapped. */
export function mapComfyJobStatus(status) {
  switch (status) {
    case "waiting_to_dispatch":
    case "pending":
      return "QUEUED";
    case "in_progress":
      return "PREPARING";
    case "completed":
      return "COMPLETED";
    case "error":
      return "FAILED";
    case "cancelled":
      return "CANCELLED";
    default:
      return null;
  }
}

export function isTerminalDisplayState(state) {
  return TERMINAL.has(String(state || ""));
}

/**
 * Reconcile a proposed display state against the current one.
 *
 * Once Comfy has reported a terminal state, nothing moves it -- not a late
 * websocket frame, not a stray telemetry sample. Otherwise the proposal wins.
 *
 * @param {string} current
 * @param {string | null} proposed
 * @returns {string} the state to show.
 */
export function reconcileDisplayState(current, proposed) {
  if (!proposed) return current;
  if (isTerminalDisplayState(current)) return current;
  return proposed;
}
