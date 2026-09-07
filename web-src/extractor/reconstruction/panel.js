// Orchestrator for the scene reconstruction panel.

import { loadReconstructionCapabilities } from "./capabilities.js";
import { bindReconstructionControls, readReconstructionSettings } from "./controls.js";
import { ReconstructionEventSubscription, matchesReconstructionEvent } from "./events.js";
import { ReconstructionJobClient, stopActiveReconstructionOnDispose } from "./job-client.js";
import {
  initialReconstructionState,
  reduceReconstructionState,
} from "./state.js";
import { renderReconstructionView } from "./views.js";

export class ReconstructionPanelController {
  constructor({
    root,
    node,
    api,
    getSource = () => null,
    onAdopt = () => {},
    listen = (target, event, handler) => target?.addEventListener?.(event, handler),
  }) {
    this.root = root;
    this.node = node;
    this.api = api;
    this.getSource = getSource;
    this.onAdopt = onAdopt;
    this.listen = listen;

    this.client = new ReconstructionJobClient(api);
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
            const res = await this.client.getJobResult(payload.job_id);
            this.dispatch({
              type: "DONE",
              result: res.result || res.motion_scene || res,
              summary: res.summary,
              warnings: res.warnings,
            });
          } catch (err) {
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
      onSettingsChange: (settings) => this.dispatch({ type: "SETTINGS", settings }),
      listen: this.listen,
    });

    this.initCapabilities();
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
    } catch {
      // Degrades gracefully
    }
  }

  setSource(source) {
    this.dispatch({ type: "SOURCE", source });
  }

  dispatch(action) {
    this.state = reduceReconstructionState(this.state, action);
    this.render();
  }

  render() {
    renderReconstructionView(this.root, this.state);
  }

  async run() {
    const source = this.state.source || this.getSource();
    if (!source) return;
    const settings = readReconstructionSettings(this.root);

    this.dispatch({ type: "STATE", jobState: "PREPARING" });
    try {
      const resp = await this.client.startJob({
        nodeId: this.node?.id || "",
        source,
        settings,
      });
      this.applyJobResponse(resp);
    } catch (err) {
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
    if (resp.result) {
      this.dispatch({
        type: "DONE",
        jobId: resp.job_id,
        result: resp.result.motion_scene || resp.result,
        summary: resp.result.summary,
        warnings: resp.result.warnings,
      });
      return;
    }
    if (resp.state === "FAILED") {
      this.dispatch({ type: "ERROR", error: resp.error || { message: "Reconstruction failed" } });
      return;
    }
    this.dispatch({ type: "STATE", jobState: resp.state || "PREPARING", jobId: resp.job_id });
  }

  async stop() {
    if (!this.state.jobId) return;
    this.dispatch({ type: "STATE", jobState: "STOPPING" });
    try {
      await this.client.stopJob(this.state.jobId);
    } catch {
      // Ignored
    }
  }

  openDirector() {
    if (this.state.result) {
      const scene = this.state.result.motion_scene || this.state.result;
      this.onAdopt(scene);
    }
  }

  dispose() {
    stopActiveReconstructionOnDispose(this.client, this.state);
    this.events.dispose();
    this.unbindControls?.();
    this.unbindControls = null;
  }
}
