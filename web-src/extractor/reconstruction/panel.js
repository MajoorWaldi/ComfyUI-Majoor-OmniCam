// Orchestrator for the scene reconstruction panel.

import { loadReconstructionCapabilities } from "./capabilities.js";
import { bindReconstructionControls, readReconstructionSettings } from "./controls.js";
import { ReconstructionEventSubscription, matchesReconstructionEvent } from "./events.js";
import { ReconstructionJobClient, stopActiveReconstructionOnDispose } from "./job-client.js";
import {
  initialReconstructionState,
  reduceReconstructionState,
} from "./state.js";
import { hydratePanelFromWidgets, syncWidgetsFromPanel } from "./settings-sync.js";
import { updateReconstructionModeVisibility } from "./controls.js";
import { renderReconstructionView } from "./views.js";
import { annotatedAssetUrl } from "../../shared/managed-assets.js";
import { confirmAction } from "../../director/ui-services.js";
import { t } from "../../i18n.js";
import { RequestLifetime, isAbortError } from "../../request-lifetime.js";

export class ReconstructionPanelController {
  constructor({
    root,
    node,
    api,
    app = null,
    getSource = () => null,
    onAdopt = () => {},
    listen = (target, event, handler) => target?.addEventListener?.(event, handler),
  }) {
    this.root = root;
    this.node = node;
    this.api = api;
    this.app = app;
    this.getSource = getSource;
    this.onAdopt = onAdopt;
    this.listen = listen;

    this.client = new ReconstructionJobClient(api);
    this.requestLifetime = new RequestLifetime();
    this.runGeneration = 0;
    this.state = initialReconstructionState();
    const initialSource = this.getSource();
    if (initialSource) {
      this.state.source = initialSource;
    }

    this.events = new ReconstructionEventSubscription(
      api,
      {
        // Field names follow omnicam/reconstruction/jobs/events.py: the server
        // sends `state` (not job_state) and has no stage_progress field.
        state: (payload) => this.dispatch({ type: "STATE", jobState: payload.state, jobId: payload.job_id }),
        progress: (payload) => this.dispatch({ type: "PROGRESS", progress: payload.progress, stage: payload.stage }),
        preview: (payload) => this.dispatch({ type: "PREVIEW", previewUrl: payload.preview_url }),
        done: async (payload) => {
          try {
            const generation = this.runGeneration;
            const res = await this.client.getJobResult(payload.job_id, { signal: this.requestLifetime.signal });
            if (this.disposed || generation !== this.runGeneration || payload.job_id !== this.state.jobId) return;
            this.dispatch({
              type: "DONE",
              result: res.result || res.motion_scene || res,
              summary: res.summary,
              warnings: res.warnings,
            });
          } catch (err) {
            if (this.disposed || isAbortError(err)) return;
            this.dispatch({ type: "ERROR", error: { message: err.message } });
          }
        },
        error: (payload) => this.dispatch({ type: "ERROR", error: payload.error }),
      },
      (payload) => matchesReconstructionEvent(payload, { jobId: this.state.jobId, nodeId: this.node?.id })
    );

    this.unbindControls = bindReconstructionControls(this.root, {
      onRun: () => this.run(),
      onStop: () => this.stop(),
      onOpenDirector: () => this.openDirector(),
      onSettingsChange: (settings) => {
        // The node widgets are the authority: every panel edit is mirrored
        // onto them so a queued graph run and a save/reload match the panel.
        syncWidgetsFromPanel(this.node, this.root);
        this.dispatch({ type: "SETTINGS", settings });
      },
      listen: this.listen,
    });

    // Hydrate the panel from whatever the saved workflow put on the widgets,
    // then push that same state straight back (fills in derived widgets like
    // recon_completion_provider) so the first queued run is consistent too.
    this.syncFromWidgets();
    syncWidgetsFromPanel(this.node, this.root);

    // Lazy read-only 3D preview of the reconstructed scene (three.js is only
    // pulled in when the user opens it).
    this.preview = null;
    this.previewLoad = null;
    this.previewOpen = false;
    const previewToggle = this.root?.querySelector?.('[data-role="reconstruction-preview-toggle"]');
    if (previewToggle) this.listen(previewToggle, "click", () => this.togglePreview());
    const previewFit = this.root?.querySelector?.('[data-role="reconstruction-preview-fit"]');
    if (previewFit) this.listen(previewFit, "click", () => this.preview?.fit());
    const discardBtn = this.root?.querySelector?.('[data-role="reconstruction-discard"]');
    if (discardBtn) {
      this.listen(discardBtn, "click", () => {
        discardBtn.disabled = true;
        Promise.resolve(this.discard()).finally(() => this.render());
      });
    }
    if (typeof document !== "undefined") {
      this.listen(document, "visibilitychange", () => {
        if (document.visibilityState === "visible") this.recoverStatus();
      });
    }
    if (typeof window !== "undefined") {
      this.listen(window, "online", () => this.recoverStatus());
    }

    this.initCapabilities();
    this.render();
  }

