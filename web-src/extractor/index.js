import { api } from "../comfy-runtime.js";
import { RequestLifetime } from "../request-lifetime.js";
import { renderSourceStageMedia } from "./source-stage.js";

import { SolveEventSubscription, solveEventMatcher } from "./job-events.js";
import { SolveJobClient, stopActiveSolveOnDispose } from "./job-client.js";
import { RefineController } from "./refine-controls.js";
import {
  FINGERPRINT_WIDGET,
  SOURCE_WIDGET,
  SCENE_WIDGET,
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

const SOLVE_SETTING_WIDGETS = [
  "method", "lens_mode", "fov_degrees", "focal_length_mm", "sensor_width_mm",
  "max_dimension", "frame_step",
];
const REFINE_SETTING_WIDGETS = [
  "normalize_origin", "motion_scale", "position_smoothing", "rotation_smoothing",
  "simplify_keys", "position_tolerance", "rotation_tolerance_deg",
];

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

const INTERNAL_WIDGETS = [SCENE_WIDGET, FINGERPRINT_WIDGET, SOURCE_WIDGET];

function hideInternalWidgets(node) {
  for (const name of INTERNAL_WIDGETS) {
    const item = widget(node, name);
    if (!item) continue;
    item.computeSize = () => [0, -4];
    item.draw = () => {};
    item.hidden = true;
    item.type = "hidden";
    item.options = { ...(item.options || {}), hideInVueNodes: true, serialize: true };
  }
  node.setDirtyCanvas?.(true, true);
}

/**
 * Hide them again once the node has actually mounted.
 *
 * Flags set during `nodeCreated` are read before the Vue node builds its widget
 * rows, so they had no effect and the cached track JSON was rendered on the
 * node as a text field. Re-applying after a frame is what makes it stick.
 */
function hideInternalWidgetsWhenMounted(node) {
  hideInternalWidgets(node);
  globalThis.requestAnimationFrame?.(() => hideInternalWidgets(node));
  setTimeout(() => hideInternalWidgets(node), 250);
}

class ExtractorUI {
  constructor(node) {
    this.node = node;
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

    this.client = new SolveJobClient(api);
    this.refine = new RefineController({ onRefine: (settings) => this.requestRefine(settings) });
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

    this.events = new SolveEventSubscription(api, {
      job: (payload) => this.dispatch({ type: "JOB_STATE", state: payload.state }),
      progress: (payload) => this.onProgress(payload),
      pose: (payload) => this.onPose(payload),
      quality: (payload) => this.onQuality(payload),
      features: (payload) => this.onFeatures(payload),
      completed: (payload) => this.onCompleted(payload),
      failed: (payload) => this.dispatch({ type: "FAILED", error: payload.error }),
    }, solveEventMatcher(() => ({ jobId: this.state.jobId, nodeId: this.node.id })));

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
    this.listen(this.root.querySelector('[data-act="stop"]'), "click", () => this.control("stopSolve"));
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
    return refreshExtractorSource(this);
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

  solveSettings() {
    const settings = {};
    for (const name of SOLVE_SETTING_WIDGETS) {
      const item = widget(this.node, name);
      if (!item) continue;
      const numeric = ["fov_degrees", "focal_length_mm", "sensor_width_mm", "max_dimension", "frame_step"];
      settings[name] = numeric.includes(name) ? Number(item.value) : String(item.value);
    }
    const refine = {};
    for (const name of REFINE_SETTING_WIDGETS) {
      const item = widget(this.node, name);
      if (!item) continue;
      refine[name] = typeof item.value === "boolean" ? item.value : Number(item.value);
    }
    settings.refine = refine;
    return settings;
  }

  // -- solve control -----------------------------------------------------

  async startSolve() {
    const source = this.refreshSource();
    if (!source.available) return;
    try {
      this.sourceViewer.setFollow(true);
      const status = await this.client.startSolve({
        nodeId: this.node.id, source: source.ref, settings: this.solveSettings(),
      });
      this.overlay.clear();
      this.diagnostics.clear();
      this.dispatch({ type: "JOB_STARTED", status });
      this.coordinator.reconcileFrameCount(status);
      this.coordinator.seek(0, "backend");
    } catch (error) {
      this.dispatch({ type: "FAILED", error: String(error?.message || error) });
    }
  }

  async control(method) {
    if (!this.state.jobId) return;
    try {
      const status = await this.client[method](this.state.jobId);
      this.dispatch({ type: "STATUS", status });
      this.coordinator.reconcileFrameCount(status);
    } catch (error) {
      this.dispatch({ type: "FAILED", error: String(error?.message || error) });
    }
  }

  /** The socket is transport; the server is the truth. Re-read after a gap. */
  async recoverStatus() {
    if (!this.state.jobId) return null;
    try {
      const status = await this.client.getSolveStatus(this.state.jobId);
      this.dispatch({ type: "STATUS", status });
      this.coordinator.reconcileFrameCount(status);
      if (status.state === "COMPLETED") await this.loadResult();
      return status;
    } catch {
      return null;
    }
  }

  onProgress(payload) {
    this.dispatch({ type: "PROGRESS", progress: payload });
    this.coordinator.reconcileFrameCount(payload);
    if (this.sourceViewer.follow) this.coordinator.seek(Number(payload.frame) || 0, "backend");
  }

  onPose(payload) {
    this.dispatch({ type: "POSE", pose: payload });
  }

  onQuality(payload) {
    this.dispatch({ type: "QUALITY", samples: payload.samples || [] });
  }

  /**
   * Paint the features the solver matched on this frame.
   *
   * Live telemetry, so it is drawn straight onto the overlay rather than routed
   * through the reducer: keeping every frame's points in panel state would grow
   * without bound over a long clip, and none of it is needed once the frame has
   * moved on.
   */
  onFeatures(payload) {
    const diagnostics = this.diagnostics.set(Number(payload.frame) || 0, {
      points: payload.points || [],
      frame: Number(payload.frame) || 0,
      state: String(payload.state || "unknown"),
    });
    if (diagnostics.frame === this.state.frame) this.overlay.setDiagnostics(diagnostics);
  }

  async onCompleted(payload) {
    this.dispatch({ type: "COMPLETED", result: payload });
    await this.loadResult();
  }

  async loadResult() {
    if (!this.state.jobId) return null;
    try {
      const result = await this.client.getSolveResult(this.state.jobId);
      this.acceptSolvedResult(result, "interactive");
      return result;
    } catch (error) {
      this.dispatch({ type: "FAILED", error: String(error?.message || error) });
      return null;
    }
  }

  acceptSolvedResult(result, origin = "interactive") {
    const raw = result?.raw_track || result?.raw || result?.track || null;
    const refined = result?.refined_track || result?.refined || result?.track || raw;
    if (!refined?.keyframes?.length) return false;
    const fingerprint = String(
      result?.fingerprint || refined?.metadata?.extractor_fingerprint || "",
    );
    this.result = { raw: raw || refined, refined };
    this.landmarks = Array.isArray(result?.landmarks_3d) ? result.landmarks_3d : [];
    if (origin === "queued") this.dispatch({ type: "QUEUED_RESULT" });
    this.dispatch({
      type: "STATUS",
      status: {
        anomalies: result?.anomalies || [], state: "COMPLETED",
        job_id: this.state.jobId, backend: refined?.metadata?.backend,
      },
    });
    this.dispatch({ type: "REFINED", fingerprint });
    this.pushTracksToViewer();
    if (origin === "queued") {
      cacheExtractorResult(this.node, {
        track: refined, fingerprint,
        confidence: Number(result?.confidence ?? refined?.metadata?.confidence) || 0,
      });
      if (result?.source) cacheExtractorSource(this.node, result.source);
      this.node.__majoorOmniCamStatus = statusLine({
        track: refined, fingerprint,
        confidence: Number(result?.confidence ?? refined?.metadata?.confidence) || 0,
      });
      this.dispatch({ type: "APPLIED", fingerprint });
      if (result?.source) this.refreshSource();
    }
    return true;
  }

  async requestRefine(settings) {
    if (!this.state.jobId || this.state.solveState !== "COMPLETED") return null;
    try {
      this.syncRefineWidgets(settings);
      const payload = await this.client.refineSolve(this.state.jobId, settings);
      this.result = { ...this.result, refined: payload.refined_track };
      this.dispatch({ type: "REFINED", fingerprint: payload.fingerprint });
      this.pushTracksToViewer();
      return payload;
    } catch (error) {
      this.dispatch({ type: "FAILED", error: String(error?.message || error) });
      return null;
    }
  }

  /** Keep queued execution and interactive cleanup on the same widget values. */
  syncRefineWidgets(settings) {
    for (const name of REFINE_SETTING_WIDGETS) {
      if (settings[name] === undefined) continue;
      const item = widget(this.node, name);
      if (item) item.value = settings[name];
    }
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
    this.acceptSolvedResult(result, "queued");
  }

  dispose() {
    stopActiveSolveOnDispose(this.client, this.state);
    this.disposed = true;
    this.requests.dispose();
    this.events.dispose();
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

// Called by web-src/main.js once the Extractor chunk has loaded. This module
// has no startup side effects, which is what keeps it out of the eager chunk.
export function attachExtractor(node) {
  if (node.__majoorOmniCamExtractor) return;
  ensureCacheWidgets(node);
  if (!widget(node, SOURCE_WIDGET)) {
    const item = node.addWidget?.("text", SOURCE_WIDGET, "", () => {}, { serialize: true });
    if (item) {
      item.computeSize = () => [0, -4];
      item.draw = () => {};
      item.hidden = true;
    }
  }
  hideInternalWidgetsWhenMounted(node);
  // Before the UI is built: its constructor restores the cached solve from
  // these widgets, and they are only now able to hold what was saved.
  restoreLateWidgetValues(node);

  const ui = new ExtractorUI(node);
  node.__majoorOmniCamExtractor = ui;
  const preferredHeight = () => Math.max(700, ui.root.scrollHeight || 0);
  node.addDOMWidget("majoor_omnicam_extractor", "omnicam", ui.root, {
    serialize: false, hideOnZoom: false, getMinHeight: () => 700,
    getHeight: preferredHeight, getMaxHeight: preferredHeight,
  });
  node.setSize([Math.max(node.size?.[0] || 0, 800), Math.max(node.size?.[1] || 0, 780)]);

  const removed = node.onRemoved;
  node.onRemoved = function () {
    ui.dispose();
    removed?.apply(this, arguments);
  };
  const executed = node.onExecuted;
  node.onExecuted = function (message) {
    executed?.apply(this, arguments);
    ui.executed(message);
  };
  const changed = node.onConnectionsChange;
  node.onConnectionsChange = function () {
    changed?.apply(this, arguments);
    ui.refreshSource();
    // A just-picked upstream image can still be mid-decode: one more look
    // shortly after catches the client-only preview once it finishes,
    // without polling for the rest of the node's life.
    setTimeout(() => { if (!ui.disposed) ui.refreshSource(); }, 400);
  };
  const configured = node.onAfterGraphConfigured;
  node.onAfterGraphConfigured = function () {
    configured?.apply(this, arguments);
    ui.refreshSource();
    ui.recoverStatus();
  };
}

