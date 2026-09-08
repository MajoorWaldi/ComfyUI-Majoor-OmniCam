// Runtime updates and event wiring for Viewport HUD, Floating Transport, Tool Rail, and Quick Overlays.

import { t } from "../i18n.js";
import { formatFocalLength, formatFov } from "../lens.js";
import { length, sub } from "../director/core.js";

export function updateCameraHud(ui) {
  const hud = ui.root.querySelector('[data-role="camera-hud"]');
  if (!hud) return;

  const inCameraView = ui.state.view_mode === "camera";
  hud.hidden = !inCameraView;
  if (!inCameraView) return;

  const camera = ui.viewportCamera ? ui.viewportCamera() : ui.camera;
  const track = ui.activeCameraTrack ? ui.activeCameraTrack() : null;

  const nameEl = hud.querySelector('[data-role="hud-cam-name"]');
  if (nameEl) nameEl.textContent = track?.name || "Camera";

  const lockIcon = hud.querySelector('[data-role="cam-lock-icon"]');
  const isLocked = Boolean(ui.state.camera_lock);
  if (lockIcon) {
    lockIcon.className = isLocked ? "pi pi-lock" : "pi pi-lock-open";
    const lockBtn = lockIcon.closest('[data-act="toggle-camera-lock"]');
    if (lockBtn) {
      lockBtn.classList.toggle("locked", isLocked);
      lockBtn.title = isLocked
        ? t("Camera View is locked (click to unlock)")
        : t("Lock Camera View (prevent accidental navigation)");
    }
  }

  const lensEl = hud.querySelector('[data-role="hud-cam-lens"]');
  if (lensEl && camera?.fov != null) lensEl.textContent = `${formatFocalLength(camera.fov)}mm`;

  const fovEl = hud.querySelector('[data-role="hud-cam-fov"]');
  if (fovEl && camera?.fov != null) fovEl.textContent = formatFov(camera.fov);

  const distEl = hud.querySelector('[data-role="hud-cam-dist"]');
  if (distEl) {
    if (camera?.target && Array.isArray(camera.target) && Array.isArray(camera.position)) {
      const dist = length(sub(camera.position, camera.target));
      distEl.textContent = `Tgt: ${dist.toFixed(2)}m`;
    } else {
      distEl.textContent = "Free";
    }
  }

  const rollReset = hud.querySelector('[data-role="hud-roll-reset"]');
  const rollVal = hud.querySelector('[data-role="hud-roll-val"]');
  const roll = Number(camera?.roll || 0);
  if (rollReset) {
    if (Math.abs(roll) > 0.05) {
      rollReset.hidden = false;
      if (rollVal) rollVal.textContent = `${roll > 0 ? "+" : ""}${roll.toFixed(1)}°`;
    } else {
      rollReset.hidden = true;
    }
  }
}

