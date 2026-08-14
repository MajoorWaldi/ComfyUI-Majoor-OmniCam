import { app as M } from "../../scripts/app.js";
import { api as T } from "../../scripts/api.js";
import { OmniWebGLViewport as j } from "./omnicam-webgl.js";
import { EditorHistory as F } from "./omnicam-history.js";
import { ContextMenuController as O, initializeTooltips as I, promptText as $ } from "./omnicam-ui.js";
import { ObjectUrlRegistry as A } from "./omnicam-media.js";
import { buildRoot as D } from "./omnicam-template.js";
import { dispatchDirectorKey as W } from "./omnicam-commands.js";
import { restoreFromWidgets as H, bindWidgetCallbacks as R, syncFromWidgets as q, serializeEditorState as N, activeCameraTrack as V, playblastCameraTrack as U, syncActiveCameraTrack as B } from "./omnicam-state-sync.js";
import { refreshCameraSelectors as G, refreshCameraPreviews as J, addCamera as X, renameCamera as Y, duplicateCamera as Z, deleteCamera as Q, activateCamera as ee, setPlayblastCamera as te, toggleCameraView as ae, drawPreviewOverlays as _, maximizeCameraPreview as ie } from "./omnicam-cameras.js";
import { makePlayblast as se, waitForMediaFrame as re, captureRealtime as ne, uploadDirectorPlayblast as oe } from "./omnicam-record.js";
import { curveChannels as he, drawCurveEditor as le, onCurvePointerDown as de, onCurvePointerMove as ce, onCurvePointerUp as me, setCurveInterpolation as ue, setTangentMode as pe, toggleCurveHandles as fe, refreshKeys as ge, timelineFrameFromEvent as ye, onTimelinePointerDown as ve, onTimelinePointerMove as be, onTimelinePointerUp as we } from "./omnicam-timeline.js";
import { resetCamera as Ce, viewportCamera as ke, setViewMode as xe, setTransformMode as Se, gizmoAxes as Ee, gizmoGeometry as Me, pickGizmo as Le, pickSceneObject as Pe, drawTransformGizmo as je, onPointerDown as _e, onPointerMove as ze, onPointerUp as Ke, onWheel as Te, frameTarget as Fe } from "./omnicam-viewport-controls.js";
import { configureDomMedia as Oe, loadMediaUrl as Ie, restoreAssets as $e, onModelLoaded as Ae, loadModelFile as De, loadCardFile as We, loadExecutionPreview as He, loadSelectedReference as Re } from "./omnicam-dom-media.js";
import { refreshSetupDiagnostic as qe } from "./omnicam-diagnostics.js";
import { timelineObject as Ne, timelineKeyframes as Ve, applyObjectAnimationFrame as Ue, insertKeyframe as Be, deleteKeyframe as Ge, copyKeyframe as Je, pasteKeyframe as Xe, selectedKeyframe as Ye, selectKeyframe as Ze, beginCameraEdit as Qe, commitCameraEdit as et, finishCameraEdit as tt, exitKeyEdit as at, toggleAutoKey as it, updateEditState as st, updateKeyVisualState as rt, refreshKeyEditor as nt, retimeSelectedKey as ot, updateSelectedKey as ht, loadSelectedKeyView as lt, goToAdjacentKey as dt, addPrimitive as ct, renameObject as mt, duplicateObject as ut, toggleObject as pt, deleteObject as ft, addMediaCard as gt, selectedObject as yt, playblastCameraAtFrame as vt, refreshInspector as bt, updateSelectedObject as wt, beginObjectEdit as Ct, commitObjectEdit as kt, updateCameraFromHud as xt, selectObjectAnimation as St, setObjectParent as Et, refreshObjects as Mt, removeObjectResources as Lt } from "./omnicam-scene.js";
import { configureCore as Pt, sanitizeState as z, sampleCamera as v, clamp as y, sampleObjectTransform as jt, defaultCamera as _t, project as b, add as w, length as zt, sub as Kt, worldTransform as Tt } from "./omnicam-core.js";
const Ft = "Majoor.OmniCam.Director", K = "MajoorOmniCamDirector";
Pt({ api: T });
Oe({ api: T });
class Ot {
  constructor(e) {
    this.node = e, this.root = D(), this.root.tabIndex = -1, this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.root.querySelector(".viewport-wrap"), this.interactionElement.tabIndex = -1, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 });
    try {
      this.webgl = new j(() => this.render(), (i) => this.onModelLoaded(i));
    } catch (i) {
      console.warn("OmniCam WebGL unavailable; using Canvas fallback", i), this.webgl = null;
    }
    try {
      this.cameraWebgl = new j(() => this.renderCameraView(), () => {
      });
    } catch (i) {
      console.warn("OmniCam Camera View unavailable", i), this.cameraWebgl = null;
    }
    this.stateWidget = e.widgets?.find((i) => i.name === "state_json"), this.recordingWidget = e.widgets?.find((i) => i.name === "recording_path"), this.cardWidget = e.widgets?.find((i) => i.name === "card_asset"), this.widthWidget = e.widgets?.find((i) => i.name === "width"), this.heightWidget = e.widgets?.find((i) => i.name === "height"), this.fpsWidget = e.widgets?.find((i) => i.name === "fps"), this.durationWidget = e.widgets?.find((i) => i.name === "duration_seconds"), this.modeWidget = e.widgets?.find((i) => i.name === "render_mode");
    let t = null;
    try {
      t = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = z(t), this.frame = 0, this.camera = v(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.objectUrls = new A(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = "subject", this.selectedEntity = "camera", this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.contextMenu = new O(this.root), this.history = new F({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedKeyFrame: this.selectedKeyFrame }), restore: (i) => this.restoreHistorySnapshot(i) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bind(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.refreshSetupDiagnostic();
  }
  refreshSetupDiagnostic() {
    qe(this);
  }
  hideInternalWidgets() {
    for (const e of ["state_json", "recording_path", "card_asset"]) {
      const t = this.node.widgets?.find((i) => i.name === e);
      t && (t.computeSize = () => [0, -4], t.draw = () => {
      }, t.hidden = !0, t.options = { ...t.options || {}, hideInVueNodes: !0 });
    }
  }
  restoreFromWidgets() {
    H(this);
  }
  restoreHistorySnapshot(e) {
    const t = JSON.parse(e);
    this.state = z(t.state), this.frame = y(t.frame, 0, this.state.duration_frames - 1), this.selectedEntity = t.selectedEntity, this.selectedObjectId = t.selectedObjectId, this.selectedKeyFrame = t.selectedKeyFrame, this.camera = v(this.state, this.frame), this.cameraPreviewSignature = "", this.serialize(), this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.render();
  }
  checkpoint(e) {
    this.history.checkpoint(e);
  }
  undo() {
    const e = this.history.undo();
    e && this.setStatus(`Undo: ${e}`);
  }
  redo() {
    const e = this.history.redo();
    e && this.setStatus(`Redo: ${e}`);
  }
  bind() {
    this.abortController = new AbortController();
    const e = this.abortController.signal, t = (a) => this.root.querySelector(a);
    t('[data-act="play"]').addEventListener("click", () => this.togglePlay(), { signal: e }), t('[data-act="key"]').addEventListener("click", () => this.insertKeyframe(), { signal: e }), t('[data-act="auto-key"]').addEventListener("click", () => this.toggleAutoKey(), { signal: e }), t('[data-act="delete-key"]').addEventListener("click", () => this.deleteKeyframe(), { signal: e }), t('[data-act="copy-key"]').addEventListener("click", () => this.copyKeyframe(), { signal: e }), t('[data-act="paste-key"]').addEventListener("click", () => this.pasteKeyframe(), { signal: e }), t('[data-act="previous-key"]').addEventListener("click", () => this.goToAdjacentKey(-1), { signal: e }), t('[data-act="next-key"]').addEventListener("click", () => this.goToAdjacentKey(1), { signal: e }), t('[data-act="previous-frame"]').addEventListener("click", () => this.setFrame(this.frame - 1), { signal: e }), t('[data-act="next-frame"]').addEventListener("click", () => this.setFrame(this.frame + 1), { signal: e }), t('[data-act="update-key"]').addEventListener("click", () => this.updateKeyFromView(), { signal: e }), t('[data-act="view-key"]').addEventListener("click", () => this.loadSelectedKeyView(), { signal: e }), t('[data-act="reset-camera"]').addEventListener("click", () => this.resetCamera(), { signal: e }), t('[data-act="loop"]').addEventListener("click", () => this.toggleLoop(), { signal: e }), t('[data-act="range-start"]').addEventListener("click", () => this.setPlaybackRange("start"), { signal: e }), t('[data-act="range-end"]').addEventListener("click", () => this.setPlaybackRange("end"), { signal: e }), t('[data-act="range-clear"]').addEventListener("click", () => this.clearPlaybackRange(), { signal: e }), t('[data-act="toggle-timecode"]').addEventListener("click", () => this.toggleTimecode(), { signal: e }), t('[data-act="toggle-snap"]').addEventListener("click", () => this.toggleSnap(), { signal: e }), t('[data-role="snap-frames"]').addEventListener("change", (a) => {
      this.state.snap_frames = Math.max(1, Math.round(Number(a.target.value) || 1)), this.serialize(), this.setStatus(`Snap: ${this.state.snap_frames} frame${this.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal: e }), t('[data-act="add-camera"]').addEventListener("click", () => {
      this.addCamera(), this.closeMenus();
    }, { signal: e }), t('[data-act="record"]').addEventListener("click", () => this.makePlayblast(), { signal: e }), t('[data-act="h3-setup"]').addEventListener("click", () => this.createH3Setup(), { signal: e }), t('[data-act="load-card"]').addEventListener("click", () => t('[data-role="file"]').click(), { signal: e }), t('[data-act="add-card"]').addEventListener("click", () => this.addMediaCard(), { signal: e }), t('[data-role="file"]').addEventListener("change", (a) => this.loadCardFile(a.target.files?.[0]), { signal: e }), t('[data-act="load-model"]').addEventListener("click", () => {
      this.closeMenus(), t('[data-role="model-file"]').click();
    }, { signal: e }), t('[data-role="model-file"]').addEventListener("change", (a) => {
      this.loadModelFile(a.target.files?.[0]), a.target.value = "";
    }, { signal: e });
    for (const a of this.root.querySelectorAll("[data-object-type]")) a.addEventListener("click", () => {
      this.addPrimitive(a.dataset.objectType), this.closeMenus();
    }, { signal: e });
    t('[data-role="mode"]').addEventListener("change", (a) => {
      this.state.render_mode = a.target.value, this.modeWidget && (this.modeWidget.value = a.target.value), this.serialize(), this.render();
    }, { signal: e }), t('[data-role="frame"]').addEventListener("change", (a) => this.setFrame(Number(a.target.value)), { signal: e }), t('[data-role="scrub"]').addEventListener("input", (a) => this.setFrame(Number(a.target.value)), { signal: e }), t('[data-role="fov"]').addEventListener("change", (a) => {
      this.camera.fov = y(Number(a.target.value), 5, 150), this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
    }, { signal: e }), t('[data-role="roll"]').addEventListener("change", (a) => {
      this.camera.roll = y(Number(a.target.value), -180, 180), this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
    }, { signal: e }), t('[data-role="speed"]').addEventListener("change", (a) => {
      this.cameraSpeed = y(Number(a.target.value), 0.05, 5), a.target.value = String(this.cameraSpeed);
    }, { signal: e }), t('[data-role="camera-type"]').addEventListener("change", (a) => {
      this.camera.camera_type = a.target.value, this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
    }, { signal: e }), t('[data-role="guides"]').addEventListener("change", (a) => {
      this.state.guides = a.target.checked, this.serialize(), this.render();
    }, { signal: e }), t('[data-role="playblast-grid"]').addEventListener("change", (a) => {
      this.state.playblast_grid = a.target.checked, this.serialize(), this.render();
    }, { signal: e }), t('[data-role="burn-in"]').addEventListener("change", (a) => {
      this.state.burn_in = a.target.checked, this.serialize(), this.render();
    }, { signal: e }), t('[data-role="speed-heatmap"]').addEventListener("change", (a) => {
      this.state.speed_heatmap = a.target.checked, this.serialize(), this.render();
    }, { signal: e }), t('[data-role="card-fit"]').addEventListener("change", (a) => {
      this.state.card_fit = a.target.value, this.serialize(), this.render();
    }, { signal: e }), t('[data-role="ui-density"]').addEventListener("change", (a) => this.setDensity(a.target.value), { signal: e }), t('[data-role="preview-layout"]').addEventListener("change", (a) => {
      this.state.preview_layout = a.target.value, this.serialize(), this.refreshCameraPreviews(), this.renderCameraView(), this.setStatus(`Preview layout: ${a.target.value}`);
    }, { signal: e }), t('[data-role="safe-areas"]').addEventListener("change", (a) => {
      this.state.safe_areas = a.target.checked, this.serialize(), this.renderCameraView();
    }, { signal: e }), t('[data-role="resolution-gate"]').addEventListener("change", (a) => {
      this.state.resolution_gate = a.target.checked, this.serialize(), this.renderCameraView(), this.render();
    }, { signal: e }), t('[data-role="aspect-ratio"]').addEventListener("change", (a) => {
      this.state.aspect_ratio = a.target.value, this.serialize(), this.renderCameraView();
    }, { signal: e }), t('[data-role="proxy-preset"]').addEventListener("change", (a) => this.applyProxyPreset(a.target.value), { signal: e }), t('[data-role="playblast-camera"]').addEventListener("change", (a) => this.setPlayblastCamera(a.target.value), { signal: e });
    for (const a of this.root.querySelectorAll("[data-transform-mode]")) a.addEventListener("click", () => this.setTransformMode(a.dataset.transformMode), { signal: e });
    t('[data-role="gizmo-space"]').addEventListener("change", (a) => {
      this.state.gizmo_space = a.target.value, this.serialize(), this.render();
    }, { signal: e }), t('[data-role="view-mode"]').addEventListener("change", (a) => this.setViewMode(a.target.value), { signal: e });
    for (const a of this.root.querySelectorAll('[data-act="toggle-camera-view"]')) a.addEventListener("click", () => this.toggleCameraView(), { signal: e });
    t('[data-role="object-material"]').addEventListener("change", (a) => {
      const o = this.selectedObject();
      o && (o.material_mode = a.target.value, this.serialize(), this.render());
    }, { signal: e }), t('[data-role="reference-select"]').addEventListener("change", (a) => {
      this.state.reference_index = Number(a.target.value), this.serialize(), this.loadSelectedReference();
    }, { signal: e });
    for (const a of ["object-x", "object-y", "object-z", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"]) t(`[data-role="${a}"]`).addEventListener("change", () => this.updateSelectedObject(), { signal: e });
    for (const a of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"]) t(`[data-role="${a}"]`).addEventListener("change", () => this.updateCameraFromHud(), { signal: e });
    t('[data-role="animation-select"]').addEventListener("change", (a) => this.selectObjectAnimation(Number(a.target.value)), { signal: e }), t('[data-role="object-parent"]').addEventListener("change", (a) => this.setObjectParent(a.target.value || null), { signal: e }), t('[data-role="duration-seconds"]').addEventListener("change", (a) => {
      this.durationWidget && (this.durationWidget.value = Number(a.target.value)), this.syncFromWidgets();
    }, { signal: e }), t('[data-role="timeline-fps"]').addEventListener("change", (a) => {
      this.fpsWidget && (this.fpsWidget.value = Number(a.target.value)), this.syncFromWidgets();
    }, { signal: e }), t('[data-role="curve-group"]').addEventListener("change", () => this.drawCurveEditor(), { signal: e }), t('[data-act="curve-handles"]').addEventListener("click", () => this.toggleCurveHandles(), { signal: e });
    for (const a of this.root.querySelectorAll("[data-curve-mode]")) a.addEventListener("click", () => this.setCurveInterpolation(a.dataset.curveMode), { signal: e });
    for (const a of this.root.querySelectorAll("[data-tangent-mode]")) a.addEventListener("click", () => this.setTangentMode(a.dataset.tangentMode), { signal: e });
    const i = t('[data-role="curve-canvas"]');
    i.addEventListener("pointerdown", (a) => this.onCurvePointerDown(a), { signal: e }), i.addEventListener("pointermove", (a) => this.onCurvePointerMove(a), { signal: e }), i.addEventListener("pointerup", (a) => this.onCurvePointerUp(a), { signal: e }), i.addEventListener("pointercancel", (a) => this.onCurvePointerUp(a), { signal: e }), t('[data-role="key-frame"]').addEventListener("change", (a) => this.retimeSelectedKey(Number(a.target.value)), { signal: e });
    for (const a of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"]) t(`[data-role="${a}"]`).addEventListener("change", () => this.updateSelectedKey(), { signal: e });
    for (const a of this.root.querySelectorAll(".toolbar-menu")) a.addEventListener("toggle", () => {
      a.open && this.closeMenus(a);
    }, { signal: e });
    this.root.addEventListener("pointerdown", (a) => {
      a.stopPropagation();
      const o = a.composedPath?.()[0] || a.target;
      o instanceof HTMLElement && !o.closest(".toolbar-menu") && this.closeMenus(), o instanceof HTMLElement && !o.closest(".key,.key-editor,canvas") && this.exitKeyEdit(!0), (!(o instanceof HTMLElement) || !o.closest("input,select,textarea,button,[contenteditable=true]")) && this.root.focus({ preventScroll: !0 });
    }, { signal: e }), document.addEventListener("pointerdown", (a) => {
      const o = a.composedPath?.()[0] || a.target;
      (!(o instanceof Node) || !this.root.contains(o)) && (this.closeMenus(), this.exitKeyEdit(!0));
    }, { capture: !0, signal: e }), this.root.addEventListener("mousedown", (a) => a.stopPropagation(), { signal: e }), this.root.addEventListener("contextmenu", (a) => this.onContextMenu(a), { signal: e }), this.interactionElement.addEventListener("pointerdown", (a) => this.onPointerDown(a), { signal: e }), this.interactionElement.addEventListener("pointermove", (a) => this.onPointerMove(a), { signal: e }), this.interactionElement.addEventListener("pointerup", (a) => this.onPointerUp(a), { signal: e }), this.interactionElement.addEventListener("pointercancel", (a) => this.onPointerUp(a), { signal: e }), this.interactionElement.addEventListener("wheel", (a) => this.onWheel(a), { passive: !1, signal: e }), window.addEventListener("pointermove", (a) => {
      this.keyDrag && this.onPointerMove(a);
    }, { capture: !0, signal: e }), window.addEventListener("pointerup", (a) => {
      this.keyDrag && this.onPointerUp(a);
    }, { capture: !0, signal: e });
    const s = t('[data-role="keys"]');
    s.addEventListener("pointerdown", (a) => this.onTimelinePointerDown(a), { signal: e }), s.addEventListener("pointermove", (a) => this.onTimelinePointerMove(a), { signal: e }), s.addEventListener("pointerup", (a) => this.onTimelinePointerUp(a), { signal: e }), s.addEventListener("pointercancel", (a) => this.onTimelinePointerUp(a), { signal: e }), this.root.addEventListener("keydown", (a) => this.onKey(a), { signal: e });
    const r = new ResizeObserver(() => {
      this.resizeCanvas(), this.render();
    });
    r.observe(this.root.querySelector(".viewport-wrap")), r.observe(this.root.querySelector('[data-role="camera-previews"]')), this.resizeObserver = r, this.updateEditState();
  }
  bindWidgetCallbacks() {
    R(this);
  }
  syncFromWidgets(e = !0) {
    q(this, e);
  }
  serialize() {
    N(this);
  }
  activeCameraTrack() {
    return V(this);
  }
  playblastCameraTrack() {
    return U(this);
  }
  syncActiveCameraTrack() {
    B(this);
  }
  refreshCameraSelectors() {
    G(this);
  }
  refreshCameraPreviews() {
    J(this);
  }
  addCamera() {
    X(this);
  }
  async renameCamera(e) {
    return Y(this, e);
  }
  duplicateCamera(e) {
    Z(this, e);
  }
  async deleteCamera(e) {
    return Q(this, e);
  }
  activateCamera(e) {
    ee(this, e);
  }
  setPlayblastCamera(e) {
    te(this, e);
  }
  closeMenus(e = null) {
    for (const t of this.root.querySelectorAll(".toolbar-menu")) t !== e && (t.open = !1);
    this.hideContextMenu();
  }
  initializeTooltips() {
    I(this.root, this.interactionElement);
  }
  hideContextMenu() {
    this.contextMenu?.hide();
  }
  showContextMenu(e, t, i) {
    return this.contextMenu.show(e, t, i);
  }
  onContextMenu(e) {
    const t = e.target, i = t.closest?.(".camera-preview-tile"), s = t.closest?.(".scene-item"), r = t.closest?.(".key");
    if (i) return this.openCameraContext(e, i.dataset.cameraId, !0);
    if (s?.dataset.cameraId) return this.openCameraContext(e, s.dataset.cameraId, !1);
    if (s?.dataset.objectId) return this.openObjectContext(e, s.dataset.objectId);
    if (r) {
      const a = this.timelineKeyframes().find((o) => o.frame === Number(r.dataset.keyFrame));
      return a && this.selectKeyframe(a), this.openTimelineContext(e, !0);
    }
    if (t.closest?.('[data-role="keys"]'))
      return this.setFrame(this.timelineFrameFromEvent(e, t.closest('[data-role="keys"]'))), this.openTimelineContext(e, !1);
    if (t.closest?.(".curve-editor")) return this.openCurveContext(e);
    if (t.closest?.(".viewport-wrap")) {
      const a = this.interactionElement.getBoundingClientRect(), o = (e.clientX - a.left) * this.canvas.width / Math.max(1, a.width), h = (e.clientY - a.top) * this.canvas.height / Math.max(1, a.height), l = this.pickSceneObject([o, h]);
      return l ? (this.selectedEntity = "object", this.selectedObjectId = l.id, this.refreshObjects(), this.refreshKeys(), this.openObjectContext(e, l.id)) : this.openViewportContext(e);
    }
    e.preventDefault(), e.stopPropagation();
  }
  openViewportContext(e) {
    const t = this.selectedObject();
    this.showContextMenu(e, "Viewport", [
      { label: t ? `Set key · ${t.name || t.type}` : `Set key · ${this.activeCameraTrack().name}`, icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
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
  openObjectContext(e, t) {
    const i = this.state.objects.find((s) => s.id === t);
    i && (this.selectedEntity = "object", this.selectedObjectId = t, this.showContextMenu(e, i.name || i.type, [
      { label: "Set key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: "Rename object…", icon: "pi-pencil", run: () => this.renameObject(t) },
      { label: "Duplicate object", icon: "pi-copy", run: () => this.duplicateObject(t) },
      { label: i.enabled === !1 ? "Show object" : "Hide object", icon: i.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(t) },
      null,
      { label: "Camera looks at this object", icon: "pi-eye", help: "Point every camera keyframe's target at this object's position", run: () => this.lookAtObject(t) },
      null,
      { label: "Translate", icon: "pi-arrows-alt", shortcut: "T", run: () => this.setTransformMode("translate") },
      { label: "Rotate", icon: "pi-refresh", shortcut: "R", run: () => this.setTransformMode("rotate") },
      { label: "Scale", icon: "pi-expand", shortcut: "S", run: () => this.setTransformMode("scale") },
      null,
      { label: "Delete object", icon: "pi-trash", danger: !0, disabled: t === "subject", help: t === "subject" ? "The canonical subject card cannot be deleted" : "Delete this object and its animation keys", run: () => this.deleteObject(t) }
    ]));
  }
  openCameraContext(e, t, i = !1) {
    const s = this.state.cameras.find((r) => r.id === t);
    s && this.showContextMenu(e, `${s.name}${i ? " preview" : ""}`, [
      { label: "Edit this camera", icon: "pi-video", run: () => this.activateCamera(t) },
      { label: "Set as primary / playblast", icon: "pi-star", disabled: t === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(t) },
      { label: "Set key at playhead", icon: "pi-key", shortcut: "I", run: () => {
        this.activateCamera(t), this.insertKeyframe();
      } },
      { label: "Record this preview", icon: "pi-circle-fill", run: () => {
        this.setPlayblastCamera(t), this.makePlayblast();
      } },
      { label: this.state.maximized_camera_id === t ? "Restore preview size" : "Maximize preview", icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(t) },
      null,
      { label: "Shot: move earlier", icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((r) => r.id === t) <= 0, run: () => this.moveShot(t, -1) },
      { label: "Shot: move later", icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((r) => r.id === t) >= this.state.cameras.length - 1, run: () => this.moveShot(t, 1) },
      { label: "Shot handles…", icon: "pi-sliders-h", run: () => this.editShotHandles(t) },
      null,
      { label: "Rename camera…", icon: "pi-pencil", run: () => this.renameCamera(t) },
      { label: "Duplicate camera", icon: "pi-copy", run: () => this.duplicateCamera(t) },
      { label: "Create camera from current view", icon: "pi-plus", run: () => this.addCamera() },
      null,
      { label: "Delete camera", icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(t) }
    ]);
  }
  moveShot(e, t) {
    const i = this.state.cameras.findIndex((a) => a.id === e), s = i + t;
    if (i < 0 || s < 0 || s >= this.state.cameras.length) return;
    this.checkpoint("Reorder shot");
    const [r] = this.state.cameras.splice(i, 1);
    this.state.cameras.splice(s, 0, r), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${r.name} → #${s + 1}`);
  }
  async editShotHandles(e) {
    const t = this.state.cameras.find((a) => a.id === e);
    if (!t) return;
    const i = t.handles || { in: 0, out: 0 }, s = await $(M, "Shot handles", "Handle frames: in,out", `${i.in},${i.out}`);
    if (s == null) return;
    const r = String(s).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
    if (!r) return this.setStatus("Handles must be two integers: in,out");
    this.checkpoint("Shot handles"), t.handles = { in: Math.min(600, Number(r[1])), out: Math.min(600, Number(r[2])) }, this.serialize(), this.setStatus(`${t.name} handles: ${t.handles.in} / ${t.handles.out}`);
  }
  openTimelineContext(e, t) {
    this.showContextMenu(e, t ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
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
      ...(this.state.markers || []).length ? [{ label: "Remove nearest marker", icon: "pi-bookmark-fill", danger: !0, run: () => this.removeNearestMarker() }] : []
    ]);
  }
  addMarker() {
    if ((this.state.markers || []).find((t) => t.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
    this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((t, i) => t.frame - i.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
  }
  removeNearestMarker() {
    const e = this.state.markers || [];
    if (!e.length) return;
    const t = e.reduce((i, s) => Math.abs(s.frame - this.frame) < Math.abs(i.frame - this.frame) ? s : i);
    this.checkpoint("Remove marker"), this.state.markers = e.filter((i) => i !== t), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${t.frame}`);
  }
  openCurveContext(e) {
    this.showContextMenu(e, "Curve editor", [
      { label: this.showCurveHandles ? "Hide Bézier handles" : "Show Bézier handles", icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
      null,
      ...["bezier", "smooth", "linear", "ease_in", "ease_out", "ease"].map((t) => ({ label: `Interpolation: ${t.replaceAll("_", " ")}`, icon: "pi-chart-line", disabled: !this.selectedKeyframe(), run: () => this.setCurveInterpolation(t) })),
      null,
      ...["auto", "vector", "free", "aligned"].map((t) => ({ label: `Tangents: ${t[0].toUpperCase()}${t.slice(1)}`, icon: "pi-share-alt", disabled: !this.selectedKeyframe(), run: () => this.setTangentMode(t) })),
      null,
      { label: "Delete selected key", icon: "pi-trash", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() }
    ]);
  }
  resizeCanvas() {
    const e = this.root.querySelector(".viewport-wrap"), t = Math.min(2, window.devicePixelRatio || 1), i = Math.max(320, Math.round(e.clientWidth * t)), s = Math.max(180, Math.round(e.clientHeight * t));
    (this.canvas.width !== i || this.canvas.height !== s) && (this.canvas.width = i, this.canvas.height = s);
    for (const r of this.cameraPreviewCanvases.values()) {
      const a = Math.max(220, Math.round(r.clientWidth * t)), o = Math.max(140, Math.round(r.clientHeight * t));
      (r.width !== a || r.height !== o) && (r.width = a, r.height = o);
    }
    this.drawCurveEditor();
  }
  setFrame(e, t = !1, i = !0) {
    this.frame = y(Math.round(e), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = v(this.state, this.frame), this.applyObjectAnimationFrame(), this.root.querySelector('[data-role="frame"]').value = String(this.frame), this.root.querySelector('[data-role="scrub"]').value = String(this.frame), this.root.querySelector('[data-role="fov"]').value = String(Math.round(this.camera.fov * 100) / 100), this.root.querySelector('[data-role="roll"]').value = String(Math.round((this.camera.roll || 0) * 100) / 100), this.root.querySelector('[data-role="camera-type"]').value = this.camera.camera_type;
    const s = this.frame / this.state.fps;
    for (const n of this.cardMediaById.values()) n instanceof HTMLVideoElement && Number.isFinite(n.duration) && n.duration > 0 && (n.currentTime = s % n.duration);
    const r = Math.floor(s / 60), a = Math.floor(s % 60), o = Math.floor(s % 1 * 1e3), h = this.frame % Math.max(1, Math.round(this.state.fps)), l = Math.floor(this.frame / this.state.fps);
    if (this.root.querySelector('[data-role="time"]').textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(l / 3600)).padStart(2, "0")}:${String(Math.floor(l / 60) % 60).padStart(2, "0")}:${String(l % 60).padStart(2, "0")}:${String(h).padStart(2, "0")}` : `${String(r).padStart(2, "0")}:${String(a).padStart(2, "0")}.${String(o).padStart(3, "0")}`, i) this.refreshKeys();
    else {
      const n = Math.max(1, this.state.duration_frames - 1), c = this.root.querySelector('[data-role="keys"] .playhead');
      c && (c.style.left = `${100 * this.frame / n}%`);
      for (const p of this.root.querySelectorAll("[data-key-frame]")) {
        const u = Number(p.dataset.keyFrame);
        p.classList.toggle("at-playhead", u === this.frame), p.classList.toggle("selected", u === this.selectedKeyFrame), p.classList.toggle("editing", u === this.editingKeyFrame);
      }
      this.refreshKeyEditor(), this.drawCurveEditor();
    }
    t || this.serialize(), this.refreshInspector(), this.render();
  }
  timelineObject() {
    return Ne(this);
  }
  timelineKeyframes() {
    return Ve(this);
  }
  applyObjectAnimationFrame() {
    Ue(this, jt);
  }
  insertKeyframe() {
    Be(this);
  }
  deleteKeyframe() {
    Ge(this);
  }
  copyKeyframe() {
    Je(this);
  }
  pasteKeyframe() {
    Xe(this);
  }
  resetCamera() {
    Ce(this, _t);
  }
  selectedKeyframe() {
    return Ye(this);
  }
  selectKeyframe(e) {
    Ze(this, e);
  }
  beginCameraEdit() {
    return Qe(this);
  }
  commitCameraEdit() {
    et(this);
  }
  finishCameraEdit() {
    tt(this);
  }
  exitKeyEdit(e = !1) {
    at(this, e);
  }
  toggleAutoKey() {
    it(this);
  }
  updateEditState() {
    st(this);
  }
  updateKeyVisualState() {
    rt(this);
  }
  curveChannels() {
    return he(this);
  }
  drawCurveEditor() {
    le(this);
  }
  onCurvePointerDown(e) {
    de(this, e);
  }
  onCurvePointerMove(e) {
    ce(this, e);
  }
  onCurvePointerUp(e) {
    me(this, e);
  }
  setCurveInterpolation(e) {
    ue(this, e);
  }
  setTangentMode(e) {
    pe(this, e);
  }
  toggleCurveHandles() {
    fe(this);
  }
  refreshKeys() {
    ge(this);
  }
  refreshKeyEditor() {
    nt(this);
  }
  retimeSelectedKey(e, t = !1) {
    ot(this, e, t);
  }
  updateSelectedKey() {
    ht(this);
  }
  updateKeyFromView() {
    updateKeyFromView(this);
  }
  loadSelectedKeyView() {
    lt(this);
  }
  goToAdjacentKey(e) {
    dt(this, e);
  }
  addPrimitive(e) {
    ct(this, e);
  }
  async renameObject(e) {
    return mt(this, e);
  }
  duplicateObject(e) {
    ut(this, e);
  }
  toggleObject(e) {
    pt(this, e);
  }
  async deleteObject(e) {
    return ft(this, e);
  }
  addMediaCard() {
    gt(this);
  }
  selectedObject() {
    return yt(this);
  }
  playblastCameraAtFrame() {
    return vt(this, v);
  }
  viewportCamera() {
    return ke(this);
  }
  setViewMode(e) {
    xe(this, e);
  }
  toggleCameraView() {
    ae(this);
  }
  setDensity(e) {
    ["basic", "animation", "advanced"].includes(e) || (e = "advanced"), this.state.ui_density = e, this.root.dataset.density = e, this.root.querySelector('[data-role="ui-density"]').value = e, this.serialize(), requestAnimationFrame(() => {
      this.resizeCanvas(), this.render();
    }), this.setStatus(`Interface: ${e}`);
  }
  lookAtObject(e) {
    const t = this.state.objects.find((i) => i.id === e);
    if (t) {
      this.checkpoint("Look-at constraint");
      for (const i of this.state.cameras)
        for (const s of i.keyframes) s.camera.target = [...t.position || [0, 1.5, 0]];
      this.camera = v(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${t.name || t.type}`);
    }
  }
  setTransformMode(e) {
    Se(this, e);
  }
  refreshInspector() {
    bt(this);
  }
  updateSelectedObject() {
    wt(this);
  }
  beginObjectEdit(e) {
    return Ct(this, e);
  }
  commitObjectEdit(e) {
    kt(this, e);
  }
  updateCameraFromHud() {
    xt(this);
  }
  selectObjectAnimation(e) {
    St(this, e);
  }
  setObjectParent(e) {
    Et(this, e);
  }
  applyProxyPreset(e) {
    const t = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, i = t[e] || t.balanced;
    this.state.render_mode = i.mode, this.state.burn_in = i.burn, this.root.querySelector('[data-role="mode"]').value = i.mode, this.root.querySelector('[data-role="burn-in"]').checked = i.burn, this.modeWidget && (this.modeWidget.value = i.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${e}`);
  }
  createH3Setup() {
    const e = LiteGraph.createNode("MajoorOmniCamH3Adapter");
    if (!e) return this.setStatus("H3 adapter node is unavailable");
    e.pos = [this.node.pos[0] + this.node.size[0] + 80, this.node.pos[1]], M.graph.add(e), this.node.connect(0, e, e.findInputSlot("camera_track")), this.node.connect(1, e, e.findInputSlot("proxy_video"));
    const t = LiteGraph.createNode("MinimaxHailuo03ReferenceNode");
    if (!t) {
      this.setStatus("H3 adapter created; official MiniMax H3 node not installed");
      return;
    }
    t.pos = [e.pos[0] + e.size[0] + 80, e.pos[1]], M.graph.add(t);
    const i = t.findInputSlot("video_1"), s = t.findInputSlot("prompt");
    i >= 0 && e.connect(0, t, i), s >= 0 && e.connect(1, t, s), this.setStatus(i >= 0 ? "H3 reference workflow created" : "H3 nodes created; connect camera video to Video 1");
  }
  refreshObjects() {
    Mt(this);
  }
  removeObjectResources(e) {
    Lt(this, e);
  }
  togglePlay() {
    if (this.playing) return this.stopPlay();
    this.playing = !0, this.root.querySelector('[data-act="play"] i').className = "pi pi-pause";
    const e = this.state.playback_range, t = e ? e[0] : 0, i = e ? e[1] : this.state.duration_frames - 1;
    let s = this.frame >= i || this.frame < t ? t : this.frame, r = null;
    const a = 1e3 / this.state.fps;
    let o = performance.now(), h = 0;
    const l = (n) => {
      if (this.playing) {
        for (h += n - o, o = n; h >= a; )
          if (h -= a, s += 1, s > i) {
            if (!this.state.loop_playback) return void this.stopPlay();
            s = t;
          }
        s !== r && (r = s, this.setFrame(s, !0)), this.playTimer = requestAnimationFrame(l);
      }
    };
    this.playTimer = requestAnimationFrame(l);
  }
  stopPlay() {
    this.playing = !1, this.playTimer && cancelAnimationFrame(this.playTimer), this.playTimer = null, this.root.querySelector('[data-act="play"] i').className = "pi pi-play";
  }
  snapFrame(e) {
    return !this.state.snap_enabled || this.state.snap_frames <= 1 ? Math.round(e) : Math.round(Math.round(e) / this.state.snap_frames) * this.state.snap_frames;
  }
  toggleLoop() {
    this.state.loop_playback = !this.state.loop_playback, this.serialize();
    const e = this.root.querySelector('[data-act="loop"]');
    e.classList.toggle("active", this.state.loop_playback), e.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
  }
  setPlaybackRange(e) {
    const t = this.state.playback_range || [0, this.state.duration_frames - 1];
    e === "start" ? t[0] = Math.min(this.frame, t[1]) : e === "end" && (t[1] = Math.max(this.frame, t[0])), this.state.playback_range = t, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${t[0]}–F${t[1]}`);
  }
  clearPlaybackRange() {
    this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
  }
  toggleTimecode() {
    this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
  }
  toggleSnap() {
    this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
    const e = this.root.querySelector('[data-act="toggle-snap"]');
    e.classList.toggle("active", this.state.snap_enabled), e.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
  }
  scheduleSerialize() {
    this.serializeScheduled || (this.serializeScheduled = !0, requestAnimationFrame(() => {
      this.serializeScheduled = !1, this.serialize();
    }));
  }
  gizmoAxes(e) {
    return Ee(this, e);
  }
  gizmoGeometry(e) {
    return Me(this, e);
  }
  pickGizmo(e) {
    return Le(this, e);
  }
  pickSceneObject(e) {
    return Pe(this, e);
  }
  drawTransformGizmo() {
    je(this);
  }
  onPointerDown(e) {
    _e(this, e);
  }
  onPointerMove(e) {
    ze(this, e);
  }
  onPointerUp(e) {
    Ke(this, e);
  }
  onWheel(e) {
    Te(this, e);
  }
  timelineFrameFromEvent(e, t) {
    return ye(this, e, t);
  }
  onTimelinePointerDown(e) {
    ve(this, e);
  }
  onTimelinePointerMove(e) {
    be(this, e);
  }
  onTimelinePointerUp(e) {
    we(this, e);
  }
  onKey(e) {
    W(this, e);
  }
  frameTarget() {
    Fe(this);
  }
  async loadMediaUrl(e, t) {
    return Ie(this, e, t);
  }
  restoreAssets() {
    $e(this);
  }
  onModelLoaded(e) {
    Ae(this, e);
  }
  async loadModelFile(e) {
    return De(this, e);
  }
  async loadCardFile(e) {
    return We(this, e);
  }
  loadExecutionPreview(e) {
    He(this, e);
  }
  loadSelectedReference() {
    Re(this);
  }
  drawLine3D(e, t, i = "#5a5a5a", s = 1) {
    const r = this.viewportCamera(), a = b(e, r, this.canvas.width, this.canvas.height), o = b(t, r, this.canvas.width, this.canvas.height);
    !a || !o || (this.ctx.strokeStyle = i, this.ctx.lineWidth = s, this.ctx.beginPath(), this.ctx.moveTo(a[0], a[1]), this.ctx.lineTo(o[0], o[1]), this.ctx.stroke());
  }
  drawGrid() {
    for (let e = -60; e <= 60; e += 1) {
      const t = e === 0, i = t ? "#6f6f6f" : "#353535";
      this.drawLine3D([e, 0, -60], [e, 0, 60], i, t ? 1.6 : 1), this.drawLine3D([-60, 0, e], [60, 0, e], i, t ? 1.6 : 1);
    }
  }
  drawPointField() {
    this.ctx.fillStyle = "#8a8a8a";
    for (let e = 0; e < 90; e++) {
      const t = e * 2.3999632297, i = 1.5 + e % 11 * 0.38, s = 0.15 + e * 0.618 % 1 * 4, r = b([Math.cos(t) * i, s, Math.sin(t) * i], this.viewportCamera(), this.canvas.width, this.canvas.height);
      if (!r) continue;
      const a = y(5 / Math.sqrt(r[2]), 1, 4);
      this.ctx.beginPath(), this.ctx.arc(r[0], r[1], a, 0, Math.PI * 2), this.ctx.fill();
    }
  }
  drawCube(e) {
    const [t, i, s] = e.size || [1, 1, 1], [r, a, o] = e.position || [0, 0, 0], h = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map((n) => [r + n[0] * t / 2, a + n[1] * i / 2, o + n[2] * s / 2]), l = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (const [n, c] of l) this.drawLine3D(h[n], h[c], "#a0a0a0", 1.4);
  }
  drawSphere(e) {
    const [t] = e.size || [1.5], [i, s, r] = e.position || [0, 1, 0], a = t / 2;
    for (let o = 0; o < 3; o++) {
      let h = null;
      for (let l = 0; l <= 32; l++) {
        const n = l / 32 * Math.PI * 2;
        let c;
        o === 0 ? c = [i + Math.cos(n) * a, s + Math.sin(n) * a, r] : o === 1 ? c = [i + Math.cos(n) * a, s, r + Math.sin(n) * a] : c = [i, s + Math.cos(n) * a, r + Math.sin(n) * a], h && this.drawLine3D(h, c, "#999", 1), h = c;
      }
    }
  }
  drawHuman(e) {
    const [t, i, s] = e.position || [0, 0, 0], r = e.size?.[1] || 1.8, a = [t, i + r * 0.88, s], o = [t, i + r * 0.72, s], h = [t, i + r * 0.42, s], l = [t - r * 0.13, i, s], n = [t + r * 0.13, i, s], c = [t - r * 0.28, i + r * 0.48, s], p = [t + r * 0.28, i + r * 0.48, s];
    this.drawLine3D(o, h, "#aaa", 2), this.drawLine3D(o, c, "#aaa", 2), this.drawLine3D(o, p, "#aaa", 2), this.drawLine3D(h, l, "#aaa", 2), this.drawLine3D(h, n, "#aaa", 2);
    const u = b(a, this.viewportCamera(), this.canvas.width, this.canvas.height);
    u && (this.ctx.strokeStyle = "#aaa", this.ctx.beginPath(), this.ctx.arc(u[0], u[1], y(28 / u[2], 3, 12), 0, Math.PI * 2), this.ctx.stroke());
  }
  drawNull(e) {
    const t = e.position || [0, 1, 0], i = 0.25;
    this.drawLine3D(w(t, [-i, 0, 0]), w(t, [i, 0, 0]), "#bbb", 2), this.drawLine3D(w(t, [0, -i, 0]), w(t, [0, i, 0]), "#bbb", 2), this.drawLine3D(w(t, [0, 0, -i]), w(t, [0, 0, i]), "#bbb", 2);
  }
  drawCard(e) {
    const [t, i, s] = e.position || [0, 1.5, 0], [r, a] = e.size || [2, 3], o = this.viewportCamera(), h = [[t - r / 2, i - a / 2, s], [t + r / 2, i - a / 2, s], [t + r / 2, i + a / 2, s], [t - r / 2, i + a / 2, s]].map((d) => b(d, o, this.canvas.width, this.canvas.height));
    if (h.some((d) => !d)) return;
    const l = h.map((d) => d[0]), n = h.map((d) => d[1]), c = Math.min(...l), p = Math.max(...l), u = Math.min(...n), L = Math.max(...n);
    this.ctx.save(), this.ctx.beginPath(), this.ctx.moveTo(h[0][0], h[0][1]);
    for (let d = 1; d < 4; d++) this.ctx.lineTo(h[d][0], h[d][1]);
    this.ctx.closePath(), this.ctx.clip();
    const f = this.cardMediaById.get(e.id) || (e.id === "subject" ? this.cardMedia : null);
    if (f)
      try {
        const d = Math.max(1, p - c), g = Math.max(1, L - u), C = f.videoWidth || f.naturalWidth || f.width, k = f.videoHeight || f.naturalHeight || f.height, P = this.state.card_fit || "contain";
        if (this.ctx.fillStyle = "#111", this.ctx.fillRect(c, u, d, g), P === "stretch" || !C || !k) this.ctx.drawImage(f, c, u, d, g);
        else if (P === "contain") {
          const x = Math.min(d / C, g / k), S = C * x, E = k * x;
          this.ctx.drawImage(f, c + (d - S) / 2, u + (g - E) / 2, S, E);
        } else {
          const x = Math.max(d / C, g / k), S = d / x, E = g / x;
          this.ctx.drawImage(f, (C - S) / 2, (k - E) / 2, S, E, c, u, d, g);
        }
      } catch {
      }
    else
      this.ctx.fillStyle = "#3a414b", this.ctx.fillRect(c, u, p - c, L - u), this.ctx.fillStyle = "#d8d8d8", this.ctx.textAlign = "center", this.ctx.font = `${Math.max(12, Math.min(28, (p - c) * 0.08))}px system-ui`, this.ctx.fillText("SUBJECT CARD", (c + p) / 2, (u + L) / 2);
    this.ctx.restore(), this.ctx.strokeStyle = "#b3b8c1", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(h[0][0], h[0][1]);
    for (let d = 1; d < 4; d++) this.ctx.lineTo(h[d][0], h[d][1]);
    this.ctx.closePath(), this.ctx.stroke();
  }
  drawCameraPath() {
    if (!(this.state.keyframes.length < 2)) {
      for (let e = 0; e < this.state.keyframes.length - 1; e++) this.drawLine3D(this.state.keyframes[e].camera.position, this.state.keyframes[e + 1].camera.position, "#6c82b0", 2);
      for (const e of this.state.keyframes) {
        const t = b(e.camera.position, this.viewportCamera(), this.canvas.width, this.canvas.height);
        t && (this.ctx.fillStyle = e.frame === this.frame ? "#f2d06b" : "#7694d1", this.ctx.beginPath(), this.ctx.arc(t[0], t[1], 4, 0, Math.PI * 2), this.ctx.fill());
      }
    }
  }
  drawSpeedHeatmap() {
    if (this.state.keyframes.length < 2) return;
    const e = [];
    for (let i = 0; i < this.state.keyframes.length - 1; i++) {
      const s = this.state.keyframes[i], r = this.state.keyframes[i + 1];
      e.push(zt(Kt(r.camera.position, s.camera.position)) * this.state.fps / Math.max(1, r.frame - s.frame));
    }
    const t = Math.max(...e, 1e-6);
    for (let i = 0; i < e.length; i++) {
      const s = 120 * (1 - e[i] / t);
      this.drawLine3D(this.state.keyframes[i].camera.position, this.state.keyframes[i + 1].camera.position, `hsl(${s} 85% 55%)`, 5);
    }
  }
  drawOverlays() {
    const e = this.ctx, t = this.canvas.width, i = this.canvas.height;
    if (!this.recording && this.state.view_mode === "camera" && this.state.guides !== !1) {
      e.save(), e.strokeStyle = "#ffffff55", e.lineWidth = 1, e.beginPath();
      for (const s of [t / 3, 2 * t / 3])
        e.moveTo(s, 0), e.lineTo(s, i);
      for (const s of [i / 3, 2 * i / 3])
        e.moveTo(0, s), e.lineTo(t, s);
      e.moveTo(t / 2 - 14, i / 2), e.lineTo(t / 2 + 14, i / 2), e.moveTo(t / 2, i / 2 - 14), e.lineTo(t / 2, i / 2 + 14), e.stroke(), e.restore();
    }
    if (this.recording || this.drawTransformGizmo(), this.state.burn_in) {
      const s = this.viewportCamera();
      e.save(), e.fillStyle = "#000b", e.fillRect(0, i - 34, t, 34), e.fillStyle = "#fff", e.font = `${Math.max(12, Math.round(i * 0.025))}px monospace`, e.fillText(`F ${this.frame}/${this.state.duration_frames - 1}  ${this.state.fps}fps  FOV ${s.fov.toFixed(1)}  ${this.state.render_mode}`, 12, i - 12), e.restore();
    }
  }
  render() {
    const e = this.ctx, t = this.canvas.width, i = this.canvas.height;
    e.fillStyle = "#121212", e.fillRect(0, 0, t, i);
    const s = this.state.render_mode, r = this.viewportCamera(), a = this.state.objects.some((n) => n.parent_id) ? this.state.objects.map((n) => n.parent_id ? { ...n, ...Tt(this.state.objects, n) } : n) : this.state.objects, o = a === this.state.objects ? this.state : { ...this.state, objects: a };
    if (this.webgl)
      this.webgl.render(o, r, this.cardMediaById, t, i, this.modelUrlsById, this.frame, this.recording), e.drawImage(this.webgl.canvas, 0, 0, t, i);
    else {
      (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(s) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(s) && this.drawPointField();
      for (const n of a)
        n.enabled !== !1 && (n.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(s) ? this.drawCard(n) : ["cube", "ground", "glb", "model"].includes(n.type) && s !== "grid" && s !== "point_field" ? this.drawCube(n) : n.type === "sphere" && s !== "grid" && s !== "point_field" ? this.drawSphere(n) : n.type === "human" && s !== "grid" && s !== "point_field" ? this.drawHuman(n) : n.type === "null" && this.drawNull(n));
      this.recording || this.drawCameraPath();
    }
    !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays();
    const h = r.position, l = r.target;
    this.root.querySelector('[data-role="hud"]').textContent = `OmniCam · ${this.state.view_mode} · ${s}
F ${this.frame}/${this.state.duration_frames - 1} · ${this.state.fps}fps · FOV ${r.fov.toFixed(1)}°
P ${h.map((n) => n.toFixed(2)).join(", ")}
T ${l.map((n) => n.toFixed(2)).join(", ")}`, this.renderCameraView();
  }
  renderCameraView() {
    if (this.state.camera_view_visible) {
      this.refreshCameraPreviews();
      for (const e of this.state.cameras) {
        const t = this.cameraPreviewCanvases.get(e.id), i = this.cameraPreviewContexts.get(e.id);
        if (!t?.width || !i) continue;
        const s = t.width, r = t.height, a = v(e, this.frame);
        i.fillStyle = "#111", i.fillRect(0, 0, s, r), this.cameraWebgl && (this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1 }, a, this.cardMediaById, s, r, this.modelUrlsById, this.frame, !0), i.drawImage(this.cameraWebgl.canvas, 0, 0, s, r)), _(this, i, s, r);
        const o = this.root.querySelector(`[data-camera-frame="${e.id}"]`);
        o && (o.textContent = `F${this.frame}`);
      }
    }
  }
  drawPreviewOverlays(e, t, i) {
    _(this, e, t, i);
  }
  maximizeCameraPreview(e) {
    ie(this, e);
  }
  setStatus(e) {
    this.root.querySelector('[data-role="status"]').textContent = e;
  }
  async makePlayblast() {
    return se(this);
  }
  async waitForMediaFrame() {
    return re(this);
  }
  async captureRealtimePlayblast() {
    return ne(this);
  }
  async uploadPlayblast(e) {
    return oe(this, e);
  }
  dispose() {
    this.stopPlay(), clearTimeout(this.previewClickTimer), this.abortController?.abort(), this.resizeObserver?.disconnect(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), this.objectUrls.clear(), this.cardMediaById.clear(), this.modelUrlsById.clear(), this.modelInfoById.clear();
  }
}
function It(m) {
  if (m.__majoorOmniCam) return;
  const e = new Ot(m);
  m.__majoorOmniCam = e, e.hideInternalWidgets();
  const t = () => Math.max(700, e.root.scrollHeight || 0);
  e.domWidget = m.addDOMWidget("majoor_omnicam_viewport", "omnicam", e.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: t,
    getMaxHeight: () => t(),
    afterResize: () => {
      e.resizeCanvas(), e.render();
    }
  });
  const i = [760, 780], s = m.size || i;
  m.setSize([Math.max(s[0], i[0]), Math.max(s[1], i[1])]);
  const r = m.onResize;
  m.onResize = function() {
    r?.apply(this, arguments), requestAnimationFrame(() => {
      e.resizeCanvas(), e.render();
    });
  };
  const a = m.onConfigure;
  m.onConfigure = function() {
    a?.apply(this, arguments), requestAnimationFrame(() => e.restoreFromWidgets());
  };
  const o = m.onAfterGraphConfigured;
  m.onAfterGraphConfigured = function() {
    o?.apply(this, arguments), requestAnimationFrame(() => e.restoreFromWidgets());
  };
  const h = m.onRemoved;
  m.onRemoved = function() {
    e.dispose(), h?.apply(this, arguments);
  };
  const l = m.onExecuted;
  m.onExecuted = function(n) {
    l?.apply(this, arguments), e.loadExecutionPreview(n);
  };
}
M.registerExtension({
  name: Ft,
  async nodeCreated(m) {
    (m.comfyClass === K || m.constructor?.type === K) && It(m);
  }
});
