// Queue an OmniCam Extractor solve as a partial ComfyUI execution.
//
// This module holds no scheduling policy: it does not decide when the GPU is
// free, it does not poll, it does not retry. It asks ComfyUI to run a partial
// prompt whose only target is the Extractor node, and ComfyUI owns everything
// after that -- admission, dependency closure, ordering, cancellation,
// progress and the final NodeOutput. The result comes back through the
// existing `ExtractorUI.executed()` / `parseExtractorMessage()` bridge.
//
// There is deliberately no import of `SolveJobClient` or any `/extractor/jobs`
// route here. TRACK must never reach the old out-of-queue scheduler.

import { queuePartialPrompt } from "./compat.js";

/** Telemetry attribution only -- ComfyUI never executes differently for it. */
const TRIGGER_SOURCE = {
  camera_track: "omnicam_track",
  scene_reconstruct: "omnicam_reconstruct",
};

/**
 * The partial-execution target ID for an Extractor node.
 *
 * For a root-graph node this is just the string node id. Nodes living inside a
 * subgraph instance need a colon-separated execution path; that case is handled
 * where subgraph support is added and is intentionally not guessed here.
 *
 * @param {{ id?: string | number }} node
 * @returns {string | null}
 */
export function resolveExecutionId(node) {
  const id = node?.id;
  if (id === undefined || id === null || id === "") return null;
  return String(id);
}

/**
 * Enqueue a partial ComfyUI execution ending at this Extractor.
 *
 * @param {object} ui - the ExtractorUI instance.
 * @param {"camera_track" | "scene_reconstruct"} [mode]
 * @returns {Promise<{ accepted: boolean, reason?: string }>}
 */
export async function queueExtractor(ui, mode = "camera_track") {
  const source = ui.refreshSource();
  if (!source?.available) return { accepted: false, reason: "no-source" };

  ui.setExtractMode(mode);
  ui.syncPanelToNodeWidgets?.();
  ui.prepareForQueuedRun?.();

  const executionId = resolveExecutionId(ui.node);
  if (!executionId) return { accepted: false, reason: "no-execution-id" };

  const accepted = await queuePartialPrompt(ui.app, [executionId], {
    intent: { trigger_source: TRIGGER_SOURCE[mode] || "omnicam_track" },
  });
  return { accepted: Boolean(accepted) };
}
