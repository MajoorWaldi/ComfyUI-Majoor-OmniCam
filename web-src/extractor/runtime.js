// Persistent, headless owner of Extractor solve/cache state -- lives for the
// full node lifetime, independent of whether an ExtractorWorkbench is open.
// See docs/superpowers/plans/2026-09-16-director-extractor-workbench.md
// section 17 (ExtractorRuntime) and section 18 (queue ownership) for the
// target contract.
//
// The critical property this exists for: a queued TRACK/Reconstruct survives
// the workbench closing (only node removal cancels it), and the compact shell
// can show live progress the whole time because the queue event bindings and
// the state reducer live here, not on the transient DOM panel.

import {
  cacheExtractorResult,
  cacheExtractorSource,
  ensureCacheWidgets,
  motionSceneFromTrack,
  parseExtractorMessage,
  readCachedResult,
  restoreLateWidgetValues,
  statusLine,
} from "./result-cache.js";
import { createExtractorState, reduceExtractorState } from "./state.js";
import { bindExtractorQueueEvents } from "./queue/events.js";
import { cancelExtractorJob } from "./queue/execution.js";
import { resolveInteractiveExtractorSource } from "./source-resolver.js";
import { ensureSourceWidget } from "./lifecycle.js";

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

export class ExtractorRuntime extends EventTarget {
  constructor(node, { api, app } = {}) {
    super();
    this.node = node;
    this.api = api;
    this.app = app;
    this.disposed = false;
    this.workbench = null;
    this.shell = null;

    ensureCacheWidgets(node);
    ensureSourceWidget(node);
    // Before state restores below: the widgets are only now able to hold
    // what a saved workflow put there (see restoreLateWidgetValues's own
    // doc comment for why this has to happen this late).
    restoreLateWidgetValues(node);

    this.extractMode = String(widget(node, "extract_mode")?.value || "camera_track");
    this.state = createExtractorState();
    this.result = { raw: null, refined: null };
    this.rawSolve = null;
    this.landmarks = [];
    this.sourceKey = "";
    // Transient solve correlation id (see queue/events.js); never serialized.
    this.queuePromptId = "";
    // Set when the upstream source changes while no workbench is open to run
    // the DOM-aware resync; consumed by the shell/workbench on next open.
    this.pendingSourceResync = false;

    const cached = readCachedResult(node);
    if (cached) {
      this.result = { raw: cached.track, refined: cached.track };
      this.state = reduceExtractorState(this.state, { type: "APPLIED", fingerprint: cached.fingerprint });
      this.state = reduceExtractorState(this.state, { type: "REFINED", fingerprint: cached.fingerprint });
    }

    // Native ComfyUI execution/job lifecycle -- bound once, for the runtime's
    // full life, so progress/results are tracked while the workbench is
    // closed (migration plan Task 13).
    this.unbindQueueEvents = bindExtractorQueueEvents(this, api);
  }

  dispatch(action) {
    this.state = reduceExtractorState(this.state, action);
    if (!this.disposed) {
      this.dispatchEvent(new CustomEvent("statechange", { detail: { action } }));
      this.workbench?.render();
    }
    return this.state;
  }

  getSnapshot() {
    return {
      solveState: this.state.solveState,
      progress: this.state.progress,
      frame: this.state.frame,
      frameCount: this.state.frameCount,
      sourceLabel: this.state.source?.label || "",
      extractMode: this.extractMode,
      anomalyCount: this.state.anomalies?.length || 0,
      error: this.state.error || "",
    };
  }

  setExtractMode(mode) {
    this.extractMode = mode;
    const modeWidget = widget(this.node, "extract_mode");
    if (modeWidget && modeWidget.value !== mode) {
      modeWidget.value = mode;
      this.node.setDirtyCanvas?.(true, true);
    }
  }

