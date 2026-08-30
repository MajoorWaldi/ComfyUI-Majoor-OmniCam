// WebSocket subscription for one Extractor node.
//
// Two rules:
//
// * **filter by job and node.** Two Extractors in one graph share the socket,
//   and a pose event for the other one must not move this panel's camera.
// * **unsubscribe on disposal.** These listeners close over the panel; leaving
//   them attached leaks the whole UI, its Three.js scene included, every time a
//   node is deleted.

export const SOLVE_EVENTS = {
  job: "majoor.omnicam.extractor.job",
  progress: "majoor.omnicam.extractor.progress",
  pose: "majoor.omnicam.extractor.pose",
  quality: "majoor.omnicam.extractor.quality",
  features: "majoor.omnicam.extractor.features",
  completed: "majoor.omnicam.extractor.completed",
  failed: "majoor.omnicam.extractor.failed",
};

export class SolveEventSubscription {
  /**
   * @param api ComfyUI api object
   * @param handlers one callback per SOLVE_EVENTS key
   * @param match ({job_id, node_id}) => boolean, deciding what belongs here
   */
  constructor(api, handlers = {}, match = () => true) {
    this.api = api;
    this.match = match;
    this.bound = [];
    for (const [key, event] of Object.entries(SOLVE_EVENTS)) {
      const handler = handlers[key];
      if (typeof handler !== "function") continue;
      const listener = (message) => {
        const payload = message?.detail ?? message;
        if (!payload || !this.match(payload)) return;
        handler(payload);
      };
      api.addEventListener?.(event, listener);
      this.bound.push([event, listener]);
    }
  }

  dispose() {
    for (const [event, listener] of this.bound.splice(0)) {
      this.api?.removeEventListener?.(event, listener);
    }
  }
}

/** Accept events for this node, and for this job once one is running. */
export function solveEventMatcher(getState) {
  return (payload) => {
    const state = getState() || {};
    if (state.jobId && payload.job_id && payload.job_id !== state.jobId) return false;
    if (payload.node_id != null && String(payload.node_id) !== String(state.nodeId)) return false;
    return true;
  };
}
