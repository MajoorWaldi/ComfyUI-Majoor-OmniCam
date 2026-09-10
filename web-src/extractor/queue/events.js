// Bind the Extractor panel to ComfyUI's public execution lifecycle events.
//
// OmniCam queues a partial prompt (queue/execution.js), which captures the
// prompt id from the /prompt response, and then follows it purely through
// native events -- there is no OmniCam job socket in this path.
//
// Two rules:
//   * correlate by prompt id. `ui.queuePromptId` is the id this panel's TRACK /
//     Reconstruct started under; every lifecycle event is filtered on it. There
//     is no "first execution_start wins" guess -- that misidentifies the run
//     when another prompt is already queued.
//   * reject late events. Once the run reaches a terminal state its id is
//     cleared, so a straggler frame is dropped rather than resurrecting a
//     finished solve.
//
// A result from a plain global Queue Prompt (no OmniCam-initiated run in
// flight) is still adopted: the user ran the graph and the Extractor produced
// a track.

import { reconcileDisplayState } from "./job-state.js";

const NATIVE_EVENTS = [
  "execution_start",
  "executing",
  "progress",
  "executed",
  "execution_error",
  "execution_interrupted",
  "execution_success",
];

/**
 * @param {object} ui - the ExtractorUI instance (reads node/extractMode/
 *   queuePromptId, calls dispatch() and executed()).
 * @param {object} api - the ComfyUI api singleton.
 * @returns {() => void} an unbind function.
 */
export function bindExtractorQueueEvents(ui, api) {
  const listeners = [];
  const on = (event, handler) => {
    const wrapped = (message) => handler(message?.detail ?? message ?? {});
    api?.addEventListener?.(event, wrapped);
    listeners.push([event, wrapped]);
  };

  const nodeId = () => String(ui.node?.id ?? "");
  const mine = (promptId) => {
    const current = String(ui.queuePromptId || "");
    return current !== "" && String(promptId ?? "") === current;
  };
  const set = (state, extra = {}) =>
    ui.dispatch({ type: "QUEUE_LIFECYCLE", state, ...extra });
  const clear = () => { ui.queuePromptId = ""; };

  on("execution_start", (p) => {
    if (mine(p.prompt_id)) set("PREPARING");
  });

  on("executing", (p) => {
    if (!mine(p.prompt_id)) return;
    const node = p.node ?? p.display_node ?? null;
    if (node == null) return; // run finished; execution_success closes it
    if (String(node) !== nodeId()) return; // an upstream dependency is running
    set(ui.extractMode === "scene_reconstruct" ? "RECONSTRUCTING" : "TRACKING");
  });

  on("progress", (p) => {
    if (!mine(p.prompt_id)) return;
    if (p.node != null && String(p.node) !== nodeId()) return;
    const max = Number(p.max) || 0;
    if (max > 0) set(null, { progress: (Number(p.value) || 0) / max });
  });

  on("executed", (p) => {
    // The solved track. Accept it for this node when it is our run, or when
    // there is no OmniCam-initiated run in flight (a global Queue Prompt).
    if (String(p.node ?? p.display_node ?? "") !== nodeId()) return;
    if (!mine(p.prompt_id) && ui.queuePromptId) return;
    clear();
    ui.executed(p.output ?? p);
  });

  on("execution_error", (p) => {
    if (!mine(p.prompt_id)) return;
    set("FAILED", {
      error: String(p.exception_message || p.error || "The queued solve failed"),
    });
    clear();
  });

  on("execution_interrupted", (p) => {
    if (!mine(p.prompt_id)) return;
    set("CANCELLED");
    clear();
  });

  on("execution_success", (p) => {
    if (!mine(p.prompt_id)) return;
    // The track arrives through the `executed` event above (which sets
    // COMPLETED). This only closes the lifecycle if that has not landed yet.
    set("FINALIZING");
    clear();
  });

  return () => {
    for (const [event, wrapped] of listeners.splice(0)) {
      api?.removeEventListener?.(event, wrapped);
    }
  };
}

export { NATIVE_EVENTS, reconcileDisplayState };
