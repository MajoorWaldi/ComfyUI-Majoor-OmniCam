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

    this.events = new ReconstructionEventSubscription(
      api,
      {
        state: (payload) => this.dispatch({ type: "STATE", jobState: payload.job_state, jobId: payload.job_id }),
        progress: (payload) => this.dispatch({ type: "PROGRESS", progress: payload.progress, stage: payload.stage, stageProgress: payload.stage_progress }),
        preview: (payload) => this.dispatch({ type: "PREVIEW", previewUrl: payload.preview_url }),
        done: async (payload) => {
          try {
            const res = await this.client.getJobResult(payload.job_id);
            this.dispatch({ type: "DONE", result: res.result || res, summary: res.summary, warnings: res.warnings });
          } catch (err) {
            this.dispatch({ type: "ERROR", error: { message: err.message } });
          }
        },
        error: (payload) => this.dispatch({ type: "ERROR", error: payload.error }),
      },
      (payload) => matchesReconstructionEvent(payload, { jobId: this.state.jobId, nodeId: this.node?.id })
    );

    bindReconstructionControls(this.root, {
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
      await loadReconstructionCapabilities(this.client, { selectElement: select, statusElement: status });
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
      this.dispatch({ type: "STATE", jobState: resp.state || "PREPARING", jobId: resp.job_id });
    } catch (err) {
      this.dispatch({ type: "ERROR", error: { message: err.message } });
    }
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
      this.onAdopt(this.state.result);
    }
  }

  dispose() {
    stopActiveReconstructionOnDispose(this.client, this.state);
    this.events.dispose();
  }
}
