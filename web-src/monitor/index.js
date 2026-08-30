import { api } from "../comfy-runtime.js";
import { sampleCamera } from "../director/core.js";
import { annotatedAssetUrl } from "../shared/managed-assets.js";
import { drawUpstreamPreview, upstreamPreviewMedia } from "../shared/upstream-preview.js";
import { ReadOnlyTrackTimelineHost } from "../timeline/read-only-track.js";

import { renderAdapterDetails } from "./adapter-view.js";
import { renderHealth } from "./health-view.js";
import { executionFingerprint, outputState } from "./output-state.js";
import { MonitorPlayer } from "./player.js";
import { renderPreflight } from "./preflight-view.js";
import { renderPreview } from "./preview.js";
import { MonitorRefreshController } from "./refresh.js";
import { TrackSourceWatcher } from "./source-sync.js";
import { linkedOrigin } from "../graph-links.js";
import { createMonitorState, reduceMonitorState } from "./state.js";
import { buildMonitorRoot } from "./template.js";
import { bindTextPanels } from "./text-panels.js";

const INTEGER_SETTINGS = new Set(["width", "height", "length", "point_count", "ltx_max_frames"]);
const SETTING_NAMES = [
  "base_prompt", "video_ref_token", "width", "height", "length",
  "point_count", "distribution", "ltx_max_frames", "ltx_sampling_mode",
];
// Controls shown until a snapshot states which ones this adapter uses.
const DEFAULT_FIELDS = ["base_prompt", "width", "height", "length"];

function widget(node, name) {
  return node.widgets?.find((item) => item.name === name);
}

function hideWidgets(node) {
  for (const item of node.widgets || []) {
    item.computeSize = () => [0, -4];
    item.draw = () => {};
    item.hidden = true;
    item.options = { ...(item.options || {}), hideInVueNodes: true };
  }
}

class MonitorUI {
  constructor(node) {
    this.node = node;
    this.root = buildMonitorRoot();
    this.state = createMonitorState();
    this.source = null;
    this.executedFingerprint = "";
    this.disposers = [];
    this.textPanels = bindTextPanels(this.root);
    this.player = new MonitorPlayer(
      this.root.querySelector('[data-role="proxy-player"]'),
      { onFrame: (frame) => this.showFrame(frame) },
    );
    this.timeline = new ReadOnlyTrackTimelineHost(
      this.root.querySelector('[data-role="monitor-track-timeline"]'),
      { onSeek: (frame) => { this.player.scrub(frame); this.showFrame(frame); } },
    );
    this.refreshController = new MonitorRefreshController(api, {
      onSnapshot: (snapshot) => this.acceptSnapshot(snapshot),
      onError: (error) => this.setError(error),
    });
    this.bindControls();
    this.syncControlsFromWidgets();
    this.watcher = new TrackSourceWatcher(node, (source) => this.sourceChanged(source));
  }

  listen(target, name, listener) {
    if (!target) return;
    target.addEventListener(name, listener);
    this.disposers.push(() => target.removeEventListener(name, listener));
  }

  bindControls() {
    this.listen(this.root.querySelector('[data-act="monitor-refresh"]'), "click", () => this.requestSnapshot(true));
    this.listen(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle());
    this.listen(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (event) => this.player.scrub(event.target.value));
    this.listen(this.root.querySelector('[data-role="proxy-loop"]'), "change", (event) => this.player.setLoop(event.target.checked));
    this.listen(this.root.querySelector('[data-role="proxy-mute"]'), "change", (event) => this.player.setMuted(event.target.checked));
    this.listen(this.root.querySelector('[data-role="adapter-select"]'), "change", (event) => {
      this.writeWidget("adapter", event.target.value);
      this.markChanged();
    });
    for (const control of this.root.querySelectorAll("[data-setting]")) {
      this.listen(control, "change", () => {
        this.writeWidget(control.dataset.setting, control.value);
        this.markChanged();
      });
    }
    this.listen(this.root.querySelector('[data-role="live-sync"]'), "change", () => {
      if (this.liveSync()) this.requestSnapshot();
    });
  }

  syncControlsFromWidgets() {
    const adapter = widget(this.node, "adapter");
    if (adapter) this.root.querySelector('[data-role="adapter-select"]').value = adapter.value;
    for (const name of SETTING_NAMES) {
      const item = widget(this.node, name);
      const control = this.root.querySelector(`[data-setting="${name}"]`);
      if (item && control) control.value = item.value ?? "";
    }
  }

  writeWidget(name, value) {
    const item = widget(this.node, name);
    if (!item) return;
    item.value = INTEGER_SETTINGS.has(name) ? Number(value) : value;
    item.callback?.(item.value);
  }

  liveSync() {
    return this.root.querySelector('[data-role="live-sync"]').checked;
  }

  settings() {
    return Object.fromEntries(SETTING_NAMES.map((name) => [name, widget(this.node, name)?.value]));
  }

