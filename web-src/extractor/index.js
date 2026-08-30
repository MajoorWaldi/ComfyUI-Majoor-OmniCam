import { api, app } from "../comfy-runtime.js";
import { TrackViewer } from "../viewer/track-viewer.js";
import { annotatedAssetUrl } from "../shared/managed-assets.js";
import { resizeTrackingOverlay, showExtractorFrame, syncUpstreamPreviewCanvas } from "./source-stage.js";

import { SolveEventSubscription, solveEventMatcher } from "./job-events.js";
import { SolveJobClient, stopActiveSolveOnDispose } from "./job-client.js";
import { RefineController } from "./refine-controls.js";
import {
  drawQualityTimeline,
  frameAtPosition,
} from "./quality-timeline.js";
import {
  EXTRACTOR_NODE_CLASS,
  FINGERPRINT_WIDGET,
  SOURCE_WIDGET,
  TRACK_WIDGET,
  cacheExtractorResult,
  cacheExtractorSource,
  ensureCacheWidgets,
  parseExtractorMessage,
  readCachedResult,
  statusLine,
} from "./result-cache.js";
import { LiveTrackAccumulator } from "./live-track.js";
import { FrameDiagnosticsStore } from "./diagnostics-store.js";
import { ResultApplyError, applyRefinedTrack } from "./result-sync.js";
import { SourceViewer } from "./source-viewer.js";
import { describeSource, resolveInteractiveExtractorSource } from "./source-resolver.js";
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
import { TrackingOverlay } from "./tracking-overlay.js";
import { cameraRows, renderAnomalies } from "./views.js";
import { renderExtractorRuler, renderFrameReadouts } from "./transport-readouts.js";

const SOLVE_SETTING_WIDGETS = [
  "method", "lens_mode", "fov_degrees", "focal_length_mm", "sensor_width_mm",
  "max_dimension", "frame_step",
];

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.type || node?.constructor?.type || "");
}

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