  /** The reconstructed MotionScene currently in `state.result`, or null. */
  currentScene() {
    const r = this.state.result;
    return r ? (r.motion_scene || r) : null;
  }

  async ensurePreview() {
    if (this.preview || this.disposed) return this.preview;
    this.previewLoad ||= import("../../viewer/track-viewer.js")
      .then(({ TrackViewer }) => {
        if (this.disposed || this.preview) return this.preview;
        const canvas = this.root.querySelector('[data-role="reconstruction-3d"]');
        this.preview = canvas ? new TrackViewer(canvas) : null;
        return this.preview;
      })
      .catch((error) => {
        console.warn("OmniCam reconstruction 3D preview unavailable", error);
        return null;
      })
      .finally(() => { this.previewLoad = null; });
    return this.previewLoad;
  }

  pushSceneToPreview() {
    const scene = this.currentScene();
    if (!this.preview || !scene) return;
    this.preview.setReconstructedScene(scene, {
      resolveAssetUrl: (ref) => annotatedAssetUrl(this.api, ref),
    });
    this.preview.resize();
    this.preview.fit();
  }

  async togglePreview() {
    this.previewOpen = !this.previewOpen;
    const box = this.root.querySelector('[data-role="reconstruction-preview"]');
    if (box) box.hidden = !this.previewOpen;
    const btn = this.root.querySelector('[data-role="reconstruction-preview-toggle"]');
    if (btn) btn.setAttribute("aria-pressed", String(this.previewOpen));
    if (!this.previewOpen) return;
    await this.ensurePreview();
    if (this.disposed) return;
    this.pushSceneToPreview();
  }

  /** Re-read the node widgets into the panel DOM (mount + workflow reload). */
  syncFromWidgets() {
    hydratePanelFromWidgets(this.node, this.root);
    updateReconstructionModeVisibility(this.root);
    this.render();
  }

  async initCapabilities() {
    try {
      const select = this.root.querySelector('[data-role="reconstruction-provider"]');
      const status = this.root.querySelector('[data-role="reconstruction-stage"]');
      const checkpointSelect = this.root.querySelector('[data-role="reconstruction-checkpoint"]');
      await loadReconstructionCapabilities(this.client, {
        selectElement: select,
        statusElement: status,
        checkpointSelectElement: checkpointSelect,
      });
      if (this.disposed) return;
      // The provider / checkpoint <select> options only exist once capabilities
      // load; re-apply the saved widget values so the panel shows the saved
      // provider, not the first available one.
      hydratePanelFromWidgets(this.node, this.root);
      updateReconstructionModeVisibility(this.root);
      this.render();
    } catch {
      // Degrades gracefully
    }
  }

  setSource(source) {
    this.dispatch({ type: "SOURCE", source });
  }

  dispatch(action) {
    if (this.disposed) return;
    const previousResult = this.state.result;
    this.state = reduceReconstructionState(this.state, action);
    this.render();
    // A fresh result while the 3D preview is open -> redraw it.
    if (this.previewOpen && this.preview && this.state.result && this.state.result !== previousResult) {
      this.pushSceneToPreview();
    }
  }

  render() {
    renderReconstructionView(this.root, this.state);
  }

  async run() {
    const source = this.state.source || this.getSource();
    if (!source || this.disposed) return;
    const generation = ++this.runGeneration;
    // Last-write wins: flush the panel onto the widgets so this run and a save
    // immediately after it agree.
    syncWidgetsFromPanel(this.node, this.root);
    const settings = readReconstructionSettings(this.root);

    this.dispatch({ type: "STATE", jobState: "PREPARING" });
    try {
      const resp = await this.client.startJob({
        nodeId: this.node?.id || "",
        source,
        settings,
        signal: this.requestLifetime.signal,
      });
      if (this.disposed || generation !== this.runGeneration) {
        if (resp?.job_id) void this.client.stopJob(resp.job_id).catch(() => {});
        return;
      }
      this.applyJobResponse(resp);
    } catch (err) {
      if (this.disposed || isAbortError(err)) return;
      this.dispatch({ type: "ERROR", error: { message: err.message } });
    }
  }

