// OmniCam Director methods extracted from the UI facade.

export function createEditorMethods(dependencies) {
  const { app, api, OmniWebGLViewport, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bind, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
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
    this.state = sanitizeState(value.state), this.frame = clamp(value.frame, 0, this.state.duration_frames - 1), this.selectedEntity = value.selectedEntity, this.selectedObjectId = value.selectedObjectId, this.selectedKeyFrame = value.selectedKeyFrame, this.camera = sampleCamera(this.state, this.frame), this.cameraPreviewSignature = "", this.serialize(), this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.render();
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
          return this.openCameraContext(event, hit.camera.id, false);
        }
      }
      return this.openViewportContext(event);
    }
  },
  openViewportContext(event) {
    const object = this.selectedObject();
    this.showContextMenu(event, "Viewport", [
      { label: object ? `Set key · ${object.name || object.type}` : `Set key · ${this.activeCameraTrack().name}`, icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: "Create camera from view", icon: "pi-video", run: () => this.addCamera() },
      { label: "Set camera target here", icon: "pi-crosshairs", help: "Set camera Look-At target to this 3D point in the scene", run: () => this.setTargetAtCursor(event) },
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
  openObjectContext(event, id) {
    const object = this.state.objects.find((item) => item.id === id);
    if (!object) return;
    this.selectedEntity = "object";
    this.selectedObjectId = id;
    this.refreshObjects();
    this.refreshKeys();
    this.refreshInspector();
    this.render();
    this.showContextMenu(event, object.name || object.type, [
      { label: "Set key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: "Rename object…", icon: "pi-pencil", run: () => this.renameObject(id) },
      { label: "Duplicate object", icon: "pi-copy", run: () => this.duplicateObject(id) },
      { label: object.enabled === !1 ? "Show object" : "Hide object", icon: object.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(id) },
      null,
      { label: "Camera tracks this object (Look-At)", icon: "pi-crosshairs", help: "Lock camera live look-at tracking to this moving object", run: () => this.aimAtSelectedObject(id) },
      { label: "Bake tracking to all camera keys", icon: "pi-check-square", help: "Write this object's motion into camera target keyframes", run: () => this.bakeAimToKeyframes() },
      null,
      { label: "Translate", icon: "pi-arrows-alt", shortcut: "W", run: () => this.setTransformMode("translate") },
      { label: "Rotate", icon: "pi-refresh", shortcut: "E", run: () => this.setTransformMode("rotate") },
      { label: "Scale", icon: "pi-expand", shortcut: "R", run: () => this.setTransformMode("scale") },
      null,
      { label: "Delete object", icon: "pi-trash", danger: !0, disabled: id === "subject", help: id === "subject" ? "The canonical subject card cannot be deleted" : "Delete this object and its animation keys", run: () => this.deleteObject(id) }
    ]);
  },
  openCameraContext(event, id, preview = !1) {
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
    const value = await promptText(app, "Shot handles", "Handle frames: in,out", `${handles.in},${handles.out}`);
    if (value === null || value === undefined) return;
    const match = String(value).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
    if (!match) return this.setStatus("Handles must be two integers: in,out");
    this.checkpoint("Shot handles"), camera.handles = { in: Math.min(600, Number(match[1])), out: Math.min(600, Number(match[2])) }, this.serialize(), this.setStatus(`${camera.name} handles: ${camera.handles.in} / ${camera.handles.out}`);
  },
  openTimelineContext(event, onKey) {
    this.showContextMenu(event, onKey ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
      { label: "Fit timeline view (F)", icon: "pi-arrows-alt", shortcut: "F", run: () => resetTimelineZoom(this) },
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
    this.showContextMenu(event, "Curve editor", [
      { label: "Fit all curves (Framing)", icon: "pi-arrows-alt", shortcut: "F", run: () => resetCurveZoom(this) },
      { label: "Set key at playhead", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
      { label: this.showCurveHandles ? "Hide Bézier handles" : "Show Bézier handles", icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
      null,
      ...["bezier", "smooth", "linear", "ease_in", "ease_out", "ease"].map((mode) => ({ label: `Interpolation: ${mode.replaceAll("_", " ")}`, icon: "pi-chart-line", disabled: !this.selectedKeyframe(), run: () => this.setCurveInterpolation(mode) })),
      null,
      ...["auto", "vector", "free", "aligned", "flat"].map((mode) => ({ label: `Tangents: ${mode[0].toUpperCase()}${mode.slice(1)}`, icon: "pi-share-alt", disabled: !this.selectedKeyframe(), run: () => this.setTangentMode(mode) })),
      null,
      { label: "Delete selected key", icon: "pi-trash", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() }
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
      const ch = canvas.clientHeight || 140;
      const previewWidth = Math.max(220, Math.round(cw * dpr));
      const previewHeight = Math.max(140, Math.round(ch * dpr));
      if (canvas.width !== previewWidth || canvas.height !== previewHeight) {
        canvas.width = previewWidth;
        canvas.height = previewHeight;
      }
    }
    this.drawCurveEditor();
  }
  };
}
