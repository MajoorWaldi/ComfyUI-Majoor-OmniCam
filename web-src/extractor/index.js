import { api, app } from "../comfy-runtime.js";
import { RequestLifetime } from "../request-lifetime.js";
import { panelWheelKeeper } from "../shared/panel-scroll.js";
import { closeHelpPopup } from "../help/schema.js";
import { renderSourceStageMedia } from "./source-stage.js";
import { clearExtractorCache } from "./clear-cache.js";

import { bindExtractorQueueEvents } from "./queue/events.js";
import { cancelExtractorJob } from "./queue/execution.js";
import { adoptReconstructionIntoDownstreamDirectors } from "./director-link.js";
import { ReconstructionPanelController } from "./reconstruction/panel.js";
import {
  cancelQueuedRun,
  prepareForQueuedRun,
  startQueuedSolve,
  syncPanelToNodeWidgets,
} from "./queue/ui-bridge.js";
import { RefineController } from "./refine-controls.js";
import {
  cacheExtractorResult,
  cacheExtractorSource,
  ensureCacheWidgets,
  parseExtractorMessage,
  readCachedResult,
  restoreLateWidgetValues,
  statusLine,
} from "./result-cache.js";
import { FrameDiagnosticsStore } from "./diagnostics-store.js";
import { FrameCoordinator } from "./frame-coordinator.js";
import { ResultApplyError, applyRefinedTrack } from "./result-sync.js";
import { SourceViewer } from "./source-viewer.js";
import { FallbackFrameViewer } from "./fallback-frame-viewer.js";
import { describeSource } from "./source-resolver.js";
import { adoptExtractorSourceLength, describeExtractorSource, refreshExtractorSource } from "./source-lifecycle.js";
import {
  appliedLabel,
  controlAvailability,
  createExtractorState,
  progressLabel,
  reduceExtractorState,
  statusLabel,
  statusTone,
} from "./state.js";
import { buildExtractorRoot } from "./template.js";
import { TimelinePanelHost } from "./timeline-panel.js";
import { trackHealth } from "./track-timeline.js";
import { bindExtractorTransport } from "./transport.js";
import { TrackingOverlay } from "./tracking-overlay.js";
import { renderAnomalies } from "./views.js";
import { loadTrackViewer } from "./track-viewer-host.js";
import { renderExtractorRuler, renderFrameReadouts } from "./transport-readouts.js";

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

