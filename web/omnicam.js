import { app as ea } from "../../scripts/app.js";
import { api as ta } from "../../scripts/api.js";
import { OmniWebGLViewport as Qt } from "./omnicam-webgl.js";
import { EditorHistory as oa } from "./omnicam-history.js";
import { ContextMenuController as na, initializeTooltips as ga, promptText as ba } from "./omnicam-ui.js";
import { ObjectUrlRegistry as la } from "./omnicam-media.js";
import { buildRoot as ca } from "./omnicam-template.js";
import { dispatchDirectorKey as Ca } from "./omnicam-commands.js";
import { activeCameraTrack as wa, bindWidgetCallbacks as va, playblastCameraTrack as Sa, restoreFromWidgets as ja, serializeEditorState as Pa, syncActiveCameraTrack as ka, syncFromWidgets as Ma } from "./omnicam-state-sync.js";
import { bind as Oa } from "./omnicam-event-bindings.js";
import { activateCamera as Ka, addCamera as Fa, deleteCamera as Ta, drawPreviewOverlays as xa, duplicateCamera as Ea, maximizeCameraPreview as _a, refreshCameraPreviews as Ia, refreshCameraSelectors as za, renameCamera as Aa, setPlayblastCamera as Wa, toggleCameraView as Da } from "./omnicam-cameras.js";
import { captureRealtime as Va, makePlayblast as Ha, uploadDirectorPlayblast as Ra, waitForMediaFrame as Ua } from "./omnicam-record.js";
import { computeAudioPeaks as $a, loadAudioFile as Ba, stopPlay as La, togglePlay as qa } from "./omnicam-playback-transport.js";
import { applyCameraPreset as Ga, applyCameraShake as Na, applyProxyPreset as Za } from "./omnicam-motion-presets.js";
import { clearViewportBgImage as Ja, loadViewportBgFile as Xa, loadViewportBgSequence as Ya } from "./omnicam-background-manager.js";
import { drawCameraPath as Qa, drawCard as er, drawCube as tr, drawGrid as ar, drawHuman as rr, drawLine3D as ir, drawNull as sr, drawOverlays as or, drawPointField as nr, drawSpeedHeatmap as lr, drawSphere as cr } from "./omnicam-viewport-overlays.js";
import { curveChannels as dr, drawCurveEditor as mr, onCurvePointerDown as hr, onCurvePointerMove as ur, onCurvePointerUp as pr, onTimelinePointerDown as fr, onTimelinePointerMove as yr, onTimelinePointerUp as gr, refreshKeys as br, resetCurveZoom as Cr, resetTimelineZoom as wr, setChannelFilter as vr, setCurveInterpolation as Sr, setTangentMode as jr, timelineFrameFromEvent as Pr, toggleCurveHandles as kr, zoomCurve as Mr } from "./omnicam-timeline.js";
import { drawTransformGizmo as Or, frameTarget as Kr, gizmoAxes as Fr, gizmoGeometry as Tr, onPointerDown as xr, onPointerMove as Er, onPointerUp as _r, onWheel as Ir, pickGizmo as zr, pickSceneObject as Ar, resetCamera as Wr, setTransformMode as Dr, setViewMode as Vr, viewportCamera as Hr } from "./omnicam-viewport-controls.js";
import { configureDomMedia as da, loadCardFile as Rr, loadExecutionPreview as Ur, loadMediaUrl as $r, loadModelFile as Br, loadSelectedReference as Lr, onModelLoaded as qr, restoreAssets as Gr, syncUpstreamInputs as Nr } from "./omnicam-dom-media.js";
import { refreshSetupDiagnostic as Zr } from "./omnicam-diagnostics.js";
import { addMediaCard as Jr, addPrimitive as Xr, applyObjectAnimationFrame as Yr, beginCameraEdit as Qr, beginObjectEdit as ei, commitCameraEdit as ti, commitObjectEdit as ai, copyKeyframe as ri, deleteKeyframe as ii, deleteObject as si, duplicateObject as oi, exitKeyEdit as ni, finishCameraEdit as li, goToAdjacentKey as ci, insertKeyframe as di, loadSelectedKeyView as mi, pasteKeyframe as hi, playblastCameraAtFrame as ui, refreshInspector as pi, refreshKeyEditor as fi, refreshObjects as yi, removeObjectResources as gi, renameObject as bi, retimeSelectedKey as Ci, selectKeyframe as wi, selectedKeyframe as vi, selectedObject as Si, selectObjectAnimation as ji, setKeyInterpolation as Pi, setObjectParent as ki, timelineKeyframes as Mi, timelineObject as Oi, toggleAutoKey as Ki, toggleObject as Fi, updateCameraFromHud as Ti, updateEditState as xi, updateKeyVisualState as Ei, updateSelectedKey as _i, updateSelectedObject as Ii } from "./omnicam-scene.js";
import { configureCore as ma, sanitizeState as ha, sampleCamera as ua, clamp as zi, cloneCamera as Ai, defaultCamera as Wi, sampleObjectTransform as Di, worldTransform as Vi } from "./omnicam-core.js";
function Hi(o) {
  const { app: s, api: u, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: k, initializeTooltips: w, promptText: v, ObjectUrlRegistry: M, buildRoot: O, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: R, playblastCameraTrack: U, restoreFromWidgets: $, serializeEditorState: B, syncActiveCameraTrack: L, syncFromWidgets: q, bind: G, activateCamera: N, addCamera: Z, deleteCamera: J, drawPreviewOverlays: K, duplicateCamera: X, maximizeCameraPreview: Y, refreshCameraPreviews: Q, refreshCameraSelectors: ee, renameCamera: te, setPlayblastCamera: ae, toggleCameraView: re, captureRealtime: ie, makePlayblast: se, uploadDirectorPlayblast: oe, waitForMediaFrame: ne, computeAudioPeaks: le, loadAudioFile: ce, stopPlay: de, togglePlay: me, applyCameraPreset: he, applyCameraShake: ue, applyProxyPreset: pe, clearViewportBgImage: fe, loadViewportBgFile: ye, loadViewportBgSequence: ge, drawCameraPath: be, drawCard: Ce, drawCube: we, drawGrid: ve, drawHuman: Se, drawLine3D: je, drawNull: Pe, drawOverlays: ke, drawPointField: Me, drawSpeedHeatmap: Oe, drawSphere: Ke, curveChannels: Fe, drawCurveEditor: F, onCurvePointerDown: T, onCurvePointerMove: x, onCurvePointerUp: E, onTimelinePointerDown: Te, onTimelinePointerMove: xe, onTimelinePointerUp: Ee, refreshKeys: _, resetCurveZoom: I, resetTimelineZoom: P, setChannelFilter: z, setCurveInterpolation: A, setTangentMode: W, timelineFrameFromEvent: _e, toggleCurveHandles: D, zoomCurve: Ie, drawTransformGizmo: ze, frameTarget: Ae, gizmoAxes: We, gizmoGeometry: De, onPointerDown: Ve, onPointerMove: He, onPointerUp: Re, onWheel: Ue, pickGizmo: $e, pickSceneObject: Be, resetCamera: Le, setTransformMode: qe, setViewMode: Ge, viewportCamera: Ne, loadCardFile: Ze, loadExecutionPreview: Je, loadMediaUrl: Xe, loadModelFile: Ye, loadSelectedReference: Qe, onModelLoaded: et, restoreAssets: tt, syncUpstreamInputs: at, configureDomMedia: Gt, refreshSetupDiagnostic: rt, addMediaCard: it, addPrimitive: st, applyObjectAnimationFrame: ot, beginCameraEdit: nt, beginObjectEdit: lt, commitCameraEdit: ct, commitObjectEdit: dt, copyKeyframe: mt, deleteKeyframe: ht, deleteObject: ut, duplicateObject: pt, exitKeyEdit: ft, finishCameraEdit: yt, goToAdjacentKey: gt, insertKeyframe: bt, loadSelectedKeyView: Ct, pasteKeyframe: wt, playblastCameraAtFrame: vt, refreshInspector: St, refreshKeyEditor: jt, refreshObjects: Pt, removeObjectResources: kt, renameObject: Mt, retimeSelectedKey: Ot, selectKeyframe: Kt, selectedKeyframe: Ft, selectedObject: Tt, selectObjectAnimation: xt, setKeyInterpolation: Et, setObjectParent: _t, timelineKeyframes: It, timelineObject: zt, toggleAutoKey: At, toggleObject: Wt, updateCameraFromHud: Dt, updateEditState: Vt, updateKeyVisualState: Ht, updateSelectedKey: Rt, updateSelectedObject: Ut, clamp: V, cloneCamera: Nt, configureCore: Zt, defaultCamera: $t, sampleCamera: f, sampleObjectTransform: y, sanitizeState: Bt, worldTransform: Lt } = o;
  return {
    setSelectMode(e) {
      ["object", "vertex", "edge", "face"].includes(e) && (this.state.select_mode = e, this.subSelection = null, this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${e.toUpperCase()}`));
    },
    refreshSetupDiagnostic() {
      rt(this);
    },
    hideInternalWidgets() {
      for (const e of ["state_json", "recording_path", "card_asset"]) {
        const t = this.node.widgets?.find((a) => a.name === e);
        t && (t.computeSize = () => [0, -4], t.draw = () => {
        }, t.hidden = !0, t.options = { ...t.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      $(this);
    },
    restoreHistorySnapshot(e) {
      const t = JSON.parse(e);
      this.state = Bt(t.state), this.frame = V(t.frame, 0, this.state.duration_frames - 1), this.selectedEntity = t.selectedEntity, this.selectedObjectId = t.selectedObjectId, this.selectedKeyFrame = t.selectedKeyFrame, this.camera = f(this.state, this.frame), this.cameraPreviewSignature = "", this.serialize(), this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.render();
    },
    checkpoint(e) {
      this.history.checkpoint(e);
    },
    undo() {
      const e = this.history.undo();
      e && this.setStatus(`Undo: ${e}`);
    },
    redo() {
      const e = this.history.redo();
      e && this.setStatus(`Redo: ${e}`);
    },
    bind() {
      G(this);
    },
    bindWidgetCallbacks() {
      R(this);
    },
    syncFromWidgets(e = !0) {
      q(this, e);
    },
    serialize() {
      B(this);
    },
    activeCameraTrack() {
      return j(this);
    },
    playblastCameraTrack() {
      return U(this);
    },
    syncActiveCameraTrack() {
      L(this);
    },
    refreshCameraSelectors() {
      ee(this);
    },
    refreshCameraPreviews() {
      Q(this);
    },
    addCamera() {
      Z(this);
    },
    async renameCamera(e) {
      return te(this, e);
    },
    duplicateCamera(e) {
      X(this, e);
    },
    async deleteCamera(e) {
      return J(this, e);
    },
    activateCamera(e) {
      N(this, e);
    },
    setPlayblastCamera(e) {
      ae(this, e);
    },
    closeMenus(e = null) {
      for (const t of this.root.querySelectorAll(".toolbar-menu")) t !== e && (t.open = !1);
      this.hideContextMenu();
    },
    initializeTooltips() {
      w(this.root, this.interactionElement);
    },
    hideContextMenu() {
      this.contextMenu?.hide();
    },
    showContextMenu(e, t, a) {
      return this.contextMenu.show(e, t, a);
    },
    onContextMenu(e) {
      const t = e.target, a = t.closest?.(".camera-preview-tile"), r = t.closest?.(".scene-item"), i = t.closest?.(".key");
      if (a) return this.openCameraContext(e, a.dataset.cameraId, !0);
      if (r?.dataset.cameraId) return this.openCameraContext(e, r.dataset.cameraId, !1);
      if (r?.dataset.objectId) return this.openObjectContext(e, r.dataset.objectId);
      if (i) {
        const c = this.timelineKeyframes().find((d) => d.frame === Number(i.dataset.keyFrame));
        return c && this.selectKeyframe(c), this.openTimelineContext(e, !0);
      }
      if (t.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(e, t.closest('[data-role="keys"]'))), this.openTimelineContext(e, !1);
      if (t.closest?.(".curve-editor")) return this.openCurveContext(e);
      if (t.closest?.(".viewport-wrap")) {
        const c = this.interactionElement.getBoundingClientRect(), d = (e.clientX - c.left) * this.canvas.width / Math.max(1, c.width), g = (e.clientY - c.top) * this.canvas.height / Math.max(1, c.height), p = this.pickSceneObject([d, g]);
        return p ? (this.selectedEntity = "object", this.selectedObjectId = p.id, this.refreshObjects(), this.refreshKeys(), this.openObjectContext(e, p.id)) : this.openViewportContext(e);
      }
      e.preventDefault(), e.stopPropagation();
    },
    openViewportContext(e) {
      const t = this.selectedObject();
      this.showContextMenu(e, "Viewport", [
        { label: t ? `Set key · ${t.name || t.type}` : `Set key · ${this.activeCameraTrack().name}`, icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: "Create camera from view", icon: "pi-video", run: () => this.addCamera() },
        { label: "Set camera target here", icon: "pi-crosshairs", help: "Set camera Look-At target to this 3D point in the scene", run: () => this.setTargetAtCursor(e) },
        { label: "Frame subject", icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        null,
        { label: "Create cube", icon: "pi-stop", run: () => this.addPrimitive("cube") },
        { label: "Create sphere", icon: "pi-circle", run: () => this.addPrimitive("sphere") },
        { label: "Create human proxy", icon: "pi-user", run: () => this.addPrimitive("human") },
        { label: "Create null", icon: "pi-plus", run: () => this.addPrimitive("null") },
        { label: "Create ground", icon: "pi-minus", run: () => this.addPrimitive("ground") },
        null,
        { label: "Show / hide camera previews", icon: "pi-images", run: () => this.toggleCameraView() },
        { label: "Record primary preview", icon: "pi-video", run: () => this.makePlayblast() },
        null,
        { label: "Clear caches & clean memory", icon: "pi-trash", run: () => this.clearCaches() }
      ]);
    },
    openObjectContext(e, t) {
      const a = this.state.objects.find((r) => r.id === t);
      a && (this.selectedEntity = "object", this.selectedObjectId = t, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(e, a.name || a.type, [
        { label: "Set key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: "Rename object…", icon: "pi-pencil", run: () => this.renameObject(t) },
        { label: "Duplicate object", icon: "pi-copy", run: () => this.duplicateObject(t) },
        { label: a.enabled === !1 ? "Show object" : "Hide object", icon: a.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(t) },
        null,
        { label: "Camera tracks this object (Look-At)", icon: "pi-crosshairs", help: "Lock camera live look-at tracking to this moving object", run: () => this.aimAtSelectedObject(t) },
        { label: "Bake tracking to all camera keys", icon: "pi-check-square", help: "Write this object's motion into camera target keyframes", run: () => this.bakeAimToKeyframes() },
        null,
        { label: "Translate", icon: "pi-arrows-alt", shortcut: "W", run: () => this.setTransformMode("translate") },
        { label: "Rotate", icon: "pi-refresh", shortcut: "E", run: () => this.setTransformMode("rotate") },
        { label: "Scale", icon: "pi-expand", shortcut: "R", run: () => this.setTransformMode("scale") },
        null,
        { label: "Delete object", icon: "pi-trash", danger: !0, disabled: t === "subject", help: t === "subject" ? "The canonical subject card cannot be deleted" : "Delete this object and its animation keys", run: () => this.deleteObject(t) }
      ]));
    },
    openCameraContext(e, t, a = !1) {
      const r = this.state.cameras.find((i) => i.id === t);
      r && (this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(t), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(e, `${r.name}${a ? " preview" : ""}`, [
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
        { label: "Shot: move earlier", icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((i) => i.id === t) <= 0, run: () => this.moveShot(t, -1) },
        { label: "Shot: move later", icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((i) => i.id === t) >= this.state.cameras.length - 1, run: () => this.moveShot(t, 1) },
        { label: "Shot handles…", icon: "pi-sliders-h", run: () => this.editShotHandles(t) },
        null,
        { label: "Rename camera…", icon: "pi-pencil", run: () => this.renameCamera(t) },
        { label: "Duplicate camera", icon: "pi-copy", run: () => this.duplicateCamera(t) },
        { label: "Create camera from current view", icon: "pi-plus", run: () => this.addCamera() },
        null,
        { label: "Delete camera", icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(t) }
      ]));
    },
    moveShot(e, t) {
      const a = this.state.cameras.findIndex((c) => c.id === e), r = a + t;
      if (a < 0 || r < 0 || r >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [i] = this.state.cameras.splice(a, 1);
      this.state.cameras.splice(r, 0, i), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${i.name} → #${r + 1}`);
    },
    async editShotHandles(e) {
      const t = this.state.cameras.find((c) => c.id === e);
      if (!t) return;
      const a = t.handles || { in: 0, out: 0 }, r = await v(s, "Shot handles", "Handle frames: in,out", `${a.in},${a.out}`);
      if (r == null) return;
      const i = String(r).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!i) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), t.handles = { in: Math.min(600, Number(i[1])), out: Math.min(600, Number(i[2])) }, this.serialize(), this.setStatus(`${t.name} handles: ${t.handles.in} / ${t.handles.out}`);
    },
    openTimelineContext(e, t) {
      this.showContextMenu(e, t ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
        { label: "Fit timeline view (F)", icon: "pi-arrows-alt", shortcut: "F", run: () => P(this) },
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
    },
    addMarker() {
      if ((this.state.markers || []).find((t) => t.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
      this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((t, a) => t.frame - a.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
    },
    removeNearestMarker() {
      const e = this.state.markers || [];
      if (!e.length) return;
      const t = e.reduce((a, r) => Math.abs(r.frame - this.frame) < Math.abs(a.frame - this.frame) ? r : a);
      this.checkpoint("Remove marker"), this.state.markers = e.filter((a) => a !== t), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${t.frame}`);
    },
    openCurveContext(e) {
      this.showContextMenu(e, "Curve editor", [
        { label: "Fit all curves (Framing)", icon: "pi-arrows-alt", shortcut: "F", run: () => I(this) },
        { label: "Set key at playhead", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: this.showCurveHandles ? "Hide Bézier handles" : "Show Bézier handles", icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
        null,
        ...["bezier", "smooth", "linear", "ease_in", "ease_out", "ease"].map((t) => ({ label: `Interpolation: ${t.replaceAll("_", " ")}`, icon: "pi-chart-line", disabled: !this.selectedKeyframe(), run: () => this.setCurveInterpolation(t) })),
        null,
        ...["auto", "vector", "free", "aligned", "flat"].map((t) => ({ label: `Tangents: ${t[0].toUpperCase()}${t.slice(1)}`, icon: "pi-share-alt", disabled: !this.selectedKeyframe(), run: () => this.setTangentMode(t) })),
        null,
        { label: "Delete selected key", icon: "pi-trash", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() }
      ]);
    },
    resizeCanvas() {
      const e = this.root.querySelector(".viewport-wrap"), t = Math.min(2, window.devicePixelRatio || 1), a = Math.max(320, Math.round(e.clientWidth * t)), r = Math.max(180, Math.round(e.clientHeight * t));
      (this.canvas.width !== a || this.canvas.height !== r) && (this.canvas.width = a, this.canvas.height = r);
      for (const i of this.cameraPreviewCanvases.values()) {
        const c = Math.max(220, Math.round(i.clientWidth * t)), d = Math.max(140, Math.round(i.clientHeight * t));
        (i.width !== c || i.height !== d) && (i.width = c, i.height = d);
      }
      this.drawCurveEditor();
    }
  };
}
function Ri(o) {
  const { app: s, api: u, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: k, initializeTooltips: w, promptText: v, ObjectUrlRegistry: M, buildRoot: O, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: R, playblastCameraTrack: U, restoreFromWidgets: $, serializeEditorState: B, syncActiveCameraTrack: L, syncFromWidgets: q, bind: G, activateCamera: N, addCamera: Z, deleteCamera: J, drawPreviewOverlays: K, duplicateCamera: X, maximizeCameraPreview: Y, refreshCameraPreviews: Q, refreshCameraSelectors: ee, renameCamera: te, setPlayblastCamera: ae, toggleCameraView: re, captureRealtime: ie, makePlayblast: se, uploadDirectorPlayblast: oe, waitForMediaFrame: ne, computeAudioPeaks: le, loadAudioFile: ce, stopPlay: de, togglePlay: me, applyCameraPreset: he, applyCameraShake: ue, applyProxyPreset: pe, clearViewportBgImage: fe, loadViewportBgFile: ye, loadViewportBgSequence: ge, drawCameraPath: be, drawCard: Ce, drawCube: we, drawGrid: ve, drawHuman: Se, drawLine3D: je, drawNull: Pe, drawOverlays: ke, drawPointField: Me, drawSpeedHeatmap: Oe, drawSphere: Ke, curveChannels: Fe, drawCurveEditor: F, onCurvePointerDown: T, onCurvePointerMove: x, onCurvePointerUp: E, onTimelinePointerDown: Te, onTimelinePointerMove: xe, onTimelinePointerUp: Ee, refreshKeys: _, resetCurveZoom: I, resetTimelineZoom: P, setChannelFilter: z, setCurveInterpolation: A, setTangentMode: W, timelineFrameFromEvent: _e, toggleCurveHandles: D, zoomCurve: Ie, drawTransformGizmo: ze, frameTarget: Ae, gizmoAxes: We, gizmoGeometry: De, onPointerDown: Ve, onPointerMove: He, onPointerUp: Re, onWheel: Ue, pickGizmo: $e, pickSceneObject: Be, resetCamera: Le, setTransformMode: qe, setViewMode: Ge, viewportCamera: Ne, loadCardFile: Ze, loadExecutionPreview: Je, loadMediaUrl: Xe, loadModelFile: Ye, loadSelectedReference: Qe, onModelLoaded: et, restoreAssets: tt, syncUpstreamInputs: at, configureDomMedia: Gt, refreshSetupDiagnostic: rt, addMediaCard: it, addPrimitive: st, applyObjectAnimationFrame: ot, beginCameraEdit: nt, beginObjectEdit: lt, commitCameraEdit: ct, commitObjectEdit: dt, copyKeyframe: mt, deleteKeyframe: ht, deleteObject: ut, duplicateObject: pt, exitKeyEdit: ft, finishCameraEdit: yt, goToAdjacentKey: gt, insertKeyframe: bt, loadSelectedKeyView: Ct, pasteKeyframe: wt, playblastCameraAtFrame: vt, refreshInspector: St, refreshKeyEditor: jt, refreshObjects: Pt, removeObjectResources: kt, renameObject: Mt, retimeSelectedKey: Ot, selectKeyframe: Kt, selectedKeyframe: Ft, selectedObject: Tt, selectObjectAnimation: xt, setKeyInterpolation: Et, setObjectParent: _t, timelineKeyframes: It, timelineObject: zt, toggleAutoKey: At, toggleObject: Wt, updateCameraFromHud: Dt, updateEditState: Vt, updateKeyVisualState: Ht, updateSelectedKey: Rt, updateSelectedObject: Ut, clamp: V, cloneCamera: Nt, configureCore: Zt, defaultCamera: $t, sampleCamera: f, sampleObjectTransform: y, sanitizeState: Bt, worldTransform: Lt } = o;
  return {
    setChannelFilter(e) {
      z(this, e);
    },
    setFrame(e, t = !1, a = !0) {
      this.frame = V(Math.round(e), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = f(this.activeCameraTrack(), this.frame), this.applyObjectAnimationFrame(), this.root.querySelector('[data-role="frame"]').value = String(this.frame), this.root.querySelector('[data-role="scrub"]').value = String(this.frame), this.root.querySelector('[data-role="fov"]').value = String(Math.round(this.camera.fov * 100) / 100), this.root.querySelector('[data-role="roll"]').value = String(Math.round((this.camera.roll || 0) * 100) / 100), this.root.querySelector('[data-role="camera-type"]').value = this.camera.camera_type;
      const r = this.frame / this.state.fps;
      for (const m of this.cardMediaById.values()) m instanceof HTMLVideoElement && Number.isFinite(m.duration) && m.duration > 0 && (m.currentTime = r % m.duration);
      const i = Math.floor(r / 60), c = Math.floor(r % 60), d = Math.floor(r % 1 * 1e3), g = this.frame % Math.max(1, Math.round(this.state.fps)), p = Math.floor(this.frame / this.state.fps);
      if (this.root.querySelector('[data-role="time"]').textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(p / 3600)).padStart(2, "0")}:${String(Math.floor(p / 60) % 60).padStart(2, "0")}:${String(p % 60).padStart(2, "0")}:${String(g).padStart(2, "0")}` : `${String(i).padStart(2, "0")}:${String(c).padStart(2, "0")}.${String(d).padStart(3, "0")}`, a) this.refreshKeys();
      else {
        const m = Math.max(1, this.state.duration_frames - 1), l = this.root.querySelector('[data-role="keys"] .playhead');
        l && (l.style.left = `${100 * this.frame / m}%`);
        for (const h of this.root.querySelectorAll("[data-key-frame]")) {
          const b = Number(h.dataset.keyFrame);
          h.classList.toggle("at-playhead", b === this.frame), h.classList.toggle("selected", b === this.selectedKeyFrame), h.classList.toggle("editing", b === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      t || this.serialize(), this.refreshInspector(), this.render();
    },
    timelineObject() {
      return zt(this);
    },
    timelineKeyframes() {
      return It(this);
    },
    applyObjectAnimationFrame() {
      ot(this, y);
    },
    insertKeyframe() {
      for (const e of this.root.querySelectorAll('[data-act="key"]'))
        e.classList.remove("key-pulse"), e.offsetWidth, e.classList.add("key-pulse");
      bt(this);
    },
    setKeyInterpolation(e) {
      Et(this, e);
    },
    deleteKeyframe() {
      ht(this);
    },
    copyKeyframe() {
      mt(this);
    },
    pasteKeyframe() {
      wt(this);
    },
    resetCamera() {
      Le(this, $t);
    },
    selectedKeyframe() {
      return Ft(this);
    },
    selectKeyframe(e) {
      Kt(this, e);
    },
    beginCameraEdit() {
      return nt(this);
    },
    commitCameraEdit() {
      ct(this);
    },
    finishCameraEdit() {
      yt(this);
    },
    exitKeyEdit(e = !1) {
      ft(this, e);
    },
    toggleAutoKey() {
      At(this);
    },
    updateEditState() {
      Vt(this);
    },
    updateKeyVisualState() {
      Ht(this);
    },
    curveChannels() {
      return Fe(this);
    },
    drawCurveEditor() {
      F(this);
    },
    onCurvePointerDown(e) {
      T(this, e);
    },
    onCurvePointerMove(e) {
      x(this, e);
    },
    onCurvePointerUp(e) {
      E(this, e);
    },
    setCurveInterpolation(e) {
      A(this, e);
    },
    setTangentMode(e) {
      W(this, e);
    },
    toggleCurveHandles() {
      D(this);
    },
    onTimelineWheel(e) {
      onTimelineWheel(this, e);
    },
    resetTimelineZoom() {
      P(this);
    },
    toggleInspector(e) {
      const t = this.root.querySelector('[data-role="viewport-inspector"]');
      if (!t) return;
      const a = e !== void 0 ? e : t.dataset.collapsed !== "true";
      t.dataset.collapsed = String(a);
      for (const r of this.root.querySelectorAll('[data-act="toggle-inspector"]'))
        r.classList.toggle("active", !a), r.setAttribute("aria-pressed", String(!a));
      this.setStatus(a ? "Inspector hidden (N)" : "Inspector shown");
    },
    refreshKeys() {
      _(this);
    },
    refreshKeyEditor() {
      jt(this);
    },
    retimeSelectedKey(e, t = !1) {
      Ot(this, e, t);
    },
    updateSelectedKey() {
      Rt(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      Ct(this);
    },
    goToAdjacentKey(e) {
      gt(this, e);
    },
    addPrimitive(e) {
      st(this, e);
    },
    async renameObject(e) {
      return Mt(this, e);
    },
    duplicateObject(e) {
      pt(this, e);
    },
    toggleObject(e) {
      Wt(this, e);
    },
    async deleteObject(e) {
      return ut(this, e);
    },
    addMediaCard() {
      it(this);
    },
    selectedObject() {
      return Tt(this);
    },
    playblastCameraAtFrame() {
      return vt(this, f);
    },
    viewportCamera() {
      return Ne(this);
    },
    setViewMode(e) {
      Ge(this, e);
    },
    toggleCameraView() {
      re(this);
    },
    setDensity(e) {
      ["basic", "animation", "advanced"].includes(e) || (e = "advanced"), this.state.ui_density = e, this.root.dataset.density = e, this.root.querySelector('[data-role="ui-density"]').value = e, this.serialize(), requestAnimationFrame(() => {
        this.resizeCanvas(), this.render();
      }), this.setStatus(`Interface: ${e}`);
    },
    lookAtObject(e) {
      const t = this.state.objects.find((a) => a.id === e);
      if (t) {
        this.checkpoint("Look-at constraint");
        for (const a of this.state.cameras)
          for (const r of a.keyframes) r.camera.target = [...t.position || [0, 1.5, 0]];
        this.camera = f(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${t.name || t.type}`);
      }
    },
    setTransformMode(e) {
      qe(this, e);
    },
    refreshInspector() {
      St(this);
    },
    updateSelectedObject() {
      Ut(this);
    },
    beginObjectEdit(e) {
      return lt(this, e);
    },
    commitObjectEdit(e) {
      dt(this, e);
    },
    updateCameraFromHud() {
      Dt(this);
    },
    selectObjectAnimation(e) {
      xt(this, e);
    },
    setObjectParent(e) {
      _t(this, e);
    },
    applyProxyPreset(e) {
      const t = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, a = t[e] || t.balanced;
      this.state.render_mode = a.mode, this.state.burn_in = a.burn, this.root.querySelector('[data-role="mode"]').value = a.mode, this.root.querySelector('[data-role="burn-in"]').checked = a.burn, this.modeWidget && (this.modeWidget.value = a.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${e}`);
    },
    createH3Setup() {
      const e = LiteGraph.createNode("MajoorOmniCamH3Adapter");
      if (!e) return this.setStatus("H3 adapter node is unavailable");
      e.pos = [this.node.pos[0] + this.node.size[0] + 80, this.node.pos[1]], s.graph.add(e), this.node.connect(0, e, e.findInputSlot("camera_track")), this.node.connect(1, e, e.findInputSlot("proxy_video"));
      const t = LiteGraph.createNode("MinimaxHailuo03ReferenceNode");
      if (!t) {
        this.setStatus("H3 adapter created; official MiniMax H3 node not installed");
        return;
      }
      t.pos = [e.pos[0] + e.size[0] + 80, e.pos[1]], s.graph.add(t);
      const a = t.findInputSlot("video_1"), r = t.findInputSlot("prompt");
      a >= 0 && e.connect(0, t, a), r >= 0 && e.connect(1, t, r), this.setStatus(a >= 0 ? "H3 reference workflow created" : "H3 nodes created; connect camera video to Video 1");
    },
    refreshObjects() {
      Pt(this);
    },
    removeObjectResources(e) {
      kt(this, e);
    },
    aimAtSelectedObject(e) {
      this.checkpoint("Aim & track subject");
      const t = this.activeCameraTrack(), a = e && this.state.objects.find((c) => c.id === e) || this.selectedObject() || this.state.objects.find((c) => c.id === "subject") || this.state.objects[0];
      if (!a) return;
      t.target_object_id = a.id, t.id === this.state.active_camera_id && (this.state.target_object_id = a.id);
      const i = (a.type === "model" || a.type === "glb" ? this.webgl?.getObjectWorldCenter?.(a.id) : null) || (a.keyframes?.length ? y(a, this.frame).position : a.position || [0, 1.5, 0]);
      this.camera.target = [...i], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${a.name || a.id}`);
    },
    setCameraTrackingTarget(e) {
      this.checkpoint("Change camera tracking target");
      const t = this.activeCameraTrack();
      if (t.target_object_id = e || null, t.id === this.state.active_camera_id && (this.state.target_object_id = e || null), e) {
        const a = this.state.objects.find((r) => r.id === e);
        if (a) {
          const i = (a.type === "model" || a.type === "glb" ? this.webgl?.getObjectWorldCenter?.(a.id) : null) || (a.keyframes?.length ? y(a, this.frame).position : a.position || [0, 1.5, 0]);
          this.camera.target = [...i], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
        }
      }
      this.serialize(), this.refreshInspector(), this.render(), this.setStatus(e ? `Camera tracking: ${e}` : "Camera tracking disabled (manual target)");
    },
    bakeAimToKeyframes() {
      this.checkpoint("Bake aim to keyframes");
      const e = this.activeCameraTrack(), t = e.target_object_id || this.state.target_object_id || "subject", a = this.state.objects.find((i) => i.id === t) || this.state.objects[0];
      if (!a || !e.keyframes?.length) return;
      const r = a.type === "model" || a.type === "glb" ? this.webgl?.getObjectWorldCenter?.(a.id) : null;
      for (const i of e.keyframes) {
        const c = (a.type === "model" || a.type === "glb") && r && !a.keyframes?.length ? r : a.keyframes?.length ? y(a, i.frame).position : a.position || [0, 1.5, 0];
        i.camera.target = [...c];
      }
      e.id === this.state.active_camera_id && (this.state.keyframes = e.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${a.name || a.id}`);
    }
  };
}
function Ui(o) {
  const { app: s, api: u, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: k, initializeTooltips: w, promptText: v, ObjectUrlRegistry: M, buildRoot: O, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: R, playblastCameraTrack: U, restoreFromWidgets: $, serializeEditorState: B, syncActiveCameraTrack: L, syncFromWidgets: q, bind: G, activateCamera: N, addCamera: Z, deleteCamera: J, drawPreviewOverlays: K, duplicateCamera: X, maximizeCameraPreview: Y, refreshCameraPreviews: Q, refreshCameraSelectors: ee, renameCamera: te, setPlayblastCamera: ae, toggleCameraView: re, captureRealtime: ie, makePlayblast: se, uploadDirectorPlayblast: oe, waitForMediaFrame: ne, computeAudioPeaks: le, loadAudioFile: ce, stopPlay: de, togglePlay: me, applyCameraPreset: he, applyCameraShake: ue, applyProxyPreset: pe, clearViewportBgImage: fe, loadViewportBgFile: ye, loadViewportBgSequence: ge, drawCameraPath: be, drawCard: Ce, drawCube: we, drawGrid: ve, drawHuman: Se, drawLine3D: je, drawNull: Pe, drawOverlays: ke, drawPointField: Me, drawSpeedHeatmap: Oe, drawSphere: Ke, curveChannels: Fe, drawCurveEditor: F, onCurvePointerDown: T, onCurvePointerMove: x, onCurvePointerUp: E, onTimelinePointerDown: Te, onTimelinePointerMove: xe, onTimelinePointerUp: Ee, refreshKeys: _, resetCurveZoom: I, resetTimelineZoom: P, setChannelFilter: z, setCurveInterpolation: A, setTangentMode: W, timelineFrameFromEvent: _e, toggleCurveHandles: D, zoomCurve: Ie, drawTransformGizmo: ze, frameTarget: Ae, gizmoAxes: We, gizmoGeometry: De, onPointerDown: Ve, onPointerMove: He, onPointerUp: Re, onWheel: Ue, pickGizmo: $e, pickSceneObject: Be, resetCamera: Le, setTransformMode: qe, setViewMode: Ge, viewportCamera: Ne, loadCardFile: Ze, loadExecutionPreview: Je, loadMediaUrl: Xe, loadModelFile: Ye, loadSelectedReference: Qe, onModelLoaded: et, restoreAssets: tt, syncUpstreamInputs: at, configureDomMedia: Gt, refreshSetupDiagnostic: rt, addMediaCard: it, addPrimitive: st, applyObjectAnimationFrame: ot, beginCameraEdit: nt, beginObjectEdit: lt, commitCameraEdit: ct, commitObjectEdit: dt, copyKeyframe: mt, deleteKeyframe: ht, deleteObject: ut, duplicateObject: pt, exitKeyEdit: ft, finishCameraEdit: yt, goToAdjacentKey: gt, insertKeyframe: bt, loadSelectedKeyView: Ct, pasteKeyframe: wt, playblastCameraAtFrame: vt, refreshInspector: St, refreshKeyEditor: jt, refreshObjects: Pt, removeObjectResources: kt, renameObject: Mt, retimeSelectedKey: Ot, selectKeyframe: Kt, selectedKeyframe: Ft, selectedObject: Tt, selectObjectAnimation: xt, setKeyInterpolation: Et, setObjectParent: _t, timelineKeyframes: It, timelineObject: zt, toggleAutoKey: At, toggleObject: Wt, updateCameraFromHud: Dt, updateEditState: Vt, updateKeyVisualState: Ht, updateSelectedKey: Rt, updateSelectedObject: Ut, clamp: V, cloneCamera: Nt, configureCore: Zt, defaultCamera: $t, sampleCamera: f, sampleObjectTransform: y, sanitizeState: Bt, worldTransform: Lt } = o;
  return {
    setTargetAtCursor(e) {
      if (!e) return;
      const t = this.interactionElement.getBoundingClientRect(), a = (e.clientX - t.left) * this.canvas.width / Math.max(1, t.width), r = (e.clientY - t.top) * this.canvas.height / Math.max(1, t.height), i = this.webgl?.intersectScenePoint?.(a, r, this.canvas.width, this.canvas.height);
      i && (this.beginCameraEdit(), this.camera.target = [
        Math.round(i[0] * 1e3) / 1e3,
        Math.round(i[1] * 1e3) / 1e3,
        Math.round(i[2] * 1e3) / 1e3
      ], this.commitCameraEdit(), this.finishCameraEdit(), this.updateHudCamera(), this.refreshInspector(), this.render(), this.setStatus(`Target set to [${this.camera.target.join(", ")}]`));
    },
    focusCameraTarget() {
      this.frameTarget();
    },
    updateHudCamera() {
      this.refreshInspector();
    },
    togglePlay() {
      me(this);
    },
    stopPlay() {
      de(this);
    },
    computeAudioPeaks() {
      le(this);
    },
    async loadAudioFile(e) {
      return ce(this, e);
    },
    applyCameraPreset(e) {
      he(this, e);
    },
    applyCameraShake(e) {
      ue(this, e);
    },
    applyProxyPreset(e) {
      pe(this, e);
    },
    clearCaches() {
      if (this.checkpoint("Clear caches"), this.objectUrls?.clear(), this.audioSource) {
        try {
          this.audioSource.stop();
        } catch {
        }
        this.audioSource = null;
      }
      if (this.webgl) {
        for (const e of this.webgl.models.values())
          try {
            e.scene && disposeObject(e.scene, !0);
          } catch {
          }
        if (this.webgl.models.clear(), this.webgl.modelLoads.clear(), this.webgl.sceneKey = "", this.webgl.mediaSignature = "", this.webgl.modelSignature = "", this.webgl.pathKey = "", this.webgl.bgTexture) {
          try {
            this.webgl.bgTexture.dispose();
          } catch {
          }
          this.webgl.bgTexture = null;
        }
        this.webgl.bgImageUrl = "";
      }
      if (this.cameraWebgl) {
        for (const e of this.cameraWebgl.models.values())
          try {
            e.scene && disposeObject(e.scene, !0);
          } catch {
          }
        this.cameraWebgl.models.clear(), this.cameraWebgl.modelLoads.clear(), this.cameraWebgl.sceneKey = "", this.cameraWebgl.mediaSignature = "", this.cameraWebgl.modelSignature = "", this.cameraWebgl.pathKey = "";
      }
      this.upstreamSignature = "", this.cameraPreviewSignature = "", this.cardMediaById.clear(), this.cardMedia = null, this.restoreAssets(), this.syncUpstreamInputs(), this.refreshObjects(), this.refreshKeys(), this.refreshCameraSelectors(), this.renderCameraView(), this.render(), this.setStatus("Caches cleared & memory freed");
    },
    snapFrame(e) {
      return !this.state.snap_enabled || this.state.snap_frames <= 1 ? Math.round(e) : Math.round(Math.round(e) / this.state.snap_frames) * this.state.snap_frames;
    },
    toggleLoop() {
      this.state.loop_playback = !this.state.loop_playback, this.serialize();
      const e = this.root.querySelector('[data-act="loop"]');
      e.classList.toggle("active", this.state.loop_playback), e.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
    },
    setPlaybackRange(e) {
      const t = this.state.playback_range || [0, this.state.duration_frames - 1];
      e === "start" ? t[0] = Math.min(this.frame, t[1]) : e === "end" && (t[1] = Math.max(this.frame, t[0])), this.state.playback_range = t, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${t[0]}–F${t[1]}`);
    },
    clearPlaybackRange() {
      this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
    },
    toggleTimecode() {
      this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
    },
    toggleSnap() {
      this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
      const e = this.root.querySelector('[data-act="toggle-snap"]');
      e.classList.toggle("active", this.state.snap_enabled), e.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
    },
    scheduleSerialize() {
      this.serializeScheduled || (this.serializeScheduled = !0, requestAnimationFrame(() => {
        this.serializeScheduled = !1, this.serialize();
      }));
    },
    gizmoAxes(e) {
      return We(this, e);
    },
    gizmoGeometry(e) {
      return De(this, e);
    },
    pickGizmo(e) {
      return $e(this, e);
    },
    pickSceneObject(e) {
      return Be(this, e);
    },
    drawTransformGizmo() {
      ze(this);
    },
    onPointerDown(e) {
      Ve(this, e);
    },
    onPointerMove(e) {
      He(this, e);
    },
    onPointerUp(e) {
      Re(this, e);
    },
    onWheel(e) {
      Ue(this, e);
    },
    timelineFrameFromEvent(e, t) {
      return _e(this, e, t);
    },
    onTimelinePointerDown(e) {
      Te(this, e);
    },
    onTimelinePointerMove(e) {
      xe(this, e);
    },
    onTimelinePointerUp(e) {
      Ee(this, e);
    },
    resetTimelineZoom() {
      P(this);
    },
    refreshKeys() {
      _(this);
    },
    drawCurveEditor() {
      F(this);
    },
    toggleCurveHandles() {
      D(this);
    },
    setCurveInterpolation(e) {
      A(this, e);
    },
    setTangentMode(e) {
      W(this, e);
    },
    setChannelFilter(e) {
      z(this, e);
    },
    onCurvePointerDown(e) {
      T(this, e);
    },
    onCurvePointerMove(e) {
      x(this, e);
    },
    onCurvePointerUp(e) {
      E(this, e);
    },
    zoomCurve(e) {
      Ie(this, e);
    },
    resetCurveZoom() {
      I(this);
    },
    onKey(e) {
      S(this, e);
    },
    frameTarget() {
      Ae(this);
    },
    async loadMediaUrl(e, t) {
      return Xe(this, e, t);
    },
    restoreAssets() {
      tt(this);
    },
    onModelLoaded(e) {
      et(this, e);
    },
    async loadModelFile(e) {
      return Ye(this, e);
    },
    async loadCardFile(e) {
      return Ze(this, e);
    },
    loadExecutionPreview(e) {
      Je(this, e);
    },
    loadSelectedReference() {
      Qe(this);
    },
    drawLine3D(e, t, a = "#5a5a5a", r = 1) {
      je(this, e, t, a, r);
    },
    drawGrid() {
      ve(this);
    },
    drawPointField() {
      Me(this);
    },
    drawCube(e) {
      we(this, e);
    },
    drawSphere(e) {
      Ke(this, e);
    },
    drawHuman(e) {
      Se(this, e);
    },
    drawNull(e) {
      Pe(this, e);
    },
    drawCard(e) {
      Ce(this, e);
    },
    drawCameraPath() {
      be(this);
    },
    drawSpeedHeatmap() {
      Oe(this);
    },
    drawOverlays() {
      ke(this);
    },
    async loadViewportBgFile(e) {
      return ye(this, e);
    },
    async loadViewportBgSequence(e) {
      return ge(this, e);
    },
    clearViewportBgImage() {
      fe(this);
    }
  };
}
function $i(o) {
  const { app: s, api: u, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: k, initializeTooltips: w, promptText: v, ObjectUrlRegistry: M, buildRoot: O, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: R, playblastCameraTrack: U, restoreFromWidgets: $, serializeEditorState: B, syncActiveCameraTrack: L, syncFromWidgets: q, bind: G, activateCamera: N, addCamera: Z, deleteCamera: J, drawPreviewOverlays: K, duplicateCamera: X, maximizeCameraPreview: Y, refreshCameraPreviews: Q, refreshCameraSelectors: ee, renameCamera: te, setPlayblastCamera: ae, toggleCameraView: re, captureRealtime: ie, makePlayblast: se, uploadDirectorPlayblast: oe, waitForMediaFrame: ne, computeAudioPeaks: le, loadAudioFile: ce, stopPlay: de, togglePlay: me, applyCameraPreset: he, applyCameraShake: ue, applyProxyPreset: pe, clearViewportBgImage: fe, loadViewportBgFile: ye, loadViewportBgSequence: ge, drawCameraPath: be, drawCard: Ce, drawCube: we, drawGrid: ve, drawHuman: Se, drawLine3D: je, drawNull: Pe, drawOverlays: ke, drawPointField: Me, drawSpeedHeatmap: Oe, drawSphere: Ke, curveChannels: Fe, drawCurveEditor: F, onCurvePointerDown: T, onCurvePointerMove: x, onCurvePointerUp: E, onTimelinePointerDown: Te, onTimelinePointerMove: xe, onTimelinePointerUp: Ee, refreshKeys: _, resetCurveZoom: I, resetTimelineZoom: P, setChannelFilter: z, setCurveInterpolation: A, setTangentMode: W, timelineFrameFromEvent: _e, toggleCurveHandles: D, zoomCurve: Ie, drawTransformGizmo: ze, frameTarget: Ae, gizmoAxes: We, gizmoGeometry: De, onPointerDown: Ve, onPointerMove: He, onPointerUp: Re, onWheel: Ue, pickGizmo: $e, pickSceneObject: Be, resetCamera: Le, setTransformMode: qe, setViewMode: Ge, viewportCamera: Ne, loadCardFile: Ze, loadExecutionPreview: Je, loadMediaUrl: Xe, loadModelFile: Ye, loadSelectedReference: Qe, onModelLoaded: et, restoreAssets: tt, syncUpstreamInputs: at, configureDomMedia: Gt, refreshSetupDiagnostic: rt, addMediaCard: it, addPrimitive: st, applyObjectAnimationFrame: ot, beginCameraEdit: nt, beginObjectEdit: lt, commitCameraEdit: ct, commitObjectEdit: dt, copyKeyframe: mt, deleteKeyframe: ht, deleteObject: ut, duplicateObject: pt, exitKeyEdit: ft, finishCameraEdit: yt, goToAdjacentKey: gt, insertKeyframe: bt, loadSelectedKeyView: Ct, pasteKeyframe: wt, playblastCameraAtFrame: vt, refreshInspector: St, refreshKeyEditor: jt, refreshObjects: Pt, removeObjectResources: kt, renameObject: Mt, retimeSelectedKey: Ot, selectKeyframe: Kt, selectedKeyframe: Ft, selectedObject: Tt, selectObjectAnimation: xt, setKeyInterpolation: Et, setObjectParent: _t, timelineKeyframes: It, timelineObject: zt, toggleAutoKey: At, toggleObject: Wt, updateCameraFromHud: Dt, updateEditState: Vt, updateKeyVisualState: Ht, updateSelectedKey: Rt, updateSelectedObject: Ut, clamp: V, cloneCamera: Nt, configureCore: Zt, defaultCamera: $t, sampleCamera: f, sampleObjectTransform: y, sanitizeState: Bt, worldTransform: Lt } = o;
  return {
    render() {
      const e = this.ctx, t = this.canvas.width, a = this.canvas.height;
      if (e.fillStyle = this.state.viewport_bg_color || "#121212", e.fillRect(0, 0, t, a), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const l = this.frame % this.viewportBgSequenceImages.length, h = this.viewportBgSequenceImages[l];
        if (h?.complete && h.naturalWidth)
          try {
            e.drawImage(h, 0, 0, t, a);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          e.drawImage(this.viewportBgImage, 0, 0, t, a);
        } catch {
        }
      const r = this.state.render_mode, i = this.viewportCamera(), c = this.state.objects.some((l) => l.parent_id) ? this.state.objects.map((l) => l.parent_id ? { ...l, ...Lt(this.state.objects, l) } : l) : this.state.objects, d = c === this.state.objects ? this.state : { ...this.state, objects: c };
      if (this.webgl)
        try {
          this.webgl.render(d, i, this.cardMediaById, t, a, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection), e.drawImage(this.webgl.canvas, 0, 0, t, a);
        } catch (l) {
          console.error("[OmniCam WebGL Render Error]", l);
        }
      else {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(r) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(r) && this.drawPointField();
        for (const l of c)
          l.enabled !== !1 && (l.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(r) ? this.drawCard(l) : ["cube", "ground", "glb", "model"].includes(l.type) && r !== "grid" && r !== "point_field" ? this.drawCube(l) : l.type === "sphere" && r !== "grid" && r !== "point_field" ? this.drawSphere(l) : l.type === "human" && r !== "grid" && r !== "point_field" ? this.drawHuman(l) : l.type === "null" && this.drawNull(l));
        this.recording || this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays();
      const g = i.position, p = i.target, m = this.root.querySelector('[data-role="hud"]');
      if (m) {
        const l = this.activeCameraTrack(), h = this.state.view_mode === "camera", b = l.target_object_id || this.state.target_object_id, Jt = b ? this.state.objects.find((H) => H.id === b) : null, fa = i.fov * Math.PI / 360, ya = Math.round(18 / Math.tan(fa));
        m.replaceChildren();
        const aa = document.createElement("div"), Xt = document.createElement("span");
        Xt.className = `hud-badge ${h ? "active" : ""}`, Xt.textContent = h ? `📷 ${l.name}` : `🌐 ${this.state.view_mode.toUpperCase()}`;
        const Yt = document.createElement("span");
        Yt.style.color = "#aaa", Yt.textContent = ` ${r}`, aa.append(Xt, Yt);
        const ra = document.createElement("div");
        ra.textContent = `F ${this.frame}/${this.state.duration_frames - 1} · ${this.state.fps}fps · FOV ${i.fov.toFixed(1)}° (≈${ya}mm)`;
        const ia = document.createElement("div");
        ia.textContent = Jt ? `🎯 Track: ${Jt.name || Jt.type}` : `P: [${g.map((H) => H.toFixed(1)).join(", ")}] · T: [${p.map((H) => H.toFixed(1)).join(", ")}]`, m.append(aa, ra, ia);
      }
      this.renderCameraView();
    },
    renderCameraView() {
      if (this.state.camera_view_visible) {
        this.refreshCameraPreviews();
        for (const e of this.state.cameras) {
          const t = this.cameraPreviewCanvases.get(e.id), a = this.cameraPreviewContexts.get(e.id);
          if (!t?.width || !a) continue;
          const r = t.width, i = t.height, c = f(e, this.frame);
          if (a.fillStyle = "#111", a.fillRect(0, 0, r, i), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1 }, c, this.cardMediaById, r, i, this.modelUrlsById, this.frame, !0), a.drawImage(this.cameraWebgl.canvas, 0, 0, r, i);
            } catch (g) {
              console.error("[OmniCam Preview Render Error]", g);
            }
          K(this, a, r, i);
          const d = this.root.querySelector(`[data-camera-frame="${e.id}"]`);
          d && (d.textContent = `F${this.frame}`);
        }
      }
    },
    drawPreviewOverlays(e, t, a) {
      K(this, e, t, a);
    },
    maximizeCameraPreview(e) {
      Y(this, e);
    },
    setStatus(e) {
      this.root.querySelector('[data-role="status"]').textContent = e;
    },
    async makePlayblast() {
      return se(this);
    },
    async waitForMediaFrame() {
      return ne(this);
    },
    async captureRealtimePlayblast() {
      return ie(this);
    },
    async uploadPlayblast(e) {
      return oe(this, e);
    },
    async syncUpstreamInputs() {
      return at(this);
    },
    dispose() {
      this.stopPlay(), clearTimeout(this.previewClickTimer), this.abortController?.abort(), this.resizeObserver?.disconnect(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), this.objectUrls.clear(), this.cardMediaById.clear(), this.modelUrlsById.clear(), this.modelInfoById.clear();
    }
  };
}
const Bi = "Majoor.OmniCam.Director", sa = "MajoorOmniCamDirector";
ma({ api: ta });
da({ api: ta });
class pa {
  constructor(s) {
    this.app = ea, this.node = s, this.root = ca(), this.root.tabIndex = -1, this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.root.querySelector(".viewport-wrap"), this.interactionElement.tabIndex = -1, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 });
    try {
      this.webgl = new Qt(() => this.render(), (n) => this.onModelLoaded(n));
    } catch (n) {
      console.warn("OmniCam WebGL unavailable; using Canvas fallback", n), this.webgl = null;
    }
    try {
      this.cameraWebgl = new Qt(() => this.renderCameraView(), () => {
      });
    } catch (n) {
      console.warn("OmniCam Camera View unavailable", n), this.cameraWebgl = null;
    }
    this.stateWidget = s.widgets?.find((n) => n.name === "state_json"), this.recordingWidget = s.widgets?.find((n) => n.name === "recording_path"), this.cardWidget = s.widgets?.find((n) => n.name === "card_asset"), this.widthWidget = s.widgets?.find((n) => n.name === "width"), this.heightWidget = s.widgets?.find((n) => n.name === "height"), this.fpsWidget = s.widgets?.find((n) => n.name === "fps"), this.durationWidget = s.widgets?.find((n) => n.name === "duration_seconds"), this.modeWidget = s.widgets?.find((n) => n.name === "render_mode");
    let u = null;
    try {
      u = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ha(u), this.frame = 0, this.camera = ua(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.objectUrls = new la(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.contextMenu = new na(this.root), this.history = new oa({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedKeyFrame: this.selectedKeyFrame }), restore: (n) => this.restoreHistorySnapshot(n) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bind(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic();
  }
}
const qt = { app: ea, api: ta, OmniWebGLViewport: Qt, EditorHistory: oa, ContextMenuController: na, initializeTooltips: ga, promptText: ba, ObjectUrlRegistry: la, buildRoot: ca, dispatchDirectorKey: Ca, activeCameraTrack: wa, bindWidgetCallbacks: va, playblastCameraTrack: Sa, restoreFromWidgets: ja, serializeEditorState: Pa, syncActiveCameraTrack: ka, syncFromWidgets: Ma, bind: Oa, activateCamera: Ka, addCamera: Fa, deleteCamera: Ta, drawPreviewOverlays: xa, duplicateCamera: Ea, maximizeCameraPreview: _a, refreshCameraPreviews: Ia, refreshCameraSelectors: za, renameCamera: Aa, setPlayblastCamera: Wa, toggleCameraView: Da, captureRealtime: Va, makePlayblast: Ha, uploadDirectorPlayblast: Ra, waitForMediaFrame: Ua, computeAudioPeaks: $a, loadAudioFile: Ba, stopPlay: La, togglePlay: qa, applyCameraPreset: Ga, applyCameraShake: Na, applyProxyPreset: Za, clearViewportBgImage: Ja, loadViewportBgFile: Xa, loadViewportBgSequence: Ya, drawCameraPath: Qa, drawCard: er, drawCube: tr, drawGrid: ar, drawHuman: rr, drawLine3D: ir, drawNull: sr, drawOverlays: or, drawPointField: nr, drawSpeedHeatmap: lr, drawSphere: cr, curveChannels: dr, drawCurveEditor: mr, onCurvePointerDown: hr, onCurvePointerMove: ur, onCurvePointerUp: pr, onTimelinePointerDown: fr, onTimelinePointerMove: yr, onTimelinePointerUp: gr, refreshKeys: br, resetCurveZoom: Cr, resetTimelineZoom: wr, setChannelFilter: vr, setCurveInterpolation: Sr, setTangentMode: jr, timelineFrameFromEvent: Pr, toggleCurveHandles: kr, zoomCurve: Mr, drawTransformGizmo: Or, frameTarget: Kr, gizmoAxes: Fr, gizmoGeometry: Tr, onPointerDown: xr, onPointerMove: Er, onPointerUp: _r, onWheel: Ir, pickGizmo: zr, pickSceneObject: Ar, resetCamera: Wr, setTransformMode: Dr, setViewMode: Vr, viewportCamera: Hr, loadCardFile: Rr, loadExecutionPreview: Ur, loadMediaUrl: $r, loadModelFile: Br, loadSelectedReference: Lr, onModelLoaded: qr, restoreAssets: Gr, syncUpstreamInputs: Nr, configureDomMedia: da, refreshSetupDiagnostic: Zr, addMediaCard: Jr, addPrimitive: Xr, applyObjectAnimationFrame: Yr, beginCameraEdit: Qr, beginObjectEdit: ei, commitCameraEdit: ti, commitObjectEdit: ai, copyKeyframe: ri, deleteKeyframe: ii, deleteObject: si, duplicateObject: oi, exitKeyEdit: ni, finishCameraEdit: li, goToAdjacentKey: ci, insertKeyframe: di, loadSelectedKeyView: mi, pasteKeyframe: hi, playblastCameraAtFrame: ui, refreshInspector: pi, refreshKeyEditor: fi, refreshObjects: yi, removeObjectResources: gi, renameObject: bi, retimeSelectedKey: Ci, selectKeyframe: wi, selectedKeyframe: vi, selectedObject: Si, selectObjectAnimation: ji, setKeyInterpolation: Pi, setObjectParent: ki, timelineKeyframes: Mi, timelineObject: Oi, toggleAutoKey: Ki, toggleObject: Fi, updateCameraFromHud: Ti, updateEditState: xi, updateKeyVisualState: Ei, updateSelectedKey: _i, updateSelectedObject: Ii, clamp: zi, cloneCamera: Ai, configureCore: ma, defaultCamera: Wi, sampleCamera: ua, sampleObjectTransform: Di, sanitizeState: ha, worldTransform: Vi };
Object.assign(
  pa.prototype,
  Hi(qt),
  Ri(qt),
  Ui(qt),
  $i(qt)
);
function Li(o) {
  if (o.__majoorOmniCam) return;
  const s = new pa(o);
  o.__majoorOmniCam = s, s.hideInternalWidgets();
  const u = () => Math.max(700, s.root.scrollHeight || 0);
  s.domWidget = o.addDOMWidget("majoor_omnicam_viewport", "omnicam", s.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: u,
    getMaxHeight: () => u(),
    afterResize: () => {
      s.resizeCanvas(), s.render();
    }
  });
  const n = [760, 780], C = o.size || n;
  o.setSize([Math.max(C[0], n[0]), Math.max(C[1], n[1])]);
  const k = o.onResize;
  o.onResize = function() {
    k?.apply(this, arguments), requestAnimationFrame(() => {
      s.resizeCanvas(), s.render();
    });
  };
  const w = o.onConfigure;
  o.onConfigure = function() {
    w?.apply(this, arguments), requestAnimationFrame(() => {
      s.restoreFromWidgets(), s.syncUpstreamInputs();
    });
  };
  const v = o.onAfterGraphConfigured;
  o.onAfterGraphConfigured = function() {
    v?.apply(this, arguments), requestAnimationFrame(() => {
      s.restoreFromWidgets(), s.syncUpstreamInputs();
    });
  };
  const M = o.onConnectionsChange;
  o.onConnectionsChange = function() {
    M?.apply(this, arguments), setTimeout(() => s.syncUpstreamInputs(), 60);
  };
  const O = o.onRemoved;
  o.onRemoved = function() {
    s.dispose(), O?.apply(this, arguments);
  };
  const S = o.onExecuted;
  o.onExecuted = function(j) {
    S?.apply(this, arguments), s.loadExecutionPreview(j), s.syncUpstreamInputs();
  };
}
ea.registerExtension({
  name: Bi,
  async nodeCreated(o) {
    (o.comfyClass === sa || o.constructor?.type === sa) && Li(o);
  }
});
