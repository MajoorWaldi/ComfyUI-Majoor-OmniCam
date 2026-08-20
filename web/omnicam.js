import { app as ia } from "../../scripts/app.js";
import { api as Zt } from "../../scripts/api.js";
import { OmniWebGLViewport as ra } from "./omnicam-webgl.js";
import { EditorHistory as ca } from "./omnicam-history.js";
import { ContextMenuController as da, initializeTooltips as wa, promptText as va } from "./omnicam-ui.js";
import { ObjectUrlRegistry as ma } from "./omnicam-media.js";
import { buildRoot as ha } from "./omnicam-template.js";
import { dispatchDirectorKey as Sa } from "./omnicam-commands.js";
import { activeCameraTrack as ja, bindWidgetCallbacks as ka, playblastCameraTrack as Pa, restoreFromWidgets as Ma, serializeEditorState as Oa, syncActiveCameraTrack as Ka, syncFromWidgets as Fa } from "./omnicam-state-sync.js";
import { bind as Ta } from "./omnicam-event-bindings.js";
import { activateCamera as xa, addCamera as Ea, deleteCamera as _a, drawPreviewOverlays as Ia, duplicateCamera as Aa, maximizeCameraPreview as za, refreshCameraPreviews as Wa, refreshCameraSelectors as Ra, renameCamera as Da, setPlayblastCamera as Va, toggleCameraView as Ha } from "./omnicam-cameras.js";
import { captureRealtime as Ua, makePlayblast as $a, uploadDirectorPlayblast as Ba, waitForMediaFrame as qa } from "./omnicam-record.js";
import { computeAudioPeaks as La, loadAudioFile as Ga, stopPlay as Na, togglePlay as Za } from "./omnicam-playback-transport.js";
import { applyCameraPreset as Ja, applyCameraShake as Xa, applyProxyPreset as Ya } from "./omnicam-motion-presets.js";
import { configureBackgroundManager as Qa, clearViewportBgImage as er, loadViewportBgFile as tr, loadViewportBgSequence as ar } from "./omnicam-background-manager.js";
import { drawCameraPath as rr, drawCard as ir, drawCube as sr, drawGrid as or, drawHuman as nr, drawLine3D as lr, drawNull as cr, drawOverlays as dr, drawPointField as mr, drawSpeedHeatmap as hr, drawSphere as ur } from "./omnicam-viewport-overlays.js";
import { curveChannels as pr, drawCurveEditor as fr, onCurvePointerDown as gr, onCurvePointerMove as yr, onCurvePointerUp as br, onTimelinePointerDown as Cr, onTimelinePointerMove as wr, onTimelinePointerUp as vr, refreshKeys as Sr, resetCurveZoom as jr, resetTimelineZoom as kr, setChannelFilter as Pr, setCurveInterpolation as Mr, setTangentMode as Or, timelineFrameFromEvent as Kr, toggleCurveHandles as Fr, zoomCurve as Tr } from "./omnicam-timeline.js";
import { drawTransformGizmo as xr, frameTarget as Er, gizmoAxes as _r, gizmoGeometry as Ir, onPointerDown as Ar, onPointerMove as zr, onPointerUp as Wr, onWheel as Rr, pickGizmo as Dr, pickSceneObject as Vr, resetCamera as Hr, setTransformMode as Ur, setViewMode as $r, viewportCamera as Br } from "./omnicam-viewport-controls.js";
import { configureDomMedia as ua, loadCardFile as qr, loadExecutionPreview as Lr, loadMediaUrl as Gr, loadModelFile as Nr, loadSelectedReference as Zr, onModelLoaded as Jr, restoreAssets as Xr, syncUpstreamInputs as Yr } from "./omnicam-dom-media.js";
import { refreshSetupDiagnostic as Qr } from "./omnicam-diagnostics.js";
import { addMediaCard as ei, addPrimitive as ti, applyObjectAnimationFrame as ai, beginCameraEdit as ri, beginObjectEdit as ii, commitCameraEdit as si, commitObjectEdit as oi, copyKeyframe as ni, deleteKeyframe as li, deleteObject as ci, duplicateObject as di, exitKeyEdit as mi, finishCameraEdit as hi, goToAdjacentKey as ui, insertKeyframe as pi, loadSelectedKeyView as fi, pasteKeyframe as gi, playblastCameraAtFrame as yi, refreshInspector as bi, refreshKeyEditor as Ci, refreshObjects as wi, removeObjectResources as vi, renameObject as Si, retimeSelectedKey as ji, selectKeyframe as ki, selectedKeyframe as Pi, selectedObject as Mi, selectObjectAnimation as Oi, setKeyInterpolation as Ki, setObjectParent as Fi, timelineKeyframes as Ti, timelineObject as xi, toggleAutoKey as Ei, toggleObject as _i, updateCameraFromHud as Ii, updateEditState as Ai, updateKeyVisualState as zi, updateSelectedKey as Wi, updateSelectedObject as Ri } from "./omnicam-scene.js";
import { configureCore as pa, sanitizeState as fa, sampleCamera as ga, clamp as Di, cloneCamera as Vi, defaultCamera as Hi, sampleObjectTransform as Ui, worldTransform as $i } from "./omnicam-core.js";
function Bi(o) {
  const { app: s, api: p, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: O, initializeTooltips: w, promptText: v, ObjectUrlRegistry: K, buildRoot: F, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: $, playblastCameraTrack: B, restoreFromWidgets: q, serializeEditorState: L, syncActiveCameraTrack: G, syncFromWidgets: N, bind: Z, activateCamera: J, addCamera: X, deleteCamera: Y, drawPreviewOverlays: T, duplicateCamera: Q, maximizeCameraPreview: ee, refreshCameraPreviews: te, refreshCameraSelectors: ae, renameCamera: re, setPlayblastCamera: ie, toggleCameraView: se, captureRealtime: oe, makePlayblast: ne, uploadDirectorPlayblast: le, waitForMediaFrame: ce, computeAudioPeaks: de, loadAudioFile: me, stopPlay: he, togglePlay: ue, applyCameraPreset: pe, applyCameraShake: fe, applyProxyPreset: ge, clearViewportBgImage: ye, loadViewportBgFile: be, loadViewportBgSequence: Ce, drawCameraPath: we, drawCard: ve, drawCube: Se, drawGrid: je, drawHuman: ke, drawLine3D: Pe, drawNull: Me, drawOverlays: Oe, drawPointField: Ke, drawSpeedHeatmap: Fe, drawSphere: Te, curveChannels: xe, drawCurveEditor: x, onCurvePointerDown: E, onCurvePointerMove: _, onCurvePointerUp: I, onTimelinePointerDown: Ee, onTimelinePointerMove: _e, onTimelinePointerUp: Ie, refreshKeys: A, resetCurveZoom: z, resetTimelineZoom: k, setChannelFilter: W, setCurveInterpolation: R, setTangentMode: D, timelineFrameFromEvent: Ae, toggleCurveHandles: V, zoomCurve: ze, drawTransformGizmo: We, frameTarget: Re, gizmoAxes: De, gizmoGeometry: Ve, onPointerDown: He, onPointerMove: Ue, onPointerUp: $e, onWheel: Be, pickGizmo: qe, pickSceneObject: Le, resetCamera: Ge, setTransformMode: Ne, setViewMode: Ze, viewportCamera: Je, loadCardFile: Xe, loadExecutionPreview: Ye, loadMediaUrl: Qe, loadModelFile: et, loadSelectedReference: tt, onModelLoaded: at, restoreAssets: rt, syncUpstreamInputs: it, configureDomMedia: Jt, refreshSetupDiagnostic: st, addMediaCard: ot, addPrimitive: nt, applyObjectAnimationFrame: lt, beginCameraEdit: ct, beginObjectEdit: dt, commitCameraEdit: mt, commitObjectEdit: ht, copyKeyframe: ut, deleteKeyframe: pt, deleteObject: ft, duplicateObject: gt, exitKeyEdit: yt, finishCameraEdit: bt, goToAdjacentKey: Ct, insertKeyframe: wt, loadSelectedKeyView: vt, pasteKeyframe: St, playblastCameraAtFrame: jt, refreshInspector: kt, refreshKeyEditor: Pt, refreshObjects: Mt, removeObjectResources: Ot, renameObject: Kt, retimeSelectedKey: Ft, selectKeyframe: Tt, selectedKeyframe: xt, selectedObject: Et, selectObjectAnimation: _t, setKeyInterpolation: It, setObjectParent: At, timelineKeyframes: zt, timelineObject: Wt, toggleAutoKey: Rt, toggleObject: Dt, updateCameraFromHud: Vt, updateEditState: Ht, updateKeyVisualState: Ut, updateSelectedKey: $t, updateSelectedObject: Bt, clamp: H, cloneCamera: Xt, configureCore: Yt, defaultCamera: qt, sampleCamera: f, sampleObjectTransform: g, sanitizeState: Lt, worldTransform: Gt } = o;
  return {
    setSelectMode(e) {
      if (["object", "vertex", "edge", "face"].includes(e)) {
        this.state.select_mode = e, this.subSelection = null;
        for (const t of this.root.querySelectorAll("[data-select-mode]")) {
          const a = t.dataset.selectMode === e;
          t.classList.toggle("active", a), t.setAttribute("aria-pressed", String(a));
        }
        for (const t of this.root.querySelectorAll('[data-role="select-mode"]'))
          t.value = e;
        this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${e.toUpperCase()}`);
      }
    },
    refreshSetupDiagnostic() {
      st(this);
    },
    hideInternalWidgets() {
      for (const e of ["state_json", "recording_path", "card_asset"]) {
        const t = this.node.widgets?.find((a) => a.name === e);
        t && (t.computeSize = () => [0, -4], t.draw = () => {
        }, t.hidden = !0, t.options = { ...t.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      q(this);
    },
    restoreHistorySnapshot(e) {
      const t = JSON.parse(e);
      this.state = Lt(t.state), this.frame = H(t.frame, 0, this.state.duration_frames - 1), this.selectedEntity = t.selectedEntity, this.selectedObjectId = t.selectedObjectId, this.selectedKeyFrame = t.selectedKeyFrame, this.camera = f(this.state, this.frame), this.cameraPreviewSignature = "", this.serialize(), this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.render();
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
      Z(this);
    },
    bindWidgetCallbacks() {
      $(this);
    },
    syncFromWidgets(e = !0) {
      N(this, e);
    },
    serialize() {
      L(this);
    },
    activeCameraTrack() {
      return j(this);
    },
    playblastCameraTrack() {
      return B(this);
    },
    syncActiveCameraTrack() {
      G(this);
    },
    refreshCameraSelectors() {
      ae(this);
    },
    refreshCameraPreviews() {
      te(this);
    },
    addCamera() {
      X(this);
    },
    async renameCamera(e) {
      return re(this, e);
    },
    duplicateCamera(e) {
      Q(this, e);
    },
    async deleteCamera(e) {
      return Y(this, e);
    },
    activateCamera(e) {
      J(this, e);
    },
    setPlayblastCamera(e) {
      ie(this, e);
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
      e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.();
      const t = e.target, a = t.closest?.(".camera-preview-tile"), r = t.closest?.(".scene-item"), i = t.closest?.(".key");
      if (a) return this.openCameraContext(e, a.dataset.cameraId, !0);
      if (r?.dataset.cameraId) return this.openCameraContext(e, r.dataset.cameraId, !1);
      if (r?.dataset.objectId) return this.openObjectContext(e, r.dataset.objectId);
      if (i) {
        const d = this.timelineKeyframes().find((h) => h.frame === Number(i.dataset.keyFrame));
        return d && this.selectKeyframe(d), this.openTimelineContext(e, !0);
      }
      if (t.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(e, t.closest('[data-role="keys"]'))), this.openTimelineContext(e, !1);
      if (t.closest?.(".curve-editor")) return this.openCurveContext(e);
      if (t.closest?.(".viewport-wrap")) {
        const d = this.interactionElement.getBoundingClientRect(), h = (e.clientX - d.left) * this.canvas.width / Math.max(1, d.width), u = (e.clientY - d.top) * this.canvas.height / Math.max(1, d.height), m = this.pickSceneObject([h, u]);
        if (m) {
          if ((m.type === "object" || m.type === "object_keyframe") && m.object)
            return this.selectedEntity = "object", this.selectedObjectId = m.object.id, m.keyframe ? (this.setFrame(m.keyframe.frame), this.selectedKeyFrame = m.keyframe.frame) : this.selectedKeyFrame = m.object.keyframes?.find((l) => l.frame === this.frame)?.frame ?? null, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openObjectContext(e, m.object.id);
          if (["camera", "camera_target", "camera_keyframe"].includes(m.type) && m.camera)
            return this.selectedEntity = m.type === "camera_target" ? "camera_target" : "camera", this.selectedObjectId = null, this.activateCamera(m.camera.id), m.keyframe && (this.setFrame(m.keyframe.frame), this.selectedKeyFrame = m.keyframe.frame), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openCameraContext(e, m.camera.id, !1);
        }
        return this.openViewportContext(e);
      }
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
      const a = this.state.cameras.findIndex((d) => d.id === e), r = a + t;
      if (a < 0 || r < 0 || r >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [i] = this.state.cameras.splice(a, 1);
      this.state.cameras.splice(r, 0, i), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${i.name} → #${r + 1}`);
    },
    async editShotHandles(e) {
      const t = this.state.cameras.find((d) => d.id === e);
      if (!t) return;
      const a = t.handles || { in: 0, out: 0 }, r = await v(s, "Shot handles", "Handle frames: in,out", `${a.in},${a.out}`);
      if (r == null) return;
      const i = String(r).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!i) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), t.handles = { in: Math.min(600, Number(i[1])), out: Math.min(600, Number(i[2])) }, this.serialize(), this.setStatus(`${t.name} handles: ${t.handles.in} / ${t.handles.out}`);
    },
    openTimelineContext(e, t) {
      this.showContextMenu(e, t ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
        { label: "Fit timeline view (F)", icon: "pi-arrows-alt", shortcut: "F", run: () => k(this) },
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
        { label: "Fit all curves (Framing)", icon: "pi-arrows-alt", shortcut: "F", run: () => z(this) },
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
    scheduleResizeAndRender() {
      this.resizeScheduled || (this.resizeScheduled = !0, this.resizeFrame = requestAnimationFrame(() => {
        this.resizeScheduled = !1, !this.disposed && (this.resizeCanvas(), this.render());
      }));
    },
    resizeCanvas() {
      const e = this.root.querySelector(".viewport-wrap");
      if (!e) return;
      const t = Math.min(2, window.devicePixelRatio || 1), a = e.clientWidth || 320, r = e.clientHeight || 180, i = Math.max(320, Math.round(a * t)), d = Math.max(180, Math.round(r * t));
      (this.canvas.width !== i || this.canvas.height !== d) && (this.canvas.width = i, this.canvas.height = d);
      for (const h of this.cameraPreviewCanvases.values()) {
        const u = h.clientWidth || 220, m = h.clientHeight || 140, l = Math.max(220, Math.round(u * t)), y = Math.max(140, Math.round(m * t));
        (h.width !== l || h.height !== y) && (h.width = l, h.height = y);
      }
      this.drawCurveEditor();
    }
  };
}
function qi(o) {
  const { app: s, api: p, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: O, initializeTooltips: w, promptText: v, ObjectUrlRegistry: K, buildRoot: F, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: $, playblastCameraTrack: B, restoreFromWidgets: q, serializeEditorState: L, syncActiveCameraTrack: G, syncFromWidgets: N, bind: Z, activateCamera: J, addCamera: X, deleteCamera: Y, drawPreviewOverlays: T, duplicateCamera: Q, maximizeCameraPreview: ee, refreshCameraPreviews: te, refreshCameraSelectors: ae, renameCamera: re, setPlayblastCamera: ie, toggleCameraView: se, captureRealtime: oe, makePlayblast: ne, uploadDirectorPlayblast: le, waitForMediaFrame: ce, computeAudioPeaks: de, loadAudioFile: me, stopPlay: he, togglePlay: ue, applyCameraPreset: pe, applyCameraShake: fe, applyProxyPreset: ge, clearViewportBgImage: ye, loadViewportBgFile: be, loadViewportBgSequence: Ce, drawCameraPath: we, drawCard: ve, drawCube: Se, drawGrid: je, drawHuman: ke, drawLine3D: Pe, drawNull: Me, drawOverlays: Oe, drawPointField: Ke, drawSpeedHeatmap: Fe, drawSphere: Te, curveChannels: xe, drawCurveEditor: x, onCurvePointerDown: E, onCurvePointerMove: _, onCurvePointerUp: I, onTimelinePointerDown: Ee, onTimelinePointerMove: _e, onTimelinePointerUp: Ie, refreshKeys: A, resetCurveZoom: z, resetTimelineZoom: k, setChannelFilter: W, setCurveInterpolation: R, setTangentMode: D, timelineFrameFromEvent: Ae, toggleCurveHandles: V, zoomCurve: ze, drawTransformGizmo: We, frameTarget: Re, gizmoAxes: De, gizmoGeometry: Ve, onPointerDown: He, onPointerMove: Ue, onPointerUp: $e, onWheel: Be, pickGizmo: qe, pickSceneObject: Le, resetCamera: Ge, setTransformMode: Ne, setViewMode: Ze, viewportCamera: Je, loadCardFile: Xe, loadExecutionPreview: Ye, loadMediaUrl: Qe, loadModelFile: et, loadSelectedReference: tt, onModelLoaded: at, restoreAssets: rt, syncUpstreamInputs: it, configureDomMedia: Jt, refreshSetupDiagnostic: st, addMediaCard: ot, addPrimitive: nt, applyObjectAnimationFrame: lt, beginCameraEdit: ct, beginObjectEdit: dt, commitCameraEdit: mt, commitObjectEdit: ht, copyKeyframe: ut, deleteKeyframe: pt, deleteObject: ft, duplicateObject: gt, exitKeyEdit: yt, finishCameraEdit: bt, goToAdjacentKey: Ct, insertKeyframe: wt, loadSelectedKeyView: vt, pasteKeyframe: St, playblastCameraAtFrame: jt, refreshInspector: kt, refreshKeyEditor: Pt, refreshObjects: Mt, removeObjectResources: Ot, renameObject: Kt, retimeSelectedKey: Ft, selectKeyframe: Tt, selectedKeyframe: xt, selectedObject: Et, selectObjectAnimation: _t, setKeyInterpolation: It, setObjectParent: At, timelineKeyframes: zt, timelineObject: Wt, toggleAutoKey: Rt, toggleObject: Dt, updateCameraFromHud: Vt, updateEditState: Ht, updateKeyVisualState: Ut, updateSelectedKey: $t, updateSelectedObject: Bt, clamp: H, cloneCamera: Xt, configureCore: Yt, defaultCamera: qt, sampleCamera: f, sampleObjectTransform: g, sanitizeState: Lt, worldTransform: Gt } = o;
  return {
    setChannelFilter(e) {
      W(this, e);
    },
    setFrame(e, t = !1, a = !0) {
      this.frame = H(Math.round(e), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = f(this.activeCameraTrack(), this.frame), this.applyObjectAnimationFrame();
      for (const l of this.root.querySelectorAll('[data-role="frame"]')) document.activeElement !== l && (l.value = String(this.frame));
      for (const l of this.root.querySelectorAll('[data-role="scrub"]')) l.value = String(this.frame);
      for (const l of this.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]')) document.activeElement !== l && (l.value = String(Math.round(this.camera.fov * 100) / 100));
      for (const l of this.root.querySelectorAll('[data-role="roll"], [data-role="camera-roll"]')) document.activeElement !== l && (l.value = String(Math.round((this.camera.roll || 0) * 100) / 100));
      for (const l of this.root.querySelectorAll('[data-role="camera-type"]')) document.activeElement !== l && (l.value = this.camera.camera_type || "perspective");
      const r = this.frame / this.state.fps;
      for (const l of this.cardMediaById.values()) l instanceof HTMLVideoElement && Number.isFinite(l.duration) && l.duration > 0 && (l.currentTime = r % l.duration);
      const i = Math.floor(r / 60), d = Math.floor(r % 60), h = Math.floor(r % 1 * 1e3), u = this.frame % Math.max(1, Math.round(this.state.fps)), m = Math.floor(this.frame / this.state.fps);
      if (this.root.querySelector('[data-role="time"]').textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(m / 3600)).padStart(2, "0")}:${String(Math.floor(m / 60) % 60).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(u).padStart(2, "0")}` : `${String(i).padStart(2, "0")}:${String(d).padStart(2, "0")}.${String(h).padStart(3, "0")}`, a) this.refreshKeys();
      else {
        const l = Math.max(1, this.state.duration_frames - 1), y = this.root.querySelector('[data-role="keys"] .playhead');
        y && (y.style.left = `${100 * this.frame / l}%`);
        for (const P of this.root.querySelectorAll("[data-key-frame]")) {
          const b = Number(P.dataset.keyFrame);
          P.classList.toggle("at-playhead", b === this.frame), P.classList.toggle("selected", b === this.selectedKeyFrame), P.classList.toggle("editing", b === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      t || this.serialize(), this.refreshInspector(), this.render();
    },
    timelineObject() {
      return Wt(this);
    },
    timelineKeyframes() {
      return zt(this);
    },
    applyObjectAnimationFrame() {
      lt(this, g);
    },
    insertKeyframe() {
      for (const e of this.root.querySelectorAll('[data-act="key"]'))
        e.classList.remove("key-pulse"), e.offsetWidth, e.classList.add("key-pulse");
      wt(this);
    },
    setKeyInterpolation(e) {
      It(this, e);
    },
    deleteKeyframe() {
      pt(this);
    },
    copyKeyframe() {
      ut(this);
    },
    pasteKeyframe() {
      St(this);
    },
    resetCamera() {
      Ge(this, qt);
    },
    selectedKeyframe() {
      return xt(this);
    },
    selectKeyframe(e) {
      Tt(this, e);
    },
    beginCameraEdit() {
      return ct(this);
    },
    commitCameraEdit() {
      mt(this);
    },
    finishCameraEdit() {
      bt(this);
    },
    exitKeyEdit(e = !1) {
      yt(this, e);
    },
    toggleAutoKey() {
      Rt(this);
    },
    updateEditState() {
      Ht(this);
    },
    updateKeyVisualState() {
      Ut(this);
    },
    curveChannels() {
      return xe(this);
    },
    drawCurveEditor() {
      x(this);
    },
    onCurvePointerDown(e) {
      E(this, e);
    },
    onCurvePointerMove(e) {
      _(this, e);
    },
    onCurvePointerUp(e) {
      I(this, e);
    },
    setCurveInterpolation(e) {
      R(this, e);
    },
    setTangentMode(e) {
      D(this, e);
    },
    toggleCurveHandles() {
      V(this);
    },
    onTimelineWheel(e) {
      onTimelineWheel(this, e);
    },
    resetTimelineZoom() {
      k(this);
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
      A(this);
    },
    refreshKeyEditor() {
      Pt(this);
    },
    retimeSelectedKey(e, t = !1) {
      Ft(this, e, t);
    },
    updateSelectedKey() {
      $t(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      vt(this);
    },
    goToAdjacentKey(e) {
      Ct(this, e);
    },
    addPrimitive(e) {
      nt(this, e);
    },
    async renameObject(e) {
      return Kt(this, e);
    },
    duplicateObject(e) {
      gt(this, e);
    },
    toggleObject(e) {
      Dt(this, e);
    },
    async deleteObject(e) {
      return ft(this, e);
    },
    addMediaCard() {
      ot(this);
    },
    selectedObject() {
      return Et(this);
    },
    playblastCameraAtFrame() {
      return jt(this, f);
    },
    viewportCamera() {
      return Je(this);
    },
    setViewMode(e) {
      Ze(this, e);
    },
    toggleCameraView() {
      se(this);
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
      Ne(this, e);
    },
    refreshInspector() {
      kt(this);
    },
    updateSelectedObject() {
      Bt(this);
    },
    beginObjectEdit(e) {
      return dt(this, e);
    },
    commitObjectEdit(e) {
      ht(this, e);
    },
    updateCameraFromHud() {
      Vt(this);
    },
    selectObjectAnimation(e) {
      _t(this, e);
    },
    setObjectParent(e) {
      At(this, e);
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
      Mt(this);
    },
    removeObjectResources(e) {
      Ot(this, e);
    },
    aimAtSelectedObject(e) {
      this.checkpoint("Aim & track subject");
      const t = this.activeCameraTrack(), a = e && this.state.objects.find((d) => d.id === e) || this.selectedObject() || this.state.objects.find((d) => d.id === "subject") || this.state.objects[0];
      if (!a) return;
      t.target_object_id = a.id, t.id === this.state.active_camera_id && (this.state.target_object_id = a.id);
      const i = (a.type === "model" || a.type === "glb" ? this.webgl?.getObjectWorldCenter?.(a.id) : null) || (a.keyframes?.length ? g(a, this.frame).position : a.position || [0, 1.5, 0]);
      this.camera.target = [...i], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${a.name || a.id}`);
    },
    setCameraTrackingTarget(e) {
      this.checkpoint("Change camera tracking target");
      const t = this.activeCameraTrack();
      if (t.target_object_id = e || null, t.id === this.state.active_camera_id && (this.state.target_object_id = e || null), e) {
        const a = this.state.objects.find((r) => r.id === e);
        if (a) {
          const i = (a.type === "model" || a.type === "glb" ? this.webgl?.getObjectWorldCenter?.(a.id) : null) || (a.keyframes?.length ? g(a, this.frame).position : a.position || [0, 1.5, 0]);
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
        const d = (a.type === "model" || a.type === "glb") && r && !a.keyframes?.length ? r : a.keyframes?.length ? g(a, i.frame).position : a.position || [0, 1.5, 0];
        i.camera.target = [...d];
      }
      e.id === this.state.active_camera_id && (this.state.keyframes = e.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${a.name || a.id}`);
    }
  };
}
function Li(o) {
  const { app: s, api: p, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: O, initializeTooltips: w, promptText: v, ObjectUrlRegistry: K, buildRoot: F, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: $, playblastCameraTrack: B, restoreFromWidgets: q, serializeEditorState: L, syncActiveCameraTrack: G, syncFromWidgets: N, bind: Z, activateCamera: J, addCamera: X, deleteCamera: Y, drawPreviewOverlays: T, duplicateCamera: Q, maximizeCameraPreview: ee, refreshCameraPreviews: te, refreshCameraSelectors: ae, renameCamera: re, setPlayblastCamera: ie, toggleCameraView: se, captureRealtime: oe, makePlayblast: ne, uploadDirectorPlayblast: le, waitForMediaFrame: ce, computeAudioPeaks: de, loadAudioFile: me, stopPlay: he, togglePlay: ue, applyCameraPreset: pe, applyCameraShake: fe, applyProxyPreset: ge, clearViewportBgImage: ye, loadViewportBgFile: be, loadViewportBgSequence: Ce, drawCameraPath: we, drawCard: ve, drawCube: Se, drawGrid: je, drawHuman: ke, drawLine3D: Pe, drawNull: Me, drawOverlays: Oe, drawPointField: Ke, drawSpeedHeatmap: Fe, drawSphere: Te, curveChannels: xe, drawCurveEditor: x, onCurvePointerDown: E, onCurvePointerMove: _, onCurvePointerUp: I, onTimelinePointerDown: Ee, onTimelinePointerMove: _e, onTimelinePointerUp: Ie, refreshKeys: A, resetCurveZoom: z, resetTimelineZoom: k, setChannelFilter: W, setCurveInterpolation: R, setTangentMode: D, timelineFrameFromEvent: Ae, toggleCurveHandles: V, zoomCurve: ze, drawTransformGizmo: We, frameTarget: Re, gizmoAxes: De, gizmoGeometry: Ve, onPointerDown: He, onPointerMove: Ue, onPointerUp: $e, onWheel: Be, pickGizmo: qe, pickSceneObject: Le, resetCamera: Ge, setTransformMode: Ne, setViewMode: Ze, viewportCamera: Je, loadCardFile: Xe, loadExecutionPreview: Ye, loadMediaUrl: Qe, loadModelFile: et, loadSelectedReference: tt, onModelLoaded: at, restoreAssets: rt, syncUpstreamInputs: it, configureDomMedia: Jt, refreshSetupDiagnostic: st, addMediaCard: ot, addPrimitive: nt, applyObjectAnimationFrame: lt, beginCameraEdit: ct, beginObjectEdit: dt, commitCameraEdit: mt, commitObjectEdit: ht, copyKeyframe: ut, deleteKeyframe: pt, deleteObject: ft, duplicateObject: gt, exitKeyEdit: yt, finishCameraEdit: bt, goToAdjacentKey: Ct, insertKeyframe: wt, loadSelectedKeyView: vt, pasteKeyframe: St, playblastCameraAtFrame: jt, refreshInspector: kt, refreshKeyEditor: Pt, refreshObjects: Mt, removeObjectResources: Ot, renameObject: Kt, retimeSelectedKey: Ft, selectKeyframe: Tt, selectedKeyframe: xt, selectedObject: Et, selectObjectAnimation: _t, setKeyInterpolation: It, setObjectParent: At, timelineKeyframes: zt, timelineObject: Wt, toggleAutoKey: Rt, toggleObject: Dt, updateCameraFromHud: Vt, updateEditState: Ht, updateKeyVisualState: Ut, updateSelectedKey: $t, updateSelectedObject: Bt, clamp: H, cloneCamera: Xt, configureCore: Yt, defaultCamera: qt, sampleCamera: f, sampleObjectTransform: g, sanitizeState: Lt, worldTransform: Gt } = o;
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
      ue(this);
    },
    stopPlay() {
      he(this);
    },
    computeAudioPeaks() {
      de(this);
    },
    async loadAudioFile(e) {
      return me(this, e);
    },
    applyCameraPreset(e) {
      pe(this, e);
    },
    applyCameraShake(e) {
      fe(this, e);
    },
    applyProxyPreset(e) {
      ge(this, e);
    },
    clearCaches() {
      if (this.checkpoint("Clear caches"), this.objectUrls?.clear(), this.audioSource) {
        try {
          this.audioSource.stop();
        } catch {
        }
        this.audioSource = null;
      }
      if (this.audioContext?.close?.().catch?.(() => {
      }), this.audioContext = null, this.webgl) {
        for (const e of this.webgl.models.values())
          try {
            e.scene && disposeObject(e.scene, !0);
          } catch {
          }
        this.webgl.models.clear(), this.webgl.modelLoads.clear(), this.webgl.sceneKey = "", this.webgl.mediaSignature = "", this.webgl.modelSignature = "", this.webgl.pathKey = "", this.webgl.bgLoadGeneration += 1, this.webgl.bgTextureLoads?.clear();
        for (const e of new Set(this.webgl.bgTextureCache?.values() || []))
          try {
            e.dispose();
          } catch {
          }
        this.webgl.bgTextureCache?.clear(), this.webgl.bgTexture = null, this.webgl.bgImageUrl = "";
      }
      if (this.cameraWebgl) {
        for (const e of this.cameraWebgl.models.values())
          try {
            e.scene && disposeObject(e.scene, !0);
          } catch {
          }
        this.cameraWebgl.models.clear(), this.cameraWebgl.modelLoads.clear(), this.cameraWebgl.sceneKey = "", this.cameraWebgl.mediaSignature = "", this.cameraWebgl.modelSignature = "", this.cameraWebgl.pathKey = "", this.cameraWebgl.bgLoadGeneration += 1, this.cameraWebgl.bgTextureLoads?.clear();
        for (const e of new Set(this.cameraWebgl.bgTextureCache?.values() || []))
          try {
            e.dispose();
          } catch {
          }
        this.cameraWebgl.bgTextureCache?.clear(), this.cameraWebgl.bgTexture = null, this.cameraWebgl.bgImageUrl = "";
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
      this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
        this.serializeScheduled = !1, this.disposed || this.serialize();
      }));
    },
    gizmoAxes(e) {
      return De(this, e);
    },
    gizmoGeometry(e) {
      return Ve(this, e);
    },
    pickGizmo(e) {
      return qe(this, e);
    },
    pickSceneObject(e) {
      return Le(this, e);
    },
    drawTransformGizmo() {
      We(this);
    },
    onPointerDown(e) {
      He(this, e);
    },
    onPointerMove(e) {
      Ue(this, e);
    },
    onPointerUp(e) {
      $e(this, e);
    },
    onWheel(e) {
      Be(this, e);
    },
    timelineFrameFromEvent(e, t) {
      return Ae(this, e, t);
    },
    onTimelinePointerDown(e) {
      Ee(this, e);
    },
    onTimelinePointerMove(e) {
      _e(this, e);
    },
    onTimelinePointerUp(e) {
      Ie(this, e);
    },
    resetTimelineZoom() {
      k(this);
    },
    refreshKeys() {
      A(this);
    },
    drawCurveEditor() {
      x(this);
    },
    toggleCurveHandles() {
      V(this);
    },
    setCurveInterpolation(e) {
      R(this, e);
    },
    setTangentMode(e) {
      D(this, e);
    },
    setChannelFilter(e) {
      W(this, e);
    },
    onCurvePointerDown(e) {
      E(this, e);
    },
    onCurvePointerMove(e) {
      _(this, e);
    },
    onCurvePointerUp(e) {
      I(this, e);
    },
    zoomCurve(e) {
      ze(this, e);
    },
    resetCurveZoom() {
      z(this);
    },
    onKey(e) {
      S(this, e);
    },
    frameTarget() {
      Re(this);
    },
    async loadMediaUrl(e, t) {
      return Qe(this, e, t);
    },
    restoreAssets() {
      rt(this);
    },
    onModelLoaded(e) {
      at(this, e);
    },
    async loadModelFile(e) {
      return et(this, e);
    },
    async loadCardFile(e) {
      return Xe(this, e);
    },
    loadExecutionPreview(e) {
      Ye(this, e);
    },
    loadSelectedReference() {
      tt(this);
    },
    drawLine3D(e, t, a = "#5a5a5a", r = 1) {
      Pe(this, e, t, a, r);
    },
    drawGrid() {
      je(this);
    },
    drawPointField() {
      Ke(this);
    },
    drawCube(e) {
      Se(this, e);
    },
    drawSphere(e) {
      Te(this, e);
    },
    drawHuman(e) {
      ke(this, e);
    },
    drawNull(e) {
      Me(this, e);
    },
    drawCard(e) {
      ve(this, e);
    },
    drawCameraPath() {
      we(this);
    },
    drawSpeedHeatmap() {
      Fe(this);
    },
    drawOverlays() {
      Oe(this);
    },
    async loadViewportBgFile(e) {
      return be(this, e);
    },
    async loadViewportBgSequence(e) {
      return Ce(this, e);
    },
    clearViewportBgImage() {
      ye(this);
    }
  };
}
function Gi(o) {
  const { app: s, api: p, OmniWebGLViewport: n, EditorHistory: C, ContextMenuController: O, initializeTooltips: w, promptText: v, ObjectUrlRegistry: K, buildRoot: F, dispatchDirectorKey: S, activeCameraTrack: j, bindWidgetCallbacks: $, playblastCameraTrack: B, restoreFromWidgets: q, serializeEditorState: L, syncActiveCameraTrack: G, syncFromWidgets: N, bind: Z, activateCamera: J, addCamera: X, deleteCamera: Y, drawPreviewOverlays: T, duplicateCamera: Q, maximizeCameraPreview: ee, refreshCameraPreviews: te, refreshCameraSelectors: ae, renameCamera: re, setPlayblastCamera: ie, toggleCameraView: se, captureRealtime: oe, makePlayblast: ne, uploadDirectorPlayblast: le, waitForMediaFrame: ce, computeAudioPeaks: de, loadAudioFile: me, stopPlay: he, togglePlay: ue, applyCameraPreset: pe, applyCameraShake: fe, applyProxyPreset: ge, clearViewportBgImage: ye, loadViewportBgFile: be, loadViewportBgSequence: Ce, drawCameraPath: we, drawCard: ve, drawCube: Se, drawGrid: je, drawHuman: ke, drawLine3D: Pe, drawNull: Me, drawOverlays: Oe, drawPointField: Ke, drawSpeedHeatmap: Fe, drawSphere: Te, curveChannels: xe, drawCurveEditor: x, onCurvePointerDown: E, onCurvePointerMove: _, onCurvePointerUp: I, onTimelinePointerDown: Ee, onTimelinePointerMove: _e, onTimelinePointerUp: Ie, refreshKeys: A, resetCurveZoom: z, resetTimelineZoom: k, setChannelFilter: W, setCurveInterpolation: R, setTangentMode: D, timelineFrameFromEvent: Ae, toggleCurveHandles: V, zoomCurve: ze, drawTransformGizmo: We, frameTarget: Re, gizmoAxes: De, gizmoGeometry: Ve, onPointerDown: He, onPointerMove: Ue, onPointerUp: $e, onWheel: Be, pickGizmo: qe, pickSceneObject: Le, resetCamera: Ge, setTransformMode: Ne, setViewMode: Ze, viewportCamera: Je, loadCardFile: Xe, loadExecutionPreview: Ye, loadMediaUrl: Qe, loadModelFile: et, loadSelectedReference: tt, onModelLoaded: at, restoreAssets: rt, syncUpstreamInputs: it, configureDomMedia: Jt, refreshSetupDiagnostic: st, addMediaCard: ot, addPrimitive: nt, applyObjectAnimationFrame: lt, beginCameraEdit: ct, beginObjectEdit: dt, commitCameraEdit: mt, commitObjectEdit: ht, copyKeyframe: ut, deleteKeyframe: pt, deleteObject: ft, duplicateObject: gt, exitKeyEdit: yt, finishCameraEdit: bt, goToAdjacentKey: Ct, insertKeyframe: wt, loadSelectedKeyView: vt, pasteKeyframe: St, playblastCameraAtFrame: jt, refreshInspector: kt, refreshKeyEditor: Pt, refreshObjects: Mt, removeObjectResources: Ot, renameObject: Kt, retimeSelectedKey: Ft, selectKeyframe: Tt, selectedKeyframe: xt, selectedObject: Et, selectObjectAnimation: _t, setKeyInterpolation: It, setObjectParent: At, timelineKeyframes: zt, timelineObject: Wt, toggleAutoKey: Rt, toggleObject: Dt, updateCameraFromHud: Vt, updateEditState: Ht, updateKeyVisualState: Ut, updateSelectedKey: $t, updateSelectedObject: Bt, clamp: H, cloneCamera: Xt, configureCore: Yt, defaultCamera: qt, sampleCamera: f, sampleObjectTransform: g, sanitizeState: Lt, worldTransform: Gt } = o;
  return {
    render() {
      const e = this.ctx, t = this.canvas.width, a = this.canvas.height;
      if (e.fillStyle = this.state.viewport_bg_color || "#121212", e.fillRect(0, 0, t, a), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const c = this.frame % this.viewportBgSequenceImages.length, M = this.viewportBgSequenceImages[c];
        if (M?.complete && M.naturalWidth)
          try {
            e.drawImage(M, 0, 0, t, a);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          e.drawImage(this.viewportBgImage, 0, 0, t, a);
        } catch {
        }
      const r = this.state.render_mode, i = this.viewportCamera(), d = this.state.objects.some((c) => c.parent_id) ? this.state.objects.map((c) => c.parent_id ? { ...c, ...Gt(this.state.objects, c) } : c) : this.state.objects, h = (this.viewportBgSequenceImages || []).map((c) => c.src), u = this.viewportBgImage?.src || "", m = {
        ...this.state,
        objects: d,
        viewport_bg_image: u,
        viewport_bg_sequence: h,
        __omnicamRevision: this.renderRevision || 0
      };
      let l = !1;
      if (this.webgl)
        try {
          this.webgl.render(m, i, this.cardMediaById, t, a, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection), e.drawImage(this.webgl.canvas, 0, 0, t, a), l = !0;
        } catch (c) {
          console.error("[OmniCam WebGL Render Error]", c);
        }
      if (!l) {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(r) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(r) && this.drawPointField();
        for (const c of d)
          c.enabled !== !1 && (c.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(r) ? this.drawCard(c) : ["cube", "ground", "glb", "model"].includes(c.type) && r !== "grid" && r !== "point_field" ? this.drawCube(c) : c.type === "sphere" && r !== "grid" && r !== "point_field" ? this.drawSphere(c) : c.type === "human" && r !== "grid" && r !== "point_field" ? this.drawHuman(c) : c.type === "null" && this.drawNull(c));
        this.recording || this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays();
      const y = i.position, P = i.target, b = this.root.querySelector('[data-role="hud"]');
      if (b) {
        const c = this.activeCameraTrack(), M = this.state.view_mode === "camera", Qt = c.target_object_id || this.state.target_object_id, ea = Qt ? this.state.objects.find((U) => U.id === Qt) : null, ba = i.fov * Math.PI / 360, Ca = Math.round(18 / Math.tan(ba));
        b.replaceChildren();
        const sa = document.createElement("div"), ta = document.createElement("span");
        ta.className = `hud-badge ${M ? "active" : ""}`, ta.textContent = M ? `📷 ${c.name}` : `🌐 ${this.state.view_mode.toUpperCase()}`;
        const aa = document.createElement("span");
        aa.style.color = "#aaa", aa.textContent = ` ${r}`, sa.append(ta, aa);
        const oa = document.createElement("div");
        oa.textContent = `F ${this.frame}/${this.state.duration_frames - 1} · ${this.state.fps}fps · FOV ${i.fov.toFixed(1)}° (≈${Ca}mm)`;
        const na = document.createElement("div");
        na.textContent = ea ? `🎯 Track: ${ea.name || ea.type}` : `P: [${y.map((U) => U.toFixed(1)).join(", ")}] · T: [${P.map((U) => U.toFixed(1)).join(", ")}]`, b.append(sa, oa, na);
      }
      this.renderCameraView();
    },
    renderCameraView() {
      if (this.state.camera_view_visible) {
        this.refreshCameraPreviews();
        for (const e of this.state.cameras) {
          const t = this.cameraPreviewCanvases.get(e.id), a = this.cameraPreviewContexts.get(e.id);
          if (!t?.width || !a) continue;
          const r = t.width, i = t.height, d = f(e, this.frame);
          if (a.fillStyle = "#111", a.fillRect(0, 0, r, i), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((u) => u.src), __omnicamRevision: this.renderRevision || 0 }, d, this.cardMediaById, r, i, this.modelUrlsById, this.frame, !0), a.drawImage(this.cameraWebgl.canvas, 0, 0, r, i);
            } catch (u) {
              console.error("[OmniCam Preview Render Error]", u);
            }
          T(this, a, r, i);
          const h = this.root.querySelector(`[data-camera-frame="${e.id}"]`);
          h && (h.textContent = `F${this.frame}`);
        }
      }
    },
    drawPreviewOverlays(e, t, a) {
      T(this, e, t, a);
    },
    maximizeCameraPreview(e) {
      ee(this, e);
    },
    setStatus(e) {
      this.root.querySelector('[data-role="status"]').textContent = e;
    },
    async makePlayblast() {
      return ne(this);
    },
    async waitForMediaFrame() {
      return ce(this);
    },
    async captureRealtimePlayblast() {
      return oe(this);
    },
    async uploadPlayblast(e) {
      return le(this, e);
    },
    async syncUpstreamInputs() {
      return it(this);
    },
    dispose() {
      if (!this.disposed) {
        if (this.disposed = !0, this.backgroundRequestId = (this.backgroundRequestId || 0) + 1, this.upstreamSyncId = (this.upstreamSyncId || 0) + 1, this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), this.audioSource) {
          try {
            this.audioSource.stop();
          } catch {
          }
          this.audioSource = null;
        }
        this.audioContext?.close?.().catch?.(() => {
        }), this.audioContext = null, this.objectUrls.clear(), this.cardMediaById.clear(), this.modelUrlsById.clear(), this.modelInfoById.clear();
      }
    }
  };
}
const Ni = "Majoor.OmniCam.Director", la = "MajoorOmniCamDirector";
pa({ api: Zt });
ua({ api: Zt });
Qa({ api: Zt });
class ya {
  constructor(s) {
    this.app = ia, this.node = s, this.root = ha(), this.root.tabIndex = -1, this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 }), this.disposed = !1, this.renderRevision = 0;
    try {
      this.webgl = new ra(() => this.render(), (n) => this.onModelLoaded(n));
    } catch (n) {
      console.warn("OmniCam WebGL unavailable; using Canvas fallback", n), this.webgl = null;
    }
    try {
      this.cameraWebgl = new ra(() => this.renderCameraView(), () => {
      });
    } catch (n) {
      console.warn("OmniCam Camera View unavailable", n), this.cameraWebgl = null;
    }
    this.stateWidget = s.widgets?.find((n) => n.name === "state_json"), this.recordingWidget = s.widgets?.find((n) => n.name === "recording_path"), this.cardWidget = s.widgets?.find((n) => n.name === "card_asset"), this.widthWidget = s.widgets?.find((n) => n.name === "width"), this.heightWidget = s.widgets?.find((n) => n.name === "height"), this.fpsWidget = s.widgets?.find((n) => n.name === "fps"), this.durationWidget = s.widgets?.find((n) => n.name === "duration_seconds"), this.modeWidget = s.widgets?.find((n) => n.name === "render_mode");
    let p = null;
    try {
      p = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = fa(p), this.frame = 0, this.camera = ga(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.objectUrls = new ma(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.contextMenu = new da(this.root), this.history = new ca({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedKeyFrame: this.selectedKeyFrame }), restore: (n) => this.restoreHistorySnapshot(n) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bind(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic();
  }
}
const Nt = { app: ia, api: Zt, OmniWebGLViewport: ra, EditorHistory: ca, ContextMenuController: da, initializeTooltips: wa, promptText: va, ObjectUrlRegistry: ma, buildRoot: ha, dispatchDirectorKey: Sa, activeCameraTrack: ja, bindWidgetCallbacks: ka, playblastCameraTrack: Pa, restoreFromWidgets: Ma, serializeEditorState: Oa, syncActiveCameraTrack: Ka, syncFromWidgets: Fa, bind: Ta, activateCamera: xa, addCamera: Ea, deleteCamera: _a, drawPreviewOverlays: Ia, duplicateCamera: Aa, maximizeCameraPreview: za, refreshCameraPreviews: Wa, refreshCameraSelectors: Ra, renameCamera: Da, setPlayblastCamera: Va, toggleCameraView: Ha, captureRealtime: Ua, makePlayblast: $a, uploadDirectorPlayblast: Ba, waitForMediaFrame: qa, computeAudioPeaks: La, loadAudioFile: Ga, stopPlay: Na, togglePlay: Za, applyCameraPreset: Ja, applyCameraShake: Xa, applyProxyPreset: Ya, clearViewportBgImage: er, loadViewportBgFile: tr, loadViewportBgSequence: ar, drawCameraPath: rr, drawCard: ir, drawCube: sr, drawGrid: or, drawHuman: nr, drawLine3D: lr, drawNull: cr, drawOverlays: dr, drawPointField: mr, drawSpeedHeatmap: hr, drawSphere: ur, curveChannels: pr, drawCurveEditor: fr, onCurvePointerDown: gr, onCurvePointerMove: yr, onCurvePointerUp: br, onTimelinePointerDown: Cr, onTimelinePointerMove: wr, onTimelinePointerUp: vr, refreshKeys: Sr, resetCurveZoom: jr, resetTimelineZoom: kr, setChannelFilter: Pr, setCurveInterpolation: Mr, setTangentMode: Or, timelineFrameFromEvent: Kr, toggleCurveHandles: Fr, zoomCurve: Tr, drawTransformGizmo: xr, frameTarget: Er, gizmoAxes: _r, gizmoGeometry: Ir, onPointerDown: Ar, onPointerMove: zr, onPointerUp: Wr, onWheel: Rr, pickGizmo: Dr, pickSceneObject: Vr, resetCamera: Hr, setTransformMode: Ur, setViewMode: $r, viewportCamera: Br, loadCardFile: qr, loadExecutionPreview: Lr, loadMediaUrl: Gr, loadModelFile: Nr, loadSelectedReference: Zr, onModelLoaded: Jr, restoreAssets: Xr, syncUpstreamInputs: Yr, configureDomMedia: ua, refreshSetupDiagnostic: Qr, addMediaCard: ei, addPrimitive: ti, applyObjectAnimationFrame: ai, beginCameraEdit: ri, beginObjectEdit: ii, commitCameraEdit: si, commitObjectEdit: oi, copyKeyframe: ni, deleteKeyframe: li, deleteObject: ci, duplicateObject: di, exitKeyEdit: mi, finishCameraEdit: hi, goToAdjacentKey: ui, insertKeyframe: pi, loadSelectedKeyView: fi, pasteKeyframe: gi, playblastCameraAtFrame: yi, refreshInspector: bi, refreshKeyEditor: Ci, refreshObjects: wi, removeObjectResources: vi, renameObject: Si, retimeSelectedKey: ji, selectKeyframe: ki, selectedKeyframe: Pi, selectedObject: Mi, selectObjectAnimation: Oi, setKeyInterpolation: Ki, setObjectParent: Fi, timelineKeyframes: Ti, timelineObject: xi, toggleAutoKey: Ei, toggleObject: _i, updateCameraFromHud: Ii, updateEditState: Ai, updateKeyVisualState: zi, updateSelectedKey: Wi, updateSelectedObject: Ri, clamp: Di, cloneCamera: Vi, configureCore: pa, defaultCamera: Hi, sampleCamera: ga, sampleObjectTransform: Ui, sanitizeState: fa, worldTransform: $i };
Object.assign(
  ya.prototype,
  Bi(Nt),
  qi(Nt),
  Li(Nt),
  Gi(Nt)
);
function Zi(o) {
  if (o.__majoorOmniCam) return;
  const s = new ya(o);
  o.__majoorOmniCam = s, s.hideInternalWidgets();
  const p = () => Math.max(700, s.root.scrollHeight || 0);
  s.domWidget = o.addDOMWidget("majoor_omnicam_viewport", "omnicam", s.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: p,
    getMaxHeight: () => p(),
    afterResize: () => {
      s.scheduleResizeAndRender();
    }
  });
  const n = [760, 780], C = o.size || n;
  o.setSize([Math.max(C[0], n[0]), Math.max(C[1], n[1])]);
  const O = o.onResize;
  o.onResize = function() {
    O?.apply(this, arguments), s.scheduleResizeAndRender();
  };
  const w = o.onConfigure;
  o.onConfigure = function() {
    w?.apply(this, arguments), cancelAnimationFrame(s.restoreFrame), s.restoreFrame = requestAnimationFrame(() => {
      s.disposed || (s.restoreFromWidgets(), s.syncUpstreamInputs());
    });
  };
  const v = o.onAfterGraphConfigured;
  o.onAfterGraphConfigured = function() {
    v?.apply(this, arguments), cancelAnimationFrame(s.restoreFrame), s.restoreFrame = requestAnimationFrame(() => {
      s.disposed || (s.restoreFromWidgets(), s.syncUpstreamInputs());
    });
  };
  const K = o.onConnectionsChange;
  o.onConnectionsChange = function() {
    K?.apply(this, arguments), clearTimeout(s.connectionTimer), s.connectionTimer = setTimeout(() => {
      s.disposed || s.syncUpstreamInputs();
    }, 60);
  };
  const F = o.onRemoved;
  o.onRemoved = function() {
    s.dispose(), F?.apply(this, arguments);
  };
  const S = o.onExecuted;
  o.onExecuted = function(j) {
    S?.apply(this, arguments), s.loadExecutionPreview(j), s.syncUpstreamInputs();
  };
}
ia.registerExtension({
  name: Ni,
  async nodeCreated(o) {
    (o.comfyClass === la || o.constructor?.type === la) && Zi(o);
  }
});
