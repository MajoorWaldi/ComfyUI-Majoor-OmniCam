// The OmniCam Monitor node's UI. Mounted inline as the node's own DOM widget
// by attachMonitor() (called from web-src/main.js's nodeCreated) -- there is
// no compact shell and no modal workbench for Monitor; the full panel is
// always on the canvas for the node's whole lifetime, disposed only when the
// node itself is removed.

import { t } from "../i18n.js";
import { drawUpstreamPreview, upstreamPreviewMedia } from "../shared/upstream-preview.js";
import { api } from "../comfy-runtime.js";

import { renderMonitorExecution } from "./execution-view.js";
import { canPreviewLive, directorLivePayload, liveRequestPayload } from "./live-source.js";
import { MonitorPlayer } from "./player.js";
import { describeReferenceSource, directorPlayblastSource, referenceSourceWarnLevel } from "./reference-source.js";
import { MonitorRefreshController } from "./refresh.js";
import { MonitorSourceWatcher } from "./source-sync.js";
import { loadMonitorProfileInfo, renderMonitorProfileInfo } from "./profile-info.js";
import { bindMonitorPreflightEvents } from "./preflight-events.js";
import { readReferenceMatrix, referencePlanToSpecs, renderReferenceMatrix } from "./reference-role-matrix.js";
import { panelWheelKeeper } from "../shared/panel-scroll.js";
import { EventScope } from "../shared/event-scope.js";
import { closeHelpPopup } from "../help/schema.js";
import { buildMonitorRoot } from "./template.js";
import { hideMonitorParameters, isH3Profile, MONITOR_WIDGETS, monitorWidgetValues, writeMonitorWidget } from "./widget-contract.js";

//: How often a connected Director's widgets are re-read for a live preflight.
//: Independent of MonitorSourceWatcher's own poll, which only fires on a
//: *topology* change (a different node connected) -- this is what catches an
//: edit within the same connected Director (a moved key, a changed fps).
//: MonitorRefreshController's own debounce, not this interval, is what
//: actually paces the network requests; running the cheap read+diff this
//: often just keeps the lag between an edit and a scheduled request small.
const LIVE_POLL_INTERVAL_MS = 250;

//: Monitor settings whose 0 means "inherit from the connected shot" rather
//: than a literal zero. Shown blank with an "auto" placeholder.
const INHERITABLE_SHOT_WIDGETS = new Set(["duration_seconds", "target_fps"]);

function hideWidgets(node) {
  hideMonitorParameters(node);
}