export function updateFloatingTransport(ui) {
  const ft = ui.root.querySelector('[data-role="floating-transport"]');
  if (!ft) return;

  // Fullscreen is tracked as a CSS class on the root (see event-bindings/
  // director-chrome.js bindViewToggles), not as a state flag.
  const fullscreen = ui.root.classList.contains("oc-fullscreen");
  ft.hidden = !fullscreen;
  if (!fullscreen) return;

  const playIcon = ft.querySelector('[data-role="ft-play-icon"]');
  if (playIcon) playIcon.className = ui.playing ? "pi pi-pause" : "pi pi-play";

  const timeEl = ft.querySelector('[data-role="ft-timecode"]');
  if (timeEl) {
    const fps = Math.max(1, Math.round(ui.state.fps || 24));
    const totalSeconds = Math.floor(ui.frame / fps);
    const frames = ui.frame % fps;
    timeEl.textContent = `${String(Math.floor(totalSeconds / 3600)).padStart(2, "0")}:${String(Math.floor(totalSeconds / 60) % 60).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
  }

  const frameEl = ft.querySelector('[data-role="ft-frame"]');
  if (frameEl) frameEl.textContent = `F${ui.frame}`;
}

export function updateViewportControls(ui) {
  const spaceBadge = ui.root.querySelector('[data-role="gizmo-space-badge"]');
  if (spaceBadge) {
    const isLocal = ui.state.gizmo_space === "local";
    spaceBadge.textContent = isLocal ? "L" : "W";
    const toggleBtn = spaceBadge.closest('[data-role="gizmo-space-toggle"]');
    if (toggleBtn) {
      toggleBtn.classList.toggle("active", isLocal);
      toggleBtn.title = isLocal ? t("Transform Space: Local (click for World)") : t("Transform Space: World (click for Local)");
    }
  }

  const snapBtn = ui.root.querySelector('[data-role="spatial-snap-toggle"]');
  if (snapBtn) {
    const isSnapping = Boolean(ui.state.spatial_snap_mode && ui.state.spatial_snap_mode !== "none");
    snapBtn.classList.toggle("active", isSnapping);
    snapBtn.title = isSnapping
      ? t("Snapping: {mode} (click to disable)").replace("{mode}", ui.state.spatial_snap_mode)
      : t("Toggle Snapping (Grid / None)");
  }

  // Quick overlay toggle buttons
  const gridBtn = ui.root.querySelector('[data-role="overlay-grid-btn"]');
  if (gridBtn) gridBtn.classList.toggle("active", ui.state.show_grid !== false);

  const wireBtn = ui.root.querySelector('[data-role="overlay-wireframe-btn"]');
  if (wireBtn) wireBtn.classList.toggle("active", Boolean(ui.state.show_wireframe));

  const cullBtn = ui.root.querySelector('[data-role="overlay-cull-btn"]');
  if (cullBtn) {
    cullBtn.classList.toggle("active", Boolean(ui.state.backface_culling));
    cullBtn.title = ui.state.backface_culling
      ? t("Backface culling: On (Single-Sided)")
      : t("Backface culling: Off (Double-Sided Interior)");
  }

  const gizmoBtn = ui.root.querySelector('[data-role="overlay-gizmo-btn"]');
  if (gizmoBtn) gizmoBtn.classList.toggle("active", ui.state.show_gizmo !== false);

  const guidesBtn = ui.root.querySelector('[data-role="overlay-guides-btn"]');
  if (guidesBtn) guidesBtn.classList.toggle("active", ui.state.guides !== false);

  const safeBtn = ui.root.querySelector('[data-role="overlay-safe-btn"]');
  if (safeBtn) safeBtn.classList.toggle("active", Boolean(ui.state.safe_areas));

  const radarBtn = ui.root.querySelector('[data-role="overlay-radar-btn"]');
  if (radarBtn) radarBtn.classList.toggle("active", Boolean(ui.state.show_radar));

  const shadingSelect = ui.root.querySelector('[data-role="shading-mode-select"]');
  const isFocused = typeof document !== "undefined" && document.activeElement === shadingSelect;
  if (shadingSelect && !isFocused) {
    shadingSelect.value = ui.state.render_mode || "omni_ref";
  }
}

export function setupViewportHudHandlers(ui, signal) {
  // Camera Lock
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-camera-lock"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle camera lock");
      ui.state.camera_lock = !ui.state.camera_lock;
      ui.serialize?.();
      updateCameraHud(ui);
      ui.setStatus?.(ui.state.camera_lock ? t("Camera View locked") : t("Camera View unlocked"));
    }, { signal });
  }

  // Reset Camera Roll
  for (const btn of ui.root.querySelectorAll('[data-act="reset-camera-roll"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Reset camera roll");
      ui.camera.roll = 0;
      const activeCamera = ui.activeCameraTrack?.();
      if (activeCamera) {
        const key = activeCamera.keyframes?.find((k) => k.frame === ui.frame);
        if (key && key.camera) key.camera.roll = 0;
      }
      ui.serialize?.();
      ui.updateEditState?.();
      ui.requestRender?.();
      ui.setStatus?.(t("Camera roll reset to 0°"));
    }, { signal });
  }

  // Toggle Gizmo Space (World / Local)
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-gizmo-space"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle transform space");
      ui.state.gizmo_space = ui.state.gizmo_space === "local" ? "world" : "local";
      for (const sel of ui.root.querySelectorAll('[data-role="gizmo-space"]')) {
        sel.value = ui.state.gizmo_space;
      }
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
      ui.setStatus?.(t("Transform space: {space}").replace("{space}", ui.state.gizmo_space));
    }, { signal });
  }

  // Toggle Spatial Snap
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-spatial-snap"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle snapping");
      const current = ui.state.spatial_snap_mode || "none";
      ui.state.spatial_snap_mode = current === "none" ? "grid" : "none";
      for (const sel of ui.root.querySelectorAll('[data-role="spatial-snap-mode"]')) {
        sel.value = ui.state.spatial_snap_mode;
      }
      ui.serialize?.();
      updateViewportControls(ui);
      ui.setStatus?.(t("Snapping: {mode}").replace("{mode}", ui.state.spatial_snap_mode));
    }, { signal });
  }

  // Overlay Quick Toggles
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-grid-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle grid overlay");
      ui.state.show_grid = ui.state.show_grid === false;
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="toggle-wireframe-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle wireframe overlay");
      ui.state.show_wireframe = !ui.state.show_wireframe;
      for (const el of ui.root.querySelectorAll('[data-role="show-wireframe"]')) el.checked = Boolean(ui.state.show_wireframe);
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
      ui.setStatus?.(ui.state.show_wireframe ? t("Wireframe overlay: On") : t("Wireframe overlay: Off"));
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="toggle-cull-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle backface culling");
      ui.state.backface_culling = !ui.state.backface_culling;
      for (const el of ui.root.querySelectorAll('[data-role="backface-culling"]')) el.checked = Boolean(ui.state.backface_culling);
      ui.serialize?.();
      updateViewportControls(ui);
      if (ui.webgl) ui.webgl.sceneKey = "";
      ui.requestRender?.();
      ui.setStatus?.(ui.state.backface_culling ? t("Backface culling: On (Single-Sided)") : t("Backface culling: Off (Double-Sided)"));
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="toggle-gizmo-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle gizmo overlay");
      ui.state.show_gizmo = ui.state.show_gizmo === false;
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="toggle-guides-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle guides overlay");
      ui.state.guides = ui.state.guides === false;
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="toggle-safe-areas-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle safe areas overlay");
      ui.state.safe_areas = !ui.state.safe_areas;
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="toggle-radar-overlay"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ui.checkpoint?.("Toggle radar overlay");
      ui.state.show_radar = !ui.state.show_radar;
      ui.serialize?.();
      updateViewportControls(ui);
      ui.requestRender?.();
    }, { signal });
  }

  // Shading Mode Selector -- render_mode has three readouts (this select, the
  // node's mode widget, and the settings-panel [data-role="mode"] dropdowns).
  // state-sync.js rehydrates render_mode from ui.modeWidget, so all three must
  // be written together or the choice is lost on the next sync.
  for (const sel of ui.root.querySelectorAll('[data-role="shading-mode-select"]')) {
    sel.addEventListener("change", (e) => {
      if (ui.state.render_mode !== e.target.value) ui.checkpoint?.("Change shading mode");
      ui.state.render_mode = e.target.value;
      if (ui.modeWidget) ui.modeWidget.value = e.target.value;
      for (const el of ui.root.querySelectorAll('[data-role="mode"]')) el.value = e.target.value;
      ui.serialize?.();
      (ui.render ? ui.render() : ui.requestRender?.());
      ui.setStatus?.(t("Shading: {mode}").replace("{mode}", ui.state.render_mode));
    }, { signal });
  }

  // Floating Transport buttons -- these are the "Previous/Next Keyframe" jumps
  // (goToAdjacentKey has no return value); with no keys on the active track they
  // degrade to a single-frame step so the buttons are never dead.
  const hasKeys = () => Boolean(ui.timelineKeyframes?.().length);
  for (const btn of ui.root.querySelectorAll('[data-act="ft-step-back"]')) {
    btn.addEventListener("click", () => {
      if (hasKeys()) ui.goToAdjacentKey?.(-1);
      else ui.setFrame?.(Math.max(0, ui.frame - 1));
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="ft-toggle-play"]')) {
    btn.addEventListener("click", () => ui.togglePlay?.(), { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="ft-step-forward"]')) {
    btn.addEventListener("click", () => {
      if (hasKeys()) ui.goToAdjacentKey?.(1);
      else ui.setFrame?.(ui.frame + 1);
    }, { signal });
  }

  for (const btn of ui.root.querySelectorAll('[data-act="ft-add-key"]')) {
    btn.addEventListener("click", () => ui.insertKeyframe?.(), { signal });
  }
}
