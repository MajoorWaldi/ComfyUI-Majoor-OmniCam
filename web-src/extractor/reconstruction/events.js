// WebSocket subscription and event filtering for reconstruction jobs.
//
// Matches server events from omnicam.reconstruction.* and filters by job_id + node_id.
// Always unsubscribes on disposal.

export const RECONSTRUCTION_EVENTS = {
  state: "omnicam.reconstruction.state",
  progress: "omnicam.reconstruction.progress",
  preview: "omnicam.reconstruction.preview",
  done: "omnicam.reconstruction.done",
  error: "omnicam.reconstruction.error",
};

export function matchesReconstructionEvent(
  payload,
  { jobId = "", nodeId = "" } = {}
) {
  if (!payload) return false;
  if (jobId && payload.job_id && String(payload.job_id) !== String(jobId)) {
    return false;
  }
  if (nodeId != null && nodeId !== "" && payload.node_id != null) {
    if (String(payload.node_id) !== String(nodeId)) {
      return false;
    }
  }
  return true;
}

export class ReconstructionEventSubscription {
  /**
   * @param api ComfyUI api object
   * @param handlers Map of event key ('state'|'progress'|'preview'|'done'|'error') to callback
   * @param match Function (payload) => boolean determining whether event belongs here
   */
  constructor(api, handlers = {}, match = () => true) {
    this.api = api;
    this.match = match;
    this.bound = [];

    for (const [key, eventName] of Object.entries(RECONSTRUCTION_EVENTS)) {
      const handler = handlers[key];
      if (typeof handler !== "function") continue;

      const listener = (event) => {
        const payload = event?.detail ?? event;
        if (!payload || !this.match(payload)) return;
        handler(payload);
      };

      this.api?.addEventListener?.(eventName, listener);
      this.bound.push([eventName, listener]);
    }
  }

  dispose() {
    for (const [eventName, listener] of this.bound.splice(0)) {
      this.api?.removeEventListener?.(eventName, listener);
    }
  }
}

