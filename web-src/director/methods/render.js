// OmniCam Director methods extracted from the UI facade.

import { applyAimConstraint } from "../../aim-constraint.js";
import { drawAxisGizmo } from "../../axis-gizmo-view.js";
import { unregisterDirector } from "../../settings.js";
import { closeHelpPopup } from "../../help/schema.js";
import { drawMotionOverlay } from "../../motion-tracks/overlay.js";
import { renderMotionPanel } from "../../motion-tracks/panel.js";
import { renderMotionPreview } from "../../motion-tracks/preview.js";
import { renderMotionTimeline } from "../../motion-tracks/timeline.js";
import { releaseAllCardMedia } from "../../dom-media.js";
import { closeOwnedModals } from "../ui-services.js";
import { drawCameraPathStrokeOverlay } from "../camera-path-draw.js";
import { UI_DIRTY, mergeDirty, hasDirty } from "../ui-dirty.js";
export function createRenderMethods(dependencies) {
  const { app, api, EditorHistory, ContextMenuController, initializeTooltips, promptText, ObjectUrlRegistry, buildRoot, dispatchDirectorKey, activeCameraTrack, bindWidgetCallbacks, playblastCameraTrack, restoreFromWidgets, serializeEditorState, syncActiveCameraTrack, syncFromWidgets, bindEditorEvents, activateCamera, addCamera, deleteCamera, drawPreviewOverlays, duplicateCamera, maximizeCameraPreview, refreshCameraPreviews, refreshCameraSelectors, renameCamera, setPlayblastCamera, toggleCameraView, captureRealtime, makePlayblast, uploadDirectorPlayblast, waitForMediaFrame, computeAudioPeaks, loadAudioFile, releaseAudio, stopPlay, togglePlay, applyCameraPreset, applyCameraShake, applyProxyPreset, clearViewportBgImage, loadViewportBgFile, loadViewportBgSequence, drawCameraPath, drawCard, drawCube, drawCylinder, drawGrid, drawHuman, drawLine3D, drawNull, drawOverlays, drawPointField, drawSpeedHeatmap, drawSphere, drawTorus, curveChannels, drawCurveEditor, onCurvePointerDown, onCurvePointerMove, onCurvePointerUp, onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp, refreshKeys, resetCurveZoom, resetTimelineZoom, setChannelFilter, setCurveInterpolation, setTangentMode, timelineFrameFromEvent, toggleCurveHandles, zoomCurve, drawTransformGizmo, frameTarget, gizmoAxes, gizmoGeometry, onPointerDown, onPointerMove, onPointerUp, onWheel, pickGizmo, pickSceneObject, resetCamera, setTransformMode, setViewMode, viewportCamera, loadCardFile, loadExecutionPreview, loadMediaUrl, loadModelFile, loadSelectedReference, onModelLoaded, restoreAssets, syncUpstreamInputs, configureDomMedia, refreshSetupDiagnostic, addMediaCard, addPrimitive, applyObjectAnimationFrame, beginCameraEdit, beginObjectEdit, commitCameraEdit, commitObjectEdit, copyKeyframe, deleteKeyframe, deleteObject, duplicateObject, exitKeyEdit, finishCameraEdit, goToAdjacentKey, insertKeyframe, loadSelectedKeyView, pasteKeyframe, playblastCameraAtFrame, refreshInspector, refreshKeyEditor, refreshObjects, removeObjectResources, renameObject, retimeSelectedKey, selectKeyframe, selectedKeyframe, selectedObject, selectObjectAnimation, setKeyInterpolation, setObjectParent, timelineKeyframes, timelineObject, toggleAutoKey, toggleObject, updateCameraFromHud, updateEditState, updateKeyVisualState, updateSelectedKey, updateSelectedObject, clamp, cloneCamera, configureCore, defaultCamera, sampleCamera, sampleObjectTransform, sanitizeState, worldTransform } = dependencies;
  return {
  // Immediate, full repaint -- the compatibility path every discrete one-shot
  // action still uses. High-frequency sources go through requestUiUpdate()
  // instead so a burst of events between animation frames only touches the
  // domains that actually changed.
  render() {
    this.renderViewportOnly();
    this.renderMotionUiOnly();
    this.renderCameraView();
  },
  // The three Motion-workspace paints, split out so a viewport-only
  // invalidation (an orbit, a wheel) does not re-run them.
  renderMotionUiOnly() {
    renderMotionPanel(this);
    renderMotionPreview(this);
    renderMotionTimeline(this);
  },
  // The main viewport canvas: WebGL (or the 2D fallback), the overlays and the
  // DOM axis gizmo. No motion panels, no camera preview strip.
  renderViewportOnly() {
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
    const backgroundSequence = (this.viewportBgSequenceImages || []).map((image) => image.src);
    const backgroundImage = this.viewportBgImage?.src || "";
    // A pending Extractor import is drawn but never adopted: it rides along as
    // an extra, gray entry in the *render-time* camera list only, so it gets
    // the same 3D path/gizmo the WebGL viewport already draws for every real
    // camera -- without ever touching this.state.cameras, the camera preview
    // strip, or anything serialized. Committing (or dismissing) makes it
    // disappear from here by clearing this.pendingExtractorImport.
    const pending = this.pendingExtractorImport;
    const renderCameras = pending
      ? [...this.state.cameras, {
          id: "__extractor_preview__",
          name: pending.label,
          color: "#9ca3af",
          camera: pending.track.keyframes[0]?.camera,
          keyframes: pending.track.keyframes,
        }]
      : this.state.cameras;
    const renderState = {
      ...this.state,
      cameras: renderCameras,
      objects: worldObjects,
      viewport_bg_image: backgroundImage,
      viewport_bg_sequence: backgroundSequence,
      __selectedObjectIds: [...(this.selectedObjectIds || [])],
      __omnicamRevision: `${this.renderRevision || 0}:${pending?.fingerprint || ""}`,
    };
    let webglRendered = false;
    if (this.webgl) {
      try {
        // Supersample: render the 3D viewport larger than the backing store and
        // let the blit scale it down. This is the antialiasing that separates a
        // crisp studio look from a soft one; it is off during a capture (which
        // needs exact pixels) and clamped so a huge panel never asks the GPU
        // for more than ~4K on its long edge.
        const factor = this.recording ? 1 : (this.webgl.supersampleFactor?.() ?? 1);
        const scale = factor > 1 ? Math.min(factor, 4096 / Math.max(1, w, h)) : 1;
        const rw = scale > 1 ? Math.round(w * scale) : w;
        const rh = scale > 1 ? Math.round(h * scale) : h;
        this.webgl.render(renderState, viewCamera, this.cardMediaById, rw, rh, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection, this.selectedKeyFrame ?? null);
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = "high";
        if (rw !== w || rh !== h) c.drawImage(this.webgl.canvas, 0, 0, rw, rh, 0, 0, w, h);
        else c.drawImage(this.webgl.canvas, 0, 0, w, h);
        webglRendered = true;
      } catch (err) {
        console.error("[OmniCam WebGL Render Error]", err);
      }
    }
    if (!webglRendered) {
      (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(mode) || this.recording && this.state.playblast_grid) && this.drawGrid();
      ["omni_ref", "point_field"].includes(mode) && this.drawPointField();
      for (const obj of worldObjects) {
        if (obj.enabled === false) continue;
        if (obj.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(mode)) this.drawCard(obj);
        else if (["cube", "ground", "glb", "model"].includes(obj.type) && mode !== "grid" && mode !== "point_field") this.drawCube(obj);
        else if (obj.type === "sphere" && mode !== "grid" && mode !== "point_field") this.drawSphere(obj);
        else if (obj.type === "cylinder" && mode !== "grid" && mode !== "point_field") this.drawCylinder(obj);
        else if (obj.type === "torus" && mode !== "grid" && mode !== "point_field") this.drawTorus(obj);
        else if (obj.type === "human" && mode !== "grid" && mode !== "point_field") this.drawHuman(obj);
        else if (obj.type === "null") this.drawNull(obj);
      }
      if (!this.recording && this.state.show_camera_paths) this.drawCameraPath();
    }
    !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap();
    !this.recording && drawCameraPathStrokeOverlay(this);
    this.drawOverlays();
    drawMotionOverlay(this);
    // The gizmo is DOM, so it repaints with the view and never reaches the
    // canvas the playblast records.
    if (this.state.show_gizmo) drawAxisGizmo(this);
    // Viewport Labels are DOM too, for the same reason -- and the overlay hides
    // itself while this.recording is set (design spec section 14).
    this.labelOverlay?.update();
    // Character rig joint dots (only while Pose editing is on).
    this.rigOverlay?.update();
    this.perf && (this.perf.viewportRenderCount = (this.perf.viewportRenderCount || 0) + 1);
  },
  // The single "something changed, repaint soon" entry point. Every
  // high-frequency source (playback tick, viewport drags, wheel/keyboard
  // navigation) funnels through here so at most one render() runs per frame
  // no matter how many events landed between paints. Discrete one-shot
  // actions can still call render() directly for an immediate repaint.
  requestRender(reason = "unknown") {
    // Back-compat alias: a bare "repaint soon" is the viewport, its preview
    // strip and the motion panels -- exactly what render() ran from here.
    return this.requestUiUpdate(UI_DIRTY.viewport | UI_DIRTY.previews | UI_DIRTY.motion, reason);
  },
  // Targeted invalidation on top of the existing one-RAF coalescing. Each
  // caller marks only the domains it changed; the animation-frame callback
  // repaints just those, once, however many calls landed between frames.
  requestUiUpdate(mask = UI_DIRTY.viewport, reason = "unknown") {
    (this.renderReasons ||= new Set()).add(reason);
    this.uiDirtyMask = mergeDirty(this.uiDirtyMask, mask);
    this.renderInvalidations = (this.renderInvalidations || 0) + 1;
    if (this.renderScheduled) return;
    this.renderScheduled = true;
    this.renderFrame = requestAnimationFrame(() => {
      this.renderScheduled = false;
      if (this.disposed) return;
      const dirty = this.uiDirtyMask || UI_DIRTY.viewport;
      this.uiDirtyMask = 0;
      this.lastRenderReasons = [...(this.renderReasons || [])];
      this.renderReasons?.clear();
      this.rendersCoalesced = (this.rendersCoalesced || 0) + 1;
      if (this.perf) this.perf.renderCount = (this.perf.renderCount || 0) + 1;
      if (hasDirty(dirty, UI_DIRTY.outliner)) this.refreshObjects();
      if (hasDirty(dirty, UI_DIRTY.timeline)) this.refreshKeys();
      if (hasDirty(dirty, UI_DIRTY.inspector)) this.refreshInspector();
      if (hasDirty(dirty, UI_DIRTY.viewport)) this.renderViewportOnly();
      if (hasDirty(dirty, UI_DIRTY.previews)) this.renderCameraView();
      if (hasDirty(dirty, UI_DIRTY.motion)) this.renderMotionUiOnly();
    });
  },
  renderCameraView() {
    this.perf && (this.perf.previewRenderCount = (this.perf.previewRenderCount || 0) + 1);
    if (this.state.camera_view_visible) {
      // The strip can be present in state but visually collapsed / off-screen
      // (data-role="camera-view-row" is toggled hidden by syncFromWidgets).
      // A hidden strip has nothing to show, so skip every preview render.
      const row = this.root.querySelector('[data-role="camera-view-row"]');
      if (row?.hidden) return;
      this.refreshCameraPreviews();
      // Rendering N off-screen previews at full playback cadence turns one
      // frame into N+1 WebGL scene renders. During playback (and a live
      // recording) the camera the playhead actually drives repaints every
      // frame; the rest share one slot per frame, round-robin, so a
      // five-camera shot costs 2 scene renders per frame instead of 6. Every
      // other path (a single scrub, an edit) still repaints all previews.
      this.cameraPreviewTick = (this.cameraPreviewTick || 0) + 1;
      const cameras = this.state.cameras;
      const throttle = Boolean(this.playing) && !this.recording && cameras.length > 2;
      let rotating = null;
      if (throttle) {
        const priorityId = this.state.active_camera_id;
        const secondary = cameras.filter((track) => track.id !== priorityId);
        rotating = secondary.length ? secondary[this.cameraPreviewTick % secondary.length] : null;
      }
      for (const cameraTrack of cameras) {
        const canvas = this.cameraPreviewCanvases.get(cameraTrack.id), context = this.cameraPreviewContexts.get(cameraTrack.id);
        if (!canvas?.width || !context) continue;
        const width = canvas.width, height = canvas.height;
        // The frame readout is cheap and must stay honest for every tile even
        // when its WebGL render is skipped this frame.
        const frameLabel = this.root.querySelector(`[data-camera-frame="${cameraTrack.id}"]`);
        frameLabel && (frameLabel.textContent = `F${this.frame}`);
        if (throttle && cameraTrack.id !== this.state.active_camera_id && cameraTrack !== rotating) continue;
        const camera = applyAimConstraint(this, cameraTrack, sampleCamera(cameraTrack, this.frame, this.state.objects), this.frame);
        context.fillStyle = "#111";
        context.fillRect(0, 0, width, height);
        if (this.cameraWebgl) {
          try {
            this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: false, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((image) => image.src), __omnicamRevision: this.renderRevision || 0 }, camera, this.cardMediaById, width, height, this.modelUrlsById, this.frame, true);
            context.drawImage(this.cameraWebgl.canvas, 0, 0, width, height);
          } catch (err) {
            console.error("[OmniCam Preview Render Error]", err);
          }
        }
        drawPreviewOverlays(this, context, width, height);
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
    (this.dom?.status || this.root.querySelector('[data-role="status"]')).textContent = text;
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
    if (this.disposed) return;
    this.disposed = true;
    unregisterDirector(this);
    // The help popup is appended to document.body with its own capture keydown
    // listener; nothing else tears it down when the node (or the whole graph)
    // goes away with it still open.
    closeHelpPopup();
    closeOwnedModals(this);
    this.backgroundRequestId = (this.backgroundRequestId || 0) + 1;
    this.upstreamSyncId = (this.upstreamSyncId || 0) + 1;
    this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), cancelAnimationFrame(this.renderFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose();
    releaseAudio(this);
    releaseAllCardMedia(this);
    this.objectUrls.clear(), this.cardMediaById.clear(), this.cardMediaAssetById?.clear?.(), this.modelUrlsById.clear(), this.modelInfoById.clear();
  }
}
function attachDirector(node) {
  };
}