export class ExtractorUI {
  constructor(node) {
    this.node = node;
    // The ComfyUI app object -- passed to confirmAction/promptText so the
    // dialog manager resolves even behind the bundle (see clear-cache.js).
    this.app = app;
    // The ComfyUI api object -- queued-run cancellation talks to the Jobs API.
    this.api = api;
    this.root = buildExtractorRoot();
    this.state = createExtractorState();
    this.disposed = false;
    this.disposers = [];
    // Requests belong to this panel. When the node is removed they are
    // cancelled, so a destroyed panel never reports its own teardown as a
    // network failure.
    this.requests = new RequestLifetime();
    this.result = { raw: null, refined: null };
    this.landmarks = [];
    this.diagnostics = new FrameDiagnosticsStore();
    this.upstreamPreviewActive = false;
    this.motionLimits = null;

    // Cleanup-desk edits accumulate on the controller; a queued run reads them
    // off the node widgets (see queue/widget-sync.js). Instant post-solve
    // refinement without a re-queue is a separate follow-up.
    this.refine = new RefineController({ onRefine: () => {} });
    this.fallbackViewer = new FallbackFrameViewer(this.$("fallback-preview"), { api });
    this.sourceViewer = new SourceViewer(this.$("source-video"), {
      onFrame: (frame) => this.coordinator.seek(frame, "media"),
      onMetadata: ({ frameCount }) => this.adoptSourceLength(frameCount),
      onError: (message) => this.dispatch({ type: "SOURCE", source: { playbackError: message } }),
      onMode: () => this.render(),
      fallbackViewer: this.fallbackViewer,
    });
    this.coordinator = new FrameCoordinator({
      media: this.sourceViewer,
      getViewer: () => this.viewer,
      showDiagnostics: (frame) => this.showDiagnostics(frame),
      dispatch: (action) => this.dispatch(action),
      setFollow: (enabled) => this.sourceViewer.setFollow(enabled),
      frameCount: this.state.frameCount,
      fps: this.sourceViewer.fps,
      loop: true,
      onPlaybackState: () => this.transport?.render(),
    });
    this.timeline = new TimelinePanelHost(this.root, {
      onSeek: (frame) => this.coordinator.seek(frame, "timeline"),
    });
    this.transport = bindExtractorTransport(this.root, {
      coordinator: this.coordinator,
      getState: () => this.state,
      getTrack: () => this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      listen: (target, event, handler) => this.listen(target, event, handler),
    });
    this.overlay = new TrackingOverlay(this.$("tracking-overlay"));
    this.viewer = null;
    this.viewerLoad = null;

    // The queued path follows ComfyUI's native lifecycle. queuePromptId is
    // transient identity (STOP, status, late-event rejection) and never serialized.
    this.queuePromptId = "";
    this.awaitingQueueStart = false;
    this.unbindQueueEvents = bindExtractorQueueEvents(this, api);

    // Read back whatever the workflow saved, rather than always booting into
    // camera_track: the widget can carry "scene_reconstruct" from a previous
    // save while this line ran unconditionally, leaving the visible UI on
    // Camera Track even though the backend widget (and Director, on the next
    // execution) would use Scene Reconstruct -- three different answers to
    // "what mode is this node in" for the same node at the same moment.
    this.extractMode = String(widget(this.node, "extract_mode")?.value || "camera_track");
    this.reconstruction = new ReconstructionPanelController({
      root: this.root,
      node: this.node,
      api,
      app,
      getSource: () => this.state.source?.ref || null,
      onAdopt: (result) => adoptReconstructionIntoDownstreamDirectors(this.node, result),
      // Scene Reconstruction Start / Stop run through the same partial queue as
      // Camera TRACK; the panel no longer owns a job manager.
      onQueue: () => this.startSolve("scene_reconstruct"),
      onCancel: () => this.cancelQueuedRun(),
      listen: (target, event, handler) => this.listen(target, event, handler),
    });

    const camModeBtn = this.$("extract-mode-camera");
    const reconModeBtn = this.$("extract-mode-reconstruct");
    if (camModeBtn) this.listen(camModeBtn, "click", () => this.setExtractMode("camera_track"));
    if (reconModeBtn) this.listen(reconModeBtn, "click", () => this.setExtractMode("scene_reconstruct"));
    // setExtractMode only dirties the canvas when the widget's value actually
    // changes (see below), so replaying the mode we just read back is a safe,
    // idempotent way to sync every other bit of UI (tab classes, panel
    // visibility, the reconstruction panel's source) to it.
    this.setExtractMode(this.extractMode);

    const clearCacheBtn = this.$("clear-cache");
    if (clearCacheBtn) {
      this.listen(clearCacheBtn, "click", () => {
        clearCacheBtn.disabled = true;
        Promise.resolve()
          .then(() => this.clearCache())
          .catch((err) => this.dispatch({ type: "FAILED", error: String(err?.message || err) }))
          .finally(() => { clearCacheBtn.disabled = false; });
      });
    }

    this.bind();
    this.loadMotionLimits();
    this.refreshSource();
    this.restoreCachedResult();
    this.render();
  }

  // -- plumbing ----------------------------------------------------------

  $(role) {
    return this.root.querySelector(`[data-role="${role}"]`);
  }

  listen(target, event, handler, options) {
    if (!target) return;
    target.addEventListener(event, handler, options);
    this.disposers.push(() => target.removeEventListener(event, handler, options));
  }

  dispatch(action) {
    this.state = reduceExtractorState(this.state, action);
    if (!this.disposed) this.render();
    return this.state;
  }

  async loadMotionLimits() {
    try {
      const payload = await this.requests.run(async (signal) => {
        const response = await api.fetchApi?.("/majoor/omnicam/motion_profiles", { signal });
        return response?.ok ? response.json() : undefined;
      });
      if (payload === undefined) return;
      this.motionLimits = payload?.profiles?.find((profile) => profile.id === "generic")?.limits || null;
      if (!this.disposed) this.render();
    } catch {
      // The panel still reports native solve quality when profile routes are unavailable.
    }
  }

