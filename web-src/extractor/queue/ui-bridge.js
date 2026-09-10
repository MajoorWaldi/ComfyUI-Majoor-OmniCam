// The queued-run surface of ExtractorUI, kept in one module so index.js stays
// under the source-line ceiling and the whole "run through ComfyUI" story is
// in one place. Every function takes the ExtractorUI instance as `ui`.

import { cancelExtractorJob, queueExtractor } from "./execution.js";
import { syncExtractorPanelToWidgets } from "./widget-sync.js";

/**
 * Enqueue a partial ComfyUI execution ending at this Extractor.
 *
 * There is no interactive solve job any more: ComfyUI owns admission,
 * ordering, cancellation, progress and the final output, and the solved
 * result returns through executed() -> parseExtractorMessage() ->
 * acceptSolvedResult(..., "queued").
 */
const QUEUE_REFUSAL = {
  "subgraph-not-supported":
    "OmniCam TRACK does not support an Extractor inside a subgraph yet. Move "
    + "it to the root graph, or run the whole workflow with Queue Prompt.",
  "no-execution-id": "This Extractor has no resolvable node id and cannot be queued.",
};

export async function startQueuedSolve(ui, mode = "camera_track") {
  try {
    const result = await queueExtractor(ui, mode);
    const message = QUEUE_REFUSAL[result?.reason];
    if (message) ui.dispatch({ type: "FAILED", error: message });
  } catch (error) {
    ui.dispatch({ type: "FAILED", error: String(error?.message || error) });
  }
}

/**
 * Make the real Extractor node widgets the single settings source a queued
 * run reads. The panel owns only the extract mode and the camera-track
 * cleanup-desk controls; method, lens_mode, fov_degrees, focal_length_mm,
 * sensor_width_mm, max_dimension and frame_step have no panel control and are
 * left exactly as set on the node. Reconstruct mode delegates recon_* to the
 * reconstruction panel's own DOM bridge.
 */
export function syncPanelToNodeWidgets(ui) {
  syncExtractorPanelToWidgets({
    node: ui.node,
    root: ui.root,
    mode: ui.extractMode,
    refineSettings: ui.refine.settings,
  });
}

/** Reset transient solve UI for a fresh queued run. queueExtractor() then
 *  records the prompt id this run is accepted under. */
export function prepareForQueuedRun(ui) {
  ui.sourceViewer.setFollow(true);
  ui.overlay.clear();
  ui.diagnostics.clear();
  ui.queuePromptId = "";
  ui.dispatch({ type: "JOB_STARTED", status: { job_id: "", state: "QUEUED" } });
  ui.coordinator.seek(0, "backend");
}

/**
 * STOP: cancel the actual ComfyUI job for this panel's queued run.
 *
 * Idempotent: with no live prompt (never queued, or already terminal) it is a
 * silent no-op, so a double-press on a finished solve neither throws nor
 * resurrects state. The move to CANCELLED comes from the execution_interrupted
 * event, not from here.
 */
export async function cancelQueuedRun(ui) {
  const jobId = String(ui.queuePromptId || "");
  if (!jobId) return;
  ui.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
  try {
    await cancelExtractorJob(ui.api, jobId);
  } catch (error) {
    ui.dispatch({
      type: "QUEUE_LIFECYCLE",
      state: "FAILED",
      error: String(error?.message || error),
    });
  }
}