  /**
   * Adopt a solved camera-track result headlessly: state + persistent cache.
   * The workbench's own pushTracksToViewer() (3D viewer, coordinator seek) is
   * separate and only runs when it is attached.
   */
  acceptSolvedResult(result) {
    const raw = result?.raw_track || result?.raw || result?.track || null;
    const refined = result?.refined_track || result?.refined || result?.track || raw;
    if (!refined?.keyframes?.length) return false;
    const fingerprint = String(
      result?.fingerprint || refined?.metadata?.extractor_fingerprint || "",
    );
    this.result = { raw: raw || refined, refined };
    this.landmarks = Array.isArray(result?.landmarks_3d) ? result.landmarks_3d : [];
    this.rawSolve = result?.rawSolve || null;
    this.dispatch({ type: "QUEUED_RESULT" });
    this.dispatch({
      type: "STATUS",
      status: {
        anomalies: result?.anomalies || [], state: "COMPLETED",
        backend: refined?.metadata?.backend,
      },
    });
    this.dispatch({ type: "REFINED", fingerprint });
    const confidence = Number(result?.confidence ?? refined?.metadata?.confidence) || 0;
    const motionScene = result?.motionScene || motionSceneFromTrack(refined);
    cacheExtractorResult(this.node, { motionScene, fingerprint });
    if (result?.source) cacheExtractorSource(this.node, result.source);
    this.node.__majoorOmniCamStatus = statusLine({ track: refined, fingerprint, confidence });
    this.dispatch({ type: "APPLIED", fingerprint });
    this.workbench?.pushTracksToViewer?.();
    if (result?.source) {
      if (this.workbench) this.workbench.refreshSource();
      else this.pendingSourceResync = true;
    }
    return true;
  }

  /**
   * Adopt an `onExecuted` envelope. Camera-track results are fully headless
   * (see acceptSolvedResult); a Scene Reconstruct result's visual/job-state
   * bookkeeping currently still lives on ReconstructionPanelController, so it
   * is only processed while the workbench is open -- a closed Extractor
   * running Scene Reconstruct will show the finished result on next open via
   * ComfyUI's own execution history, not live.
   */
  executed(message) {
    const result = parseExtractorMessage(message);
    if (!result) return;
    if (result.mode === "scene_reconstruct") {
      this.workbench?.reconstruction?.acceptQueuedResult(result);
      return;
    }
    this.acceptSolvedResult(result);
  }

  /**
   * STOP: cancel the actual ComfyUI job for this node's queued run.
   * Idempotent, and safe to call whether or not a workbench is attached.
   */
  async cancelQueuedRun() {
    const jobId = String(this.queuePromptId || "");
    if (!jobId) return;
    this.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
    try {
      await cancelExtractorJob(this.api, jobId);
    } catch (error) {
      this.dispatch({ type: "QUEUE_LIFECYCLE", state: "FAILED", error: String(error?.message || error) });
    }
  }

  /**
   * Headless half of source-lifecycle.js's refreshExtractorSource(): decide
   * whether the upstream source identity changed, and if a solve is running
   * against stale footage, cancel it -- regardless of whether a workbench is
   * open to show the change. The DOM-aware half (media element, viewer,
   * frame-count probe) runs only when the workbench is open; otherwise this
   * marks pendingSourceResync so the next open catches up.
   */
  checkSourceChanged() {
    const mode = this.extractMode || "camera_track";
    const resolved = resolveInteractiveExtractorSource(this.node, this.node.graph, mode);
    const sourceKey = resolved.ref ? `${resolved.ref.kind}:${resolved.ref.value}` : "";
    const changed = sourceKey !== (this.sourceKey || "");
    if (changed) {
      this.sourceKey = sourceKey;
      if (this.queuePromptId) void cancelExtractorJob(this.api, this.queuePromptId).catch(() => {});
      this.pendingSourceResync = true;
    }
    return changed;
  }

  attachWorkbench(workbench) {
    this.workbench = workbench;
    this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: true } }));
  }

  detachWorkbench(workbench) {
    if (this.workbench !== workbench) return;
    this.workbench = null;
    this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: false } }));
  }

  /** Node removal only: a queued solve outlives a closed workbench, but not a deleted node. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.queuePromptId) void cancelExtractorJob(this.api, this.queuePromptId).catch(() => {});
    this.unbindQueueEvents?.();
    this.workbench = null;
  }
}