  adapter() {
    const selected = this.root.querySelector('[data-role="adapter-select"]').value;
    return String(widget(this.node, "adapter")?.value || selected || "h3");
  }

  sourceChanged(source) {
    this.source = source;
    if (!source.connected) {
      this.state = reduceMonitorState(this.state, { type: "OFFLINE" });
      this.player.setSource("");
      this.timeline.render({ track: null, frame: 0, frameCount: 1 });
      this.renderStatus();
      this.refreshProxyUpstreamPreview();
      return;
    }
    if (!source.resolved) {
      // A producer whose track only exists at execution time (Extractor, or a
      // third-party node). The graph is valid, so this is not OFFLINE -- there
      // is simply nothing to preview until the prompt runs.
      this.state = reduceMonitorState(this.state, { type: "CONNECTED" });
      this.player.setSource("");
      this.timeline.render({ track: null, frame: 0, frameCount: 1 });
      this.renderStatus();
      this.refreshProxyUpstreamPreview();
      return;
    }
    const video = this.root.querySelector('[data-role="proxy-player"]');
    this.player.fps = source.track.fps;
    this.player.durationFrames = source.track.duration_frames;
    this.player.setSource(annotatedAssetUrl(api, source.recordingPath));
    video.nextElementSibling.hidden = Boolean(source.recordingPath);
    const scrubber = this.root.querySelector('[data-role="proxy-scrubber"]');
    scrubber.max = Math.max(0, source.track.duration_frames - 1);
    scrubber.value = 0;
    this.showFrame(0);
    this.markChanged();
    this.refreshProxyUpstreamPreview();
  }

  /**
   * Monitor's proxy player only ever shows a managed file reached through a
   * connected Director's recording_path. When that path is empty -- no
   * playblast recorded yet -- fall back to whatever the node actually wired
   * to `proxy_video` has already rendered into its own DOM: the same
   * client-only trick Extractor and Director use for a source that is not a
   * managed file yet.
   */
  refreshProxyUpstreamPreview() {
    const canvas = this.root.querySelector('[data-role="proxy-upstream-preview"]');
    if (!canvas) return;
    if (this.source?.recordingPath) { canvas.hidden = true; return; }
    const input = (this.node.inputs || []).find((item) => item.name === "proxy_video");
    const graph = this.node.graph;
    const origin = input?.link != null ? linkedOrigin(graph, input.link) : null;
    const media = origin ? upstreamPreviewMedia(origin) : null;
    if (!media) { canvas.hidden = true; return; }
    drawUpstreamPreview(media, canvas, 640).then((drawn) => {
      canvas.hidden = !drawn;
      if (drawn) this.root.querySelector('[data-role="proxy-player"]').nextElementSibling.hidden = true;
    });
  }

  markChanged() {
    this.state = reduceMonitorState(this.state, { type: "SOURCE_CHANGED" });
    this.renderStatus();
    if (this.liveSync()) this.requestSnapshot();
  }

  /**
   * What the queue will actually be judged on.
   *
   * `proxy_available` used to be `Boolean(recordingPath)` -- the Director's
   * playblast path -- so a VIDEO node wired straight into `proxy_video` was
   * reported as "no proxy" on a graph that executes fine. Four different
   * things were being conflated: the socket being connected, a preview being
   * drawable, a managed file existing, and a Director playblast existing.
   */
  proxyPayload() {
    const facts = { ...(this.source?.proxy || { available: false }) };
    if (this.source?.recordingPath) {
      facts.available = true;
      facts.source = "director_playblast";
      // A managed playblast was rendered by the Director at the track's own
      // rate, which is the one frame rate the client can state honestly.
      if (this.source?.track?.fps) facts.fps = Number(this.source.track.fps);
      if (this.source?.track?.duration_frames && this.source?.track?.fps) {
        facts.frame_count = Number(this.source.track.duration_frames);
        facts.duration_seconds = Number(this.source.track.duration_frames) / Number(this.source.track.fps);
      }
    }
    return facts;
  }

  payload() {
    return {
      track: this.source?.track,
      adapter: this.adapter(),
      proxy: this.proxyPayload(),
      settings: this.settings(),
    };
  }

  requestSnapshot(immediate = false) {
    if (!this.source?.resolved) return;
    this.state = reduceMonitorState(this.state, { type: "REFRESHING" });
    this.renderStatus();
    if (immediate) this.refreshController.refresh(this.payload());
    else this.refreshController.schedule(this.payload());
  }

  acceptSnapshot(snapshot) {
    this.state = reduceMonitorState(this.state, { type: "SNAPSHOT", snapshot });
    this.renderSnapshot(snapshot);
    this.renderStatus();
  }

  setError(error) {
    this.state = reduceMonitorState(this.state, { type: "ERROR", error });
    this.renderStatus();
  }

