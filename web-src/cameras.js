// Camera manager and camera-preview strip for the OmniCam Director.

import { app } from "../../scripts/app.js";
import { cloneCamera, sampleCamera } from "./omnicam-core.js";
import { confirmAction, promptText } from "./omnicam-ui.js";
import { t } from "./omnicam-i18n.js";

export function refreshCameraSelectors(ui) {
  for (const role of ["playblast-camera"]) {
    const select = ui.root.querySelector(`[data-role="${role}"]`);
    if (!select) continue;
    select.innerHTML = "";
    for (const camera of ui.state.cameras) {
      const option = document.createElement("option");
      option.value = camera.id;
      option.textContent = camera.name;
      select.appendChild(option);
    }
    select.value = ui.state.playblast_camera_id;
  }
  refreshCameraPreviews(ui);
}

export function visibleCameraTracks(ui) {
  const cameras = ui.state.cameras;
  const soloed = cameras.filter((camera) => camera.solo);
  const pool = soloed.length ? soloed : cameras.filter((camera) => !camera.muted);
  return pool.length ? pool : cameras;
}

export function refreshCameraPreviews(ui) {
  const strip = ui.root.querySelector('[data-role="camera-previews"]');
  if (!strip) return;
  const layout = ui.state.preview_layout || "auto";
  if (strip.dataset.layout !== (layout === "auto" ? "" : layout)) strip.dataset.layout = layout === "auto" ? "" : layout;
  const row = ui.root.querySelector('[data-role="camera-view-row"]');
  row.classList.toggle("maximized", Boolean(ui.state.maximized_camera_id));
  const visible = visibleCameraTracks(ui);
  const signature = visible.map((camera) => `${camera.id}:${camera.name}:${camera.muted ? 1 : 0}:${camera.solo ? 1 : 0}`).join("|");
  let rebuilt = false;
  if (signature !== ui.cameraPreviewSignature) {
    rebuilt = true;
    ui.cameraPreviewSignature = signature;
    strip.innerHTML = "";
    ui.cameraPreviewCanvases.clear();
    ui.cameraPreviewContexts.clear();
    visible.forEach((camera, index) => {
      const tile = document.createElement("div");
      tile.className = "camera-preview-tile";
      tile.dataset.cameraId = camera.id;
      tile.style.setProperty("--camera-color", `hsl(${(index * 115) % 360} 75% 52%)`);
      tile.title = t(`Click: set ${camera.name} as primary · Double-click: edit · Right-click: preview actions`);
      const header = document.createElement("div");
      header.className = "camera-preview-head";
      const icon = document.createElement("i");
      icon.className = "pi pi-video";
      const label = document.createElement("span");
      label.textContent = camera.name;
      const frame = document.createElement("span");
      frame.dataset.cameraFrame = camera.id;
      frame.textContent = `F${ui.frame}`;
      const output = document.createElement("i");
      output.className = "pi pi-circle-fill output-mark";
      output.title = t("Playblast camera");
      const canvas = document.createElement("canvas");
      canvas.dataset.cameraPreview = camera.id;
      const badge = document.createElement("span");
      badge.className = "camera-view-badge";
      badge.textContent = t("CAMERA PREVIEW");
      header.append(icon, label, frame, output);
      tile.append(canvas, header, badge);
      strip.appendChild(tile);
      tile.addEventListener("click", () => {
        clearTimeout(ui.previewClickTimer);
        ui.previewClickTimer = setTimeout(() => ui.setPlayblastCamera(camera.id), 220);
      });
      tile.addEventListener("dblclick", () => {
        clearTimeout(ui.previewClickTimer);
        ui.previewClickTimer = null;
        ui.activateCamera(camera.id);
      });
      tile.addEventListener("auxclick", (event) => {
        if (event.button === 1) {
          event.preventDefault();
          maximizeCameraPreview(ui, camera.id);
        }
      });
      ui.cameraPreviewCanvases.set(camera.id, canvas);
      ui.cameraPreviewContexts.set(camera.id, canvas.getContext("2d", { alpha: false }));
    });
  }
  for (const tile of strip.querySelectorAll(".camera-preview-tile")) {
    tile.classList.toggle("playblast", tile.dataset.cameraId === ui.state.playblast_camera_id);
    tile.classList.toggle("maximized", tile.dataset.cameraId === ui.state.maximized_camera_id);
  }
  for (const marker of strip.querySelectorAll(".output-mark")) marker.hidden = marker.closest(".camera-preview-tile")?.dataset.cameraId !== ui.state.playblast_camera_id;
  if (rebuilt)
    requestAnimationFrame(() => {
      if (ui.root.isConnected) {
        ui.resizeCanvas();
        ui.renderCameraView();
      }
    });
}

export function addCamera(ui) {
  ui.checkpoint("Add camera");
  ui.syncActiveCameraTrack();
  const id = `camera_${Date.now().toString(36)}`;
  const name = `Camera ${ui.state.cameras.length + 1}`;
  const camera = cloneCamera(ui.camera);
  ui.state.cameras.push({ id, name, camera, keyframes: [{ frame: 0, camera: cloneCamera(camera), interpolation: ui.root.querySelector('[data-role="interp"]').value }] });
  ui.activateCamera(id);
  ui.setStatus(t(`${name} added`));
}

export async function renameCamera(ui, id) {
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera) return;
  const name = (await promptText(app, t("Rename camera"), t("Camera name"), camera.name))?.trim();
  if (!name || name === camera.name) return;
  ui.checkpoint("Rename camera");
  camera.name = name.slice(0, 80);
  ui.cameraPreviewSignature = "";
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.setStatus(t(`Camera renamed: ${camera.name}`));
}