  /**
   * A cache hit can finish the job on its background thread before this
   * POST even returns, racing the "done" WebSocket event: it may already
   * have fired and been dropped (state.jobId was still empty when it
   * matched against it), or it may never fire before this response lands.
   * The HTTP response is the source of truth (job.to_dict() always embeds
   * "result" once job.result is set), so a job that is already DONE/FAILED
   * by the time we see it is resolved right here instead of waiting on a
   * socket event that may not come.
   */
  applyJobResponse(resp) {
    if (this.disposed) return;
    if (resp.result) {
      this.acceptResultEnvelope(resp.job_id, resp.result);
      return;
    }
    if (resp.state === "FAILED") {
      this.dispatch({ type: "ERROR", error: resp.error || { message: "Reconstruction failed" } });
      return;
    }
    this.dispatch({ type: "STATE", jobState: resp.state || "PREPARING", jobId: resp.job_id });
    // The job may already have finished on its worker thread while this POST
    // was in flight, with the "done" WebSocket event lost (state.jobId was
    // still empty when it fired). If the response says DONE but carries no
    // result, pull it over HTTP instead of waiting on a socket event.
    if (resp.state === "DONE" && resp.job_id) {
      this.recoverResult(resp.job_id);
    }
  }

  acceptResultEnvelope(jobId, result) {
    if (this.disposed) return;
    this.dispatch({
      type: "DONE",
      jobId: jobId || this.state.jobId,
      result: result.motion_scene || result,
      summary: result.summary,
      warnings: result.warnings,
    });
  }

  /** Fetch a finished job's result over HTTP after a missed WebSocket "done". */
  async recoverResult(jobId) {
    const generation = this.runGeneration;
    try {
      const resp = await this.client.result(jobId, { signal: this.requestLifetime.signal });
      if (this.disposed || generation !== this.runGeneration || jobId !== this.state.jobId) return;
      const result = resp?.result || resp;
      if (result && (result.motion_scene || result.summary)) {
        this.acceptResultEnvelope(jobId, result);
      }
    } catch (err) {
      if (this.disposed || isAbortError(err)) return;
      this.dispatch({ type: "ERROR", error: { message: err.message } });
    }
  }

  /** Re-sync state from the server after a WebSocket gap (reconnect, sleep). */
  async recoverStatus() {
    if (!this.state.jobId || this.disposed) return;
    const generation = this.runGeneration;
    const jobId = this.state.jobId;
    try {
      const resp = await this.client.status(jobId, { signal: this.requestLifetime.signal });
      if (this.disposed || generation !== this.runGeneration || jobId !== this.state.jobId) return;
      if (resp?.state === "DONE") {
        if (resp.result) this.acceptResultEnvelope(resp.job_id, resp.result);
        else await this.recoverResult(jobId);
      } else if (resp?.state === "FAILED") {
        this.dispatch({ type: "ERROR", error: resp.error || { message: "Reconstruction failed" } });
      } else if (resp?.state) {
        this.dispatch({ type: "STATE", jobState: resp.state, jobId: this.state.jobId });
      }
    } catch {
      // A failed status poll is not itself an error state; keep what we have.
    }
  }

  async stop() {
    if (!this.state.jobId) return;
    this.runGeneration += 1;
    this.dispatch({ type: "STATE", jobState: "STOPPING" });
    try {
      await this.client.stopJob(this.state.jobId);
    } catch {
      // Ignored
    }
  }

  openDirector() {
    if (!this.disposed && this.state.result) {
      const scene = this.state.result.motion_scene || this.state.result;
      this.onAdopt(scene);
    }
  }

  /**
   * Throw away the current reconstruction the user is unhappy with: delete its
   * cache folder on disk (so the next identical run recomputes instead of
   * serving this one back), close the 3D preview, and return the panel to
   * IDLE. The camera track and every other cached reconstruction are left
   * alone -- this is the narrow counterpart to the header's "Clear Cache".
   */
  async discard() {
    if (!this.state.result) return false;
    const proceed = await confirmAction(
      this,
      t("Discard reconstruction"),
      t("Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched."),
    );
    if (!proceed || this.disposed) return false;

    const fp = String(this.state.fingerprint || "");
    if (fp) {
      try {
        await this.client.deleteCacheEntry(fp);
        if (this.disposed) return false;
      } catch (err) {
        this.dispatch({ type: "ERROR", error: { message: err.message } });
        return false;
      }
    }
    if (this.previewOpen) await this.togglePreview();
    this.dispatch({ type: "RESET" });
    return true;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.runGeneration += 1;
    stopActiveReconstructionOnDispose(this.client, this.state);
    this.requestLifetime.dispose();
    this.events.dispose();
    this.unbindControls?.();
    this.unbindControls = null;
    this.preview?.dispose();
    this.preview = null;
  }
}