  renderStatus() {
    const badge = this.root.querySelector('[data-role="monitor-status"]');
    badge.dataset.state = this.state.status;
    badge.lastChild.textContent = ` ${this.state.status}`;
    this.root.querySelector('[data-role="source-status"]').textContent = this.sourceSummary();
    this.root.querySelector('[data-role="output-status"]').textContent = outputState(
      this.state.fingerprint,
      this.executedFingerprint,
    );
  }

  sourceSummary() {
    if (!this.source?.connected) return "Connect an OmniCam camera track.";
    const proxy = this.source.proxy || {};
    const proxyLabel = proxy.available
      ? `proxy: ${this.source.recordingPath ? "Director playblast" : proxy.source || "connected"}`
      : "no proxy connected";
    if (!this.source.resolved) {
      const origin = this.source.nodeClass || "upstream node";
      return `${origin} connected · track resolves at execution · ${proxyLabel}`;
    }
    const { duration_frames: frames, fps } = this.source.track;
    return `${this.source.nodeClass || "Track"} connected · ${frames} frames · ${fps} fps · ${proxyLabel}`;
  }

  /** Show only the controls this adapter actually consumes. */
  applyAdapterFields(fields) {
    const shown = new Set(fields && fields.length ? fields : DEFAULT_FIELDS);
    for (const field of this.root.querySelectorAll("[data-field]")) {
      field.hidden = !shown.has(field.dataset.field);
    }
  }

  renderSnapshot(snapshot) {
    this.applyAdapterFields(snapshot?.adapter?.settings);
    const proxyCard = this.root.querySelector('[data-role="proxy-card"]');
    // The proxy monitor is meaningful only where a reference clip is the
    // control path; for Wan Camera and the trajectory adapters it is noise.
    if (proxyCard) proxyCard.hidden = !snapshot?.adapter?.requires_proxy;
    renderHealth(this.root.querySelector('[data-role="camera-health"]'), snapshot.health);
    renderPreflight(this.root.querySelector('[data-role="adapter-preflight"]'), snapshot.preflight);
    renderPreview(this.root.querySelector('[data-role="adapter-preview"]'), snapshot.preview);
    renderAdapterDetails(this.root.querySelector('[data-role="adapter-details"]'), snapshot);
    this.textPanels.render(snapshot);
  }

  showFrame(frame) {
    const max = Math.max(0, (this.source?.track?.duration_frames || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = frame;
    this.root.querySelector('[data-role="proxy-frame"]').textContent = `${frame} / ${max}`;
    const camera = this.source?.track ? sampleCamera(this.source.track, frame) : null;
    this.timeline.render({
      track: this.source?.track || null,
      frame,
      frameCount: this.source?.track?.duration_frames || 1,
    });
    this.root.querySelector('[data-role="camera-readout"]').textContent = camera
      ? `Position ${camera.position.map((value) => Number(value).toFixed(2)).join(", ")} · Target ${camera.target.map((value) => Number(value).toFixed(2)).join(", ")} · FOV ${Number(camera.fov).toFixed(1)}° · Roll ${Number(camera.roll || 0).toFixed(1)}°`
      : "Camera data unavailable";
  }

  executed(message) {
    this.executedFingerprint = executionFingerprint(message);
    this.renderStatus();
  }

  dispose() {
    this.watcher?.dispose();
    this.refreshController.dispose();
    this.player.dispose();
    this.timeline.dispose();
    this.textPanels.dispose();
    for (const dispose of this.disposers.splice(0)) dispose();
  }
}

// Called by web-src/main.js once the Monitor chunk has loaded. This module has
// no startup side effects, which is what keeps it out of the eager chunk.
export function attachMonitor(node) {
  if (node.__majoorOmniCamMonitor) return;
  hideWidgets(node);
  const ui = new MonitorUI(node);
  node.__majoorOmniCamMonitor = ui;
  const preferredHeight = () => Math.max(680, ui.root.scrollHeight || 0);
  node.addDOMWidget("majoor_omnicam_monitor", "omnicam", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 680,
    getHeight: preferredHeight,
    getMaxHeight: preferredHeight,
  });
  node.setSize([Math.max(node.size?.[0] || 0, 760), Math.max(node.size?.[1] || 0, 760)]);
  const removed = node.onRemoved;
  node.onRemoved = function() {
    ui.dispose();
    removed?.apply(this, arguments);
  };
  const executed = node.onExecuted;
  node.onExecuted = function(message) {
    executed?.apply(this, arguments);
    ui.executed(message);
  };
  const changed = node.onConnectionsChange;
  node.onConnectionsChange = function() {
    changed?.apply(this, arguments);
    ui.watcher?.poll();
    ui.refreshProxyUpstreamPreview();
    // A just-picked upstream image can still be mid-decode: one more look
    // shortly after catches the client-only preview once it finishes.
    setTimeout(() => ui.refreshProxyUpstreamPreview(), 400);
  };
}

