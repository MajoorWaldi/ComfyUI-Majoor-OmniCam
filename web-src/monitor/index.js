import { drawUpstreamPreview, upstreamPreviewMedia } from "../shared/upstream-preview.js";
import { api } from "../comfy-runtime.js";

import { renderMonitorExecution } from "./execution-view.js";
import { MonitorPlayer } from "./player.js";
import { MonitorSourceWatcher } from "./source-sync.js";
import { loadMonitorProfileInfo, renderMonitorProfileInfo } from "./profile-info.js";
import { buildMonitorRoot } from "./template.js";
import { MONITOR_WIDGETS, monitorWidgetValues, writeMonitorWidget } from "./widget-contract.js";

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
    this.bindControls();
    this.syncControlsFromWidgets();
    this.loadProfileInfo();
    this.watcher = new MonitorSourceWatcher(node, (source) => this.sourceChanged(source));
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
      this.markOutdated();
    });
    for (const control of this.root.querySelectorAll("[data-setting]")) {
      this.listen(control, "change", () => {
        writeMonitorWidget(this.node, control.dataset.setting, control.value);
        this.markOutdated();
      });
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
  }

  refreshPlayblastPreview() {
    const canvas = this.root.querySelector('[data-role="proxy-upstream-preview"]');
    const empty = this.root.querySelector(".oc-player-empty");
    const media = upstreamPreviewMedia(this.source?.playblastOrigin);
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
    const result = renderMonitorExecution(this.root, message);
    if (result.targetProfile) {
      const selected = monitorWidgetValues(this.node).target_profile;
      if (selected !== result.targetProfile) this.markOutdated();
    }
  }

  dispose() {
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
  node.setSize([Math.max(node.size?.[0] || 0, 720), Math.max(node.size?.[1] || 0, 700)]);

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
