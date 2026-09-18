// The Director UI, loaded on demand by web-src/main.js when a Director node is
// created. Registration, preferences and locales live in main.js; this module
// must stay free of startup side effects so it can stay out of the eager chunk.
import { app, api } from "./comfy-runtime.js";
import { builtInAgentEnabled, configureDirectorViewports, registerDirectorRuntime } from "./settings.js";
import { EditorHistory } from "./omnicam-history.js";
import { ContextMenuController, initializeTooltips, promptText } from "./director/ui-services.js";
import { ObjectUrlRegistry } from "./omnicam-media.js";
import { buildRoot } from "./omnicam-template.js";
import { dispatchDirectorKey } from "./omnicam-commands.js";
import { createAssetBrowserPanel } from "./assets/panel.js";
import { createLabelOverlay } from "./assets/label-overlay.js";
import { createCharacterRuntime } from "./assets/character/rig-runtime.js";
import { createRigMapper } from "./assets/character/rig-mapper.js";
import { createPoseEditor } from "./assets/character/pose-editor.js";
import { createMotionEditor } from "./assets/character/motion-editor.js";
import { buildDirectorDomCache } from "./director/dom-cache.js";
import { createTransformControlsWiring } from "./viewport/transform-controls-wiring.js";
import { createPathSelection } from "./director/camera-path-selection.js";
import {
  activeCameraTrack,
  bindWidgetCallbacks,
  playblastCameraTrack,
  restoreFromWidgets,
  serializeEditorState,
  syncActiveCameraTrack,
  syncFromWidgets
} from "./omnicam-state-sync.js";
import { bindEditorEvents } from "./omnicam-event-bindings.js";
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
import { computeAudioPeaks, loadAudioFile, releaseAudio, stopPlay, togglePlay } from "./omnicam-playback-transport.js";
import { applyCameraPreset, applyCameraShake, applyProxyPreset } from "./omnicam-motion-presets.js";
import { clearViewportBgImage, configureBackgroundManager, loadViewportBgFile, loadViewportBgSequence } from "./omnicam-background-manager.js";
import {
  drawCameraPath,
  drawCard,
  drawCube,
  drawCylinder,
  drawGrid,
  drawHuman,
  drawLine3D,
  drawNull,
  drawOverlays,
  drawPointField,
  drawSpeedHeatmap,
  drawSphere,
  drawTorus,
} from "./omnicam-viewport-overlays.js";
import {
  curveChannels,
  drawCurveEditor,
  fitCurveView,
  onCurveDoubleClick,
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
  deleteSelectedObjects,
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
  setKeyTangentMode,
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
import { createKeyframeBatchMethods } from "./director/methods/keyframe-batch.js";
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
  // `runtime` is the persistent DirectorRuntime (web-src/director/runtime.js)
  // this workbench renders: it already owns canonical state, widgets and
  // serialization, constructed once by attachDirectorShell() and reused
  // across every open/close cycle. See RUNTIME_ALIASED_FIELDS below for how
  // `this.state`/`this.frame`/etc. read and write through to it.
  constructor(runtime) {
    this.runtime = runtime;
    const node = runtime.node;
    // Own instance field, deliberately not aliased to runtime.disposed: this
    // guards workbench-local re-entrancy (loadWebGLViewports(), dispose())
    // across a runtime that outlives many open/close cycles.
    this.disposed = false;
    this.app = app, this.api = api, this.node = node, this.root = buildRoot(), this.root.tabIndex = -1, this.dom = buildDirectorDomCache(this.root), this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 });
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
    // Real Three.js TransformControls for object/camera/camera_target
    // (plan Task 4); synced once per renderViewportOnly() tick.
    this.transformControlsWiring = createTransformControlsWiring(this);
    // Re-derive from current runtime state/frame on every open (not just the
    // first): a headless director-api mutation or an upstream restore may
    // have changed the camera while this workbench was closed.
    this.camera = sampleCamera(this.state, this.frame);
    this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.pathSelection = createPathSelection(), this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.cardMediaAssetById = /* @__PURE__ */ new Map(), this.objectUrls = new ObjectUrlRegistry(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.uiDirtyMask = 0, this.perf = globalThis.__omnicamPerf === true ? { renderCount: 0, viewportRenderCount: 0, previewRenderCount: 0, timelineRefreshCount: 0, inspectorRefreshCount: 0, lastFrameMs: 0 } : null, this.contextMenu = new ContextMenuController(this.root), this.refreshCameraPreviews(), this.initializeTooltips(), this.bindEditorEvents(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(),
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
// Canonical state, widgets and serialization live on DirectorRuntime (see
// director/runtime.js); the UI aliases the fields below through accessors so
// every existing `this.state`/`this.frame`/etc. read or write in this file
// and in web-src/director/methods/* keeps working unchanged while actually
// storing on the runtime instance. This is what lets director-api and the
// Agent bridge mutate/serialize Director state without an open workbench
// (migration plan Task 5).
// Deliberately excludes "disposed": that flag means different things for the
// two lifetimes now that a workbench can close and reopen many times across
// one runtime's life. ui.disposed is the workbench's own instance field
// (guards loadWebGLViewports()/dispose() re-entrancy); runtime.disposed is
// set once, only when the node itself is removed.
const RUNTIME_ALIASED_FIELDS = [
  "state", "frame", "camera", "directorRevision", "renderRevision",
  "sceneBaseline", "sceneName",
  "stateWidget", "recordingWidget", "cardWidget",
  "widthWidget", "heightWidget", "fpsWidget", "durationWidget", "modeWidget",
  "directorApi", "agentBridge", "assetBrowser",
  // Director modal audit Lot 5: the undo/redo stack now lives on the
  // persistent runtime (constructed once, outliving every workbench
  // open/close) rather than being recreated empty each time a workbench
  // mounts, so closing and reopening no longer silently drops the user's
  // undo history even though the document itself was always preserved. See
  // DirectorRuntime.history in director/runtime.js.
  "history",
];
for (const field of RUNTIME_ALIASED_FIELDS) {
  Object.defineProperty(OmniCamDirectorUI.prototype, field, {
    configurable: true,
    enumerable: true,
    get() { return this.runtime[field]; },
    set(value) { this.runtime[field] = value; },
  });
}
const directorDependencies = { app, api, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bindEditorEvents, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, releaseAudio, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawCylinder, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, drawTorus, curveChannels, drawCurveEditor, fitCurveView, onCurveDoubleClick, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, deleteSelectedObjects, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setKeyTangentMode, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateCameraRotationFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform };
Object.assign(
  OmniCamDirectorUI.prototype,
  createEditorMethods(directorDependencies),
  createSceneMethods(directorDependencies),
  createInteractionMethods(directorDependencies),
  createRenderMethods(directorDependencies),
  createKeyframeBatchMethods(),
);
function recordDirectorTrace(stage, node) {
  const trace = globalThis.__majoorOmniCamCiTrace;
  if (!Array.isArray(trace)) return;
  trace.push({ stage, nodeId: node?.id ?? null, nodeClass: node?.comfyClass ?? node?.type ?? null });
}
// Constructs the heavy visible editor (DOM root, WebGL, asset browser,
// character tools) against an existing, persistent DirectorRuntime, and
// returns it. Called only from web-src/director/shell.js's Open handler --
// never from nodeCreated() directly (migration plan Task 9): the runtime
// itself, the semantic API and the external Agent bridge are attached once,
// at shell-attach time, and outlive every open/close cycle this produces.
export function openDirectorWorkbench(runtime) {
  const node = runtime.node;
  recordDirectorTrace("director:workbench:constructor:start", node);
  const ui = new OmniCamDirectorUI(runtime);
  recordDirectorTrace("director:workbench:constructor:complete", node);
  runtime.attachWorkbench(ui);
  // Compatibility marker for tooling/tests that look up "the open Director
  // UI" by this pre-migration convention. Present only while a workbench is
  // mounted -- closeDirectorWorkbench() below clears it again.
  node.__majoorOmniCam = ui;
  registerDirectorRuntime(ui);
  // The ASSETS tab of the left panel. Constructed here (after the DOM and the
  // event bindings exist) rather than in the constructor so it stays out of the
  // core editor's method soup; it fetches nothing until the tab is first shown.
  try {
    ui.assetBrowser = createAssetBrowserPanel(ui, {
      // Keeps the Agent module out of the eager chunk (design spec section
      // 32): nothing under web-src/agent/panel.js loads until the AGENT tab
      // is actually opened.
      onAgentFirstOpen: async () => {
        // "Enable built-in Agent" only ever gates this lazy mount -- the
        // external Agent bridge (runtime-owned) is created unconditionally
        // and never reads this setting (design spec Task 6).
        if (!builtInAgentEnabled()) return;
        try {
          const { createDirectorAgentPanel } = await import("./agent/panel.js");
          ui.agentPanel = createDirectorAgentPanel(ui);
        } catch (error) {
          console.warn("[OmniCam] Agent panel unavailable", error);
        }
      },
    });
  } catch (error) {
    console.warn("[OmniCam] Asset Browser unavailable", error);
  }
  // Pooled DOM overlay for viewport Labels (tags / annotations). renderViewport
  // calls ui.labelOverlay.update() after each paint; the overlay hides itself
  // during a capture.
  try {
    ui.labelOverlay = createLabelOverlay(ui);
    const modeSel = ui.root.querySelector('[data-role="label-mode"]');
    const contentSel = ui.root.querySelector('[data-role="label-content"]');
    if (modeSel) modeSel.value = ui.labelOverlay.settings.mode;
    if (contentSel) contentSel.value = ui.labelOverlay.settings.content;
  } catch (error) {
    console.warn("[OmniCam] Label overlay unavailable", error);
  }
  // Character rig: the transient bone bridge (never serialised) and the Rig
  // Mapper panel. refreshInspector() calls ui.rigMapper.sync() on selection.
  try {
    ui.characterRuntime = createCharacterRuntime(ui);
    ui.rigMapper = createRigMapper(ui);
    ui.poseEditor = createPoseEditor(ui);
    ui.motionEditor = createMotionEditor(ui);
  } catch (error) {
    console.warn("[OmniCam] Character tools unavailable", error);
  }
  recordDirectorTrace("director:workbench:ready", node);
  return ui;
}

// Disposes only the visual/GPU/media side of a workbench -- panels, overlays,
// character tools and (via ui.dispose()) WebGL/canvas/media -- and detaches
// it from its runtime. Never disposes the runtime, the semantic API or the
// external Agent bridge: those survive the workbench (migration plan
// Task 15).
export function closeDirectorWorkbench(ui) {
  ui.assetBrowser?.dispose?.();
  ui.agentPanel?.dispose?.();
  ui.labelOverlay?.dispose?.();
  ui.rigMapper?.dispose?.();
  ui.poseEditor?.dispose?.();
  ui.motionEditor?.dispose?.();
  ui.dispose();
  ui.runtime.detachWorkbench(ui);
  if (ui.node.__majoorOmniCam === ui) delete ui.node.__majoorOmniCam;
}
