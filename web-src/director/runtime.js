// Persistent, headless owner of Director canonical state -- lives for the
// full node lifetime, independent of whether a DirectorWorkbench is mounted.
// See docs/superpowers/plans/2026-09-16-director-extractor-workbench.md
// section 10 for the target contract.
//
// This is an incremental extraction (migration Task 5): OmniCamDirectorUI
// still owns the DOM/WebGL editor and still runs unchanged, but its
// `state`/`frame`/`camera`/revision counters/widget refs now live here and
// are aliased through instance accessors (see director.js), so the same
// canonical schema and the same `serializeEditorState()` codepath serve both
// the current always-mounted UI and any future headless caller (director-api,
// the Agent bridge, a closed compact shell).

import { sampleCamera, sanitizeState } from "./core.js";
import { serializeEditorState } from "../state-sync.js";

function findWidget(node, name) {
  return node.widgets?.find((widget) => widget.name === name) ?? null;
}

export class DirectorRuntime extends EventTarget {
  constructor(node, { app, api } = {}) {
    super();
    this.app = app;
    this.api = api;
    this.node = node;
    this.disposed = false;
    this.workbench = null;
    this.pendingUiDirtyMask = 0;
    this.serializeScheduled = false;
    this.serializeFrame = null;
    // Attached by director.js's attachDirector(): the bounded semantic
    // transaction layer (web-src/director-api/*) and the external Agent
    // bridge (web-src/agent/bridge.js). Both target this runtime rather than
    // the transient workbench so they keep working while the editor is
    // closed (migration plan Tasks 7-8).
    this.directorApi = null;
    this.agentBridge = null;

    this.stateWidget = findWidget(node, "state_json");
    this.recordingWidget = findWidget(node, "recording_path");
    this.cardWidget = findWidget(node, "card_asset");
    this.widthWidget = findWidget(node, "width");
    this.heightWidget = findWidget(node, "height");
    this.fpsWidget = findWidget(node, "fps");
    this.durationWidget = findWidget(node, "duration_seconds");
    this.modeWidget = findWidget(node, "render_mode");

    let parsed = null;
    try {
      parsed = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
      // Keep an empty canonical state when the stored payload is unreadable.
    }
    this.state = sanitizeState(parsed);
    // The scene "Reset" command reverts to whatever was last saved or opened;
    // the state the node mounts with is that baseline until then.
    this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state);
    this.sceneName = this.state.metadata?.scene_name || "";
    this.frame = 0;
    this.camera = sampleCamera(this.state, 0);
    this.directorRevision = 0;
    this.renderRevision = 0;
  }

  /** Small summary for the compact node shell; never a second source of truth. */
  getSnapshot() {
    const state = this.state;
    return {
      sceneName: this.sceneName || state.metadata?.scene_name || "",
      fps: state.fps,
      durationSeconds: state.fps ? state.duration_frames / state.fps : 0,
      width: state.width,
      height: state.height,
      cameraCount: state.cameras?.length ?? 0,
      objectCount: state.objects?.length ?? 0,
    };
  }

  /** Immediate, synchronous widget flush -- reuses the existing headless-safe serializer. */
  flushToWidgets({ immediate = false } = {}) {
    if (immediate) {
      cancelAnimationFrame(this.serializeFrame);
      this.serializeScheduled = false;
    }
    serializeEditorState(this);
  }

  /** Synchronous immediate flush -- what director-api's `ui.serialize?.()` call expects after a committed transaction. */
  serialize() {
    this.flushToWidgets({ immediate: true });
  }

  /** RAF-batched flush; ports the throttling OmniCamDirectorUI already relied on. */
  scheduleSerialize(reason = "state") {
    if (this.serializeScheduled) return;
    this.serializeScheduled = true;
    this.serializeFrame = requestAnimationFrame(() => {
      this.serializeScheduled = false;
      if (!this.disposed) this.flushToWidgets();
      this.dispatchEvent(new CustomEvent("statechange", { detail: { reason, revision: this.directorRevision } }));
    });
  }

  /** Apply a state mutation headlessly, whether or not a workbench is open. */
  mutate(mutator, { reason = "mutation", dirty = 0 } = {}) {
    mutator(this.state);
    this.scheduleSerialize(reason);
    if (dirty) this.requestUiUpdate(dirty, reason);
  }

  replaceState(nextState, { reason = "replace" } = {}) {
    this.state = sanitizeState(nextState);
    this.sceneName = this.state.metadata?.scene_name || "";
    this.scheduleSerialize(reason);
    this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason } }));
  }

  attachWorkbench(workbench) {
    this.workbench = workbench;
    this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: true } }));
  }

  detachWorkbench(workbench) {
    if (this.workbench !== workbench) return;
    this.workbench = null;
    this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: false } }));
  }

  /** No-op with no open workbench; the next open renders current canonical state from scratch. */
  requestUiUpdate(mask, reason) {
    this.pendingUiDirtyMask |= mask;
    this.workbench?.requestUiUpdate?.(mask, reason);
  }

  setStatus(status) {
    this.status = status;
    this.dispatchEvent(new CustomEvent("statuschange", { detail: { status } }));
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.serializeFrame);
    this.workbench = null;
  }
}
