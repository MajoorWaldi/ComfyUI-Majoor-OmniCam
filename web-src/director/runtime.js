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

import { clamp, sampleCamera, sanitizeState } from "./core.js";
import { serializeEditorState } from "../state-sync.js";
import { EditorHistory } from "./history.js";

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
    // Owned by director/shell.js: guards the lazy workbench import against a
    // rapid open/close race (migration plan section 29), and defers a media/
    // widget resync that arrives while no workbench is open to attach.
    this.workbenchGeneration = 0;
    this.pendingUpstreamResync = false;

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
    // Best-effort still frame of the active camera's viewport, captured by
    // director/shell.js at workbench-close time only. Pure in-memory visual
    // convenience for the compact shell -- never serialized, starts empty
    // again after a reload until the workbench has been opened and closed
    // once.
    this.previewDataUrl = null;
    // URL of this Director's own recorded playblast (directorPlayblastSource
    // resolves `recording_path` to an asset URL), refreshed by director/
    // shell.js's refreshDirectorPreview() at the same workbench-close moment.
    // When set, the compact shell plays this instead of previewDataUrl above
    // (updateShell() in director/shell.js decides). Also pure in-memory,
    // never serialized.
    this.previewVideoUrl = null;
    // Director modal audit Lot 5: owned here (not by the transient workbench)
    // so the undo/redo stack survives a close+reopen within the same node
    // session -- previously a fresh, empty EditorHistory was created every
    // time a workbench mounted, silently dropping the whole undo stack even
    // though the document itself (this.state) was already preserved. Capture/
    // restore delegate to whichever workbench is currently attached (the rich
    // path: it also needs to reconcile transient drag/WebGL state and refresh
    // the DOM) and fall back to a state-only snapshot headlessly, matching the
    // existing no-op-headlessly policy documented on checkpoint() below.
    this.history = new EditorHistory({
      capture: () => this.workbench?.captureHistorySnapshot?.() ?? JSON.stringify({ state: this.state, frame: this.frame }),
      restore: (snapshot) => {
        if (this.workbench) return this.workbench.restoreHistorySnapshot(snapshot);
        const value = JSON.parse(snapshot);
        this.state = sanitizeState(value.state);
        this.frame = clamp(value.frame, 0, this.state.duration_frames - 1);
        this.camera = sampleCamera(this.state, this.frame);
      },
    });
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
      previewDataUrl: this.previewDataUrl,
      isDirty: this.isDirty,
    };
  }

  /**
   * True once the serialized state_json widget has drifted from
   * sceneBaseline -- the same "last saved or opened" snapshot scene-library.js
   * already maintains for Reset Scene (New/Open/Save/Reset all refresh it).
   * Widget value lags a live edit by at most one RAF (scheduleSerialize), so
   * this is accurate to within a frame, never a second source of truth.
   */
  get isDirty() {
    if (!this.stateWidget) return false;
    return (this.stateWidget.value ?? "") !== (this.sceneBaseline ?? "");
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

  /**
   * The state-only half of state-sync.js's restoreFromWidgets(): re-parses
   * state_json and re-samples the camera, without any of the DOM/asset/
   * history reconciliation that function also does. Used by director/shell.js
   * when a graph configure/reconfigure lands while no workbench is attached;
   * the workbench runs the full DOM-aware restore instead when one is open.
   */
  restoreFromWidgetsHeadless() {
    let parsed = null;
    try {
      parsed = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
      // Keep the current state when the stored payload is unreadable.
    }
    this.state = sanitizeState(parsed);
    this.camera = sampleCamera(this.state, Math.min(this.frame, this.state.duration_frames - 1));
    this.sceneBaseline = this.stateWidget?.value ?? this.sceneBaseline;
    this.sceneName = this.state.metadata?.scene_name || "";
    this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: "restore" } }));
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

  /**
   * Forwards to the open workbench's undo-history checkpoint when one is
   * attached; a no-op headlessly. director-api transactions call this
   * unconditionally (`ui.checkpoint?.()`) so a committed edit is still one
   * undo step while the workbench is open, exactly as before this migration.
   */
  checkpoint(description) {
    this.workbench?.checkpoint?.(description);
  }

  setStatus(status) {
    this.status = status;
    this.dispatchEvent(new CustomEvent("statuschange", { detail: { status } }));
    // Also write through to the workbench's own status line when open, so a
    // director-api transaction's `ui.setStatus?.()` call (bound to this
    // runtime) still updates the visible editor immediately.
    this.workbench?.setStatus?.(status);
  }

  /** Forwards asset/media disposal to the open workbench; a no-op headlessly (deferred until next open). */
  removeObjectResources(objectId) {
    this.workbench?.removeObjectResources?.(objectId);
  }

  /** Forwards asset resource reconciliation to the open workbench; a no-op headlessly. */
  async restoreAssets() {
    return this.workbench?.restoreAssets?.();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.serializeFrame);
    this.workbench = null;
  }
}
