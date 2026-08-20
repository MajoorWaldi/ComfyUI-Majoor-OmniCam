// OmniCam Director methods extracted from the UI facade.

export function createRenderMethods(dependencies) {
  const { app, api, OmniWebGLViewport, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bind, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
  return {
  render() {
    const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
    c.fillStyle = this.state.viewport_bg_color || "#121212";
    c.fillRect(0, 0, w, h);
    if (this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
      const idx = this.frame % this.viewportBgSequenceImages.length;
      const img = this.viewportBgSequenceImages[idx];
      if (img?.complete && img.naturalWidth) {
        try { c.drawImage(img, 0, 0, w, h); } catch (_) {}
      }
    } else if (this.viewportBgImage) {
      try { c.drawImage(this.viewportBgImage, 0, 0, w, h); } catch (_) {}
    }
    const mode = this.state.render_mode, viewCamera = this.viewportCamera();
    const worldObjects = this.state.objects.some((obj) => obj.parent_id) ? this.state.objects.map((obj) => obj.parent_id ? { ...obj, ...worldTransform(this.state.objects, obj) } : obj) : this.state.objects;
    const renderState = worldObjects === this.state.objects ? this.state : { ...this.state, objects: worldObjects };
    if (this.webgl) {
      try {
        this.webgl.render(renderState, viewCamera, this.cardMediaById, w, h, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection);
        c.drawImage(this.webgl.canvas, 0, 0, w, h);
      } catch (err) {
        console.error("[OmniCam WebGL Render Error]", err);
      }
    } else {
      (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(mode) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(mode) && this.drawPointField();
      for (const obj of worldObjects)
        obj.enabled !== !1 && (obj.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(mode) ? this.drawCard(obj) : ["cube", "ground", "glb", "model"].includes(obj.type) && mode !== "grid" && mode !== "point_field" ? this.drawCube(obj) : obj.type === "sphere" && mode !== "grid" && mode !== "point_field" ? this.drawSphere(obj) : obj.type === "human" && mode !== "grid" && mode !== "point_field" ? this.drawHuman(obj) : obj.type === "null" && this.drawNull(obj));
      this.recording || this.drawCameraPath();
    }
    !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays();
    const p = viewCamera.position, t = viewCamera.target;
    const hud = this.root.querySelector('[data-role="hud"]');
    if (hud) {
      const activeCam = this.activeCameraTrack();
      const isCamView = this.state.view_mode === "camera";
      const trackingObjId = activeCam.target_object_id || this.state.target_object_id;
      const trackingObj = trackingObjId ? this.state.objects.find((o) => o.id === trackingObjId) : null;
      const fovRad = (viewCamera.fov * Math.PI) / 360;
      const fovMm = Math.round(18 / Math.tan(fovRad));
      hud.replaceChildren();
      const heading = document.createElement("div");
      const badge = document.createElement("span");
      badge.className = `hud-badge ${isCamView ? "active" : ""}`;
      badge.textContent = isCamView ? `📷 ${activeCam.name}` : `🌐 ${this.state.view_mode.toUpperCase()}`;
      const modeLabel = document.createElement("span");
      modeLabel.style.color = "#aaa";
      modeLabel.textContent = ` ${mode}`;
      heading.append(badge, modeLabel);
      const lens = document.createElement("div");
      lens.textContent = `F ${this.frame}/${this.state.duration_frames - 1} · ${this.state.fps}fps · FOV ${viewCamera.fov.toFixed(1)}° (≈${fovMm}mm)`;
      const tracking = document.createElement("div");
      tracking.textContent = trackingObj
        ? `🎯 Track: ${trackingObj.name || trackingObj.type}`
        : `P: [${p.map((v) => v.toFixed(1)).join(", ")}] · T: [${t.map((v) => v.toFixed(1)).join(", ")}]`;
      hud.append(heading, lens, tracking);
    }
    this.renderCameraView();
  },
  renderCameraView() {
    if (this.state.camera_view_visible) {
      this.refreshCameraPreviews();
      for (const cameraTrack of this.state.cameras) {
        const canvas = this.cameraPreviewCanvases.get(cameraTrack.id), context = this.cameraPreviewContexts.get(cameraTrack.id);
        if (!canvas?.width || !context) continue;
        const width = canvas.width, height = canvas.height, camera = sampleCamera(cameraTrack, this.frame);
        context.fillStyle = "#111";
        context.fillRect(0, 0, width, height);
        if (this.cameraWebgl) {
          try {
            this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: false }, camera, this.cardMediaById, width, height, this.modelUrlsById, this.frame, true);
            context.drawImage(this.cameraWebgl.canvas, 0, 0, width, height);
          } catch (err) {
            console.error("[OmniCam Preview Render Error]", err);
          }
        }
        drawPreviewOverlays(this, context, width, height);
        const frameLabel = this.root.querySelector(`[data-camera-frame="${cameraTrack.id}"]`);
        frameLabel && (frameLabel.textContent = `F${this.frame}`);
      }
    }
  },
  drawPreviewOverlays(context, width, height) {
    drawPreviewOverlays(this, context, width, height);
  },
  maximizeCameraPreview(id) {
    maximizeCameraPreview(this, id);
  },
  setStatus(text) {
    this.root.querySelector('[data-role="status"]').textContent = text;
  },
  async makePlayblast() {
    return makePlayblast(this);
  },
  async waitForMediaFrame() {
    return waitForMediaFrame(this);
  },
  async captureRealtimePlayblast() {
    return captureRealtime(this);
  },
  async uploadPlayblast(blob) {
    return uploadDirectorPlayblast(this, blob);
  },
  async syncUpstreamInputs() {
    return syncUpstreamInputs(this);
  },
  dispose() {
    this.stopPlay(), clearTimeout(this.previewClickTimer), this.abortController?.abort(), this.resizeObserver?.disconnect(), this.webgl?.dispose(), this.cameraWebgl?.dispose();
    this.objectUrls.clear(), this.cardMediaById.clear(), this.modelUrlsById.clear(), this.modelInfoById.clear();
  }
}
function attachDirector(node) {
  };
}



