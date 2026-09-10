// Bind the Extractor panel to ComfyUI's public execution lifecycle events.
//
// OmniCam queues a partial prompt (queue/execution.js) and then follows it
// purely through native events -- there is no OmniCam job socket in this path.
//
// Two rules, same as the retired subscription had:
//   * correlate by prompt id. A graph can hold two Extractors and the user can
//     also press the global Queue; an event for another prompt must not move
//     this panel.
//   * reject late events. Once this panel's prompt reaches a terminal state its
//     id is cleared, so a straggler frame for it is dropped rather than
//     resurrecting a finished solve.

import { reconcileDisplayState } from "./job-state.js";

const NATIVE_EVENTS = [
  "execution_start",
  "executing",
  "progress",
  "execution_error",
  "execution_interrupted",
  "execution_success",
];

/**
 * @param {object} ui - the ExtractorUI instance (reads node/extractMode,
 *   writes queuePromptId/awaitingQueueStart, calls dispatch()).
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
  const clear = () => {
    ui.queuePromptId = "";
    ui.awaitingQueueStart = false;
  };

  on("execution_start", (p) => {
    // We just queued and have no id yet: adopt the first execution_start while
    // still waiting for it. Anything else (a global Queue run, a superseded
    // prompt) is ignored.
    if (ui.awaitingQueueStart && !ui.queuePromptId && p.prompt_id != null) {
      ui.queuePromptId = String(p.prompt_id);
      ui.awaitingQueueStart = false;
      set("PREPARING");
    }
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
    // The solved track arrives separately through executed() ->
    // parseExtractorMessage() -> acceptSolvedResult(..., "queued"), which sets
    // COMPLETED. This only closes the lifecycle if that has not landed yet.
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