const INTERNAL_WIDGETS = [TRACK_WIDGET, FINGERPRINT_WIDGET, SOURCE_WIDGET];

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
    this.result = { raw: null, refined: null };
    this.liveTrack = null;
    this.diagnostics = new FrameDiagnosticsStore();
    this.upstreamPreviewActive = false;
    this.live = new LiveTrackAccumulator();

    this.client = new SolveJobClient(api);
    this.refine = new RefineController({ onRefine: (settings) => this.requestRefine(settings) });
    this.sourceViewer = new SourceViewer(this.$("source-video"), {
      onFrame: (frame) => this.showFrame(frame, { fromVideo: true }),
      onMetadata: ({ frameCount }) => this.adoptSourceLength(frameCount),
      onError: (message) => this.dispatch({ type: "SOURCE", source: { playbackError: message } }),
    });
    this.timeline = new TimelinePanelHost(this.root, {
      onSeek: (frame) => this.sourceViewer.scrubTo(frame),
    });
    this.overlay = new TrackingOverlay(this.$("tracking-overlay"));
    this.viewer = null;

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
    void this.timeline.loadProfiles().then(() => this.disposed || this.renderTimeline());
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

    this.listen(this.root.querySelector('[data-act="track"]'), "click", () => this.startSolve());
    this.listen(this.root.querySelector('[data-act="pause"]'), "click", () => this.control("pauseSolve"));
    this.listen(this.root.querySelector('[data-act="resume"]'), "click", () => this.control("resumeSolve"));
    this.listen(this.root.querySelector('[data-act="stop"]'), "click", () => this.control("stopSolve"));
    this.listen(this.root.querySelector('[data-act="fit"]'), "click", () => this.viewer?.fit());
    this.listen(this.root.querySelector('[data-act="apply"]'), "click", () => this.applyRefined());
    this.listen(this.root.querySelector('[data-act="reset-refine"]'), "click", () => this.resetRefine());
    this.listen(this.root.querySelector('[data-act="play"]'), "click", () => this.sourceViewer.toggle());
    this.listen(this.root.querySelector('[data-act="first-frame"]'), "click", () => this.sourceViewer.scrubTo(0));
    this.listen(this.root.querySelector('[data-act="previous-frame"]'), "click", () => this.sourceViewer.scrubTo(this.state.frame - 1));
    this.listen(this.root.querySelector('[data-act="next-frame"]'), "click", () => this.sourceViewer.scrubTo(this.state.frame + 1));
    this.listen(this.root.querySelector('[data-act="last-frame"]'), "click",
      () => this.sourceViewer.scrubTo(Math.max(0, this.state.frameCount - 1)));
    this.listen(this.root.querySelector('[data-act="toggle-loop"]'), "click", () => {
      const loop = this.$("loop");
      if (!loop) return;
      loop.checked = !loop.checked;
      this.sourceViewer.setLoop(loop.checked);
      this.root.querySelector('[data-act="toggle-loop"]')?.setAttribute("aria-pressed", String(loop.checked));
    });

    this.listen(this.root.querySelector('[data-act="choose-source"]'), "click",
      () => this.$("source-file")?.click());
    this.listen(this.$("source-file"), "change", (event) => this.pickSource(event.target.files?.[0]));

    this.listen(this.$("scrubber"), "input", (event) => this.sourceViewer.scrubTo(Number(event.target.value)));
    this.listen(this.$("frame"), "change", (event) => this.sourceViewer.scrubTo(Number(event.target.value)));
    this.listen(this.$("follow-solve"), "change", (event) => this.sourceViewer.setFollow(event.target.checked));
    this.listen(this.$("loop"), "change", (event) => this.sourceViewer.setLoop(event.target.checked));
    this.listen(this.$("quality-timeline"), "click", (event) => this.seekFromTimeline(event));
    this.timeline.bind((target, event, handler) => this.listen(target, event, handler),
      () => this.state.frameCount);
    this.listen(this.$("limits-profile"), "change", (event) => {
      this.timeline.setProfile(event.target.value);
      this.renderTimeline();
    });

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
    const resolved = resolveInteractiveExtractorSource(this.node, this.node.graph);
    // A reload invalidates the previous failure: keeping it would leave the
    // "cannot decode" notice over footage that now plays.
    const reloaded = this.sourceViewer.setSource(
      resolved.available && resolved.ref ? annotatedAssetUrl(api, resolved.ref.value) : "",
    );
    this.dispatch({
      type: "SOURCE",
      source: reloaded ? { ...resolved, playbackError: "" } : resolved,
    });
    if (resolved.available && resolved.ref) this.describeSource(resolved);
    else this.adoptSourceLength(0);
    syncUpstreamPreviewCanvas(this, resolved);
    return resolved;
  }

  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(resolved) {
    if (this.describing === resolved.ref?.value) return null;
    this.describing = resolved.ref?.value;
    try {
      const payload = await this.client.describeSource(resolved.ref);
      if (this.disposed) return null;
      const info = payload?.info || null;
      this.dispatch({ type: "SOURCE", source: { info } });
      if (info) {
        this.sourceViewer.fps = Number(info.fps) || this.sourceViewer.fps;
        this.adoptSourceLength(Number(info.frame_count) || 0);
        resizeTrackingOverlay(this, info);
      }
      return info;
    } catch (error) {
      // A source the server cannot measure is not a panel failure: the strip
      // keeps the filename and TRACK will report the real reason.
      console.warn("[OmniCam] could not describe the extractor source", error);
      return null;
    }
  }

  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(frameCount) {
    const total = Math.max(0, Math.round(Number(frameCount) || 0));
    if (!total || total === this.state.frameCount) return;
    this.sourceViewer.frameCount = total;
    this.state.frameCount = total;
    if (!this.disposed) this.render();
  }

  async pickSource(file) {
    if (!file) return;
    try {
      const uploaded = await this.client.uploadSource(file);
      const item = widget(this.node, SOURCE_WIDGET);
      if (item) item.value = uploaded.relative || uploaded.path || "";
      this.refreshSource();
    } catch (error) {
      this.dispatch({ type: "FAILED", error: `Source upload failed: ${error?.message || error}` });
    }
  }

  solveSettings() {
    const settings = {};
    for (const name of SOLVE_SETTING_WIDGETS) {
      const item = widget(this.node, name);
      if (!item) continue;
      const numeric = ["fov_degrees", "focal_length_mm", "sensor_width_mm", "max_dimension", "frame_step"];
      settings[name] = numeric.includes(name) ? Number(item.value) : String(item.value);
    }
    return settings;
  }

  // -- solve control -----------------------------------------------------

  async startSolve() {
    const source = this.refreshSource();
    if (!source.available) return;
    try {
      const status = await this.client.startSolve({
        nodeId: this.node.id, source: source.ref, settings: this.solveSettings(),
      });
      this.overlay.clear();
      this.diagnostics.clear();
      const info = this.state.source.info || {};
      this.live.reset({
        fps: Number(info.fps) || this.sourceViewer.fps,
        fov: Number(widget(this.node, "fov_degrees")?.value) || 53,
        width: Number(info.width) || 1280,
        height: Number(info.height) || 720,
      });
      this.liveTrack = null;
      this.dispatch({ type: "JOB_STARTED", status });
    } catch (error) {
      this.dispatch({ type: "FAILED", error: String(error?.message || error) });
    }
  }

  async control(method) {
    if (!this.state.jobId) return;
    try {
      const status = await this.client[method](this.state.jobId);
      this.dispatch({ type: "STATUS", status });
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
      if (status.state === "COMPLETED") await this.loadResult();
      return status;
    } catch {
      return null;
    }
  }

  onProgress(payload) {
    this.dispatch({ type: "PROGRESS", progress: payload });
    this.sourceViewer.followSolveFrame(Number(payload.frame) || 0);
  }

  onPose(payload) {
    this.dispatch({ type: "POSE", pose: payload });
    if (this.state.backend === "dpvo" || !this.live.add(payload)) return;
    this.liveTrack = this.live.track();
    if (this.viewer && !this.result.refined) {
      this.viewer.setRawTrack(this.liveTrack);
      this.viewer.setRefinedTrack(this.liveTrack);
      this.viewer.setFrame(this.state.frame);
    }
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
    this.liveTrack = null;
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
    if (this.viewer || this.disposed) return this.viewer;
    this.viewer = new TrackViewer(this.$("track-canvas"), {
      onFrameCamera: (camera) => renderRows(this.$("extractor-camera"), cameraRows(camera, this.state.frame)),
    });
    this.pushTracksToViewer();
    return this.viewer;
  }

  pushTracksToViewer() {
    if (!this.viewer) return;
    const transient = this.liveTrack && !this.result.refined ? this.liveTrack : null;
    this.viewer.setRawTrack(this.result.raw || transient);
    this.viewer.setRefinedTrack(this.result.refined || transient);
    this.viewer.setMode(this.state.trackMode);
    this.viewer.setFrame(this.state.frame);
  }

  setViewerMode(mode) {
    this.dispatch({ type: "VIEWER_MODE", mode });
    if (mode !== "source") {
      this.ensureViewer();
      if (mode === "compare") this.setTrackMode("compare");
      this.viewer?.resize();
      this.viewer?.fit();
    }
  }

  setTrackMode(mode) {
    this.dispatch({ type: "TRACK_MODE", mode });
    this.viewer?.setMode(mode);
  }

  seekFromTimeline(event) {
    const canvas = this.$("quality-timeline");
    const rect = canvas.getBoundingClientRect();
    const frame = frameAtPosition(event.clientX - rect.left, rect.width, this.state.frameCount);
    this.sourceViewer.scrubTo(frame);
  }

  showFrame(frame, { fromVideo = false } = {}) {
    return showExtractorFrame(this, frame, { fromVideo });
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
      track: available.track, pause: available.pause, resume: available.resume,
      stop: available.stop, apply: available.apply,
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
    const showingTrack = mode === "track3d" || mode === "compare";
    const showingDiagnostics = mode === "compare";
    const stage = this.$("stage");
    if (stage) stage.dataset.mode = mode;
    this.$("source-video").hidden = showingTrack && !showingDiagnostics;
    this.$("upstream-preview").hidden = !this.upstreamPreviewActive || !showingSource;
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
      onAction: (frame, action) => {
        this.refine.setSpikeAction(frame, action);
        this.render();
      },
    });
    this.renderQuality();
    this.renderTimeline();
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
   * The dope sheet plus both health bands.
   *
   * Graded on the track the user is *looking at*: switching RAW/REFINED has to
   * change the MOTION band, or the panel would be grading something other than
   * what the viewer is showing.
   */
  renderTimeline() {
    return this.timeline.render({
      track: this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      quality: this.state.quality,
      frame: this.state.frame,
      frameCount: this.state.frameCount,
    });
  }

  renderQuality() {
    drawQualityTimeline(this.$("quality-timeline"), this.state.quality, this.state.frameCount, {
      currentFrame: this.state.frame,
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
    this.events.dispose();
    this.refine.dispose();
    this.sourceViewer.dispose();
    this.overlay.dispose();
    this.diagnostics.dispose();
    this.viewer?.dispose();
    this.viewer = null;
    for (const dispose of this.disposers.splice(0)) dispose();
    this.result = { raw: null, refined: null };
  }
}

function attachExtractor(node) {
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

export function registerOmniCamExtractor(target = app) {
  target.registerExtension({
    name: "Majoor.OmniCam.Extractor",
    async nodeCreated(node) {
      if (nodeClassOf(node) === EXTRACTOR_NODE_CLASS) attachExtractor(node);
    },
  });
}

registerOmniCamExtractor();
