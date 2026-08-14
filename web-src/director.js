import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { OmniWebGLViewport } from "./omnicam-webgl.js";
import { EditorHistory } from "./omnicam-history.js";
import { ContextMenuController, initializeTooltips, promptText } from "./omnicam-ui.js";
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
  setCurveInterpolation,
  setTangentMode,
  timelineFrameFromEvent,
  toggleCurveHandles
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
  restoreAssets
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
  setObjectParent,
  timelineKeyframes,
  timelineObject,
  toggleAutoKey,
  toggleObject,
  updateCameraFromHud,
  updateEditState,
  updateKeyVisualState,
  updateSelectedKey,
  updateSelectedObject
} from "./omnicam-scene.js";
const EXTENSION_NAME = "Majoor.OmniCam.Director", NODE_CLASS = "MajoorOmniCamDirector";
import {
  add,
  clamp,
  configureCore,
  defaultCamera,
  length,
  project,
  sampleCamera,
  sampleObjectTransform,
  sanitizeState,
  sub,
  worldTransform
} from "./omnicam-core.js";
configureCore({ api });
configureDomMedia({ api });
class OmniCamDirectorUI {
  constructor(node) {
    this.node = node, this.root = buildRoot(), this.root.tabIndex = -1, this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.root.querySelector(".viewport-wrap"), this.interactionElement.tabIndex = -1, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 });
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
    this.stateWidget = node.widgets?.find((w) => w.name === "state_json"), this.recordingWidget = node.widgets?.find((w) => w.name === "recording_path"), this.cardWidget = node.widgets?.find((w) => w.name === "card_asset"), this.widthWidget = node.widgets?.find((w) => w.name === "width"), this.heightWidget = node.widgets?.find((w) => w.name === "height"), this.fpsWidget = node.widgets?.find((w) => w.name === "fps"), this.durationWidget = node.widgets?.find((w) => w.name === "duration_seconds"), this.modeWidget = node.widgets?.find((w) => w.name === "render_mode");
    let parsed = null;
    try {
      parsed = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = sanitizeState(parsed), this.frame = 0, this.camera = sampleCamera(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.objectUrls = new ObjectUrlRegistry(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = "subject", this.selectedEntity = "camera", this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.contextMenu = new ContextMenuController(this.root), this.history = new EditorHistory({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedKeyFrame: this.selectedKeyFrame }), restore: (snapshot) => this.restoreHistorySnapshot(snapshot) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bind(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.refreshSetupDiagnostic();
  }
  refreshSetupDiagnostic() {
    refreshSetupDiagnostic(this);
  }
  hideInternalWidgets() {
    for (const name of ["state_json", "recording_path", "card_asset"]) {
      const w = this.node.widgets?.find((x) => x.name === name);
      w && (w.computeSize = () => [0, -4], w.draw = () => {
      }, w.hidden = !0, w.options = { ...w.options || {}, hideInVueNodes: !0 });
    }
  }
  restoreFromWidgets() {
    restoreFromWidgets(this);
  }
  restoreHistorySnapshot(snapshot) {
    const value = JSON.parse(snapshot);
    this.state = sanitizeState(value.state), this.frame = clamp(value.frame, 0, this.state.duration_frames - 1), this.selectedEntity = value.selectedEntity, this.selectedObjectId = value.selectedObjectId, this.selectedKeyFrame = value.selectedKeyFrame, this.camera = sampleCamera(this.state, this.frame), this.cameraPreviewSignature = "", this.serialize(), this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.render();
  }
  checkpoint(label) {
    this.history.checkpoint(label);
  }
  undo() {
    const label = this.history.undo();
    label && this.setStatus(`Undo: ${label}`);
  }
  redo() {
    const label = this.history.redo();
    label && this.setStatus(`Redo: ${label}`);
  }
  bind() {
    this.abortController = new AbortController();
    const signal = this.abortController.signal, q = (sel) => this.root.querySelector(sel);
    q('[data-act="play"]').addEventListener("click", () => this.togglePlay(), { signal }), q('[data-act="key"]').addEventListener("click", () => this.insertKeyframe(), { signal }), q('[data-act="auto-key"]').addEventListener("click", () => this.toggleAutoKey(), { signal }), q('[data-act="delete-key"]').addEventListener("click", () => this.deleteKeyframe(), { signal }), q('[data-act="copy-key"]').addEventListener("click", () => this.copyKeyframe(), { signal }), q('[data-act="paste-key"]').addEventListener("click", () => this.pasteKeyframe(), { signal }), q('[data-act="previous-key"]').addEventListener("click", () => this.goToAdjacentKey(-1), { signal }), q('[data-act="next-key"]').addEventListener("click", () => this.goToAdjacentKey(1), { signal }), q('[data-act="previous-frame"]').addEventListener("click", () => this.setFrame(this.frame - 1), { signal }), q('[data-act="next-frame"]').addEventListener("click", () => this.setFrame(this.frame + 1), { signal }), q('[data-act="update-key"]').addEventListener("click", () => this.updateKeyFromView(), { signal }), q('[data-act="view-key"]').addEventListener("click", () => this.loadSelectedKeyView(), { signal }), q('[data-act="reset-camera"]').addEventListener("click", () => this.resetCamera(), { signal }), q('[data-act="loop"]').addEventListener("click", () => this.toggleLoop(), { signal }), q('[data-act="range-start"]').addEventListener("click", () => this.setPlaybackRange("start"), { signal }), q('[data-act="range-end"]').addEventListener("click", () => this.setPlaybackRange("end"), { signal }), q('[data-act="range-clear"]').addEventListener("click", () => this.clearPlaybackRange(), { signal }), q('[data-act="toggle-timecode"]').addEventListener("click", () => this.toggleTimecode(), { signal }), q('[data-act="toggle-snap"]').addEventListener("click", () => this.toggleSnap(), { signal }), q('[data-role="snap-frames"]').addEventListener("change", (e) => {
      this.state.snap_frames = Math.max(1, Math.round(Number(e.target.value) || 1)), this.serialize(), this.setStatus(`Snap: ${this.state.snap_frames} frame${this.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal }), q('[data-act="add-camera"]').addEventListener("click", () => {
      this.addCamera(), this.closeMenus();
    }, { signal }), q('[data-act="record"]').addEventListener("click", () => this.makePlayblast(), { signal }), q('[data-act="h3-setup"]').addEventListener("click", () => this.createH3Setup(), { signal }), q('[data-act="load-card"]').addEventListener("click", () => q('[data-role="file"]').click(), { signal }), q('[data-act="add-card"]').addEventListener("click", () => this.addMediaCard(), { signal }), q('[data-role="file"]').addEventListener("change", (e) => this.loadCardFile(e.target.files?.[0]), { signal }), q('[data-act="load-model"]').addEventListener("click", () => {
      this.closeMenus(), q('[data-role="model-file"]').click();
    }, { signal }), q('[data-role="model-file"]').addEventListener("change", (e) => {
      this.loadModelFile(e.target.files?.[0]), e.target.value = "";
    }, { signal });
    for (const button of this.root.querySelectorAll("[data-object-type]")) button.addEventListener("click", () => {
      this.addPrimitive(button.dataset.objectType), this.closeMenus();
    }, { signal });
    q('[data-role="mode"]').addEventListener("change", (e) => {
      this.state.render_mode = e.target.value, this.modeWidget && (this.modeWidget.value = e.target.value), this.serialize(), this.render();
    }, { signal }), q('[data-role="frame"]').addEventListener("change", (e) => this.setFrame(Number(e.target.value)), { signal }), q('[data-role="scrub"]').addEventListener("input", (e) => this.setFrame(Number(e.target.value)), { signal }), q('[data-role="fov"]').addEventListener("change", (e) => {
      this.camera.fov = clamp(Number(e.target.value), 5, 150), this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
    }, { signal }), q('[data-role="roll"]').addEventListener("change", (e) => {
      this.camera.roll = clamp(Number(e.target.value), -180, 180), this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
    }, { signal }), q('[data-role="speed"]').addEventListener("change", (e) => {
      this.cameraSpeed = clamp(Number(e.target.value), 0.05, 5), e.target.value = String(this.cameraSpeed);
    }, { signal }), q('[data-role="camera-type"]').addEventListener("change", (e) => {
      this.camera.camera_type = e.target.value, this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
    }, { signal }), q('[data-role="guides"]').addEventListener("change", (e) => {
      this.state.guides = e.target.checked, this.serialize(), this.render();
    }, { signal }), q('[data-role="playblast-grid"]').addEventListener("change", (e) => {
      this.state.playblast_grid = e.target.checked, this.serialize(), this.render();
    }, { signal }), q('[data-role="burn-in"]').addEventListener("change", (e) => {
      this.state.burn_in = e.target.checked, this.serialize(), this.render();
    }, { signal }), q('[data-role="speed-heatmap"]').addEventListener("change", (e) => {
      this.state.speed_heatmap = e.target.checked, this.serialize(), this.render();
    }, { signal }), q('[data-role="card-fit"]').addEventListener("change", (e) => {
      this.state.card_fit = e.target.value, this.serialize(), this.render();
    }, { signal }), q('[data-role="ui-density"]').addEventListener("change", (e) => this.setDensity(e.target.value), { signal }), q('[data-role="preview-layout"]').addEventListener("change", (e) => {
      this.state.preview_layout = e.target.value, this.serialize(), this.refreshCameraPreviews(), this.renderCameraView(), this.setStatus(`Preview layout: ${e.target.value}`);
    }, { signal }), q('[data-role="safe-areas"]').addEventListener("change", (e) => {
      this.state.safe_areas = e.target.checked, this.serialize(), this.renderCameraView();
    }, { signal }), q('[data-role="resolution-gate"]').addEventListener("change", (e) => {
      this.state.resolution_gate = e.target.checked, this.serialize(), this.renderCameraView(), this.render();
    }, { signal }), q('[data-role="aspect-ratio"]').addEventListener("change", (e) => {
      this.state.aspect_ratio = e.target.value, this.serialize(), this.renderCameraView();
    }, { signal }), q('[data-role="proxy-preset"]').addEventListener("change", (e) => this.applyProxyPreset(e.target.value), { signal }), q('[data-role="playblast-camera"]').addEventListener("change", (e) => this.setPlayblastCamera(e.target.value), { signal });
    for (const button of this.root.querySelectorAll("[data-transform-mode]")) button.addEventListener("click", () => this.setTransformMode(button.dataset.transformMode), { signal });
    q('[data-role="gizmo-space"]').addEventListener("change", (e) => {
      this.state.gizmo_space = e.target.value, this.serialize(), this.render();
    }, { signal }), q('[data-role="view-mode"]').addEventListener("change", (e) => this.setViewMode(e.target.value), { signal });
    for (const button of this.root.querySelectorAll('[data-act="toggle-camera-view"]')) button.addEventListener("click", () => this.toggleCameraView(), { signal });
    q('[data-role="object-material"]').addEventListener("change", (e) => {
      const object = this.selectedObject();
      object && (object.material_mode = e.target.value, this.serialize(), this.render());
    }, { signal }), q('[data-role="reference-select"]').addEventListener("change", (e) => {
      this.state.reference_index = Number(e.target.value), this.serialize(), this.loadSelectedReference();
    }, { signal });
    for (const role of ["object-x", "object-y", "object-z", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"]) q(`[data-role="${role}"]`).addEventListener("change", () => this.updateSelectedObject(), { signal });
    for (const role of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"]) q(`[data-role="${role}"]`).addEventListener("change", () => this.updateCameraFromHud(), { signal });
    q('[data-role="animation-select"]').addEventListener("change", (event) => this.selectObjectAnimation(Number(event.target.value)), { signal }), q('[data-role="object-parent"]').addEventListener("change", (event) => this.setObjectParent(event.target.value || null), { signal }), q('[data-role="duration-seconds"]').addEventListener("change", (event) => {
      this.durationWidget && (this.durationWidget.value = Number(event.target.value)), this.syncFromWidgets();
    }, { signal }), q('[data-role="timeline-fps"]').addEventListener("change", (event) => {
      this.fpsWidget && (this.fpsWidget.value = Number(event.target.value)), this.syncFromWidgets();
    }, { signal }), q('[data-role="curve-group"]').addEventListener("change", () => this.drawCurveEditor(), { signal }), q('[data-act="curve-handles"]').addEventListener("click", () => this.toggleCurveHandles(), { signal });
    for (const button of this.root.querySelectorAll("[data-curve-mode]")) button.addEventListener("click", () => this.setCurveInterpolation(button.dataset.curveMode), { signal });
    for (const button of this.root.querySelectorAll("[data-tangent-mode]")) button.addEventListener("click", () => this.setTangentMode(button.dataset.tangentMode), { signal });
    const curve = q('[data-role="curve-canvas"]');
    curve.addEventListener("pointerdown", (event) => this.onCurvePointerDown(event), { signal }), curve.addEventListener("pointermove", (event) => this.onCurvePointerMove(event), { signal }), curve.addEventListener("pointerup", (event) => this.onCurvePointerUp(event), { signal }), curve.addEventListener("pointercancel", (event) => this.onCurvePointerUp(event), { signal }), q('[data-role="key-frame"]').addEventListener("change", (event) => this.retimeSelectedKey(Number(event.target.value)), { signal });
    for (const role of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"]) q(`[data-role="${role}"]`).addEventListener("change", () => this.updateSelectedKey(), { signal });
    for (const menu of this.root.querySelectorAll(".toolbar-menu")) menu.addEventListener("toggle", () => {
      menu.open && this.closeMenus(menu);
    }, { signal });
    this.root.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const target = event.composedPath?.()[0] || event.target;
      target instanceof HTMLElement && !target.closest(".toolbar-menu") && this.closeMenus(), target instanceof HTMLElement && !target.closest(".key,.key-editor,canvas") && this.exitKeyEdit(!0), (!(target instanceof HTMLElement) || !target.closest("input,select,textarea,button,[contenteditable=true]")) && this.root.focus({ preventScroll: !0 });
    }, { signal }), document.addEventListener("pointerdown", (event) => {
      const target = event.composedPath?.()[0] || event.target;
      (!(target instanceof Node) || !this.root.contains(target)) && (this.closeMenus(), this.exitKeyEdit(!0));
    }, { capture: !0, signal }), this.root.addEventListener("mousedown", (event) => event.stopPropagation(), { signal }), this.root.addEventListener("contextmenu", (event) => this.onContextMenu(event), { signal }), this.interactionElement.addEventListener("pointerdown", (event) => this.onPointerDown(event), { signal }), this.interactionElement.addEventListener("pointermove", (event) => this.onPointerMove(event), { signal }), this.interactionElement.addEventListener("pointerup", (event) => this.onPointerUp(event), { signal }), this.interactionElement.addEventListener("pointercancel", (event) => this.onPointerUp(event), { signal }), this.interactionElement.addEventListener("wheel", (event) => this.onWheel(event), { passive: !1, signal }), window.addEventListener("pointermove", (event) => {
      this.keyDrag && this.onPointerMove(event);
    }, { capture: !0, signal }), window.addEventListener("pointerup", (event) => {
      this.keyDrag && this.onPointerUp(event);
    }, { capture: !0, signal });
    const timeline = q('[data-role="keys"]');
    timeline.addEventListener("pointerdown", (event) => this.onTimelinePointerDown(event), { signal }), timeline.addEventListener("pointermove", (event) => this.onTimelinePointerMove(event), { signal }), timeline.addEventListener("pointerup", (event) => this.onTimelinePointerUp(event), { signal }), timeline.addEventListener("pointercancel", (event) => this.onTimelinePointerUp(event), { signal }), this.root.addEventListener("keydown", (event) => this.onKey(event), { signal });
    const ro = new ResizeObserver(() => {
      this.resizeCanvas(), this.render();
    });
    ro.observe(this.root.querySelector(".viewport-wrap")), ro.observe(this.root.querySelector('[data-role="camera-previews"]')), this.resizeObserver = ro, this.updateEditState();
  }
  bindWidgetCallbacks() {
    bindWidgetCallbacks(this);
  }
  syncFromWidgets(persist = !0) {
    syncFromWidgets(this, persist);
  }
  serialize() {
    serializeEditorState(this);
  }
  activeCameraTrack() {
    return activeCameraTrack(this);
  }
  playblastCameraTrack() {
    return playblastCameraTrack(this);
  }
  syncActiveCameraTrack() {
    syncActiveCameraTrack(this);
  }
  refreshCameraSelectors() {
    refreshCameraSelectors(this);
  }
  refreshCameraPreviews() {
    refreshCameraPreviews(this);
  }
  addCamera() {
    addCamera(this);
  }
  async renameCamera(id) {
    return renameCamera(this, id);
  }
  duplicateCamera(id) {
    duplicateCamera(this, id);
  }
  async deleteCamera(id) {
    return deleteCamera(this, id);
  }
  activateCamera(id) {
    activateCamera(this, id);
  }
  setPlayblastCamera(id) {
    setPlayblastCamera(this, id);
  }
  closeMenus(except = null) {
    for (const menu of this.root.querySelectorAll(".toolbar-menu")) menu !== except && (menu.open = !1);
    this.hideContextMenu();
  }
  initializeTooltips() {
    initializeTooltips(this.root, this.interactionElement);
  }
  hideContextMenu() {
    this.contextMenu?.hide();
  }
  showContextMenu(event, title, actions) {
    return this.contextMenu.show(event, title, actions);
  }
  onContextMenu(event) {
    const target = event.target, preview = target.closest?.(".camera-preview-tile"), sceneItem = target.closest?.(".scene-item"), keyElement = target.closest?.(".key");
    if (preview) return this.openCameraContext(event, preview.dataset.cameraId, !0);
    if (sceneItem?.dataset.cameraId) return this.openCameraContext(event, sceneItem.dataset.cameraId, !1);
    if (sceneItem?.dataset.objectId) return this.openObjectContext(event, sceneItem.dataset.objectId);
    if (keyElement) {
      const key = this.timelineKeyframes().find((item) => item.frame === Number(keyElement.dataset.keyFrame));
      return key && this.selectKeyframe(key), this.openTimelineContext(event, !0);
    }
    if (target.closest?.('[data-role="keys"]'))
      return this.setFrame(this.timelineFrameFromEvent(event, target.closest('[data-role="keys"]'))), this.openTimelineContext(event, !1);
    if (target.closest?.(".curve-editor")) return this.openCurveContext(event);
    if (target.closest?.(".viewport-wrap")) {
      const rect = this.interactionElement.getBoundingClientRect(), x = (event.clientX - rect.left) * this.canvas.width / Math.max(1, rect.width), y = (event.clientY - rect.top) * this.canvas.height / Math.max(1, rect.height), hit = this.pickSceneObject([x, y]);
      return hit ? (this.selectedEntity = "object", this.selectedObjectId = hit.id, this.refreshObjects(), this.refreshKeys(), this.openObjectContext(event, hit.id)) : this.openViewportContext(event);
    }
    event.preventDefault(), event.stopPropagation();
  }
  openViewportContext(event) {
    const object = this.selectedObject();
    this.showContextMenu(event, "Viewport", [
      { label: object ? `Set key · ${object.name || object.type}` : `Set key · ${this.activeCameraTrack().name}`, icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: "Create camera from view", icon: "pi-video", run: () => this.addCamera() },
      { label: "Frame subject", icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
      null,
      { label: "Create cube", icon: "pi-stop", run: () => this.addPrimitive("cube") },
      { label: "Create sphere", icon: "pi-circle", run: () => this.addPrimitive("sphere") },
      { label: "Create human proxy", icon: "pi-user", run: () => this.addPrimitive("human") },
      { label: "Create null", icon: "pi-plus", run: () => this.addPrimitive("null") },
      { label: "Create ground", icon: "pi-minus", run: () => this.addPrimitive("ground") },
      null,
      { label: "Show / hide camera previews", icon: "pi-images", run: () => this.toggleCameraView() },
      { label: "Record primary preview", icon: "pi-video", run: () => this.makePlayblast() }
    ]);
  }
  openObjectContext(event, id) {
    const object = this.state.objects.find((item) => item.id === id);
    object && (this.selectedEntity = "object", this.selectedObjectId = id, this.showContextMenu(event, object.name || object.type, [
      { label: "Set key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: "Rename object…", icon: "pi-pencil", run: () => this.renameObject(id) },
      { label: "Duplicate object", icon: "pi-copy", run: () => this.duplicateObject(id) },
      { label: object.enabled === !1 ? "Show object" : "Hide object", icon: object.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(id) },
      null,
      { label: "Camera looks at this object", icon: "pi-eye", help: "Point every camera keyframe's target at this object's position", run: () => this.lookAtObject(id) },
      null,
      { label: "Translate", icon: "pi-arrows-alt", shortcut: "T", run: () => this.setTransformMode("translate") },
      { label: "Rotate", icon: "pi-refresh", shortcut: "R", run: () => this.setTransformMode("rotate") },
      { label: "Scale", icon: "pi-expand", shortcut: "S", run: () => this.setTransformMode("scale") },
      null,
      { label: "Delete object", icon: "pi-trash", danger: !0, disabled: id === "subject", help: id === "subject" ? "The canonical subject card cannot be deleted" : "Delete this object and its animation keys", run: () => this.deleteObject(id) }
    ]));
  }
  openCameraContext(event, id, preview = !1) {
    const camera = this.state.cameras.find((item) => item.id === id);
    camera && this.showContextMenu(event, `${camera.name}${preview ? " preview" : ""}`, [
      { label: "Edit this camera", icon: "pi-video", run: () => this.activateCamera(id) },
      { label: "Set as primary / playblast", icon: "pi-star", disabled: id === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(id) },
      { label: "Set key at playhead", icon: "pi-key", shortcut: "I", run: () => {
        this.activateCamera(id), this.insertKeyframe();
      } },
      { label: "Record this preview", icon: "pi-circle-fill", run: () => {
        this.setPlayblastCamera(id), this.makePlayblast();
      } },
      { label: this.state.maximized_camera_id === id ? "Restore preview size" : "Maximize preview", icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(id) },
      null,
      { label: "Shot: move earlier", icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((item) => item.id === id) <= 0, run: () => this.moveShot(id, -1) },
      { label: "Shot: move later", icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((item) => item.id === id) >= this.state.cameras.length - 1, run: () => this.moveShot(id, 1) },
      { label: "Shot handles…", icon: "pi-sliders-h", run: () => this.editShotHandles(id) },
      null,
      { label: "Rename camera…", icon: "pi-pencil", run: () => this.renameCamera(id) },
      { label: "Duplicate camera", icon: "pi-copy", run: () => this.duplicateCamera(id) },
      { label: "Create camera from current view", icon: "pi-plus", run: () => this.addCamera() },
      null,
      { label: "Delete camera", icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(id) }
    ]);
  }
  moveShot(id, delta) {
    const index = this.state.cameras.findIndex((item) => item.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= this.state.cameras.length) return;
    this.checkpoint("Reorder shot");
    const [camera] = this.state.cameras.splice(index, 1);
    this.state.cameras.splice(target, 0, camera);
    this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${camera.name} → #${target + 1}`);
  }
  async editShotHandles(id) {
    const camera = this.state.cameras.find((item) => item.id === id);
    if (!camera) return;
    const handles = camera.handles || { in: 0, out: 0 };
    const value = await promptText(app, "Shot handles", "Handle frames: in,out", `${handles.in},${handles.out}`);
    if (value === null || value === undefined) return;
    const match = String(value).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
    if (!match) return this.setStatus("Handles must be two integers: in,out");
    this.checkpoint("Shot handles"), camera.handles = { in: Math.min(600, Number(match[1])), out: Math.min(600, Number(match[2])) }, this.serialize(), this.setStatus(`${camera.name} handles: ${camera.handles.in} / ${camera.handles.out}`);
  }
  openTimelineContext(event, onKey) {
    this.showContextMenu(event, onKey ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
      { label: "Set / replace key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: "Delete selected key", icon: "pi-trash", shortcut: "Delete", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() },
      { label: "Copy selected key", icon: "pi-copy", shortcut: "Ctrl+C", disabled: !this.selectedKeyframe(), run: () => this.copyKeyframe() },
      { label: "Paste key at playhead", icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
      null,
      { label: "Previous key", icon: "pi-fast-backward", shortcut: ",", run: () => this.goToAdjacentKey(-1) },
      { label: "Next key", icon: "pi-fast-forward", shortcut: ".", run: () => this.goToAdjacentKey(1) },
      { label: this.state.auto_key ? "Disable Auto Key" : "Enable Auto Key", icon: "pi-circle-fill", run: () => this.toggleAutoKey() },
      null,
      { label: "Add marker at playhead", icon: "pi-bookmark", run: () => this.addMarker() },
      ...((this.state.markers || []).length ? [{ label: "Remove nearest marker", icon: "pi-bookmark-fill", danger: !0, run: () => this.removeNearestMarker() }] : [])
    ]);
  }
  addMarker() {
    const existing = (this.state.markers || []).find((marker) => marker.frame === this.frame);
    if (existing) return this.setStatus(`Marker already at F${this.frame}`);
    this.checkpoint("Add marker"), this.state.markers = [...(this.state.markers || []), { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((a, b) => a.frame - b.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
  }
  removeNearestMarker() {
    const markers = this.state.markers || [];
    if (!markers.length) return;
    const nearest = markers.reduce((best, marker) => Math.abs(marker.frame - this.frame) < Math.abs(best.frame - this.frame) ? marker : best);
    this.checkpoint("Remove marker"), this.state.markers = markers.filter((marker) => marker !== nearest), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${nearest.frame}`);
  }
  openCurveContext(event) {
    this.showContextMenu(event, "Curve editor", [
      { label: this.showCurveHandles ? "Hide Bézier handles" : "Show Bézier handles", icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
      null,
      ...["bezier", "smooth", "linear", "ease_in", "ease_out", "ease"].map((mode) => ({ label: `Interpolation: ${mode.replaceAll("_", " ")}`, icon: "pi-chart-line", disabled: !this.selectedKeyframe(), run: () => this.setCurveInterpolation(mode) })),
      null,
      ...["auto", "vector", "free", "aligned"].map((mode) => ({ label: `Tangents: ${mode[0].toUpperCase()}${mode.slice(1)}`, icon: "pi-share-alt", disabled: !this.selectedKeyframe(), run: () => this.setTangentMode(mode) })),
      null,
      { label: "Delete selected key", icon: "pi-trash", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() }
    ]);
  }
  resizeCanvas() {
    const wrap = this.root.querySelector(".viewport-wrap"), dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(320, Math.round(wrap.clientWidth * dpr)), h = Math.max(180, Math.round(wrap.clientHeight * dpr));
    (this.canvas.width !== w || this.canvas.height !== h) && (this.canvas.width = w, this.canvas.height = h);
    for (const canvas of this.cameraPreviewCanvases.values()) {
      const previewWidth = Math.max(220, Math.round(canvas.clientWidth * dpr)), previewHeight = Math.max(140, Math.round(canvas.clientHeight * dpr));
      (canvas.width !== previewWidth || canvas.height !== previewHeight) && (canvas.width = previewWidth, canvas.height = previewHeight);
    }
    this.drawCurveEditor();
  }
  setFrame(frame, fromPlayback = !1, refreshTimeline = !0) {
    this.frame = clamp(Math.round(frame), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = sampleCamera(this.state, this.frame), this.applyObjectAnimationFrame(), this.root.querySelector('[data-role="frame"]').value = String(this.frame), this.root.querySelector('[data-role="scrub"]').value = String(this.frame), this.root.querySelector('[data-role="fov"]').value = String(Math.round(this.camera.fov * 100) / 100), this.root.querySelector('[data-role="roll"]').value = String(Math.round((this.camera.roll || 0) * 100) / 100), this.root.querySelector('[data-role="camera-type"]').value = this.camera.camera_type;
    const sec = this.frame / this.state.fps;
    for (const media of this.cardMediaById.values()) media instanceof HTMLVideoElement && Number.isFinite(media.duration) && media.duration > 0 && (media.currentTime = sec % media.duration);
    const minutes = Math.floor(sec / 60), seconds = Math.floor(sec % 60), milliseconds = Math.floor(sec % 1 * 1e3), frames = this.frame % Math.max(1, Math.round(this.state.fps)), totalSeconds = Math.floor(this.frame / this.state.fps);
    this.root.querySelector('[data-role="time"]').textContent = this.state.timecode_mode === "timecode"
      ? `${String(Math.floor(totalSeconds / 3600)).padStart(2, "0")}:${String(Math.floor(totalSeconds / 60) % 60).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}:${String(frames).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
    if (refreshTimeline) this.refreshKeys();
    else {
      const lastFrame = Math.max(1, this.state.duration_frames - 1), playhead = this.root.querySelector('[data-role="keys"] .playhead');
      playhead && (playhead.style.left = `${100 * this.frame / lastFrame}%`);
      for (const element of this.root.querySelectorAll("[data-key-frame]")) {
        const keyFrame = Number(element.dataset.keyFrame);
        element.classList.toggle("at-playhead", keyFrame === this.frame), element.classList.toggle("selected", keyFrame === this.selectedKeyFrame), element.classList.toggle("editing", keyFrame === this.editingKeyFrame);
      }
      this.refreshKeyEditor(), this.drawCurveEditor();
    }
    fromPlayback || this.serialize(), this.refreshInspector(), this.render();
  }
  timelineObject() {
    return timelineObject(this);
  }
  timelineKeyframes() {
    return timelineKeyframes(this);
  }
  applyObjectAnimationFrame() {
    applyObjectAnimationFrame(this, sampleObjectTransform);
  }
  insertKeyframe() {
    insertKeyframe(this);
  }
  deleteKeyframe() {
    deleteKeyframe(this);
  }
  copyKeyframe() {
    copyKeyframe(this);
  }
  pasteKeyframe() {
    pasteKeyframe(this);
  }
  resetCamera() {
    resetCamera(this, defaultCamera);
  }
  selectedKeyframe() {
    return selectedKeyframe(this);
  }
  selectKeyframe(key) {
    selectKeyframe(this, key);
  }
  beginCameraEdit() {
    return beginCameraEdit(this);
  }
  commitCameraEdit() {
    commitCameraEdit(this);
  }
  finishCameraEdit() {
    finishCameraEdit(this);
  }
  exitKeyEdit(clearSelection = !1) {
    exitKeyEdit(this, clearSelection);
  }
  toggleAutoKey() {
    toggleAutoKey(this);
  }
  updateEditState() {
    updateEditState(this);
  }
  updateKeyVisualState() {
    updateKeyVisualState(this);
  }
  curveChannels() {
    return curveChannels(this);
  }
  drawCurveEditor() {
    drawCurveEditor(this);
  }
  onCurvePointerDown(event) {
    onCurvePointerDown(this, event);
  }
  onCurvePointerMove(event) {
    onCurvePointerMove(this, event);
  }
  onCurvePointerUp(event) {
    onCurvePointerUp(this, event);
  }
  setCurveInterpolation(mode) {
    setCurveInterpolation(this, mode);
  }
  setTangentMode(mode) {
    setTangentMode(this, mode);
  }
  toggleCurveHandles() {
    toggleCurveHandles(this);
  }
  refreshKeys() {
    refreshKeys(this);
  }
  refreshKeyEditor() {
    refreshKeyEditor(this);
  }
  retimeSelectedKey(frame, nearest = !1) {
    retimeSelectedKey(this, frame, nearest);
  }
  updateSelectedKey() {
    updateSelectedKey(this);
  }
  updateKeyFromView() {
    updateKeyFromView(this);
  }
  loadSelectedKeyView() {
    loadSelectedKeyView(this);
  }
  goToAdjacentKey(direction) {
    goToAdjacentKey(this, direction);
  }
  addPrimitive(type) {
    addPrimitive(this, type);
  }
  async renameObject(id) {
    return renameObject(this, id);
  }
  duplicateObject(id) {
    duplicateObject(this, id);
  }
  toggleObject(id) {
    toggleObject(this, id);
  }
  async deleteObject(id) {
    return deleteObject(this, id);
  }
  addMediaCard() {
    addMediaCard(this);
  }
  selectedObject() {
    return selectedObject(this);
  }
  playblastCameraAtFrame() {
    return playblastCameraAtFrame(this, sampleCamera);
  }
  viewportCamera() {
    return viewportCamera(this);
  }
  setViewMode(mode) {
    setViewMode(this, mode);
  }
  toggleCameraView() {
    toggleCameraView(this);
  }
  setDensity(density) {
    ["basic", "animation", "advanced"].includes(density) || (density = "advanced"), this.state.ui_density = density, this.root.dataset.density = density, this.root.querySelector('[data-role="ui-density"]').value = density, this.serialize(), requestAnimationFrame(() => {
      this.resizeCanvas(), this.render();
    }), this.setStatus(`Interface: ${density}`);
  }
  lookAtObject(id) {
    const object = this.state.objects.find((item) => item.id === id);
    if (!object) return;
    this.checkpoint("Look-at constraint");
    for (const camera of this.state.cameras)
      for (const key of camera.keyframes) key.camera.target = [...(object.position || [0, 1.5, 0])];
    this.camera = sampleCamera(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${object.name || object.type}`);
  }
  setTransformMode(mode) {
    setTransformMode(this, mode);
  }
  refreshInspector() {
    refreshInspector(this);
  }
  updateSelectedObject() {
    updateSelectedObject(this);
  }
  beginObjectEdit(object) {
    return beginObjectEdit(this, object);
  }
  commitObjectEdit(object) {
    commitObjectEdit(this, object);
  }
  updateCameraFromHud() {
    updateCameraFromHud(this);
  }
  selectObjectAnimation(index) {
    selectObjectAnimation(this, index);
  }
  setObjectParent(parentId) {
    setObjectParent(this, parentId);
  }
  applyProxyPreset(preset) {
    const presets = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, value = presets[preset] || presets.balanced;
    this.state.render_mode = value.mode, this.state.burn_in = value.burn, this.root.querySelector('[data-role="mode"]').value = value.mode, this.root.querySelector('[data-role="burn-in"]').checked = value.burn, this.modeWidget && (this.modeWidget.value = value.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${preset}`);
  }
  createH3Setup() {
    const adapter = LiteGraph.createNode("MajoorOmniCamH3Adapter");
    if (!adapter) return this.setStatus("H3 adapter node is unavailable");
    adapter.pos = [this.node.pos[0] + this.node.size[0] + 80, this.node.pos[1]], app.graph.add(adapter), this.node.connect(0, adapter, adapter.findInputSlot("camera_track")), this.node.connect(1, adapter, adapter.findInputSlot("proxy_video"));
    const h3 = LiteGraph.createNode("MinimaxHailuo03ReferenceNode");
    if (!h3) {
      this.setStatus("H3 adapter created; official MiniMax H3 node not installed");
      return;
    }
    h3.pos = [adapter.pos[0] + adapter.size[0] + 80, adapter.pos[1]], app.graph.add(h3);
    const videoSlot = h3.findInputSlot("video_1"), promptSlot = h3.findInputSlot("prompt");
    videoSlot >= 0 && adapter.connect(0, h3, videoSlot), promptSlot >= 0 && adapter.connect(1, h3, promptSlot), this.setStatus(videoSlot >= 0 ? "H3 reference workflow created" : "H3 nodes created; connect camera video to Video 1");
  }
  refreshObjects() {
    refreshObjects(this);
  }
  removeObjectResources(id) {
    removeObjectResources(this, id);
  }
  togglePlay() {
    if (this.playing) return this.stopPlay();
    this.playing = !0, this.root.querySelector('[data-act="play"] i').className = "pi pi-pause";
    const range = this.state.playback_range, rangeStart = range ? range[0] : 0, rangeEnd = range ? range[1] : this.state.duration_frames - 1;
    let target = this.frame >= rangeEnd || this.frame < rangeStart ? rangeStart : this.frame, rendered = null;
    const stepMs = 1e3 / this.state.fps;
    let lastTime = performance.now(), accumulated = 0;
    const tick = (now) => {
      if (!this.playing) return;
      accumulated += now - lastTime, lastTime = now;
      while (accumulated >= stepMs) {
        if (accumulated -= stepMs, target += 1, target > rangeEnd) {
          if (!this.state.loop_playback) return void this.stopPlay();
          target = rangeStart;
        }
      }
      target !== rendered && (rendered = target, this.setFrame(target, !0)), this.playTimer = requestAnimationFrame(tick);
    };
    this.playTimer = requestAnimationFrame(tick);
  }
  stopPlay() {
    this.playing = !1, this.playTimer && cancelAnimationFrame(this.playTimer), this.playTimer = null, this.root.querySelector('[data-act="play"] i').className = "pi pi-play";
  }
  snapFrame(frame) {
    if (!this.state.snap_enabled || this.state.snap_frames <= 1) return Math.round(frame);
    return Math.round(Math.round(frame) / this.state.snap_frames) * this.state.snap_frames;
  }
  toggleLoop() {
    this.state.loop_playback = !this.state.loop_playback, this.serialize();
    const button = this.root.querySelector('[data-act="loop"]');
    button.classList.toggle("active", this.state.loop_playback), button.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
  }
  setPlaybackRange(edge) {
    const range = this.state.playback_range || [0, this.state.duration_frames - 1];
    if (edge === "start") range[0] = Math.min(this.frame, range[1]);
    else if (edge === "end") range[1] = Math.max(this.frame, range[0]);
    this.state.playback_range = range, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${range[0]}–F${range[1]}`);
  }
  clearPlaybackRange() {
    this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
  }
  toggleTimecode() {
    this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
  }
  toggleSnap() {
    this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
    const button = this.root.querySelector('[data-act="toggle-snap"]');
    button.classList.toggle("active", this.state.snap_enabled), button.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
  }
  scheduleSerialize() {
    this.serializeScheduled || (this.serializeScheduled = !0, requestAnimationFrame(() => {
      this.serializeScheduled = !1, this.serialize();
    }));
  }
  gizmoAxes(object) {
    return gizmoAxes(this, object);
  }
  gizmoGeometry(object) {
    return gizmoGeometry(this, object);
  }
  pickGizmo(pointer) {
    return pickGizmo(this, pointer);
  }
  pickSceneObject(pointer) {
    return pickSceneObject(this, pointer);
  }
  drawTransformGizmo() {
    drawTransformGizmo(this);
  }
  onPointerDown(e) {
    onPointerDown(this, e);
  }
  onPointerMove(e) {
    onPointerMove(this, e);
  }
  onPointerUp(event) {
    onPointerUp(this, event);
  }
  onWheel(e) {
    onWheel(this, e);
  }
  timelineFrameFromEvent(event, box) {
    return timelineFrameFromEvent(this, event, box);
  }
  onTimelinePointerDown(event) {
    onTimelinePointerDown(this, event);
  }
  onTimelinePointerMove(event) {
    onTimelinePointerMove(this, event);
  }
  onTimelinePointerUp(event) {
    onTimelinePointerUp(this, event);
  }
  onKey(e) {
    dispatchDirectorKey(this, e);
  }
  frameTarget() {
    frameTarget(this);
  }
  async loadMediaUrl(object, url) {
    return loadMediaUrl(this, object, url);
  }
  restoreAssets() {
    restoreAssets(this);
  }
  onModelLoaded(model) {
    onModelLoaded(this, model);
  }
  async loadModelFile(file) {
    return loadModelFile(this, file);
  }
  async loadCardFile(file) {
    return loadCardFile(this, file);
  }
  loadExecutionPreview(message) {
    loadExecutionPreview(this, message);
  }
  loadSelectedReference() {
    loadSelectedReference(this);
  }
  drawLine3D(a, b, color = "#5a5a5a", width = 1) {
    const camera = this.viewportCamera(), pa = project(a, camera, this.canvas.width, this.canvas.height), pb = project(b, camera, this.canvas.width, this.canvas.height);
    !pa || !pb || (this.ctx.strokeStyle = color, this.ctx.lineWidth = width, this.ctx.beginPath(), this.ctx.moveTo(pa[0], pa[1]), this.ctx.lineTo(pb[0], pb[1]), this.ctx.stroke());
  }
  drawGrid() {
    for (let i = -60; i <= 60; i += 1) {
      const major = i === 0, c = major ? "#6f6f6f" : "#353535";
      this.drawLine3D([i, 0, -60], [i, 0, 60], c, major ? 1.6 : 1), this.drawLine3D([-60, 0, i], [60, 0, i], c, major ? 1.6 : 1);
    }
  }
  drawPointField() {
    this.ctx.fillStyle = "#8a8a8a";
    for (let i = 0; i < 90; i++) {
      const angle = i * 2.3999632297, r = 1.5 + i % 11 * 0.38, y = 0.15 + i * 0.618 % 1 * 4, p = project([Math.cos(angle) * r, y, Math.sin(angle) * r], this.viewportCamera(), this.canvas.width, this.canvas.height);
      if (!p) continue;
      const radius = clamp(5 / Math.sqrt(p[2]), 1, 4);
      this.ctx.beginPath(), this.ctx.arc(p[0], p[1], radius, 0, Math.PI * 2), this.ctx.fill();
    }
  }
  drawCube(obj) {
    const [sx, sy, sz] = obj.size || [1, 1, 1], [x, y, z] = obj.position || [0, 0, 0], pts = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map((p) => [x + p[0] * sx / 2, y + p[1] * sy / 2, z + p[2] * sz / 2]), edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (const [a, b] of edges) this.drawLine3D(pts[a], pts[b], "#a0a0a0", 1.4);
  }
  drawSphere(obj) {
    const [sx] = obj.size || [1.5], [x, y, z] = obj.position || [0, 1, 0], r = sx / 2;
    for (let axis = 0; axis < 3; axis++) {
      let prev = null;
      for (let i = 0; i <= 32; i++) {
        const a = i / 32 * Math.PI * 2;
        let p;
        axis === 0 ? p = [x + Math.cos(a) * r, y + Math.sin(a) * r, z] : axis === 1 ? p = [x + Math.cos(a) * r, y, z + Math.sin(a) * r] : p = [x, y + Math.cos(a) * r, z + Math.sin(a) * r], prev && this.drawLine3D(prev, p, "#999", 1), prev = p;
      }
    }
  }
  drawHuman(obj) {
    const [x, y, z] = obj.position || [0, 0, 0], h = obj.size?.[1] || 1.8, head = [x, y + h * 0.88, z], neck = [x, y + h * 0.72, z], hip = [x, y + h * 0.42, z], footL = [x - h * 0.13, y, z], footR = [x + h * 0.13, y, z], handL = [x - h * 0.28, y + h * 0.48, z], handR = [x + h * 0.28, y + h * 0.48, z];
    this.drawLine3D(neck, hip, "#aaa", 2), this.drawLine3D(neck, handL, "#aaa", 2), this.drawLine3D(neck, handR, "#aaa", 2), this.drawLine3D(hip, footL, "#aaa", 2), this.drawLine3D(hip, footR, "#aaa", 2);
    const p = project(head, this.viewportCamera(), this.canvas.width, this.canvas.height);
    p && (this.ctx.strokeStyle = "#aaa", this.ctx.beginPath(), this.ctx.arc(p[0], p[1], clamp(28 / p[2], 3, 12), 0, Math.PI * 2), this.ctx.stroke());
  }
  drawNull(obj) {
    const p = obj.position || [0, 1, 0], s = 0.25;
    this.drawLine3D(add(p, [-s, 0, 0]), add(p, [s, 0, 0]), "#bbb", 2), this.drawLine3D(add(p, [0, -s, 0]), add(p, [0, s, 0]), "#bbb", 2), this.drawLine3D(add(p, [0, 0, -s]), add(p, [0, 0, s]), "#bbb", 2);
  }
  drawCard(obj) {
    const [x, y, z] = obj.position || [0, 1.5, 0], [w, h] = obj.size || [2, 3], camera = this.viewportCamera(), corners = [[x - w / 2, y - h / 2, z], [x + w / 2, y - h / 2, z], [x + w / 2, y + h / 2, z], [x - w / 2, y + h / 2, z]].map((p) => project(p, camera, this.canvas.width, this.canvas.height));
    if (corners.some((p) => !p)) return;
    const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    this.ctx.save(), this.ctx.beginPath(), this.ctx.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < 4; i++) this.ctx.lineTo(corners[i][0], corners[i][1]);
    this.ctx.closePath(), this.ctx.clip();
    const media = this.cardMediaById.get(obj.id) || (obj.id === "subject" ? this.cardMedia : null);
    if (media)
      try {
        const dw = Math.max(1, maxX - minX), dh = Math.max(1, maxY - minY), sw = media.videoWidth || media.naturalWidth || media.width, sh = media.videoHeight || media.naturalHeight || media.height, fit = this.state.card_fit || "contain";
        if (this.ctx.fillStyle = "#111", this.ctx.fillRect(minX, minY, dw, dh), fit === "stretch" || !sw || !sh) this.ctx.drawImage(media, minX, minY, dw, dh);
        else if (fit === "contain") {
          const scale = Math.min(dw / sw, dh / sh), w2 = sw * scale, h2 = sh * scale;
          this.ctx.drawImage(media, minX + (dw - w2) / 2, minY + (dh - h2) / 2, w2, h2);
        } else {
          const scale = Math.max(dw / sw, dh / sh), cropW = dw / scale, cropH = dh / scale;
          this.ctx.drawImage(media, (sw - cropW) / 2, (sh - cropH) / 2, cropW, cropH, minX, minY, dw, dh);
        }
      } catch {
      }
    else
      this.ctx.fillStyle = "#3a414b", this.ctx.fillRect(minX, minY, maxX - minX, maxY - minY), this.ctx.fillStyle = "#d8d8d8", this.ctx.textAlign = "center", this.ctx.font = `${Math.max(12, Math.min(28, (maxX - minX) * 0.08))}px system-ui`, this.ctx.fillText("SUBJECT CARD", (minX + maxX) / 2, (minY + maxY) / 2);
    this.ctx.restore(), this.ctx.strokeStyle = "#b3b8c1", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < 4; i++) this.ctx.lineTo(corners[i][0], corners[i][1]);
    this.ctx.closePath(), this.ctx.stroke();
  }
  drawCameraPath() {
    if (!(this.state.keyframes.length < 2)) {
      for (let i = 0; i < this.state.keyframes.length - 1; i++) this.drawLine3D(this.state.keyframes[i].camera.position, this.state.keyframes[i + 1].camera.position, "#6c82b0", 2);
      for (const k of this.state.keyframes) {
        const p = project(k.camera.position, this.viewportCamera(), this.canvas.width, this.canvas.height);
        p && (this.ctx.fillStyle = k.frame === this.frame ? "#f2d06b" : "#7694d1", this.ctx.beginPath(), this.ctx.arc(p[0], p[1], 4, 0, Math.PI * 2), this.ctx.fill());
      }
    }
  }
  drawSpeedHeatmap() {
    if (this.state.keyframes.length < 2) return;
    const speeds = [];
    for (let index = 0; index < this.state.keyframes.length - 1; index++) {
      const a = this.state.keyframes[index], b = this.state.keyframes[index + 1];
      speeds.push(length(sub(b.camera.position, a.camera.position)) * this.state.fps / Math.max(1, b.frame - a.frame));
    }
    const maximum = Math.max(...speeds, 1e-6);
    for (let index = 0; index < speeds.length; index++) {
      const hue = 120 * (1 - speeds[index] / maximum);
      this.drawLine3D(this.state.keyframes[index].camera.position, this.state.keyframes[index + 1].camera.position, `hsl(${hue} 85% 55%)`, 5);
    }
  }
  drawOverlays() {
    const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
    if (!this.recording && this.state.view_mode === "camera" && this.state.guides !== !1) {
      c.save(), c.strokeStyle = "#ffffff55", c.lineWidth = 1, c.beginPath();
      for (const x of [w / 3, 2 * w / 3])
        c.moveTo(x, 0), c.lineTo(x, h);
      for (const y of [h / 3, 2 * h / 3])
        c.moveTo(0, y), c.lineTo(w, y);
      c.moveTo(w / 2 - 14, h / 2), c.lineTo(w / 2 + 14, h / 2), c.moveTo(w / 2, h / 2 - 14), c.lineTo(w / 2, h / 2 + 14), c.stroke(), c.restore();
    }
    if (this.recording || this.drawTransformGizmo(), this.state.burn_in) {
      const camera = this.viewportCamera();
      c.save(), c.fillStyle = "#000b", c.fillRect(0, h - 34, w, 34), c.fillStyle = "#fff", c.font = `${Math.max(12, Math.round(h * 0.025))}px monospace`, c.fillText(`F ${this.frame}/${this.state.duration_frames - 1}  ${this.state.fps}fps  FOV ${camera.fov.toFixed(1)}  ${this.state.render_mode}`, 12, h - 12), c.restore();
    }
  }
  render() {
    const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
    c.fillStyle = "#121212", c.fillRect(0, 0, w, h);
    const mode = this.state.render_mode, viewCamera = this.viewportCamera();
    const worldObjects = this.state.objects.some((obj) => obj.parent_id) ? this.state.objects.map((obj) => obj.parent_id ? { ...obj, ...worldTransform(this.state.objects, obj) } : obj) : this.state.objects;
    const renderState = worldObjects === this.state.objects ? this.state : { ...this.state, objects: worldObjects };
    if (this.webgl)
      this.webgl.render(renderState, viewCamera, this.cardMediaById, w, h, this.modelUrlsById, this.frame, this.recording), c.drawImage(this.webgl.canvas, 0, 0, w, h);
    else {
      (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(mode) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(mode) && this.drawPointField();
      for (const obj of worldObjects)
        obj.enabled !== !1 && (obj.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(mode) ? this.drawCard(obj) : ["cube", "ground", "glb", "model"].includes(obj.type) && mode !== "grid" && mode !== "point_field" ? this.drawCube(obj) : obj.type === "sphere" && mode !== "grid" && mode !== "point_field" ? this.drawSphere(obj) : obj.type === "human" && mode !== "grid" && mode !== "point_field" ? this.drawHuman(obj) : obj.type === "null" && this.drawNull(obj));
      this.recording || this.drawCameraPath();
    }
    !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays();
    const p = viewCamera.position, t = viewCamera.target;
    this.root.querySelector('[data-role="hud"]').textContent = `OmniCam · ${this.state.view_mode} · ${mode}
F ${this.frame}/${this.state.duration_frames - 1} · ${this.state.fps}fps · FOV ${viewCamera.fov.toFixed(1)}°
P ${p.map((v) => v.toFixed(2)).join(", ")}
T ${t.map((v) => v.toFixed(2)).join(", ")}`, this.renderCameraView();
  }
  renderCameraView() {
    if (this.state.camera_view_visible) {
      this.refreshCameraPreviews();
      for (const cameraTrack of this.state.cameras) {
        const canvas = this.cameraPreviewCanvases.get(cameraTrack.id), context = this.cameraPreviewContexts.get(cameraTrack.id);
        if (!canvas?.width || !context) continue;
        const width = canvas.width, height = canvas.height, camera = sampleCamera(cameraTrack, this.frame);
        if (context.fillStyle = "#111", context.fillRect(0, 0, width, height), this.cameraWebgl && (this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1 }, camera, this.cardMediaById, width, height, this.modelUrlsById, this.frame, !0), context.drawImage(this.cameraWebgl.canvas, 0, 0, width, height)), drawPreviewOverlays(this, context, width, height), !0) {
        }
        const frameLabel = this.root.querySelector(`[data-camera-frame="${cameraTrack.id}"]`);
        frameLabel && (frameLabel.textContent = `F${this.frame}`);
      }
    }
  }
  drawPreviewOverlays(context, width, height) {
    drawPreviewOverlays(this, context, width, height);
  }
  maximizeCameraPreview(id) {
    maximizeCameraPreview(this, id);
  }
  setStatus(text) {
    this.root.querySelector('[data-role="status"]').textContent = text;
  }
  async makePlayblast() {
    return makePlayblast(this);
  }
  async waitForMediaFrame() {
    return waitForMediaFrame(this);
  }
  async captureRealtimePlayblast() {
    return captureRealtime(this);
  }
  async uploadPlayblast(blob) {
    return uploadDirectorPlayblast(this, blob);
  }
  dispose() {
    this.stopPlay(), clearTimeout(this.previewClickTimer), this.abortController?.abort(), this.resizeObserver?.disconnect(), this.webgl?.dispose(), this.cameraWebgl?.dispose();
    this.objectUrls.clear(), this.cardMediaById.clear(), this.modelUrlsById.clear(), this.modelInfoById.clear();
  }
}
function attachDirector(node) {
  if (node.__majoorOmniCam) return;
  const ui = new OmniCamDirectorUI(node);
  node.__majoorOmniCam = ui, ui.hideInternalWidgets();
  const preferredHeight = () => Math.max(700, ui.root.scrollHeight || 0);
  ui.domWidget = node.addDOMWidget("majoor_omnicam_viewport", "omnicam", ui.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: preferredHeight,
    getMaxHeight: () => preferredHeight(),
    afterResize: () => {
      ui.resizeCanvas(), ui.render();
    }
  });
  const min = [760, 780], current = node.size || min;
  node.setSize([Math.max(current[0], min[0]), Math.max(current[1], min[1])]);
  const originalResize = node.onResize;
  node.onResize = function() {
    originalResize?.apply(this, arguments), requestAnimationFrame(() => {
      ui.resizeCanvas(), ui.render();
    });
  };
  const originalConfigure = node.onConfigure;
  node.onConfigure = function() {
    originalConfigure?.apply(this, arguments), requestAnimationFrame(() => ui.restoreFromWidgets());
  };
  const originalAfterGraphConfigured = node.onAfterGraphConfigured;
  node.onAfterGraphConfigured = function() {
    originalAfterGraphConfigured?.apply(this, arguments), requestAnimationFrame(() => ui.restoreFromWidgets());
  };
  const originalRemoved = node.onRemoved;
  node.onRemoved = function() {
    ui.dispose(), originalRemoved?.apply(this, arguments);
  };
  const originalExecuted = node.onExecuted;
  node.onExecuted = function(message) {
    originalExecuted?.apply(this, arguments), ui.loadExecutionPreview(message);
  };
}
app.registerExtension({
  name: EXTENSION_NAME,
  async nodeCreated(node) {
    (node.comfyClass === NODE_CLASS || node.constructor?.type === NODE_CLASS) && attachDirector(node);
  }
});
