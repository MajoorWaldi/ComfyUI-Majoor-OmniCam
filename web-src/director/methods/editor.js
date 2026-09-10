// OmniCam Director methods extracted from the UI facade.

import { applyAimConstraint } from "../../aim-constraint.js";
import { SPATIAL_HANDLE_MODES, spatialHandleMode } from "../../camera-path-curve.js";
import { t } from "../../i18n.js";
import { toggleObjectLock } from "../../scene/object-lock.js";

function handleModeLabel(mode) {
  switch (mode) {
    case "auto": return t("Auto Smooth");
    case "aligned": return t("Aligned");
    case "free": return t("Free");
    case "corner": return t("Corner");
    default: return mode;
  }
}

// Smallest horizontal resolution a camera preview is rendered at.
const MIN_PREVIEW_WIDTH = 220;

// Simplify / Reduce / Clean entries shared by the timeline, curve and path-key
// context menus. Scope follows the active entity; when 2+ keys are selected the
// op is confined to that range (see simplifyActiveKeys).
function keyOpsMenuItems(self, promptTextFn, appRef, timelineObjectFn) {
  const scope = self.selectedEntity === "object" && timelineObjectFn(self) ? "object" : "camera";
  const suffix = (self.selectedKeyFrames?.size || 0) >= 2 ? ` (${t("Selection")})` : "";
  return [
    { label: `${t("Simplify keys")}${suffix}`, icon: "pi-chart-line", help: t("Drop keys that barely change the motion"), run: () => self.simplifyActiveKeys({ mode: "simplify", tolerance: 0.35, scope }) },
    {
      label: `${t("Reduce keys…")}${suffix}`, icon: "pi-minus-circle", help: t("Decimate down to a target key count"),
      run: async () => {
        const answer = await promptTextFn(appRef, t("Reduce keys"), t("Target number of keys"), "8");
        const target = Math.round(Number(answer));
        if (Number.isFinite(target) && target >= 2) self.simplifyActiveKeys({ mode: "reduce", target, scope });
      },
    },
    { label: `${t("Clean keys")}${suffix}`, icon: "pi-filter", help: t("Remove duplicate, too-close and redundant keys"), run: () => self.simplifyActiveKeys({ mode: "clean", scope }) },
  ];
}

function assetSignature(state) {
  return JSON.stringify({
    background: state.viewport_bg_image || "",
    sequence: state.viewport_bg_sequence || [],
    objects: (state.objects || []).map((object) => [object.id, object.type, object.asset || ""]),
  });
}

