// The Director UI, loaded on demand by web-src/main.js when a Director node is
// created. Registration, preferences and locales live in main.js; this module
// must stay free of startup side effects so it can stay out of the eager chunk.
import { app, api } from "./comfy-runtime.js";
import { configureDirectorViewports } from "./settings.js";
import { EditorHistory } from "./omnicam-history.js";
import { ContextMenuController, initializeTooltips, promptText } from "./director/ui-services.js";
import { ObjectUrlRegistry } from "./omnicam-media.js";
import { buildRoot } from "./omnicam-template.js";
import { dispatchDirectorKey } from "./omnicam-commands.js";
import {
  activeCameraTrack,
  bindWidgetCallbacks,
  playblastCameraTrack,
  restoreFromWidgets,
  serializeEditorState,
  syncActiveCameraTrack,
  syncFromWidgets
} from "./omnicam-state-sync.js";
import { bind } from "./omnicam-event-bindings.js";
import {
  activateCamera,
  addCamera,
  deleteCamera,
  drawPreviewOverlays,
  duplicateCamera,
  maximizeCameraPreview,
  refreshCameraPreviews,
  refreshCameraSelectors,
  renameCamera,
  setPlayblastCamera,
  toggleCameraView
} from "./omnicam-cameras.js";
import { captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame } from "./omnicam-record.js";
import { computeAudioPeaks, loadAudioFile, stopPlay, togglePlay } from "./omnicam-playback-transport.js";
import { applyCameraPreset, applyCameraShake, applyProxyPreset } from "./omnicam-motion-presets.js";
import { clearViewportBgImage, configureBackgroundManager, loadViewportBgFile, loadViewportBgSequence } from "./omnicam-background-manager.js";
import {
  drawCameraPath,
  drawCard,
  drawCube,
  drawGrid,
  drawHuman,
  drawLine3D,
  drawNull,
  drawOverlays,
  drawPointField,
  drawSpeedHeatmap,
  drawSphere,
} from "./omnicam-viewport-overlays.js";
import {
  curveChannels,
  drawCurveEditor,
  onCurvePointerDown,
  onCurvePointerMove,
  onCurvePointerUp,
  onTimelinePointerDown,
  onTimelinePointerMove,
  onTimelinePointerUp,
  refreshKeys,
  resetCurveZoom,
  resetTimelineZoom,
  setChannelFilter,
  setCurveInterpolation,
  setTangentMode,
  timelineFrameFromEvent,
  toggleCurveHandles,
  zoomCurve
} from "./omnicam-timeline.js";
import {
  drawTransformGizmo,
  frameTarget,
  gizmoAxes,
  gizmoGeometry,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  pickGizmo,
  pickSceneObject,
  resetCamera,
  setTransformMode,
  setViewMode,
  viewportCamera
} from "./omnicam-viewport-controls.js";
import {
  loadCardFile,
  loadExecutionPreview,
  loadMediaUrl,
  loadModelFile,
  loadSelectedReference,
  onModelLoaded,
  restoreAssets,
  syncUpstreamInputs
} from "./omnicam-dom-media.js";
import { configureDomMedia } from "./omnicam-dom-media.js";
import { refreshSetupDiagnostic } from "./omnicam-diagnostics.js";
import {
  addMediaCard,
  addPrimitive,
  applyObjectAnimationFrame,
  beginCameraEdit,
  beginObjectEdit,
  commitCameraEdit,
  commitObjectEdit,
  copyKeyframe,
  deleteKeyframe,
  deleteObject,
  duplicateObject,
  exitKeyEdit,
  finishCameraEdit,
  goToAdjacentKey,
  insertKeyframe,
  loadSelectedKeyView,
  pasteKeyframe,
  playblastCameraAtFrame,
  refreshInspector,
  refreshKeyEditor,
  refreshObjects,
  removeObjectResources,
  renameObject,
  retimeSelectedKey,
  selectKeyframe,
  selectedKeyframe,
  selectedObject,
  selectObjectAnimation,
  setKeyInterpolation,
  setObjectParent,
  timelineKeyframes,
  timelineObject,
  toggleAutoKey,
  toggleObject,
  updateCameraFromHud,
  updateCameraRotationFromHud,
  updateEditState,
  updateKeyVisualState,
  updateSelectedKey,
  updateSelectedObject
} from "./omnicam-scene.js";
import { createEditorMethods } from "./director/methods/editor.js";
import { createSceneMethods } from "./director/methods/scene.js";
import { createInteractionMethods } from "./director/methods/interaction.js";
import { createRenderMethods } from "./director/methods/render.js";
import {
  clamp,
  cloneCamera,
  configureCore,
  defaultCamera,
  sampleCamera,
  sampleObjectTransform,
  sanitizeState,
  worldTransform

} from "./director/core.js";
configureCore({ api });
configureDomMedia({ api });
configureBackgroundManager({ api });
class OmniCamDirectorUI {
  constructor(node) {
    this.app = app, this.node = node, this.root = buildRoot(), this.root.tabIndex = -1, this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 });
    this.disposed = false;
    this.renderRevision = 0;
    // three.js and mediabunny total ~1.4 MB and nothing outside the viewport
    // needs them, so they load on demand here rather than at module scope --
    // ComfyUI would otherwise parse them at startup for every user, including
    // those who never place a Director. Every read of these two fields is
    // null-guarded and render() already has a Canvas 2-D fallback path, so the
    // first frames simply draw without WebGL until loadWebGLViewports() swaps
    // the real viewports in and repaints.
    this.webgl = null;
    this.cameraWebgl = null;
    this.webglReady = this.loadWebGLViewports();
    this.stateWidget = node.widgets?.find((w) => w.name === "state_json"), this.recordingWidget = node.widgets?.find((w) => w.name === "recording_path"), this.cardWidget = node.widgets?.find((w) => w.name === "card_asset"), this.widthWidget = node.widgets?.find((w) => w.name === "width"), this.heightWidget = node.widgets?.find((w) => w.name === "height"), this.fpsWidget = node.widgets?.find((w) => w.name === "fps"), this.durationWidget = node.widgets?.find((w) => w.name === "duration_seconds"), this.modeWidget = node.widgets?.find((w) => w.name === "render_mode");
    let parsed = null;
    try {
      parsed = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = sanitizeState(parsed), this.frame = 0, this.camera = sampleCamera(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.objectUrls = new ObjectUrlRegistry(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.contextMenu = new ContextMenuController(this.root), this.history = new EditorHistory({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedObjectIds: [...(this.selectedObjectIds || [])], selectedKeyFrame: this.selectedKeyFrame, selectedKeyFrames: [...(this.selectedKeyFrames || [])], subSelection: this.subSelection }), restore: (snapshot) => this.restoreHistorySnapshot(snapshot) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bind(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(),
      // Seed every frame-derived readout (timecode, lens millimetres, viewport
      // zoom, dope rows) instead of waiting for the first scrub.
      this.setFrame(this.frame, false, true);
  }
  /** Load the WebGL viewports, then repaint with them. Never rejects. */
  async loadWebGLViewports() {
    let OmniWebGLViewport;
    try {
      ({ OmniWebGLViewport } = await import("./omnicam-webgl.js"));
    } catch (error) {
      console.warn("OmniCam WebGL unavailable; using Canvas fallback", error);
      return;
    }
    if (this.disposed) return;
    try {
      this.webgl = new OmniWebGLViewport(() => this.render(), (model) => this.onModelLoaded(model));
    } catch (error) {
      console.warn("OmniCam WebGL unavailable; using Canvas fallback", error), this.webgl = null;
    }
    try {
      this.cameraWebgl = new OmniWebGLViewport(() => this.renderCameraView(), () => {
      });
    } catch (error) {
      console.warn("OmniCam Camera View unavailable", error), this.cameraWebgl = null;
    }
    // dispose() may have run while the import was in flight; it saw no
    // viewports to tear down, so release them here instead of leaking a
    // WebGL context.
    if (this.disposed) {
      this.webgl?.dispose(), this.cameraWebgl?.dispose();
      this.webgl = this.cameraWebgl = null;
      return;
    }
    // applyDirectorDefaults already ran, on a node that had no viewports yet.
    configureDirectorViewports(this);
    this.resizeCanvas(), this.render(), this.renderCameraView();
  }
}
const directorDependencies = { app, api, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bind, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateCameraRotationFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform };
Object.assign(
  OmniCamDirectorUI.prototype,
  createEditorMethods(directorDependencies),
  createSceneMethods(directorDependencies),
  createInteractionMethods(directorDependencies),
  createRenderMethods(directorDependencies),
);
function recordDirectorTrace(stage, node) {
  const trace = globalThis.__majoorOmniCamCiTrace;
  if (!Array.isArray(trace)) return;
  trace.push({ stage, nodeId: node?.id ?? null, nodeClass: node?.comfyClass ?? node?.type ?? null });
}
export function attachDirector(node) {
  if (node.__majoorOmniCam) return;
  recordDirectorTrace("director:attach:start", node);
  recordDirectorTrace("director:constructor:start", node);
  const ui = new OmniCamDirectorUI(node);
  recordDirectorTrace("director:constructor:complete", node);
  node.__majoorOmniCam = ui;
  recordDirectorTrace("director:marker:assigned", node);
  ui.hideInternalWidgets();
  const preferredHeight = () => Math.max(700, ui.root.scrollHeight || 0);
  ui.domWidget = node.addDOMWidget("majoor_omnicam_viewport", "omnicam", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 700,
    getHeight: preferredHeight,
    getMaxHeight: () => preferredHeight(),
    afterResize: () => {
      ui.scheduleResizeAndRender();
    }
  });
  // Initial and minimum sizing is centralized in main.js's nodeCreated
  // (web-src/shared/node-layout.js), which alone knows whether this is a
  // fresh node or one being restored from a saved workflow.
  const originalResize = node.onResize;
  node.onResize = function() {
    originalResize?.apply(this, arguments);
    ui.scheduleResizeAndRender();
  };
  const originalConfigure = node.onConfigure;
  node.onConfigure = function() {
    originalConfigure?.apply(this, arguments);
    cancelAnimationFrame(ui.restoreFrame);
    ui.restoreFrame = requestAnimationFrame(() => {
      if (ui.disposed) return;
      ui.restoreFromWidgets();
      ui.syncUpstreamInputs();
    });
  };
  const originalAfterGraphConfigured = node.onAfterGraphConfigured;
  node.onAfterGraphConfigured = function() {
    originalAfterGraphConfigured?.apply(this, arguments);
    cancelAnimationFrame(ui.restoreFrame);
    ui.restoreFrame = requestAnimationFrame(() => {
      if (ui.disposed) return;
      ui.restoreFromWidgets();
      ui.syncUpstreamInputs();
    });
  };
  const originalConnectionsChange = node.onConnectionsChange;
  node.onConnectionsChange = function() {
    originalConnectionsChange?.apply(this, arguments);
    clearTimeout(ui.connectionTimer);
    ui.connectionTimer = setTimeout(() => { if (!ui.disposed) ui.syncUpstreamInputs(); }, 60);
  };
  const originalRemoved = node.onRemoved;
  node.onRemoved = function() {
    ui.dispose();
    originalRemoved?.apply(this, arguments);
  };
  const originalExecuted = node.onExecuted;
  node.onExecuted = function(message) {
    originalExecuted?.apply(this, arguments);
    ui.loadExecutionPreview(message);
    ui.syncUpstreamInputs();
  };
}
