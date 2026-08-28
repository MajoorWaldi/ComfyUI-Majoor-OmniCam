// Editor-state serialization and ComfyUI widget synchronization.
// The node widgets stay authoritative on queue; the UI keeps them in sync here.

import { clamp, cloneCamera, sanitizeState, sampleCamera } from "./omnicam-core.js";

export function activeCameraTrack(ui) {
  if (!ui?.state?.cameras?.length) {
    ui.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: cloneCamera(ui?.camera), keyframes: ui?.state?.keyframes || [] }];
  }
  return ui.state.cameras.find((item) => item.id === ui.state.active_camera_id) || ui.state.cameras[0];
}

export function playblastCameraTrack(ui) {
  if (!ui?.state?.cameras?.length) {
    return activeCameraTrack(ui);
  }
  return ui.state.cameras.find((item) => item.id === ui.state.playblast_camera_id) || activeCameraTrack(ui);
}

export function syncActiveCameraTrack(ui) {
  const active = activeCameraTrack(ui);
  if (active) {
    active.camera = cloneCamera(ui.camera);
    active.keyframes = ui.state.keyframes;
    ui.state.camera = cloneCamera(ui.camera);
  }
}

export function serializeEditorState(ui) {
  if (ui.disposed) return;
  ui.renderRevision = (ui.renderRevision || 0) + 1;
  syncActiveCameraTrack(ui);
  const playblastCamera = playblastCameraTrack(ui);
  if (ui.recordingWidget) {
    const hasPerCameraRecording = ui.state.cameras.some((camera) => Boolean(camera.recording_path));
    if (!hasPerCameraRecording && !playblastCamera.recording_path && ui.recordingWidget.value) {
      playblastCamera.recording_path = String(ui.recordingWidget.value);
    }
    ui.recordingWidget.value = playblastCamera.recording_path || "";
  }
  ui.state.metadata = { ...ui.state.metadata, playblast_camera_id: playblastCamera.id, playblast_camera_name: playblastCamera.name };
  const payload = { ...ui.state, camera: cloneCamera(playblastCamera.camera), keyframes: playblastCamera.keyframes };
  if (ui.stateWidget) ui.stateWidget.value = JSON.stringify(payload);
  if (ui.widthWidget) ui.widthWidget.value = ui.state.width;
  if (ui.heightWidget) ui.heightWidget.value = ui.state.height;
  if (ui.fpsWidget) ui.fpsWidget.value = ui.state.fps;
  if (ui.durationWidget) ui.durationWidget.value = ui.state.duration_frames / ui.state.fps;
  if (ui.modeWidget) ui.modeWidget.value = ui.state.render_mode;
  if (ui.cardWidget) ui.cardWidget.value = ui.state.card_asset || "";
  ui.node.graph?.setDirtyCanvas?.(true, true);
}

export function bindWidgetCallbacks(ui) {
  for (const widget of [ui.widthWidget, ui.heightWidget, ui.fpsWidget, ui.durationWidget, ui.modeWidget]) {
    if (!widget || widget.__omnicamCallback) continue;
    const original = widget.callback;
    widget.callback = (...args) => {
      const result = original?.apply(widget, args);
      ui.syncFromWidgets();
      return result;
    };
    widget.__omnicamCallback = true;
  }
}