class MonitorUI {
  constructor(node) {
    this.node = node;
    this.root = buildMonitorRoot();
    this.events = new EventScope();
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
    this.disposed = false;
    this.connectionRefreshTimer = null;
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
      if (this.disposed) return;
      renderMonitorProfileInfo(this.root, payload);
    } catch (error) {
      if (target) target.textContent = t("Monitor profile information unavailable.");
      console.warn("OmniCam: Monitor profile catalog unavailable", error);
    }
  }

  bindControls() {
    // Wheel over a scrollable panel scrolls it instead of zooming the graph.
    this.events.on(this.root, "wheel", panelWheelKeeper(this.root));
    this.events.on(this.root.querySelector('[data-act="copy-compiled-prompt"]'), "click", (event) => this.copyCompiledPrompt(event.currentTarget));
    this.events.on(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle());
    this.events.on(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (event) => this.player.scrub(event.target.value));
    this.events.on(this.root.querySelector('[data-role="proxy-loop"]'), "change", (event) => this.player.setLoop(event.target.checked));
    this.events.on(this.root.querySelector('[data-role="proxy-mute"]'), "change", (event) => this.player.setMuted(event.target.checked));
    this.events.on(this.root.querySelector('[data-role="profile-select"]'), "change", (event) => {
      writeMonitorWidget(this.node, "target_profile", event.target.value);
      this.updateH3SetupHint(event.target.value);
      this.settingsChanged();
    });
    for (const control of this.root.querySelectorAll("[data-setting]")) {
      this.events.on(control, "change", () => {
        writeMonitorWidget(this.node, control.dataset.setting, control.value);
        this.settingsChanged();
      });
    }
    this.events.on(this.root.querySelector('[data-act="reference-matrix-add"]'), "click", () => {
      const specs = readReferenceMatrix(this.root);
      specs.push({ id: `reference_${specs.length + 1}`, media_type: "image", roles: [] });
      this.syncReferenceMatrix(specs);
    });
    const matrixRows = this.root.querySelector('[data-role="reference-matrix-rows"]');
    this.events.on(matrixRows, "click", (event) => {
      const button = event.target.closest('[data-act="reference-row-remove"]');
      if (!button) return;
      const row = button.closest('[data-role="reference-row"]');
      const rows = [...this.root.querySelectorAll('[data-role="reference-row"]')];
      const index = rows.indexOf(row);
      const specs = readReferenceMatrix(this.root);
      if (index >= 0) specs.splice(index, 1);
      this.syncReferenceMatrix(specs);
    });
    // A field edit (id/media_type/slot_hint/roles/ignore) never re-renders the
    // rows -- only add/remove change row count. Re-rendering mid-edit would
    // wipe whatever the user is typing or the <select multiple> they're
    // mid-click on.
    this.events.on(matrixRows, "change", (event) => {
      if (!event.target.closest('[data-role="reference-row"]')) return;
      this.commitReferenceMatrix(readReferenceMatrix(this.root));
    });
  }

  /** Repaints the matrix rows from `specs`, then commits. Only for add/remove. */
  syncReferenceMatrix(specs) {
    renderReferenceMatrix(this.root, specs);
    this.commitReferenceMatrix(specs);
  }

  /** Serializes `specs` into the hidden reference_plan_json widget and
   * schedules a fresh preflight, without touching the rendered rows. */
  commitReferenceMatrix(specs) {
    writeMonitorWidget(this.node, "reference_plan_json", JSON.stringify(specs));
    this.settingsChanged();
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

  updateH3SetupHint(profile) {
    const hint = this.root.querySelector('[data-role="h3-setup-hint"]');
    if (hint) hint.hidden = !isH3Profile(profile);
  }

  syncControlsFromWidgets() {
    const values = monitorWidgetValues(this.node);
    const select = this.root.querySelector('[data-role="profile-select"]');
    if (values.target_profile != null) select.value = String(values.target_profile);
    this.updateH3SetupHint(select.value);
    for (const name of MONITOR_WIDGETS) {
      if (name === "target_profile") continue;
      const control = this.root.querySelector(`[data-setting="${name}"]`);
      if (!control || values[name] == null) continue;
      // duration_seconds / target_fps use 0 as "inherit the connected shot".
      // Show that as an empty field with an "auto" placeholder, never a bare 0.
      if (INHERITABLE_SHOT_WIDGETS.has(name) && Number(values[name]) <= 0) {
        control.value = "";
      } else {
        control.value = values[name];
      }
    }
    renderReferenceMatrix(this.root, referencePlanToSpecs(values.reference_plan_json));
    this.reflectInheritedShot();
  }

  /**
   * Fill the placeholder of any "auto" (left-blank) duration / fps field with
   * the value the compile will actually inherit from the connected Director,
   * so the number is visible without being typed. Only a Director exposes its
   * shot client-side; a third-party MotionScene still compiles correctly (the
   * backend inherits from the scene) but cannot be previewed here.
   */
  reflectInheritedShot() {
    const origin = this.source?.sceneOrigin;
    const shot = canPreviewLive(origin) ? directorLivePayload(origin) : null;
    const fields = {
      duration_seconds: shot ? t("{value} (from Director)", {value: shot.duration_seconds}) : t("auto (from shot)"),
      target_fps: shot ? t("{value} (from Director)", {value: shot.fps}) : t("auto (from shot)"),
    };
    for (const [name, placeholder] of Object.entries(fields)) {
      const control = this.root.querySelector(`[data-setting="${name}"]`);
      if (control) control.placeholder = placeholder;
    }
  }

  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = t("OUTPUT OUTDATED");
  }

  async copyCompiledPrompt(button) {
    const prompt = this.root.querySelector('[data-role="compiled-prompt"]');
    if (!prompt || prompt.dataset.empty === "1") return;
    try {
      await navigator.clipboard.writeText(prompt.textContent);
    } catch {
      // Clipboard permission can legitimately be denied in an embedded
      // webview -- a silent no-op is correct here, not a panel error.
      return;
    }
    if (!button) return;
    const icon = button.querySelector("i");
    const original = icon ? icon.className : "";
    button.title = t("Copied");
    if (icon) icon.className = "pi pi-check";
    setTimeout(() => {
      button.title = t("Copy");
      if (icon) icon.className = original;
    }, 1200);
  }

  sourceChanged(source) {
    if (this.disposed) return;
    this.source = source;
    const status = this.root.querySelector('[data-role="source-status"]');
    status.textContent = source.sceneConnected
      ? t("{source} connected · {playblast}", {
        source: source.sceneNodeClass || "MotionScene",
        playblast: source.playblastConnected
          ? t("Playblast: {name}", {name: source.playblastNodeClass || t("CONNECTED")}) : t("No playblast"),
      })
      : t("Connect a MotionScene and queue the workflow.");
    const badge = this.root.querySelector('[data-role="monitor-status"]');
    badge.dataset.state = source.sceneConnected ? t("CONNECTED") : "OFFLINE";
    badge.lastChild.textContent = source.sceneConnected ? " " + t("CONNECTED") : " " + t("WAITING");
    this.reflectInheritedShot();
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
    if (this.disposed) return;
    // Not just the preflight: a playblast recorded (or re-recorded) after the
    // Director was already connected changes no link, so the topology
    // watcher alone would never notice it. Reading it on the same cadence as
    // the preflight is what makes a fresh recording show up without needing
    // to unplug and replug the cable.
    this.refreshPlayblastPreview();
    this.reflectInheritedShot();
    const origin = this.source?.sceneOrigin;
    if (!canPreviewLive(origin)) {
      this.showLiveUnavailable();
      return;
    }
    const payload = liveRequestPayload(origin, monitorWidgetValues(this.node));
    // Cheap change gate. The Director's state_json plus this Monitor's own
    // settings fully determine the request, and state_json is already a
    // reference here -- so an exact match skips schedule()'s full-payload
    // JSON.stringify (which would otherwise re-encode the entire scene four
    // times a second while nothing is being edited).
    const director = payload.director;
    const liveKey = `${director.state_json}\u0000${JSON.stringify(payload.monitor)}\u0000${director.recording_path}\u0000${director.card_asset}\u0000${director.width}x${director.height}@${director.fps}/${director.duration_seconds}:${director.render_mode}`;
    if (liveKey === this._liveKey) return;
    this._liveKey = liveKey;
    this.refreshController.schedule(payload);
  }

  liveSnapshotReceived(snapshot) {
    if (this.disposed) return;
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
      ? t("CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight.")
      : t("Queue the workflow to validate the selected profile.");
    if (text === this._liveUnavailableText) return;
    this._liveUnavailableText = text;
    this.root.querySelector('[data-role="profile-preflight"]').innerHTML =
      `<div class="oc-empty">${text}</div>`;
  }

  refreshPlayblastPreview() {
    if (this.disposed) return;
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
      if (this.disposed) return;
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

  renderResult(message, { executed = false } = {}) {
    if (executed) this.hasExecutedOnce = true;
    const result = renderMonitorExecution(this.root, message);
    if (result.targetProfile) {
      const selected = monitorWidgetValues(this.node).target_profile;
      if (selected !== result.targetProfile) this.markOutdated();
    }
  }

  executed(message) {
    this.renderResult(message, { executed: true });
  }

  blockedPreflight(message) {
    this.hasExecutedOnce = true;
    this.renderResult(message);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    clearInterval(this.liveTimer);
    clearTimeout(this.connectionRefreshTimer);
    closeHelpPopup(); // body-level popup + capture keydown, else orphaned on graph clear
    this.refreshController?.dispose();
    this.watcher?.dispose();
    this.player.dispose();
    this.events.dispose();
  }
}

export function attachMonitor(node) {
  if (node.__majoorOmniCamMonitor) return;
  hideWidgets(node);
  const ui = new MonitorUI(node);
  const disposeBlockedPreflight = bindMonitorPreflightEvents(api, node, ui);
  ui.events.add(disposeBlockedPreflight);
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
    if (ui.disposed) return;
    ui.watcher?.poll();
    ui.refreshPlayblastPreview();
    clearTimeout(ui.connectionRefreshTimer);
    ui.connectionRefreshTimer = setTimeout(() => {
      ui.connectionRefreshTimer = null;
      ui.refreshPlayblastPreview();
    }, 400);
  };
}
