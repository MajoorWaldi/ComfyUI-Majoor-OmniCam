// OmniCam Director methods extracted from the UI facade.

export function createInteractionMethods(dependencies) {
  const { app, api, OmniWebGLViewport, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bind, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
  return {
  setTargetAtCursor(event) {
    if (!event) return;
    const rect = this.interactionElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * this.canvas.width) / Math.max(1, rect.width);
    const y = ((event.clientY - rect.top) * this.canvas.height) / Math.max(1, rect.height);
    const point = this.webgl?.intersectScenePoint?.(x, y, this.canvas.width, this.canvas.height);
    if (point) {
      this.beginCameraEdit();
      this.camera.target = [
        Math.round(point[0] * 1000) / 1000,
        Math.round(point[1] * 1000) / 1000,
        Math.round(point[2] * 1000) / 1000,
      ];
      this.commitCameraEdit();
      this.finishCameraEdit();
      this.updateHudCamera();
      this.refreshInspector();
      this.render();
      this.setStatus(`Target set to [${this.camera.target.join(", ")}]`);
    }
  },
  focusCameraTarget() {
    this.frameTarget();
  },
  updateHudCamera() {
    this.refreshInspector();
  },
  togglePlay() {
    togglePlay(this);
  },
  stopPlay() {
    stopPlay(this);
  },
  computeAudioPeaks() {
    computeAudioPeaks(this);
  },
  async loadAudioFile(file) {
    return loadAudioFile(this, file);
  },
  applyCameraPreset(presetName) {
    applyCameraPreset(this, presetName);
  },
  applyCameraShake(shakeType) {
    applyCameraShake(this, shakeType);
  },
  applyProxyPreset(preset) {
    applyProxyPreset(this, preset);
  },
  clearCaches() {
    this.checkpoint("Clear caches");
    // 1. Revoke and clear all registered media blob URLs
    this.objectUrls?.clear();
    // 2. Stop and clear any active WebAudio sound sources
    if (this.audioSource) {
      try { this.audioSource.stop(); } catch (_) {}
      this.audioSource = null;
    }
    // 3. Clear WebGL models, geometries, materials & textures in main viewport
    if (this.webgl) {
      for (const model of this.webgl.models.values()) {
        try { if (model.scene) disposeObject(model.scene, true); } catch (_) {}
      }
      this.webgl.models.clear();
      this.webgl.modelLoads.clear();
      this.webgl.sceneKey = "";
      this.webgl.mediaSignature = "";
      this.webgl.modelSignature = "";
      this.webgl.pathKey = "";
      if (this.webgl.bgTexture) {
        try { this.webgl.bgTexture.dispose(); } catch (_) {}
        this.webgl.bgTexture = null;
      }
      this.webgl.bgImageUrl = "";
    }
    // 4. Clear WebGL models, geometries, materials & textures in preview viewport
    if (this.cameraWebgl) {
      for (const model of this.cameraWebgl.models.values()) {
        try { if (model.scene) disposeObject(model.scene, true); } catch (_) {}
      }
      this.cameraWebgl.models.clear();
      this.cameraWebgl.modelLoads.clear();
      this.cameraWebgl.sceneKey = "";
      this.cameraWebgl.mediaSignature = "";
      this.cameraWebgl.modelSignature = "";
      this.cameraWebgl.pathKey = "";
    }
    // 5. Reset upstream signatures & card media caches
    this.upstreamSignature = "";
    this.cameraPreviewSignature = "";
    this.cardMediaById.clear();
    this.cardMedia = null;
    // 6. Resync assets & upstream inputs cleanly
    this.restoreAssets();
    this.syncUpstreamInputs();
    this.refreshObjects();
    this.refreshKeys();
    this.refreshCameraSelectors();
    this.renderCameraView();
    this.render();
    this.setStatus("Caches cleared & memory freed");
  },
  snapFrame(frame) {
    if (!this.state.snap_enabled || this.state.snap_frames <= 1) return Math.round(frame);
    return Math.round(Math.round(frame) / this.state.snap_frames) * this.state.snap_frames;
  },
  toggleLoop() {
    this.state.loop_playback = !this.state.loop_playback, this.serialize();
    const button = this.root.querySelector('[data-act="loop"]');
    button.classList.toggle("active", this.state.loop_playback), button.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
  },
  setPlaybackRange(edge) {
    const range = this.state.playback_range || [0, this.state.duration_frames - 1];
    if (edge === "start") range[0] = Math.min(this.frame, range[1]);
    else if (edge === "end") range[1] = Math.max(this.frame, range[0]);
    this.state.playback_range = range, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${range[0]}–F${range[1]}`);
  },
  clearPlaybackRange() {
    this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
  },
  toggleTimecode() {
    this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
  },
  toggleSnap() {
    this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
    const button = this.root.querySelector('[data-act="toggle-snap"]');
    button.classList.toggle("active", this.state.snap_enabled), button.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
  },
  scheduleSerialize() {
    this.serializeScheduled || (this.serializeScheduled = !0, requestAnimationFrame(() => {
      this.serializeScheduled = !1, this.serialize();
    }));
  },
  gizmoAxes(object) {
    return gizmoAxes(this, object);
  },
  gizmoGeometry(object) {
    return gizmoGeometry(this, object);
  },
  pickGizmo(pointer) {
    return pickGizmo(this, pointer);
  },
  pickSceneObject(pointer) {
    return pickSceneObject(this, pointer);
  },
  drawTransformGizmo() {
    drawTransformGizmo(this);
  },
  onPointerDown(e) {
    onPointerDown(this, e);
  },
  onPointerMove(e) {
    onPointerMove(this, e);
  },
  onPointerUp(event) {
    onPointerUp(this, event);
  },
  onWheel(e) {
    onWheel(this, e);
  },
  timelineFrameFromEvent(event, box) {
    return timelineFrameFromEvent(this, event, box);
  },
  onTimelinePointerDown(event) {
    onTimelinePointerDown(this, event);
  },
  onTimelinePointerMove(event) {
    onTimelinePointerMove(this, event);
  },
  onTimelinePointerUp(event) {
    onTimelinePointerUp(this, event);
  },
  resetTimelineZoom() {
    resetTimelineZoom(this);
  },
  refreshKeys() {
    refreshKeys(this);
  },
  drawCurveEditor() {
    drawCurveEditor(this);
  },
  toggleCurveHandles() {
    toggleCurveHandles(this);
  },
  setCurveInterpolation(mode) {
    setCurveInterpolation(this, mode);
  },
  setTangentMode(mode) {
    setTangentMode(this, mode);
  },
  setChannelFilter(filter) {
    setChannelFilter(this, filter);
  },
  onCurvePointerDown(event) {
    onCurvePointerDown(this, event);
  },
  onCurvePointerMove(event) {
    onCurvePointerMove(this, event);
  },
  onCurvePointerUp(event) {
    onCurvePointerUp(this, event);
  },
  zoomCurve(factor) {
    zoomCurve(this, factor);
  },
  resetCurveZoom() {
    resetCurveZoom(this);
  },
  onKey(e) {
    dispatchDirectorKey(this, e);
  },
  frameTarget() {
    frameTarget(this);
  },
  async loadMediaUrl(object, url) {
    return loadMediaUrl(this, object, url);
  },
  restoreAssets() {
    restoreAssets(this);
  },
  onModelLoaded(model) {
    onModelLoaded(this, model);
  },
  async loadModelFile(file) {
    return loadModelFile(this, file);
  },
  async loadCardFile(file) {
    return loadCardFile(this, file);
  },
  loadExecutionPreview(message) {
    loadExecutionPreview(this, message);
  },
  loadSelectedReference() {
    loadSelectedReference(this);
  },
  drawLine3D(a, b, color = "#5a5a5a", width = 1) {
    drawLine3D(this, a, b, color, width);
  },
  drawGrid() {
    drawGrid(this);
  },
  drawPointField() {
    drawPointField(this);
  },
  drawCube(obj) {
    drawCube(this, obj);
  },
  drawSphere(obj) {
    drawSphere(this, obj);
  },
  drawHuman(obj) {
    drawHuman(this, obj);
  },
  drawNull(obj) {
    drawNull(this, obj);
  },
  drawCard(obj) {
    drawCard(this, obj);
  },
  drawCameraPath() {
    drawCameraPath(this);
  },
  drawSpeedHeatmap() {
    drawSpeedHeatmap(this);
  },
  drawOverlays() {
    drawOverlays(this);
  },
  async loadViewportBgFile(file) {
    return loadViewportBgFile(this, file);
  },
  async loadViewportBgSequence(files) {
    return loadViewportBgSequence(this, files);
  },
  clearViewportBgImage() {
    clearViewportBgImage(this);
  }
  };
}



