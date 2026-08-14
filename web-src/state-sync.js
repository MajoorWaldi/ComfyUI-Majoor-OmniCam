// Editor-state serialization and ComfyUI widget synchronization.
// The node widgets stay authoritative on queue; the UI keeps them in sync here.

import { clamp, cloneCamera, sanitizeState, sampleCamera } from "./omnicam-core.js";

export function activeCameraTrack(ui) {
  return ui.state.cameras.find((item) => item.id === ui.state.active_camera_id) || ui.state.cameras[0];
}

export function playblastCameraTrack(ui) {
  return ui.state.cameras.find((item) => item.id === ui.state.playblast_camera_id) || activeCameraTrack(ui);
}

export function syncActiveCameraTrack(ui) {
  const active = activeCameraTrack(ui);
  active.camera = cloneCamera(ui.camera);
  active.keyframes = ui.state.keyframes;
  ui.state.camera = cloneCamera(ui.camera);
}

export function serializeEditorState(ui) {
  syncActiveCameraTrack(ui);
  const playblastCamera = playblastCameraTrack(ui);
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
  q('[data-role="mode"]').value = ui.state.render_mode;
  q('[data-role="guides"]').checked = ui.state.guides !== false;
  q('[data-role="playblast-grid"]').checked = Boolean(ui.state.playblast_grid);
  q('[data-role="burn-in"]').checked = Boolean(ui.state.burn_in);
  q('[data-role="speed-heatmap"]').checked = Boolean(ui.state.speed_heatmap);
  q('[data-role="card-fit"]').value = ui.state.card_fit || "contain";
  const layoutSelect = q('[data-role="preview-layout"]');
  if (layoutSelect) layoutSelect.value = ui.state.preview_layout || "auto";
  const safeAreas = q('[data-role="safe-areas"]');
  if (safeAreas) safeAreas.checked = Boolean(ui.state.safe_areas);
  const resolutionGate = q('[data-role="resolution-gate"]');
  if (resolutionGate) resolutionGate.checked = Boolean(ui.state.resolution_gate);
  const aspectSelect = q('[data-role="aspect-ratio"]');
  if (aspectSelect) aspectSelect.value = ui.state.aspect_ratio || "auto";
  q('[data-role="gizmo-space"]').value = ui.state.gizmo_space || "world";
  q('[data-role="view-mode"]').value = ui.state.view_mode || "camera";
  q('[data-role="ui-density"]').value = ui.state.ui_density || "advanced";
  ui.root.dataset.density = ui.state.ui_density || "advanced";
  q('[data-role="camera-view-row"]').hidden = !ui.state.camera_view_visible;
  ui.root.querySelector('.view-nav [data-act="toggle-camera-view"]')?.classList.toggle("active", ui.state.camera_view_visible);
  ui.refreshCameraSelectors();
  const scrub = q('[data-role="scrub"]');
  scrub.max = String(ui.state.duration_frames - 1);
  q('[data-role="frame"]').max = String(ui.state.duration_frames - 1);
  q('[data-role="key-frame"]').max = String(ui.state.duration_frames - 1);
  q('[data-role="duration-seconds"]').value = String(ui.state.duration_frames / ui.state.fps);
  q('[data-role="timeline-fps"]').value = String(ui.state.fps);
  ui.frame = clamp(ui.frame, 0, ui.state.duration_frames - 1);
  if (persist) ui.serialize();
  if (previousDuration !== ui.state.duration_frames || previousFps !== ui.state.fps) {
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
