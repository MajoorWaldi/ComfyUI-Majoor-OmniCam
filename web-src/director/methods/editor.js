import { applyAimConstraint } from "../../aim-constraint.js";
import { normalizePathSelection } from "../camera-path-selection.js";
import { t } from "../../i18n.js";
import { createContextMenuMethods } from "./context-menu.js";

// Smallest horizontal resolution a camera preview is rendered at.
const MIN_PREVIEW_WIDTH = 220;


function assetSignature(state) {
  return JSON.stringify({
    background: state.viewport_bg_image || "",
    sequence: state.viewport_bg_sequence || [],
    objects: (state.objects || []).map((object) => [object.id, object.type, object.asset || ""]),
  });
}

export function createEditorMethods(dependencies) {
  const { app, api, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bindEditorEvents, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, releaseAudio, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
  const contextMenuMethods = createContextMenuMethods(dependencies);
  return {
  ...contextMenuMethods,
  setSelectMode(mode) {
    if (!["object", "vertex", "edge", "face"].includes(mode)) return;
    this.state.select_mode = mode;
    this.subSelection = null;
    for (const button of this.root.querySelectorAll("[data-select-mode]")) {
      const isMode = button.dataset.selectMode === mode;
      button.classList.toggle("active", isMode);
      button.setAttribute("aria-pressed", String(isMode));
    }
    for (const select of this.root.querySelectorAll('[data-role="select-mode"]')) {
      select.value = mode;
    }
    this.serialize();
    this.syncFromWidgets();
    this.render();
    this.setStatus(`Select Mode: ${mode.toUpperCase()}`);
  },
  refreshSetupDiagnostic() {
    refreshSetupDiagnostic(this);
  },
  hideInternalWidgets() {
    for (const name of ["state_json", "recording_path", "card_asset"]) {
      const w = this.node.widgets?.find((x) => x.name === name);
      w && (w.computeSize = () => [0, -4], w.draw = () => {
      }, w.hidden = !0, w.options = { ...w.options || {}, hideInVueNodes: !0 });
    }
  },
  restoreFromWidgets() {
    restoreFromWidgets(this);
  },
  // Director modal audit Lot 5: extracted from the old inline `capture`
  // closure passed to `new EditorHistory(...)` in director.js, so the
  // persistent runtime (which now owns the EditorHistory instance -- see
  // DirectorRuntime.history) can call it whenever a workbench is attached.
  captureHistorySnapshot() {
    return JSON.stringify({
      state: this.state,
      frame: this.frame,
      selectedEntity: this.selectedEntity,
      selectedObjectId: this.selectedObjectId,
      selectedObjectIds: [...(this.selectedObjectIds || [])],
      selectedKeyFrame: this.selectedKeyFrame,
      selectedKeyFrames: [...(this.selectedKeyFrames || [])],
      subSelection: this.subSelection,
    });
  },
  restoreHistorySnapshot(snapshot) {
    const value = JSON.parse(snapshot);
    this.keyDrag?.badge?.remove?.();
    this.boxSelect?.overlay?.remove?.();
    this.drag = null;
    this.gizmoDrag = null;
    this.targetFreeDrag = null;
    this.pathDrag = null;
    this.boxSelection = null;
    this.keyDrag = null;
    this.curveDrag = null;
    this.curvePanDrag = null;
    this.curveScrub = null;
    this.curveBoxSelect = null;
    this.timelineDrag = null;
    this.timelinePanDrag = null;
    this.boxSelect = null;
    this.modalTransform = null;
    if (this.activePointerId != null) {
      try { this.interactionElement?.releasePointerCapture?.(this.activePointerId); } catch (_) {}
      this.activePointerId = null;
    }
    const previousAssets = assetSignature(this.state);
    const previousIds = new Set(this.state.objects.map((object) => object.id));
    this.state = sanitizeState(value.state);
    const nextIds = new Set(this.state.objects.map((object) => object.id));
    for (const id of previousIds) if (!nextIds.has(id)) this.removeObjectResources(id);
    this.frame = clamp(value.frame, 0, this.state.duration_frames - 1);
    const validObjectIds = new Set(this.state.objects.map((object) => object.id));
    const selectedObjectIds = Array.isArray(value.selectedObjectIds)
      ? value.selectedObjectIds
      : [value.selectedObjectId].filter(Boolean);
    this.selectedObjectIds = new Set(selectedObjectIds.filter((id) => validObjectIds.has(id)));
    this.selectedObjectId = this.selectedObjectIds.has(value.selectedObjectId)
      ? value.selectedObjectId
      : [...this.selectedObjectIds].at(-1) || null;
    this.selectedEntity = this.selectedObjectIds.size ? "object" : (value.selectedEntity || "camera");
    const validKeyFrames = new Set(this.timelineKeyframes().map((key) => key.frame));
    const selectedKeyFrames = Array.isArray(value.selectedKeyFrames)
      ? value.selectedKeyFrames
      : [value.selectedKeyFrame].filter((frame) => frame !== null && frame !== undefined);
    this.selectedKeyFrames = new Set(selectedKeyFrames.filter((frame) => validKeyFrames.has(frame)));
    this.selectedKeyFrame = this.selectedKeyFrames.has(value.selectedKeyFrame)
      ? value.selectedKeyFrame
      : [...this.selectedKeyFrames].at(-1) ?? null;
    // Path selection is transient UI state (plan section 7) and is never part
    // of the serialized history snapshot, so it must be re-derived here
    // rather than restored -- otherwise an undo/redo could leave it pointing
    // at frames/cameras that no longer exist in the restored state.
    this.pathSelection = normalizePathSelection(this.pathSelection, this.activeCameraTrack());
    this.subSelection = value.subSelection || null;
    this.camera = sampleCamera(this.state, this.frame);
    // sampleCamera alone cannot resolve a bone-level aim (bones only exist in
    // the WebGL viewport -- see aim-constraint.js). Without this, undoing or
    // redoing any edit snapped a bone-tracked camera's target back to the
    // plain object-centre resolution for one frame, until the next scrub
    // corrected it -- a real constraint never shows a stale value like that.
    applyAimConstraint(this, this.activeCameraTrack(), this.camera, this.frame);
    this.cameraPreviewSignature = "";
    this.serialize();
    if (previousAssets !== assetSignature(this.state)) this.restoreAssets();
    this.refreshObjects();
    this.refreshKeys();
    this.refreshInspector();
    this.render();
  },
  checkpoint(label) {
    this.history.checkpoint(label);
  },
  undo() {
    const label = this.history.undo();
    label && this.setStatus(`Undo: ${label}`);
  },
  redo() {
    const label = this.history.redo();
    label && this.setStatus(`Redo: ${label}`);
  },
  bindEditorEvents() {
    bindEditorEvents(this);
  },
  bindWidgetCallbacks() {
    bindWidgetCallbacks(this);
  },
  syncFromWidgets(persist = !0) {
    syncFromWidgets(this, persist);
  },
  serialize() {
    serializeEditorState(this);
  },
  activeCameraTrack() {
    return activeCameraTrack(this);
  },
  playblastCameraTrack() {
    return playblastCameraTrack(this);
  },
  syncActiveCameraTrack() {
    syncActiveCameraTrack(this);
  },
  refreshCameraSelectors() {
    refreshCameraSelectors(this);
  },
  refreshCameraPreviews() {
    refreshCameraPreviews(this);
  },
  addCamera() {
    addCamera(this);
  },
  async renameCamera(id) {
    return renameCamera(this, id);
  },
  duplicateCamera(id) {
    duplicateCamera(this, id);
  },
  async deleteCamera(id) {
    return deleteCamera(this, id);
  },
  activateCamera(id) {
    activateCamera(this, id);
  },
  setPlayblastCamera(id) {
    setPlayblastCamera(this, id);
  },

  scheduleResizeAndRender() {
    if (this.resizeScheduled) return;
    this.resizeScheduled = true;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeScheduled = false;
      if (this.disposed) return;
      this.resizeCanvas();
      this.render();
    });
  },
  // Re-fit the LiteGraph node to the DOM widget's current content height. The
  // DOM widget reports Math.max(700, root.scrollHeight) from getHeight(), but
  // ComfyUI only re-reads that on a layout pass -- so a resizable panel that
  // just grew (the Outliner list, the camera-preview strip) needs to ask for
  // one explicitly or the node clips the taller content behind a scrollbar.
  //
  // Hosted in the WorkbenchHost modal, growing the underlying graph node is a
  // pure side effect (the modal's box is independent of node.size) that used
  // to silently resize the saved node from dragging an internal splitter.
  // Skip that part there; the .viewport-wrap ResizeObserver (editor-global.js)
  // already repaints the viewport/canvas for both paths (Lot 4).
  refitNode() {
    if (this.disposed) return;
    const node = this.node;
    if (!this.root?.closest?.(".oc-workbench-content")) {
      try {
        if (node && typeof node.computeSize === "function" && typeof node.setSize === "function") {
          const size = node.computeSize();
          if (Array.isArray(size)) node.setSize([node.size?.[0] ?? size[0], size[1]]);
        }
        node?.graph?.setDirtyCanvas?.(true, true);
      } catch (_) {}
    }
    this.scheduleResizeAndRender();
  },
  resizeCanvas() {
    const wrap = this.root.querySelector(".viewport-wrap");
    if (!wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const clientW = wrap.clientWidth || 320;
    const clientH = wrap.clientHeight || 180;
    const w = Math.max(320, Math.round(clientW * dpr));
    const h = Math.max(180, Math.round(clientH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    for (const canvas of this.cameraPreviewCanvases.values()) {
      const cw = canvas.clientWidth || 220;
      const ch = canvas.clientHeight || 124;
      // The floor used to be applied per axis -- max(220, w) by max(140, h) --
      // which changed the aspect ratio whenever one axis hit it: a 216x122
      // tile became a 220x140 buffer, so the preview showed a framing the
      // render would never produce. One scale factor for both axes instead.
      const scale = Math.max(dpr, MIN_PREVIEW_WIDTH / Math.max(1, cw));
      const previewWidth = Math.max(1, Math.round(cw * scale));
      const previewHeight = Math.max(1, Math.round(ch * scale));
      if (canvas.width !== previewWidth || canvas.height !== previewHeight) {
        canvas.width = previewWidth;
        canvas.height = previewHeight;
      }
    }
    this.drawCurveEditor();
  }
  };
}
