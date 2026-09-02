import { drawUpstreamPreview, upstreamPreviewMedia } from "../shared/upstream-preview.js";
import { api } from "../comfy-runtime.js";

import { renderMonitorExecution } from "./execution-view.js";
import { canPreviewLive, liveRequestPayload } from "./live-source.js";
import { MonitorPlayer } from "./player.js";
import { describeReferenceSource, directorPlayblastSource, referenceSourceWarnLevel } from "./reference-source.js";
import { MonitorRefreshController } from "./refresh.js";
import { MonitorSourceWatcher } from "./source-sync.js";
import { loadMonitorProfileInfo, renderMonitorProfileInfo } from "./profile-info.js";
import { buildMonitorRoot } from "./template.js";
import { MONITOR_WIDGETS, monitorWidgetValues, writeMonitorWidget } from "./widget-contract.js";

//: How often a connected Director's widgets are re-read for a live preflight.
//: Independent of MonitorSourceWatcher's own poll, which only fires on a
//: *topology* change (a different node connected) -- this is what catches an
//: edit within the same connected Director (a moved key, a changed fps).
//: MonitorRefreshController's own debounce, not this interval, is what
//: actually paces the network requests; running the cheap read+diff this
//: often just keeps the lag between an edit and a scheduled request small.
const LIVE_POLL_INTERVAL_MS = 250;

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
    this.disposers = [];
    this.source = null;
    this.player = new MonitorPlayer(
      this.root.querySelector('[data-role="proxy-player"]'),
      {
        onFrame: (frame) => this.showFrame(frame),
        onMetadata: ({ frameCount }) => this.setFrameCount(frameCount),
      },
    );
    // Set before the watcher's first poll can call sourceChanged() -> liveTick().
    this.hasExecutedOnce = false;
    this._liveUnavailableText = "";
    this.refreshController = new MonitorRefreshController(api, {
      onSnapshot: (snapshot) => this.liveSnapshotReceived(snapshot),
      onError: (error) => this.liveRefreshFailed(error),
    });
    this.bindControls();
    this.syncControlsFromWidgets();
    this.loadProfileInfo();
    this.watcher = new MonitorSourceWatcher(node, (source) => this.sourceChanged(source));
    this.liveTimer = setInterval(() => this.liveTick(), LIVE_POLL_INTERVAL_MS);
  }

  async loadProfileInfo() {
    const target = this.root.querySelector('[data-role="profile-catalogue"]');
    try {
      const payload = await loadMonitorProfileInfo(api);
      renderMonitorProfileInfo(this.root, payload);
    } catch (error) {
      if (target) target.textContent = "Monitor profile information unavailable.";
      console.warn("OmniCam: Monitor profile catalog unavailable", error);
    }
  }

  listen(target, name, listener) {
    if (!target) return;
    target.addEventListener(name, listener);
    this.disposers.push(() => target.removeEventListener(name, listener));
  }

  bindControls() {
    this.listen(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle());
    this.listen(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (event) => this.player.scrub(event.target.value));
    this.listen(this.root.querySelector('[data-role="proxy-loop"]'), "change", (event) => this.player.setLoop(event.target.checked));
    this.listen(this.root.querySelector('[data-role="proxy-mute"]'), "change", (event) => this.player.setMuted(event.target.checked));
    this.listen(this.root.querySelector('[data-role="profile-select"]'), "change", (event) => {
      writeMonitorWidget(this.node, "target_profile", event.target.value);
      this.settingsChanged();
    });
    for (const control of this.root.querySelectorAll("[data-setting]")) {
      this.listen(control, "change", () => {
        writeMonitorWidget(this.node, control.dataset.setting, control.value);
        this.settingsChanged();
      });
    }
  }

  /**
   * A Monitor setting changed. A live-able Director means the next poll tick
   * (at most ``LIVE_POLL_INTERVAL_MS`` away) replaces the panel with a fresh
   * preview of the new settings, so "OUTDATED" would be true for a fraction
   * of a second and then wrong. Only mark outdated when there is no live
   * preview coming to correct it -- an executed result with nothing to
   * refresh it really has gone stale.
   */
  settingsChanged() {
    if (canPreviewLive(this.source?.sceneOrigin)) {
      this.liveTick();
    } else {
      this.markOutdated();
    }
  }

  syncControlsFromWidgets() {
    const values = monitorWidgetValues(this.node);
    const select = this.root.querySelector('[data-role="profile-select"]');
    if (values.target_profile != null) select.value = String(values.target_profile);
    for (const name of MONITOR_WIDGETS) {
      if (name === "target_profile") continue;
      const control = this.root.querySelector(`[data-setting="${name}"]`);
      if (control && values[name] != null) control.value = values[name];
    }
  }

  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = "OUTPUT OUTDATED";
  }

  sourceChanged(source) {
    this.source = source;
    const status = this.root.querySelector('[data-role="source-status"]');
    status.textContent = source.sceneConnected
      ? `${source.sceneNodeClass || "MotionScene"} connected${source.playblastConnected ? ` · playblast: ${source.playblastNodeClass || "connected"}` : " · no playblast"}`
      : "Connect a MotionScene and queue the workflow.";
    const badge = this.root.querySelector('[data-role="monitor-status"]');
    badge.dataset.state = source.sceneConnected ? "CONNECTED" : "OFFLINE";
    badge.lastChild.textContent = source.sceneConnected ? " CONNECTED" : " WAITING";
    this.refreshPlayblastPreview();
    this.liveTick();
  }

  /**
   * Read the connected Director's current widgets and, if anything actually
   * changed, schedule a debounced live preflight request. Runs on a timer
   * (LIVE_POLL_INTERVAL_MS) rather than on a widget "change" event: LiteGraph
   * widgets do not all fire one, and a camera dragged in the 3D viewport
   * never touches a DOM input at all.
   */
  liveTick() {
    // Not just the preflight: a playblast recorded (or re-recorded) after the
    // Director was already connected changes no link, so the topology
    // watcher alone would never notice it. Reading it on the same cadence as
    // the preflight is what makes a fresh recording show up without needing
    // to unplug and replug the cable.
    this.refreshPlayblastPreview();
    const origin = this.source?.sceneOrigin;
    if (!canPreviewLive(origin)) {
      this.showLiveUnavailable();
      return;
    }
    const payload = liveRequestPayload(origin, monitorWidgetValues(this.node));
    this.refreshController.schedule(payload);
  }

  liveSnapshotReceived(snapshot) {
    renderMonitorExecution(this.root, snapshot, { live: true });
  }

  liveRefreshFailed(error) {
    // Deliberately does not touch the panel: a transient network hiccup
    // should not blank out the last good preview, live or executed.
    console.warn("OmniCam: Monitor live preflight failed", error);
  }

  /**
   * Honest placeholder for the two cases a live preview cannot cover: nothing
   * connected yet, or a MotionScene from something other than a Director --
   * a third-party node whose state only exists once the graph has run.
   * Never overwrites an actual execution result; that stands until another
   * execution, or a live-able connection, replaces it.
   */
  showLiveUnavailable() {
    if (this.hasExecutedOnce) return;
    const connected = Boolean(this.source?.sceneConnected);
    const text = connected
      ? "CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight."
      : "Queue the workflow to validate the selected profile.";
    if (text === this._liveUnavailableText) return;
    this._liveUnavailableText = text;
    this.root.querySelector('[data-role="profile-preflight"]').innerHTML =
      `<div class="oc-empty">${text}</div>`;
  }

  refreshPlayblastPreview() {
    const canvas = this.root.querySelector('[data-role="proxy-upstream-preview"]');
    const empty = this.root.querySelector(".oc-player-empty");
    const origin = this.source?.playblastOrigin;
    // The Director's own recorded file always wins over reading pixels back
    // out of its DOM: that DOM is the live edit viewport -- gizmos, helpers,
    // the working camera -- not the clean proxy `playblast_video` carries.
    const directorSource = directorPlayblastSource(api, origin);
    this.updateReferenceSourceLabel(origin, directorSource);
    if (directorSource) {
      canvas.hidden = true;
      empty.hidden = true;
      this.player.setSource(directorSource.url, {
        fps: directorSource.fps,
        frameCount: directorSource.frameCount,
      });
      return;
    }

    const media = upstreamPreviewMedia(origin);
    if (!media) {
      canvas.hidden = true;
      empty.hidden = false;
      this.player.setSource("");
      return;
    }
    const isVideo = typeof HTMLVideoElement !== "undefined" && media instanceof HTMLVideoElement;
    const url = isVideo ? String(media.currentSrc || media.src || "") : "";
    if (url) {
      canvas.hidden = true;
      empty.hidden = true;
      this.player.setSource(url);
      return;
    }
    this.player.setSource("");
    drawUpstreamPreview(media, canvas, 640).then((drawn) => {
      canvas.hidden = !drawn;
      empty.hidden = drawn;
    });
  }

  updateReferenceSourceLabel(origin, directorSource) {
    const label = this.root.querySelector('[data-role="reference-source"]');
    if (!label) return;
    const text = describeReferenceSource(directorSource, origin);
    label.textContent = text;
    label.hidden = !text;
    label.dataset.warn = referenceSourceWarnLevel(directorSource, origin);
  }

  setFrameCount(frameCount) {
    const scrubber = this.root.querySelector('[data-role="proxy-scrubber"]');
    scrubber.max = Math.max(0, Number(frameCount || 1) - 1);
  }

  showFrame(frame) {
    const max = Math.max(0, Number(this.player.frameCount || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = frame;
    this.root.querySelector('[data-role="proxy-frame"]').textContent = `${frame} / ${max}`;
  }

  executed(message) {
    this.hasExecutedOnce = true;
    const result = renderMonitorExecution(this.root, message);
    if (result.targetProfile) {
      const selected = monitorWidgetValues(this.node).target_profile;
      if (selected !== result.targetProfile) this.markOutdated();
    }
  }

  dispose() {
    clearInterval(this.liveTimer);
    this.refreshController?.dispose();
    this.watcher?.dispose();
    this.player.dispose();
    for (const dispose of this.disposers.splice(0)) dispose();
  }
}

export function attachMonitor(node) {
  if (node.__majoorOmniCamMonitor) return;
  hideWidgets(node);
  const ui = new MonitorUI(node);
  node.__majoorOmniCamMonitor = ui;
  const preferredHeight = () => Math.max(620, ui.root.scrollHeight || 0);
  node.addDOMWidget("majoor_omnicam_monitor", "omnicam", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 620,
    getHeight: preferredHeight,
    getMaxHeight: preferredHeight,
  });
  // Initial and minimum sizing is centralized in main.js's nodeCreated
  // (web-src/shared/node-layout.js), which alone knows whether this is a
  // fresh node or one being restored from a saved workflow.

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
  const configured = node.onConfigure;
  node.onConfigure = function() {
    configured?.apply(this, arguments);
    ui.syncControlsFromWidgets();
  };
  const changed = node.onConnectionsChange;
  node.onConnectionsChange = function() {
    changed?.apply(this, arguments);
    ui.watcher?.poll();
    ui.refreshPlayblastPreview();
    setTimeout(() => ui.refreshPlayblastPreview(), 400);
  };
}