export function syncFromWidgets(ui, persist = true) {
  const previousDuration = ui.state.duration_frames;
  const previousFps = ui.state.fps;
  ui.state.width = Number(ui.widthWidget?.value || ui.state.width);
  ui.state.height = Number(ui.heightWidget?.value || ui.state.height);
  ui.state.fps = Number(ui.fpsWidget?.value || ui.state.fps);
  ui.state.duration_frames = Math.max(1, Math.round(Number(ui.durationWidget?.value || 5) * ui.state.fps));
  for (const camera of ui.state.cameras) {
    for (const key of camera.keyframes) key.frame = clamp(Math.round(key.frame), 0, ui.state.duration_frames - 1);
    camera.keyframes = [...new Map(camera.keyframes.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
  }
  ui.state.keyframes = activeCameraTrack(ui).keyframes;
  for (const object of ui.state.objects)
    object.keyframes = [...new Map((object.keyframes || []).map((key) => [clamp(Math.round(key.frame), 0, ui.state.duration_frames - 1), { ...key, frame: clamp(Math.round(key.frame), 0, ui.state.duration_frames - 1) }])).values()].sort((a, b) => a.frame - b.frame);
  if (!ui.timelineKeyframes().some((key) => key.frame === ui.selectedKeyFrame)) ui.selectedKeyFrame = ui.timelineKeyframes()[0]?.frame ?? null;
  ui.state.render_mode = ui.modeWidget?.value || ui.state.render_mode;
  const q = (sel) => ui.root.querySelector(sel);
  for (const el of ui.root.querySelectorAll('[data-role="mode"]')) el.value = ui.state.render_mode;
  for (const el of ui.root.querySelectorAll('[data-role="guides"]')) el.checked = ui.state.guides !== false;
  for (const el of ui.root.querySelectorAll('[data-role="playblast-grid"]')) el.checked = Boolean(ui.state.playblast_grid);
  for (const el of ui.root.querySelectorAll('[data-role="show-wireframe"]')) el.checked = Boolean(ui.state.show_wireframe);
  for (const el of ui.root.querySelectorAll('[data-role="show-vertices"]')) el.checked = Boolean(ui.state.show_vertices);
  for (const el of ui.root.querySelectorAll('[data-role="select-mode"]')) el.value = ui.state.select_mode || "object";
  for (const el of ui.root.querySelectorAll('[data-role="burn-in"]')) el.checked = Boolean(ui.state.burn_in);
  for (const el of ui.root.querySelectorAll('[data-role="speed-heatmap"]')) el.checked = Boolean(ui.state.speed_heatmap);
  for (const el of ui.root.querySelectorAll('[data-role="point-density"]')) el.value = ui.state.point_density || "balanced";
  for (const el of ui.root.querySelectorAll('[data-role="point-color"]')) el.value = ui.state.point_color || "#cbd5e1";
  for (const el of ui.root.querySelectorAll('[data-role="point-spread"]')) el.value = ui.state.point_spread || "all_views";
  for (const el of ui.root.querySelectorAll('[data-role="card-fit"]')) el.value = ui.state.card_fit || "contain";
  for (const el of ui.root.querySelectorAll('[data-role="preview-layout"]')) el.value = ui.state.preview_layout || "auto";
  for (const el of ui.root.querySelectorAll('[data-role="safe-areas"]')) el.checked = Boolean(ui.state.safe_areas);
  for (const el of ui.root.querySelectorAll('[data-role="resolution-gate"]')) el.checked = Boolean(ui.state.resolution_gate);
  for (const el of ui.root.querySelectorAll('[data-role="aspect-ratio"]')) el.value = ui.state.aspect_ratio || "auto";
  for (const el of ui.root.querySelectorAll('[data-role="viewport-bg-color"]')) el.value = ui.state.viewport_bg_color || "#121212";
  for (const el of ui.root.querySelectorAll('[data-role="gizmo-space"]')) el.value = ui.state.gizmo_space || "world";
  for (const el of ui.root.querySelectorAll('[data-role="navigation-profile"]')) el.value = ui.state.navigation_profile || "maya";
  for (const el of ui.root.querySelectorAll('[data-role="spatial-snap-mode"]')) el.value = ui.state.spatial_snap_mode || "none";
  for (const el of ui.root.querySelectorAll('[data-role="spatial-grid-size"]')) el.value = String(ui.state.spatial_grid_size || 0.5);
  for (const el of ui.root.querySelectorAll('[data-role="view-mode"]')) el.value = ui.state.view_mode || "camera";
  for (const el of ui.root.querySelectorAll('[data-role="ui-density"]')) el.value = ui.state.ui_density || "advanced";
  ui.root.dataset.density = ui.state.ui_density || "advanced";
  for (const el of ui.root.querySelectorAll('[data-role="camera-view-row"]')) el.hidden = !ui.state.camera_view_visible;
  for (const tcv of ui.root.querySelectorAll('[data-act="toggle-camera-view"]')) {
    tcv.classList.toggle("active", ui.state.camera_view_visible);
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-type"]')) el.value = ui.camera.camera_type || "perspective";
  for (const el of ui.root.querySelectorAll('[data-role="speed"]')) el.value = String(ui.cameraSpeed || 1);
  for (const btn of ui.root.querySelectorAll('[data-act="loop"]')) {
    btn.classList.toggle("active", Boolean(ui.state.loop_playback));
    btn.setAttribute("aria-pressed", String(Boolean(ui.state.loop_playback)));
  }
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-snap"]')) {
    btn.classList.toggle("active", ui.state.snap_enabled !== false);
    btn.setAttribute("aria-pressed", String(ui.state.snap_enabled !== false));
  }
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-timecode"]')) {
    btn.classList.toggle("active", ui.state.timecode_mode === "timecode");
    btn.setAttribute("aria-pressed", String(ui.state.timecode_mode === "timecode"));
  }
  for (const el of ui.root.querySelectorAll('[data-role="show-radar"]')) el.checked = Boolean(ui.state.show_radar);
  for (const el of ui.root.querySelectorAll('[data-role="encoder"]')) el.value = ui.state.encoder || "auto";
  for (const el of ui.root.querySelectorAll('[data-role="proxy-preset"]')) el.value = ui.state.proxy_preset || "balanced";
  for (const el of ui.root.querySelectorAll('[data-role="snap-frames"]')) el.value = String(ui.state.snap_frames || 1);
  for (const btn of ui.root.querySelectorAll('[data-act="auto-key"]')) {
    btn.classList.toggle("active", Boolean(ui.state.auto_key));
    btn.setAttribute("aria-pressed", String(Boolean(ui.state.auto_key)));
  }
  for (const btn of ui.root.querySelectorAll('[data-select-mode]')) {
    const isMode = btn.dataset.selectMode === (ui.state.select_mode || "object");
    btn.classList.toggle("active", isMode);
    btn.setAttribute("aria-pressed", String(isMode));
  }
  for (const btn of ui.root.querySelectorAll('[data-transform-mode]')) {
    const isMode = btn.dataset.transformMode === (ui.state.gizmo_mode || "translate");
    btn.classList.toggle("active", isMode);
    btn.setAttribute("aria-pressed", String(isMode));
  }
  const inspector = ui.root.querySelector('[data-role="viewport-inspector"]');
  const isInspectorOpen = inspector && inspector.dataset.collapsed !== "true";
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-inspector"]')) {
    btn.classList.toggle("active", Boolean(isInspectorOpen));
    btn.setAttribute("aria-pressed", String(Boolean(isInspectorOpen)));
  }
  ui.refreshCameraSelectors();
  const scrub = q('[data-role="scrub"]');
  if (scrub) scrub.max = String(ui.state.duration_frames - 1);
  const frameEl = q('[data-role="frame"]');
  if (frameEl) frameEl.max = String(ui.state.duration_frames - 1);
  const keyFrameEl = q('[data-role="key-frame"]');
  if (keyFrameEl) keyFrameEl.max = String(ui.state.duration_frames - 1);
  const durationSecEl = q('[data-role="duration-seconds"]');
  if (durationSecEl) durationSecEl.value = String(ui.state.duration_frames / ui.state.fps);
  const timelineFpsEl = q('[data-role="timeline-fps"]');
  if (timelineFpsEl) timelineFpsEl.value = String(ui.state.fps);
  ui.frame = clamp(ui.frame, 0, ui.state.duration_frames - 1);
  if (persist) ui.serialize();
  if (previousDuration !== ui.state.duration_frames || previousFps !== ui.state.fps) {
    ui.computeAudioPeaks?.();
    ui.setFrame(ui.frame, false, true);
    ui.setStatus(`Timeline: ${ui.state.duration_frames} frames · ${(ui.state.duration_frames / ui.state.fps).toFixed(2)} s`);
  }
}

export function restoreFromWidgets(ui) {
  let parsed = null;
  try {
    parsed = JSON.parse(ui.stateWidget?.value || "{}");
  } catch {
    // Keep the current state when the stored payload is unreadable.
  }
  const previousIds = new Set(ui.state.objects.map((object) => object.id));
  ui.state = sanitizeState(parsed);
  const nextIds = new Set(ui.state.objects.map((object) => object.id));
  for (const id of previousIds) if (!nextIds.has(id)) ui.removeObjectResources(id);
  if (!ui.timelineKeyframes().some((key) => key.frame === ui.selectedKeyFrame)) ui.selectedKeyFrame = ui.timelineKeyframes()[0]?.frame ?? null;
  ui.camera = sampleCamera(ui.state, Math.min(ui.frame, ui.state.duration_frames - 1));
  ui.syncFromWidgets(false);
  ui.root.querySelector('[data-role="gizmo-space"]').value = ui.state.gizmo_space;
  ui.restoreAssets();
  ui.refreshKeys();
  ui.refreshObjects();
  ui.render();
  ui.history?.clear();
}
