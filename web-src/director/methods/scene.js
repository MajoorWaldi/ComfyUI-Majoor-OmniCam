// OmniCam Director methods extracted from the UI facade.

import { resetCameraAnimation, resetObjectAnimation } from "../../animation-reset.js";

export function createSceneMethods(dependencies) {
  const { app, api, OmniWebGLViewport, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bind, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
  return {
  setChannelFilter(filter) {
    setChannelFilter(this, filter);
  },
  setFrame(frame, fromPlayback = false, refreshTimeline = true) {
    this.frame = clamp(Math.round(frame), 0, this.state.duration_frames - 1);
    if (this.editingKeyFrame !== this.frame) this.editingKeyFrame = null;
    this.camera = sampleCamera(this.activeCameraTrack(), this.frame, this.state.objects);
    this.applyObjectAnimationFrame();
    for (const el of this.root.querySelectorAll('[data-role="frame"]')) if (document.activeElement !== el) el.value = String(this.frame);
    for (const el of this.root.querySelectorAll('[data-role="scrub"]')) el.value = String(this.frame);
    for (const el of this.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]')) if (document.activeElement !== el) el.value = String(Math.round(this.camera.fov * 100) / 100);
    for (const el of this.root.querySelectorAll('[data-role="roll"], [data-role="camera-roll"]')) if (document.activeElement !== el) el.value = String(Math.round((this.camera.roll || 0) * 100) / 100);
    for (const el of this.root.querySelectorAll('[data-role="camera-type"]')) if (document.activeElement !== el) el.value = this.camera.camera_type || "perspective";
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
  },
  timelineObject() {
    return timelineObject(this);
  },
  timelineKeyframes() {
    return timelineKeyframes(this);
  },
  applyObjectAnimationFrame() {
    applyObjectAnimationFrame(this, sampleObjectTransform);
  },
  insertKeyframe() {
    for (const btn of this.root.querySelectorAll('[data-act="key"]')) {
      btn.classList.remove("key-pulse");
      void btn.offsetWidth;
      btn.classList.add("key-pulse");
    }
    insertKeyframe(this);
  },
  setKeyInterpolation(interpolation) {
    setKeyInterpolation(this, interpolation);
  },
  deleteKeyframe() {
    deleteKeyframe(this);
  },
  copyKeyframe() {
    copyKeyframe(this);
  },
  pasteKeyframe() {
    pasteKeyframe(this);
  },
  resetCamera() {
    resetCamera(this, defaultCamera);
  },
  resetCameraAnimation(id) {
    resetCameraAnimation(this, id);
  },
  resetObjectAnimation(id) {
    resetObjectAnimation(this, id);
  },
  selectedKeyframe() {
    return selectedKeyframe(this);
  },
  selectKeyframe(key) {
    selectKeyframe(this, key);
  },
  beginCameraEdit() {
    return beginCameraEdit(this);
  },
  commitCameraEdit() {
    commitCameraEdit(this);
  },
  finishCameraEdit() {
    finishCameraEdit(this);
  },
  exitKeyEdit(clearSelection = !1) {
    exitKeyEdit(this, clearSelection);
  },
  toggleAutoKey() {
    toggleAutoKey(this);
  },
  updateEditState() {
    updateEditState(this);
  },
  updateKeyVisualState() {
    updateKeyVisualState(this);
  },
  curveChannels() {
    return curveChannels(this);
  },
  drawCurveEditor() {
    drawCurveEditor(this);
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
  setCurveInterpolation(mode) {
    setCurveInterpolation(this, mode);
  },
  setTangentMode(mode) {
    setTangentMode(this, mode);
  },
  toggleCurveHandles() {
    toggleCurveHandles(this);
  },
  onTimelineWheel(event) {
    onTimelineWheel(this, event);
  },
  resetTimelineZoom() {
    resetTimelineZoom(this);
  },
  toggleInspector(forcedState) {
    const el = this.root.querySelector('[data-role="viewport-inspector"]');
    if (!el) return;
    const isCollapsed = forcedState !== undefined ? forcedState : el.dataset.collapsed !== "true";
    el.dataset.collapsed = String(isCollapsed);
    for (const btn of this.root.querySelectorAll('[data-act="toggle-inspector"]')) {
      btn.classList.toggle("active", !isCollapsed);
      btn.setAttribute("aria-pressed", String(!isCollapsed));
    }
    this.setStatus(isCollapsed ? "Inspector hidden (N)" : "Inspector shown");
  },
  refreshKeys() {
    refreshKeys(this);
  },
  refreshKeyEditor() {
    refreshKeyEditor(this);
  },
  retimeSelectedKey(frame, nearest = !1) {
    retimeSelectedKey(this, frame, nearest);
  },
  updateSelectedKey() {
    updateSelectedKey(this);
  },
  updateKeyFromView() {
    updateKeyFromView(this);
  },
  loadSelectedKeyView() {
    loadSelectedKeyView(this);
  },
  goToAdjacentKey(direction) {
    goToAdjacentKey(this, direction);
  },
  addPrimitive(type) {
    addPrimitive(this, type);
  },
  async renameObject(id) {
    return renameObject(this, id);
  },
  duplicateObject(id) {
    duplicateObject(this, id);
  },
  toggleObject(id) {
    toggleObject(this, id);
  },
  showAllObjects() {
    const hidden = this.state.objects.filter((object) => object.enabled === false);
    if (!hidden.length) return;
    this.checkpoint("Show all objects");
    for (const object of hidden) object.enabled = true;
    this.serialize(); this.refreshObjects(); this.render(); this.setStatus("All objects shown");
  },
  selectHierarchy(id = this.selectedObjectId) {
    if (!id) return;
    const ids = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const object of this.state.objects) {
        if (object.parent_id && ids.has(object.parent_id) && !ids.has(object.id)) { ids.add(object.id); changed = true; }
      }
    }
    this.selectedObjectIds = ids; this.selectedObjectId = id; this.selectedEntity = "object";
    this.refreshObjects(); this.refreshInspector(); this.render(); this.setStatus(`Hierarchy selected: ${ids.size} object(s)`);
  },
  async deleteObject(id) {
    return deleteObject(this, id);
  },
  addMediaCard() {
    addMediaCard(this);
  },
  selectedObject() {
    return selectedObject(this);
  },
  playblastCameraAtFrame() {
    return playblastCameraAtFrame(this, sampleCamera);
  },
  viewportCamera() {
    return viewportCamera(this);
  },
  setViewMode(mode) {
    setViewMode(this, mode);
  },
  toggleCameraView() {
    toggleCameraView(this);
  },
  setDensity(density) {
    ["basic", "animation", "advanced"].includes(density) || (density = "advanced"), this.state.ui_density = density, this.root.dataset.density = density, this.root.querySelector('[data-role="ui-density"]').value = density, this.serialize(), requestAnimationFrame(() => {
      this.resizeCanvas(), this.render();
    }), this.setStatus(`Interface: ${density}`);
  },
  lookAtObject(id) {
    const object = this.state.objects.find((item) => item.id === id);
    if (!object) return;
    this.checkpoint("Look-at constraint");
    for (const camera of this.state.cameras)
      for (const key of camera.keyframes) key.camera.target = [...(object.position || [0, 1.5, 0])];
    this.camera = sampleCamera(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${object.name || object.type}`);
  },
  setTransformMode(mode) {
    setTransformMode(this, mode);
  },
  refreshInspector() {
    refreshInspector(this);
  },
  updateSelectedObject() {
    updateSelectedObject(this);
  },
  beginObjectEdit(object) {
    return beginObjectEdit(this, object);
  },
  commitObjectEdit(object) {
    commitObjectEdit(this, object);
  },
  updateCameraFromHud() {
    updateCameraFromHud(this);
  },
  selectObjectAnimation(index) {
    selectObjectAnimation(this, index);
  },
  setObjectParent(parentId) {
    setObjectParent(this, parentId);
  },
  applyProxyPreset(preset) {
    const presets = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, value = presets[preset] || presets.balanced;
    this.state.render_mode = value.mode, this.state.burn_in = value.burn, this.root.querySelector('[data-role="mode"]').value = value.mode, this.root.querySelector('[data-role="burn-in"]').checked = value.burn, this.modeWidget && (this.modeWidget.value = value.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${preset}`);
  },
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
  },
  refreshObjects() {
    refreshObjects(this);
  },
  removeObjectResources(id) {
    removeObjectResources(this, id);
  },
  aimAtSelectedObject(targetId) {
    this.checkpoint("Aim & track subject");
    const cam = this.activeCameraTrack();
    const targetObj = (targetId && this.state.objects.find((o) => o.id === targetId)) || this.selectedObject() || this.state.objects.find((o) => o.id === "subject") || this.state.objects[0];
    if (!targetObj) return;
    cam.target_object_id = targetObj.id;
    if (cam.id === this.state.active_camera_id) {
      this.state.target_object_id = targetObj.id;
    }
    const modelCenter = (targetObj.type === "model" || targetObj.type === "glb") ? this.webgl?.getObjectWorldCenter?.(targetObj.id) : null;
    const targetPos = modelCenter || (targetObj.keyframes?.length
      ? sampleObjectTransform(targetObj, this.frame).position
      : (targetObj.position || [0, 1.5, 0]));
    this.camera.target = [...targetPos];
    this.beginCameraEdit();
    this.commitCameraEdit();
    this.finishCameraEdit();
    this.serialize();
    this.refreshInspector();
    this.updateHudCamera();
    this.render();
    this.setStatus(`Camera tracking locked to ${targetObj.name || targetObj.id}`);
  },
  setCameraTrackingTarget(targetId) {
    this.checkpoint("Change camera tracking target");
    const cam = this.activeCameraTrack();
    cam.target_object_id = targetId || null;
    if (cam.id === this.state.active_camera_id) {
      this.state.target_object_id = targetId || null;
    }
    if (targetId) {
      const targetObj = this.state.objects.find((o) => o.id === targetId);
      if (targetObj) {
        const modelCenter = (targetObj.type === "model" || targetObj.type === "glb") ? this.webgl?.getObjectWorldCenter?.(targetObj.id) : null;
        const targetPos = modelCenter || (targetObj.keyframes?.length
          ? sampleObjectTransform(targetObj, this.frame).position
          : (targetObj.position || [0, 1.5, 0]));
        this.camera.target = [...targetPos];
        this.beginCameraEdit();
        this.commitCameraEdit();
        this.finishCameraEdit();
      }
    }
    this.serialize();
    this.refreshInspector();
    this.render();
    this.setStatus(targetId ? `Camera tracking: ${targetId}` : `Camera tracking disabled (manual target)`);
  },
  bakeAimToKeyframes() {
    this.checkpoint("Bake aim to keyframes");
    const cam = this.activeCameraTrack();
    const targetId = cam.target_object_id || this.state.target_object_id || "subject";
    const targetObj = this.state.objects.find((o) => o.id === targetId) || this.state.objects[0];
    if (!targetObj || !cam.keyframes?.length) return;
    const modelCenter = (targetObj.type === "model" || targetObj.type === "glb") ? this.webgl?.getObjectWorldCenter?.(targetObj.id) : null;
    for (const key of cam.keyframes) {
      const pos = (targetObj.type === "model" || targetObj.type === "glb") && modelCenter && !targetObj.keyframes?.length
        ? modelCenter
        : (targetObj.keyframes?.length
          ? sampleObjectTransform(targetObj, key.frame).position
          : (targetObj.position || [0, 1.5, 0]));
      key.camera.target = [...pos];
    }
    if (cam.id === this.state.active_camera_id) {
      this.state.keyframes = cam.keyframes;
    }
    this.serialize();
    this.refreshKeys();
    this.refreshInspector();
    this.render();
    this.setStatus(`Aim baked across all keyframes following ${targetObj.name || targetObj.id}`);
  }
  };
}