  bind() {
    // Wheel over a scrollable panel scrolls it instead of zooming the graph.
    this.listen(this.root, "wheel", panelWheelKeeper(this.root));
    for (const tab of this.root.querySelectorAll("[data-tab]")) {
      this.listen(tab, "click", () => this.setViewerMode(tab.dataset.tab));
    }
    for (const button of this.root.querySelectorAll("[data-track-mode]")) {
      this.listen(button, "click", () => this.setTrackMode(button.dataset.trackMode));
    }
    for (const button of this.root.querySelectorAll("[data-view]")) {
      this.listen(button, "click", () => this.viewer?.setView(button.dataset.view));
    }
    for (const button of this.root.querySelectorAll("[data-inspection-view]")) {
      this.listen(button, "click", () => {
        const view = this.viewer?.setInspectionView(button.dataset.inspectionView) || "scene";
        for (const item of this.root.querySelectorAll("[data-inspection-view]")) {
          item.setAttribute("aria-selected", String(item.dataset.inspectionView === view));
        }
        for (const item of this.root.querySelectorAll("[data-view], [data-act='fit']")) {
          item.disabled = view === "camera";
        }
      });
    }

    this.listen(this.root.querySelector('[data-act="track"]'), "click", () => this.startSolve());
    this.listen(this.root.querySelector('[data-act="stop"]'), "click", () => this.cancelQueuedRun());
    this.listen(this.root.querySelector('[data-act="fit"]'), "click", () => this.viewer?.fit());
    this.listen(this.root.querySelector('[data-act="apply"]'), "click", () => this.applyRefined());
    this.listen(this.root.querySelector('[data-act="reset-refine"]'), "click", () => this.resetRefine());
    this.listen(this.$("scrubber"), "input", (event) => this.coordinator.seek(Number(event.target.value), "input"));
    this.listen(this.$("frame"), "change", (event) => this.coordinator.seek(Number(event.target.value), "input"));
    this.listen(this.$("follow-solve"), "change", (event) => this.sourceViewer.setFollow(event.target.checked));
    this.timeline.bind((target, event, handler) => this.listen(target, event, handler),
      () => this.state.frameCount);
    this.bindRefineControls();
  }

  bindRefineControls() {
    const sliders = {
      "position-smoothing": "position_smoothing",
      "rotation-smoothing": "rotation_smoothing",
      "motion-scale": "motion_scale",
      "position-tolerance": "position_tolerance",
    };
    for (const [role, key] of Object.entries(sliders)) {
      const input = this.$(role);
      this.listen(input, "input", () => {
        this.refine.update({ [key]: Number(input.value) });
        this.renderRefineValues();
      });
    }
    for (const axis of ["pitch", "yaw", "roll"]) {
      const input = this.$(`align-${axis}`);
      this.listen(input, "input", () => {
        this.refine.setAlignment({ [axis]: Number(input.value) });
        this.renderRefineValues();
      });
    }
    this.listen(this.root.querySelector('[data-act="reset-alignment"]'), "click", () => {
      for (const axis of ["pitch", "yaw", "roll"]) {
        const input = this.$(`align-${axis}`);
        if (input) input.value = "0";
      }
      this.refine.setAlignment({ pitch: 0, yaw: 0, roll: 0 });
      this.renderRefineValues();
    });
    this.listen(this.root.querySelector('[data-act="estimate-up"]'), "click", () => this.estimateUp());

    this.listen(this.root.querySelector('[data-act="set-in"]'), "click",
      () => this.setTrim("trim-start", "trim_start_frame"));
    this.listen(this.root.querySelector('[data-act="set-out"]'), "click",
      () => this.setTrim("trim-end", "trim_end_frame"));
    this.listen(this.root.querySelector('[data-act="reset-trim"]'), "click", () => {
      for (const role of ["trim-start", "trim-end"]) {
        const input = this.$(role);
        if (input) input.value = "0";
      }
      this.refine.update({ trim_start_frame: 0, trim_end_frame: 0 });
    });
    for (const [role, key] of [["trim-start", "trim_start_frame"], ["trim-end", "trim_end_frame"]]) {
      const input = this.$(role);
      this.listen(input, "change", () => this.refine.update({ [key]: Math.max(0, Number(input.value) || 0) }));
    }
    for (const [role, key] of [["normalize-origin", "normalize_origin"], ["simplify-keys", "simplify_keys"]]) {
      const input = this.$(role);
      this.listen(input, "change", () => this.refine.update({ [key]: Boolean(input.checked) }));
    }
  }