export function duplicateCamera(ui, id) {
  const source = ui.state.cameras.find((item) => item.id === id);
  if (!source) return;
  ui.checkpoint("Duplicate camera");
  ui.syncActiveCameraTrack();
  const copy = JSON.parse(JSON.stringify(source));
  copy.id = `camera_${Date.now().toString(36)}`;
  copy.name = `${source.name} Copy`;
  ui.state.cameras.push(copy);
  ui.cameraPreviewSignature = "";
  ui.activateCamera(copy.id);
  ui.setStatus(t(`${copy.name} added`));
}

export async function deleteCamera(ui, id) {
  if (ui.state.cameras.length <= 1) return ui.setStatus(t("At least one camera is required"));
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera || !(await confirmAction(app, t("Delete camera"), t(`Delete ${camera.name} and its ${camera.keyframes.length} keyframe(s)?`)))) return;
  ui.checkpoint("Delete camera");
  const wasActive = id === ui.state.active_camera_id;
  ui.state.cameras = ui.state.cameras.filter((item) => item.id !== id);
  if (id === ui.state.playblast_camera_id) ui.state.playblast_camera_id = ui.state.cameras[0].id;
  ui.cameraPreviewSignature = "";
  if (wasActive) {
    const next = ui.state.cameras[0];
    ui.state.active_camera_id = next.id;
    ui.state.keyframes = next.keyframes;
    ui.state.camera = cloneCamera(next.camera);
    ui.camera = sampleCamera(next, ui.frame);
    ui.selectedEntity = "camera";
    ui.selectedKeyFrame = next.keyframes.find((key) => key.frame === ui.frame)?.frame ?? null;
  }
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`${camera.name} deleted`));
}

export function activateCamera(ui, id) {
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera) return;
  ui.syncActiveCameraTrack();
  ui.state.active_camera_id = camera.id;
  ui.state.keyframes = camera.keyframes;
  ui.state.camera = cloneCamera(camera.camera);
  ui.camera = sampleCamera(camera, ui.frame);
  ui.selectedEntity = "camera";
  ui.selectedKeyFrame = camera.keyframes.find((key) => key.frame === ui.frame)?.frame ?? null;
  ui.editingKeyFrame = null;
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`Editing ${camera.name}`));
}

export function setPlayblastCamera(ui, id) {
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera) return;
  ui.state.playblast_camera_id = camera.id;
  ui.refreshCameraSelectors();
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.renderCameraView();
  ui.setStatus(t(`Playblast: ${camera.name}`));
}

export function toggleCameraView(ui) {
  ui.state.camera_view_visible = !ui.state.camera_view_visible;
  ui.root.querySelector('[data-role="camera-view-row"]').hidden = !ui.state.camera_view_visible;
  ui.root.querySelector('.view-nav [data-act="toggle-camera-view"]')?.classList.toggle("active", ui.state.camera_view_visible);
  ui.serialize();
  if (ui.state.camera_view_visible)
    requestAnimationFrame(() => {
      ui.resizeCanvas();
      ui.renderCameraView();
    });
  ui.setStatus(t(`Camera previews ${ui.state.camera_view_visible ? "shown" : "hidden"}`));
}

export function maximizeCameraPreview(ui, id) {
  ui.state.maximized_camera_id = ui.state.maximized_camera_id === id ? null : id;
  ui.serialize();
  refreshCameraPreviews(ui);
  requestAnimationFrame(() => {
    ui.resizeCanvas();
    ui.renderCameraView();
  });
  ui.setStatus(ui.state.maximized_camera_id ? t("Preview maximized") : t("Preview restored"));
}

const ASPECT_RATIOS = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };

export function drawPreviewOverlays(ui, context, width, height) {
  if (ui.state.guides !== false) {
    context.save();
    context.strokeStyle = "#ffffff55";
    context.lineWidth = Math.max(1, width / 640);
    context.beginPath();
    for (const x of [width / 3, (2 * width) / 3]) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (const y of [height / 3, (2 * height) / 3]) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();
    context.restore();
  }
  if (ui.state.safe_areas) {
    context.save();
    context.strokeStyle = "#f2d06b99";
    context.lineWidth = 1;
    for (const margin of [0.05, 0.1]) {
      context.strokeRect(width * margin, height * margin, width * (1 - 2 * margin), height * (1 - 2 * margin));
    }
    context.restore();
  }
  if (ui.state.resolution_gate || ui.state.aspect_ratio !== "auto") {
    const targetAspect = ASPECT_RATIOS[ui.state.aspect_ratio] || ui.state.width / Math.max(1, ui.state.height);
    const currentAspect = width / Math.max(1, height);
    context.save();
    context.fillStyle = "#00000088";
    if (currentAspect > targetAspect) {
      const visible = height * targetAspect;
      const bar = (width - visible) / 2;
      context.fillRect(0, 0, bar, height);
      context.fillRect(width - bar, 0, bar, height);
      if (ui.state.resolution_gate) {
        context.strokeStyle = "#ffffff88";
        context.strokeRect(bar, 0, visible, height);
      }
    } else if (currentAspect < targetAspect) {
      const visible = width / targetAspect;
      const bar = (height - visible) / 2;
      context.fillRect(0, 0, width, bar);
      context.fillRect(0, height - bar, width, bar);
      if (ui.state.resolution_gate) {
        context.strokeStyle = "#ffffff88";
        context.strokeRect(0, bar, width, visible);
      }
    }
    context.restore();
  }
}
