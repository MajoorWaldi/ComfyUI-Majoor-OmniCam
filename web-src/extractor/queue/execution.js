// Queue an OmniCam Extractor solve as a partial ComfyUI execution.
//
// This module holds no scheduling policy: it does not decide when the GPU is
// free, it does not poll, it does not retry. It asks ComfyUI to run a partial
// prompt whose only target is the Extractor node, and ComfyUI owns everything
// after that -- admission, dependency closure, ordering, cancellation,
// progress and the final NodeOutput.
//
// The prompt id is captured deterministically from the /prompt POST response
// (app.queuePrompt reduces that to a boolean and the public promptQueued event
// does not carry it), so every event, the STOP call and the result are
// filtered on THIS run -- never "the first execution_start after TRACK", which
// misidentifies a solve when another prompt was already queued.
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
 * For a root-graph node this is just the string node id. A node inside a
 * subgraph instance needs a colon-separated execution path; that is not
 * supported yet, so this returns null there rather than target the wrong node.
 *
 * @param {object} node - a LiteGraph node.
 * @returns {string | null}
 */
export function resolveExecutionId(node) {
  const id = node?.id;
  if (id === undefined || id === null || id === "") return null;
  if (isInsideSubgraph(node)) return null;
  return String(id);
}

/** Whether this node lives inside a subgraph instance rather than the root graph. */
export function isInsideSubgraph(node) {
  if (node == null) return false;
  // A colon in the id is the execution-path form ComfyUI uses for nested nodes.
  if (String(node.id ?? "").includes(":")) return true;
  const graph = node.graph;
  if (!graph) return false;
  // LiteGraph/ComfyUI subgraph graphs expose one of these.
  if (graph.isRootGraph === false) return true;
  if (graph._is_subgraph || graph.is_subgraph || graph._subgraph_node) return true;
  if (graph.rootGraph && graph.rootGraph !== graph) return true;
  return false;
}

/**
 * Enqueue a partial ComfyUI execution ending at this Extractor and record the
 * prompt id it was accepted under.
 *
 * @param {object} ui - the ExtractorUI instance.
 * @param {"camera_track" | "scene_reconstruct"} [mode]
 * @returns {Promise<{ accepted: boolean, reason?: string, promptId?: string }>}
 */
export async function queueExtractor(ui, mode = "camera_track") {
  const source = ui.refreshSource();
  if (!source?.available) return { accepted: false, reason: "no-source" };

  if (isInsideSubgraph(ui.node)) {
    return { accepted: false, reason: "subgraph-not-supported" };
  }
  const executionId = resolveExecutionId(ui.node);
  if (!executionId) return { accepted: false, reason: "no-execution-id" };

  ui.setExtractMode(mode);
  ui.syncPanelToNodeWidgets?.();
  ui.prepareForQueuedRun?.();

  const { accepted, promptId } = await queueAndCapturePromptId(
    ui.app,
    ui.api,
    [executionId],
    { intent: { trigger_source: TRIGGER_SOURCE[mode] || "omnicam_track" } },
  );
  ui.queuePromptId = accepted ? String(promptId || "") : "";
  return { accepted, promptId: ui.queuePromptId };
}

/**
 * Call queuePartialPrompt and pull the prompt id out of the /prompt POST it
 * makes. api.fetchApi is wrapped only for the duration of that one call, and
 * only a /prompt POST whose partial_execution_targets exactly match ours is
 * read -- a concurrent full Queue Prompt is never mistaken for this run.
 *
 * @returns {Promise<{ accepted: boolean, promptId: string }>}
 */
export async function queueAndCapturePromptId(app, api, executionIds, options) {
  const wanted = executionIds.map(String).sort();
  const original = api.fetchApi;
  let promptId = "";

  api.fetchApi = async (url, opts = {}) => {
    const response = await original.call(api, url, opts);
    try {
      const path = String(url).split("?")[0];
      const isPromptPost =
        String(opts.method || "GET").toUpperCase() === "POST" &&
        (path === "/prompt" || path.endsWith("/prompt"));
      if (isPromptPost && response.ok && !promptId) {
        let body = {};
        try { body = JSON.parse(opts.body || "{}"); } catch { body = {}; }
        const targets = Array.isArray(body.partial_execution_targets)
          ? body.partial_execution_targets.map(String).sort()
          : null;
        const isOurs = targets && targets.length === wanted.length
          && targets.every((id, i) => id === wanted[i]);
        if (isOurs) {
          const json = await response.clone().json().catch(() => ({}));
          if (typeof json?.prompt_id === "string") promptId = json.prompt_id;
        }
      }
    } catch {
      // leave promptId empty; the run still executes, it is just uncorrelated
    }
    return response;
  };

  try {
    const accepted = await queuePartialPrompt(app, executionIds, options);
    return { accepted: Boolean(accepted), promptId };
  } finally {
    api.fetchApi = original;
  }
}

export { queuePartialPrompt };

/**
 * Cancel a queued Extractor solve through ComfyUI's Jobs API.
 *
 * A pending job is dequeued; a running job is interrupted. The endpoint is
 * idempotent -- cancelling a job that already finished returns cleanly.
 *
 * @param {{ fetchApi: Function }} api - the ComfyUI api singleton.
 * @param {string} jobId - the queued prompt / job id.
 * @returns {Promise<boolean>} whether the server reports it cancelled.
 */
export async function cancelExtractorJob(api, jobId) {
  if (!jobId) return false;
  const response = await api.fetchApi(
    `/api/jobs/${encodeURIComponent(jobId)}/cancel`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new Error(`Comfy job cancellation failed (${response.status})`);
  }
  const payload = await response.json().catch(() => ({}));
  return Boolean(payload?.cancelled);
}