  // -- source ------------------------------------------------------------

  refreshSource() {
    const resolved = refreshExtractorSource(this);
    if (this.reconstruction && resolved) {
      this.reconstruction.setSource(resolved.ref || resolved);
    }
    return resolved;
  }

  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(resolved) {
    return describeExtractorSource(this, resolved);
  }

  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(frameCount) {
    return adoptExtractorSourceLength(this, frameCount);
  }

  // -- solve control -----------------------------------------------------

  /**
   * Delete every cached reconstruction from disk and forget this node's own
   * cached results, in both modes: the camera-track scene/fingerprint/source
   * widgets (result-cache.js) and the reconstruction panel's job state.
   */
  async clearCache() {
    return clearExtractorCache(this);
  }

  /** TRACK / Reconstruct Start -> a partial ComfyUI execution. See queue/ui-bridge.js. */
  startSolve(mode = "camera_track") {
    return startQueuedSolve(this, mode);
  }

  /** STOP -> cancel this panel's ComfyUI job. Idempotent. */
  cancelQueuedRun() {
    return cancelQueuedRun(this);
  }

  syncPanelToNodeWidgets() {
    return syncPanelToNodeWidgets(this);
  }

  prepareForQueuedRun() {
    return prepareForQueuedRun(this);
  }

  /**
   * Adopt a solved track that arrived through the Extractor's queued
   * executed() -> parseExtractorMessage() envelope. This is the only way a
   * camera-track result reaches the panel now.
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
    this.dispatch({ type: "QUEUED_RESULT" });
    this.dispatch({
      type: "STATUS",
      status: {
        anomalies: result?.anomalies || [], state: "COMPLETED",
        backend: refined?.metadata?.backend,
      },
    });
    this.dispatch({ type: "REFINED", fingerprint });
    this.pushTracksToViewer();
    const confidence = Number(result?.confidence ?? refined?.metadata?.confidence) || 0;
    cacheExtractorResult(this.node, { track: refined, fingerprint, confidence });
    if (result?.source) cacheExtractorSource(this.node, result.source);
    this.node.__majoorOmniCamStatus = statusLine({ track: refined, fingerprint, confidence });
    this.dispatch({ type: "APPLIED", fingerprint });
    if (result?.source) this.refreshSource();
    return true;
  }

  /**
   * Level the world from the solve's own average up vector.
   *
   * Deliberately a button rather than something applied silently: a shot that
   * was genuinely filmed tilted is indistinguishable from a tilted
   * reconstruction, and only the user knows which they shot.
   */
  async estimateUp() {
    this.refine.requestEstimatedUp();
    const payload = await this.refine.flush();
    const resolved = payload?.resolved_alignment;
    if (!resolved) return null;
    // Show what the estimate chose, so it can be nudged rather than trusted.
    const [x, y, z, w] = resolved.map(Number);
    const degrees = (value) => Math.round(value * (180 / Math.PI) * 10) / 10;
    const pitch = degrees(Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)));
    const roll = degrees(Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)));
    for (const [axis, value] of [["pitch", pitch], ["yaw", 0], ["roll", roll]]) {
      const input = this.$(`align-${axis}`);
      if (input) input.value = String(value);
    }
    this.refine.alignment = { pitch, yaw: 0, roll };
    this.renderRefineValues();
    return payload;
  }

  resetRefine() {
    this.refine.reset();
    for (const [role, value] of [
      ["position-smoothing", 0.15], ["rotation-smoothing", 0.1],
      ["motion-scale", 1], ["position-tolerance", 0.01],
      ["align-pitch", 0], ["align-yaw", 0], ["align-roll", 0],
    ]) {
      const input = this.$(role);
      if (input) input.value = String(value);
    }
    this.renderRefineValues();
  }

  setTrim(role, key) {
    const input = this.$(role);
    if (input) input.value = String(this.state.frame);
    this.refine.update({ [key]: this.state.frame });
  }

  applyRefined() {
    try {
      const { fingerprint } = applyRefinedTrack(this.node, {
        track: this.result.refined, state: this.state.solveState,
      });
      this.dispatch({ type: "APPLIED", fingerprint });
    } catch (error) {
      const message = error instanceof ResultApplyError ? error.message : String(error?.message || error);
      this.dispatch({ type: "FAILED", error: message });
    }
  }

  // -- viewer ------------------------------------------------------------

  ensureViewer() {
    if (this.viewer || this.disposed) return Promise.resolve(this.viewer);
    this.viewerLoad ||= loadTrackViewer(this);
    return this.viewerLoad;
  }

  pushTracksToViewer() {
    if (!this.viewer) return;
    this.viewer.setRawTrack(this.result.raw);
    this.viewer.setRefinedTrack(this.result.refined);
    this.viewer.setLandmarks(this.landmarks);
    this.viewer.setMode(this.state.trackMode);
    this.coordinator.seek(this.state.frame, "sync");
  }

  async setViewerMode(mode) {
    this.dispatch({ type: "VIEWER_MODE", mode });
    if (mode === "source") return;
    // The viewer must exist before resize/fit, and on the first switch that
    // now means waiting for the three.js chunk.
    await this.ensureViewer();
    if (this.disposed) return;
    this.viewer?.resize();
    this.viewer?.fit();
  }

  setTrackMode(mode) {
    this.dispatch({ type: "TRACK_MODE", mode });
    this.viewer?.setMode(mode);
  }

  showDiagnostics(frame) {
    const diagnostics = this.diagnostics.get(frame);
    if (diagnostics) this.overlay.setDiagnostics(diagnostics);
    else this.overlay.clear();
  }

  // -- rendering ---------------------------------------------------------

  render() {
    const pill = this.$("solve-status");
    if (pill) {
      pill.dataset.tone = statusTone(this.state.solveState);
      this.$("solve-status-text").textContent = statusLabel(this.state);
    }

    const strip = this.$("source-strip");
    if (strip) {
      strip.dataset.available = String(Boolean(this.state.source.available));
      this.$("source-label").textContent = describeSource(this.state.source);
    }

    const available = controlAvailability(this.state);
    for (const [action, enabled] of Object.entries({
      track: available.track, stop: available.stop, apply: available.apply,
    })) {
      const button = this.root.querySelector(`[data-act="${action}"]`);
      if (button) button.disabled = !enabled;
    }

    this.$("solve-detail").textContent = progressLabel(this.state);
    this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`;
    this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;

    const error = this.$("solve-error");
    error.hidden = !this.state.error;
    error.textContent = this.state.error || "";

    const appliedState = appliedLabel(this.state);
    const applied = this.$("applied-state");
    applied.dataset.state = appliedState;
    applied.textContent = appliedState;

    for (const tab of this.root.querySelectorAll("[data-tab]")) {
      tab.setAttribute("aria-selected", String(tab.dataset.tab === this.state.viewerMode));
    }
    for (const button of this.root.querySelectorAll("[data-track-mode]")) {
      button.setAttribute("aria-selected", String(button.dataset.trackMode === this.state.trackMode));
    }
    const mode = this.state.viewerMode;
    const showingSource = mode === "source";
    const showingTrack = mode === "track3d";
    const showingDiagnostics = false;
    const stage = this.$("stage");
    if (stage) stage.dataset.mode = mode;
    renderSourceStageMedia(this, showingSource);
    this.$("tracking-overlay").hidden = !showingDiagnostics;
    this.$("track-canvas").hidden = !showingTrack;
    this.root.querySelector('[data-role="views"]').hidden = !showingTrack;

    const scrubber = this.$("scrubber");
    if (scrubber) scrubber.max = String(Math.max(0, this.state.frameCount - 1));
    const frameInput = this.$("frame");
    if (frameInput) frameInput.max = String(Math.max(0, this.state.frameCount - 1));
    const frameTotal = this.$("frame-total");
    if (frameTotal) frameTotal.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`;
    const fps = this.$("extractor-fps");
    if (fps) fps.textContent = String(this.sourceViewer.fps || 24);

    renderAnomalies(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onFrame: (frame) => this.coordinator.seek(frame, "anomaly"),
      onAction: (anomaly, action) => {
        const start = Number(anomaly.start_frame ?? anomaly.frame) || 0;
        const end = Math.max(start, Number(anomaly.end_frame ?? anomaly.frame) || start);
        for (let frame = start; frame <= end; frame += 1) this.refine.setSpikeAction(frame, action);
        this.render();
      },
    });
    this.renderTimeline();
    this.transport.render();
    renderFrameReadouts(this);
    renderExtractorRuler(this);

    const notice = this.$("stage-notice");
    if (notice) {
      const message = this.state.source.playbackError
        || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      notice.hidden = !message || !showingSource;
      notice.textContent = message;
    }
  }

  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    const track = this.state.trackMode === "raw" ? this.result.raw : this.result.refined;
    this.currentHealth = trackHealth(track, this.motionLimits);
    return this.timeline.render({
      track,
      health: this.currentHealth,
      quality: this.state.quality,
      anomalies: this.state.anomalies,
      frame: this.state.frame,
      frameCount: this.state.frameCount,
    });
  }

  renderFrameReadouts() {
    return renderFrameReadouts(this);
  }

  /** Keep the read-only solve sheet on the exact same frame axis as playback. */
  renderExtractorRuler() {
    renderExtractorRuler(this);
  }

  renderRefineValues() {
    for (const role of [
      "position-smoothing", "rotation-smoothing", "motion-scale", "position-tolerance",
      "align-pitch", "align-yaw", "align-roll",
    ]) {
      const input = this.$(role);
      const output = this.$(`${role}-out`);
      if (input && output) output.textContent = input.value;
    }
  }

  // -- lifecycle ---------------------------------------------------------

  restoreCachedResult() {
    const cached = readCachedResult(this.node);
    if (!cached) return;
    this.result = { raw: cached.track, refined: cached.track };
    this.state = reduceExtractorState(this.state, { type: "APPLIED", fingerprint: cached.fingerprint });
    this.state = reduceExtractorState(this.state, { type: "REFINED", fingerprint: cached.fingerprint });
  }

  executed(message) {
    const result = parseExtractorMessage(message);
    if (!result) return;
    if (result.mode === "scene_reconstruct") {
      this.reconstruction?.acceptQueuedResult(result);
      return;
    }
    this.acceptSolvedResult(result);
  }

  setExtractMode(mode) {
    this.extractMode = mode;
    const isReconstruct = mode === "scene_reconstruct";
    const reconPanel = this.$("reconstruction-panel");
    // The whole camera-track UI -- tabs, stage, transport/dope timeline, Solve
    // card, cleanup columns -- lives in this one element. Scene Reconstruct has
    // its own panel (and its own 3D preview), so hide camera track entirely
    // rather than leaving its menus stacked under the reconstruction panel.
    const cameraBody = this.$("camera-track-body");

    if (reconPanel) reconPanel.toggleAttribute("hidden", !isReconstruct);
    if (cameraBody) cameraBody.toggleAttribute("hidden", isReconstruct);

    const camBtn = this.$("extract-mode-camera");
    if (camBtn) {
      camBtn.setAttribute("aria-selected", !isReconstruct ? "true" : "false");
      camBtn.classList.toggle("active", !isReconstruct);
    }
    const reconBtn = this.$("extract-mode-reconstruct");
    if (reconBtn) {
      reconBtn.setAttribute("aria-selected", isReconstruct ? "true" : "false");
      reconBtn.classList.toggle("active", isReconstruct);
    }

    if (isReconstruct && this.reconstruction) {
      const src = this.state.source?.ref || this.state.source;
      if (src) this.reconstruction.setSource(src);
    }

    const modeWidget = widget(this.node, "extract_mode");
    if (modeWidget && modeWidget.value !== mode) {
      modeWidget.value = mode;
      this.node.setDirtyCanvas?.(true, true);
    }
  }

  dispose() {
    // A queued solve outlives this panel: cancel it so a deleted node does not
    // leave a job running on stale footage.
    if (this.queuePromptId) void cancelExtractorJob(this.api, this.queuePromptId).catch(() => {});
    this.unbindQueueEvents?.();
    this.reconstruction?.dispose();
    this.disposed = true;
    closeHelpPopup(); // body-level popup + capture keydown, else orphaned on graph clear
    this.requests.dispose();
    this.refine.dispose();
    this.coordinator.dispose();
    this.sourceViewer.dispose();
    this.overlay.dispose();
    this.diagnostics.dispose();
    this.viewer?.dispose();
    this.viewer = null;
    this.viewerLoad = null;
    for (const dispose of this.disposers.splice(0)) dispose();
    this.result = { raw: null, refined: null };
  }
}

export { attachExtractor } from "./lifecycle.js";