export function createEditorMethods(dependencies) {
  const { app, api, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bind, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, releaseAudio, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
  return {
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
  bind() {
    bind(this);
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
  closeMenus(except = null) {
    for (const menu of this.root.querySelectorAll(".toolbar-menu")) menu !== except && (menu.open = !1);
    this.hideContextMenu();
  },
  initializeTooltips() {
    initializeTooltips(this.root, this.interactionElement);
  },
  hideContextMenu() {
    this.contextMenu?.hide();
  },
  showContextMenu(event, title, actions) {
    return this.contextMenu.show(event, title, actions);
  },
  onContextMenu(event) {
    // OmniCam owns every context-menu gesture inside its DOM widget. Prevent
    // LiteGraph/ComfyUI from opening a second menu even if no local action is
    // ultimately available for the exact target.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    // Alt+right-drag dollies the camera in Maya profile (onPointerDown's own
    // context-menu swallow uses this exact condition, `!e.altKey`, to let the
    // drag through in the first place). The browser fires `contextmenu` on
    // release regardless, so without this a dolly ended by lifting the right
    // button popped up a menu at the release point -- something real Maya
    // never does; Alt always means navigation, never a menu request.
    if (event.altKey) return;
    // The simple navigation profile binds a right-drag to panning the viewport,
    // so the release must not raise a menu there. Every other context menu
    // (scene tree, timeline, curve editor) is outside .viewport-wrap and stays.
    if (this.state.navigation_profile === "simple" && event.target?.closest?.(".viewport-wrap")) return;
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
      const rect = this.interactionElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) * this.canvas.width) / Math.max(1, rect.width);
      const y = ((event.clientY - rect.top) * this.canvas.height) / Math.max(1, rect.height);
      const hit = this.pickSceneObject([x, y]);
      if (hit) {
        if ((hit.type === "object" || hit.type === "object_keyframe") && hit.object) {
          this.selectedEntity = "object";
          this.selectedObjectId = hit.object.id;
          if (hit.keyframe) {
            this.setFrame(hit.keyframe.frame);
            this.selectedKeyFrame = hit.keyframe.frame;
          } else {
            this.selectedKeyFrame = hit.object.keyframes?.find((key) => key.frame === this.frame)?.frame ?? null;
          }
          this.refreshObjects();
          this.refreshKeys();
          this.refreshInspector();
          this.render();
          return this.openObjectContext(event, hit.object.id);
        }
        if (["camera", "camera_target", "camera_keyframe"].includes(hit.type) && hit.camera) {
          this.selectedEntity = hit.type === "camera_target" ? "camera_target" : "camera";
          this.selectedObjectId = null;
          this.activateCamera(hit.camera.id);
          if (hit.keyframe) {
            this.setFrame(hit.keyframe.frame);
            this.selectedKeyFrame = hit.keyframe.frame;
          }
          this.refreshObjects();
          this.refreshKeys();
          this.refreshInspector();
          this.render();
          if (hit.type === "camera_keyframe" && hit.keyframe) {
            return this.openPathKeyContext(event, hit.camera.id, hit.keyframe.frame);
          }
          return this.openCameraContext(event, hit.camera.id, false);
        }
      }
      return this.openViewportContext(event);
    }
  },
  openViewportContext(event) {
    const object = this.selectedObject();
    this.showContextMenu(event, t("Viewport"), [
      {
        label: object ? `${t("Set key")} · ${object.name || object.type}` : `${t("Set key")} · ${this.activeCameraTrack().name}`,
        icon: "pi-key",
        shortcut: "I",
        run: () => this.insertKeyframe(),
      },
      { label: t("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
      { label: t("Set camera target here"), icon: "pi-bullseye", help: t("Set camera Look-At target to this 3D point in the scene"), run: () => this.setTargetAtCursor(event) },
      null,
      {
        label: t("Add object"),
        icon: "pi-plus-circle",
        items: [
          { label: t("Sphere"), icon: "pi-circle", run: () => this.addPrimitive("sphere") },
          { label: t("Cube"), icon: "pi-stop", run: () => this.addPrimitive("cube") },
          { label: t("Pyramide"), icon: "pi-caret-up", run: () => this.addPrimitive("pyramid") },
          { label: t("Sun light"), icon: "pi-sun", run: () => this.addPrimitive("sun_light") },
          { label: t("Point light"), icon: "pi-bolt", run: () => this.addPrimitive("point_light") },
          { label: t("Spot light"), icon: "pi-forward", run: () => this.addPrimitive("spot_light") },
          { label: t("Camera"), icon: "pi-video", run: () => this.addCamera() },
          null,
          {
            label: t("Assets"),
            icon: "pi-box",
            items: [
              { label: t("Card"), icon: "pi-image", run: () => this.addPrimitive("card") },
              { label: t("Cylinder"), icon: "pi-database", run: () => this.addPrimitive("cylinder") },
              { label: t("Torus"), icon: "pi-circle", run: () => this.addPrimitive("torus") },
              { label: t("Human"), icon: "pi-user", run: () => this.addPrimitive("human") },
              { label: t("Null"), icon: "pi-plus", run: () => this.addPrimitive("null") },
              null,
              { label: t("Import 3D Model (+)"), icon: "pi-upload", run: () => this.root.querySelector('[data-act="load-model"]')?.click() },
            ],
          },
        ],
      },
      {
        label: t("Selection"),
        icon: "pi-check-square",
        items: [
          { label: t("Select all"), icon: "pi-check-square", shortcut: "Ctrl+A", run: () => this.selectAllObjects() },
          { label: t("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() },
          { label: t("Invert selection"), icon: "pi-sync", shortcut: "Ctrl+I", run: () => this.invertSelection() },
          null,
          {
            label: t("Box selection tool"),
            icon: "pi-stop",
            shortcut: "B",
            run: () => {
              this.boxSelectMode = true;
              if (this.interactionElement?.style) this.interactionElement.style.cursor = "crosshair";
              this.setStatus(t("Box select mode (drag over objects in viewport)"));
            },
          },
        ],
      },
      {
        label: t("Camera & Views"),
        icon: "pi-eye",
        items: [
          { label: t("Camera View (Active)"), icon: "pi-video", checked: this.state.view_mode === "camera", run: () => this.setViewMode("camera") },
          { label: t("Perspective View"), icon: "pi-compass", checked: this.state.view_mode === "perspective", run: () => this.setViewMode("perspective") },
          { label: t("Top"), icon: "pi-arrow-up", checked: this.state.view_mode === "top", run: () => this.setViewMode("top") },
          { label: t("Front"), icon: "pi-arrow-circle-up", checked: this.state.view_mode === "front", run: () => this.setViewMode("front") },
          { label: t("Right"), icon: "pi-arrow-right", checked: this.state.view_mode === "right", run: () => this.setViewMode("right") },
          { label: t("ISO"), icon: "pi-box", checked: this.state.view_mode === "iso", run: () => this.setViewMode("iso") },
          null,
          { label: t("Show / hide camera previews"), icon: "pi-images", run: () => this.toggleCameraView() },
        ],
      },
      null,
      {
        label: t("Tools & Playblast"),
        icon: "pi-cog",
        items: [
          { label: t("Record primary preview"), icon: "pi-video", run: () => this.makePlayblast() },
          null,
          { label: t("Clear caches & clean memory"), icon: "pi-trash", danger: true, run: () => this.clearCaches() },
        ],
      },
    ]);
  },
  openObjectContext(event, id) {
    const object = this.state.objects.find((item) => item.id === id);
    if (!object) return;
    this.selectedEntity = "object";
    this.selectedObjectId = id;
    this.refreshObjects();
    this.refreshKeys();
    this.refreshInspector();
    this.render();

    const isLight = ["sun_light", "point_light", "spot_light"].includes(object.type);
    const n = this.selectedObjectIds?.size || 0;

    if (n >= 2 && this.selectedObjectIds.has(id)) {
      this.showContextMenu(event, `${n} ${t("objects selected")}`, [
        { label: t("Duplicate {count} objects").replace("{count}", String(n)), icon: "pi-copy", shortcut: "Shift+D", run: () => this.duplicateSelectedObjects() },
        { label: t("Toggle visibility"), icon: "pi-eye", shortcut: "H", run: () => this.toggleSelectedObjects() },
        { label: t("Toggle lock"), icon: "pi-lock", shortcut: "L", run: () => this.lockSelectedObjects() },
        null,
        {
          label: t("Transform mode"),
          icon: "pi-arrows-alt",
          items: [
            { label: t("Translate"), icon: "pi-arrows-alt", shortcut: "W", checked: (this.state.gizmo_mode || "translate") === "translate", run: () => this.setTransformMode("translate") },
            { label: t("Rotate"), icon: "pi-refresh", shortcut: "E", checked: this.state.gizmo_mode === "rotate", run: () => this.setTransformMode("rotate") },
            { label: t("Scale"), icon: "pi-expand", shortcut: "R", checked: this.state.gizmo_mode === "scale", run: () => this.setTransformMode("scale") },
          ],
        },
        null,
        {
          label: t("Reset entire animation"),
          icon: "pi-replay",
          danger: true,
          run: () => {
            for (const objId of this.selectedObjectIds) this.resetObjectAnimation(objId);
          },
        },
        { label: t("Delete {count} objects").replace("{count}", String(n)), icon: "pi-trash", danger: true, shortcut: "Del", run: () => this.deleteSelectedObjects() },
        null,
        { label: t("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() },
      ]);
      return;
    }

    this.showContextMenu(event, object.name || object.type, [
      { label: t("Set key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: t("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
      { label: t("Rename object…"), icon: "pi-pencil", run: () => this.renameObject(id) },
      { label: t("Duplicate object"), icon: "pi-copy", run: () => this.duplicateObject(id) },
      { label: object.enabled === false ? t("Show object") : t("Hide object"), icon: object.enabled === false ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(id) },
      { label: object.locked ? t("Unlock object") : t("Lock object"), icon: object.locked ? "pi-lock" : "pi-lock-open", run: () => toggleObjectLock(this, object) },
      null,
      {
        label: t("Transform mode"),
        icon: "pi-arrows-alt",
        items: [
          { label: t("Translate"), icon: "pi-arrows-alt", shortcut: "W", checked: (this.state.gizmo_mode || "translate") === "translate", run: () => this.setTransformMode("translate") },
          { label: t("Rotate"), icon: "pi-refresh", shortcut: "E", checked: this.state.gizmo_mode === "rotate", run: () => this.setTransformMode("rotate") },
          { label: t("Scale"), icon: "pi-expand", shortcut: "R", disabled: isLight, checked: this.state.gizmo_mode === "scale", run: () => this.setTransformMode("scale") },
        ],
      },
      {
        label: t("Tracking & Constraints"),
        icon: "pi-bullseye",
        items: [
          { label: t("Camera tracks this object (Look-At)"), icon: "pi-bullseye", help: t("Lock camera live look-at tracking to this moving object"), run: () => this.aimAtSelectedObject(id) },
          { label: t("Bake tracking to all camera keys"), icon: "pi-check-square", help: t("Write this object's motion into camera target keyframes"), run: () => this.bakeAimToKeyframes() },
          null,
          { label: t("Select hierarchy"), icon: "pi-sitemap", shortcut: "Shift+G", help: t("Select this object and all descendants"), run: () => this.selectHierarchy(id) },
        ],
      },
      ...(isLight ? [
        {
          label: t("Light"),
          icon: "pi-sun",
          items: [
            {
              label: t("Shadow"),
              icon: "pi-circle-fill",
              checked: object.cast_shadow !== false,
              run: () => {
                this.checkpoint("Toggle light shadow");
                object.cast_shadow = object.cast_shadow === false;
                this.serialize();
                this.refreshInspector();
                this.render();
              },
            },
          ],
        },
      ] : []),
      null,
      { label: t("Reset entire animation"), icon: "pi-replay", danger: true, help: t("Delete every animation key and return position/rotation to zero"), run: () => this.resetObjectAnimation(id) },
      null,
      { label: t("Delete object"), icon: "pi-trash", danger: true, disabled: id === "subject", help: id === "subject" ? t("The canonical subject card cannot be deleted") : t("Delete this object and its animation keys"), run: () => this.deleteObject(id) },
    ]);
  },
  openCameraContext(event, id, preview = false) {
    const camera = this.state.cameras.find((item) => item.id === id);
    if (!camera) return;
    this.selectedEntity = "camera";
    this.selectedObjectId = null;
    this.activateCamera(id);
    this.refreshObjects();
    this.refreshKeys();
    this.refreshInspector();
    this.render();
    this.showContextMenu(event, `${camera.name}${preview ? " preview" : ""}`, [
      { label: t("Edit this camera"), icon: "pi-video", run: () => this.activateCamera(id) },
      {
        label: t("Select whole path — move / scale / rotate"),
        icon: "pi-arrows-alt",
        disabled: (camera.keyframes || []).length < 1,
        run: () => {
          this.activateCamera(id);
          if (this.selectCameraPath()) this.setStatus(`${camera.name} · ${t("whole path selected — move / scale / rotate")}`);
        },
      },
      { label: t("Set as primary / playblast"), icon: "pi-star", disabled: id === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(id) },
      { label: t("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => { this.activateCamera(id); this.insertKeyframe(); } },
      { label: t("Record this preview"), icon: "pi-circle-fill", run: () => { this.setPlayblastCamera(id); this.makePlayblast(); } },
      { label: this.state.maximized_camera_id === id ? t("Restore preview size") : t("Maximize preview"), icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(id) },
      null,
      {
        label: t("Shot order & handles"),
        icon: "pi-sliders-h",
        items: [
          { label: t("Shot: move earlier"), icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((item) => item.id === id) <= 0, run: () => this.moveShot(id, -1) },
          { label: t("Shot: move later"), icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((item) => item.id === id) >= this.state.cameras.length - 1, run: () => this.moveShot(id, 1) },
          null,
          { label: t("Shot handles…"), icon: "pi-sliders-h", run: () => this.editShotHandles(id) },
        ],
      },
      null,
      { label: t("Rename camera…"), icon: "pi-pencil", run: () => this.renameCamera(id) },
      { label: t("Duplicate camera"), icon: "pi-copy", run: () => this.duplicateCamera(id) },
      { label: t("Create camera from current view"), icon: "pi-plus", run: () => this.addCamera() },
      null,
      { label: t("Reset entire animation"), icon: "pi-replay", danger: true, help: t("Delete every camera key and return to a static zero pose at frame 0"), run: () => this.resetCameraAnimation(id) },
      null,
      { label: t("Delete camera"), icon: "pi-trash", danger: true, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(id) },
    ]);
  },
  openPathKeyContext(event, id, frame) {
    const camera = this.state.cameras.find((item) => item.id === id);
    if (!camera) return;
    this.selectedEntity = "camera";
    this.selectedObjectId = null;
    this.activateCamera(id);
    const key = (camera.keyframes || []).find((item) => item.frame === frame) || null;
    if (key) this.selectKeyframe(key);
    this.refreshObjects();
    this.refreshKeys();
    this.refreshInspector();
    this.render();
    const current = key ? spatialHandleMode(key) : "auto";
    const n = this.selectedKeyFrames?.size || 0;
    this.showContextMenu(event, `Path key F${frame}`, [
      { label: t("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: t("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
      null,
      {
        label: t("Handle Type"),
        icon: "pi-share-alt",
        items: SPATIAL_HANDLE_MODES.map((mode) => ({
          label: handleModeLabel(mode),
          checked: current === mode,
          run: () => this.setSpatialHandleMode(mode),
        })),
      },
      {
        label: t("Keyframe operations"),
        icon: "pi-sliders-v",
        items: keyOpsMenuItems(this, promptText, app, timelineObject),
      },
      null,
      {
        label: n >= 2 ? t("Delete {count} keys").replace("{count}", String(n)) : t("Delete key"),
        icon: "pi-trash",
        danger: true,
        disabled: (camera.keyframes || []).length <= 1,
        run: () => this.deleteSelectedKeyframes(),
      },
    ]);
  },
  moveShot(id, delta) {
    const index = this.state.cameras.findIndex((item) => item.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= this.state.cameras.length) return;
    this.checkpoint("Reorder shot");
    const [camera] = this.state.cameras.splice(index, 1);
    this.state.cameras.splice(target, 0, camera);
    this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${camera.name} → #${target + 1}`);
  },
  async editShotHandles(id) {
    const camera = this.state.cameras.find((item) => item.id === id);
    if (!camera) return;
    const handles = camera.handles || { in: 0, out: 0 };
    const value = await promptText(app, t("Shot handles…"), "Handle frames: in,out", `${handles.in},${handles.out}`);
    if (value === null || value === undefined) return;
    const match = String(value).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
    if (!match) return this.setStatus("Handles must be two integers: in,out");
    this.checkpoint("Shot handles"), camera.handles = { in: Math.min(600, Number(match[1])), out: Math.min(600, Number(match[2])) }, this.serialize(), this.setStatus(`${camera.name} handles: ${camera.handles.in} / ${camera.handles.out}`);
  },
  openTimelineContext(event, onKey) {
    const n = this.selectedKeyFrames?.size || 0;
    const key = this.selectedKeyframe();
    const currentInterp = key?.interpolation || "ease";
    const currentTangent = key ? (spatialHandleMode(key) || "auto") : "auto";
    const interpModes = ["ease", "linear", "bezier", "smooth", "ease_in", "ease_out", "sine", "cubic", "quintic", "expo", "back"];
    const tangentModes = ["auto", "clamped", "vector", "free", "aligned", "flat"];

    this.showContextMenu(event, onKey ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
      { label: t("Fit timeline view (F)"), icon: "pi-arrows-alt", shortcut: "F", run: () => resetTimelineZoom(this) },
      { label: t("Set / replace key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: t("Copy selected key"), icon: "pi-copy", shortcut: "Ctrl+C", disabled: !key, run: () => this.copyKeyframe() },
      { label: t("Paste key at playhead"), icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
      null,
      {
        label: t("Interpolation"),
        icon: "pi-chart-line",
        disabled: !key && n < 2,
        items: interpModes.map((mode) => ({
          label: mode.replaceAll("_", " "),
          checked: currentInterp === mode,
          run: () => this.setSelectedKeysInterpolation(mode),
        })),
      },
      {
        label: t("Tangents"),
        icon: "pi-share-alt",
        disabled: !key && n < 2,
        items: tangentModes.map((mode) => ({
          label: mode[0].toUpperCase() + mode.slice(1),
          checked: currentTangent === mode,
          run: () => this.setSelectedKeysTangentMode(mode),
        })),
      },
      {
        label: t("Markers"),
        icon: "pi-bookmark",
        items: [
          { label: t("Add marker at playhead"), icon: "pi-bookmark", run: () => this.addMarker() },
          { label: t("Remove nearest marker"), icon: "pi-bookmark-fill", danger: true, disabled: !(this.state.markers || []).length, run: () => this.removeNearestMarker() },
        ],
      },
      null,
      { label: t("Previous key"), icon: "pi-fast-backward", shortcut: ",", run: () => this.goToAdjacentKey(-1) },
      { label: t("Next key"), icon: "pi-fast-forward", shortcut: ".", run: () => this.goToAdjacentKey(1) },
      { label: this.state.auto_key ? t("Disable Auto Key") : t("Enable Auto Key"), icon: "pi-circle-fill", checked: Boolean(this.state.auto_key), run: () => this.toggleAutoKey() },
      null,
      {
        label: t("Keyframe operations"),
        icon: "pi-sliders-v",
        items: keyOpsMenuItems(this, promptText, app, timelineObject),
      },
      null,
      {
        label: n >= 2 ? t("Delete {count} keys").replace("{count}", String(n)) : t("Delete selected key"),
        icon: "pi-trash",
        shortcut: "Delete",
        danger: true,
        disabled: n < 2 && !key,
        run: () => this.deleteSelectedKeyframes(),
      },
    ]);
  },
  addMarker() {
    const existing = (this.state.markers || []).find((marker) => marker.frame === this.frame);
    if (existing) return this.setStatus(`Marker already at F${this.frame}`);
    this.checkpoint("Add marker"), this.state.markers = [...(this.state.markers || []), { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((a, b) => a.frame - b.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
  },
  removeNearestMarker() {
    const markers = this.state.markers || [];
    if (!markers.length) return;
    const nearest = markers.reduce((best, marker) => Math.abs(marker.frame - this.frame) < Math.abs(best.frame - this.frame) ? marker : best);
    this.checkpoint("Remove marker"), this.state.markers = markers.filter((marker) => marker !== nearest), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${nearest.frame}`);
  },
  openCurveContext(event) {
    const n = this.selectedKeyFrames?.size || 0;
    const disabled = n < 2 && !this.selectedKeyframe();
    const key = this.selectedKeyframe();
    const currentInterp = key?.interpolation || "ease";
    const currentTangent = key ? (spatialHandleMode(key) || "auto") : "auto";
    const interpModes = ["bezier", "smooth", "linear", "ease_in", "ease_out", "ease", "sine", "cubic", "quintic", "expo", "back"];
    const tangentModes = ["auto", "clamped", "vector", "free", "aligned", "flat"];

    this.showContextMenu(event, t("Curve editor"), [
      { label: t("Fit all curves (Framing)"), icon: "pi-arrows-alt", shortcut: "F", run: () => resetCurveZoom(this) },
      { label: t("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: this.showCurveHandles ? t("Hide Bézier handles") : t("Show Bézier handles"), icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
      null,
      {
        label: t("Interpolation"),
        icon: "pi-chart-line",
        disabled,
        items: interpModes.map((mode) => ({
          label: mode.replaceAll("_", " "),
          checked: currentInterp === mode,
          run: () => this.setSelectedKeysInterpolation(mode),
        })),
      },
      {
        label: t("Tangents"),
        icon: "pi-share-alt",
        disabled,
        items: tangentModes.map((mode) => ({
          label: mode[0].toUpperCase() + mode.slice(1),
          checked: currentTangent === mode,
          run: () => this.setSelectedKeysTangentMode(mode),
        })),
      },
      null,
      {
        label: t("Keyframe operations"),
        icon: "pi-sliders-v",
        items: keyOpsMenuItems(this, promptText, app, timelineObject),
      },
      null,
      { label: n >= 2 ? t("Delete {count} keys").replace("{count}", String(n)) : t("Delete selected key"), icon: "pi-trash", danger: true, disabled, run: () => this.deleteSelectedKeyframes() },
    ]);
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
  refitNode() {
    if (this.disposed) return;
    const node = this.node;
    try {
      if (node && typeof node.computeSize === "function" && typeof node.setSize === "function") {
        const size = node.computeSize();
        if (Array.isArray(size)) node.setSize([node.size?.[0] ?? size[0], size[1]]);
      }
      node?.graph?.setDirtyCanvas?.(true, true);
    } catch (_) {}
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
