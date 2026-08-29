// Camera manager and camera-preview strip for the OmniCam Director.

import { cloneCamera, sampleCamera } from "./omnicam-core.js";
import { SEQUENCE_TARGET, sequenceCuts } from "./director/sequence.js";
import { confirmAction, promptText } from "./omnicam-ui.js";
import { t } from "./omnicam-i18n.js";
import { focalLengthToFov, formatFocalLength } from "./lens.js";
import { drawResolutionGate } from "./viewport/resolution-gate.js";

export const CAMERA_PALETTE = [
  "#4aa3ef", // Camera 1 - Blue/Cyan
  "#f2a93b", // Camera 2 - Amber/Gold
  "#48c774", // Camera 3 - Emerald/Green
  "#b565d8", // Camera 4 - Purple
  "#ec4899", // Camera 5 - Pink
  "#06b6d4", // Camera 6 - Cyan
  "#f97316", // Camera 7 - Orange
  "#8b5cf6", // Camera 8 - Violet
];

function nextCameraId(state) {
  const prefix = `camera_${Date.now().toString(36)}`;
  let id = prefix;
  let suffix = 2;
  while (state.cameras.some((camera) => camera.id === id)) id = `${prefix}_${suffix++}`;
  return id;
}

export function refreshCameraSelectors(ui) {
  const cuts = sequenceCuts(ui.state);
  for (const select of ui.root.querySelectorAll('[data-role="playblast-camera"]')) {
    select.innerHTML = "";
    for (const camera of ui.state.cameras) {
      const option = document.createElement("option");
      option.value = camera.id;
      option.textContent = camera.name;
      select.appendChild(option);
    }
    // Recording the edit is just another target: the playblast follows the cuts
    // and lands as one video. Offered only once there is an edit to record.
    const sequenceOption = document.createElement("option");
    sequenceOption.value = SEQUENCE_TARGET;
    sequenceOption.textContent = cuts.length
      ? t("Sequence ({count} shots)").replace("{count}", String(cuts.length))
      : t("Sequence (no shots yet)");
    sequenceOption.disabled = cuts.length === 0;
    select.appendChild(sequenceOption);
    select.value = ui.state.playblast_camera_id;
  }
  for (const select of ui.root.querySelectorAll('[data-role="active-camera-select"]')) {
    select.innerHTML = "";
    for (const camera of ui.state.cameras) {
      const option = document.createElement("option");
      option.value = camera.id;
      option.textContent = camera.name;
      select.appendChild(option);
    }
    select.value = ui.state.active_camera_id;
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
  // The tiles take the shot's aspect, so a preview shows the framing the
  // render will actually produce rather than the shape of its own box.
  const shotAspect = `${Math.max(1, ui.state.width || 16)} / ${Math.max(1, ui.state.height || 9)}`;
  const aspectChanged = strip.style.getPropertyValue("--shot-aspect") !== shotAspect;
  if (aspectChanged) strip.style.setProperty("--shot-aspect", shotAspect);
  const row = ui.root.querySelector('[data-role="camera-view-row"]');
  if (row) row.classList.toggle("maximized", Boolean(ui.state.maximized_camera_id));
  const visible = visibleCameraTracks(ui);
  const signature = visible.map((camera) => `${camera.id}:${camera.name}:${camera.muted ? 1 : 0}:${camera.solo ? 1 : 0}:${camera.color || ""}`).join("|");
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
      const camColor = camera.color || CAMERA_PALETTE[index % CAMERA_PALETTE.length];
      tile.style.setProperty("--camera-color", camColor);
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
    tile.classList.toggle("active", tile.dataset.cameraId === ui.state.active_camera_id);
    tile.classList.toggle("maximized", tile.dataset.cameraId === ui.state.maximized_camera_id);
  }
  for (const marker of strip.querySelectorAll(".output-mark")) marker.hidden = marker.closest(".camera-preview-tile")?.dataset.cameraId !== ui.state.playblast_camera_id;
  // A resolution change reshapes the tile in CSS but leaves the canvas backing
  // store at its old size, so the render would be stretched until the next
  // rebuild. The aspect is as good a reason to re-measure as a new camera is.
  if (rebuilt || aspectChanged)
    requestAnimationFrame(() => {
      if (ui.root.isConnected) {
        ui.resizeCanvas();
        ui.renderCameraView();
      }
    });
}

export function addCamera(ui) {
  ui.checkpoint("Add camera");
  ui.finishCameraEdit();
  ui.syncActiveCameraTrack();
  const id = nextCameraId(ui.state);
  const count = ui.state.cameras.length;
  const name = `Camera ${count + 1}`;

  // New entities are created at the world origin. Preserve the current viewing
  // direction so the camera remains immediately usable from position 0,0,0.
  const baseCam = cloneCamera(ui.camera);
  const direction = [
    (baseCam.target?.[0] ?? 0) - (baseCam.position?.[0] ?? 0),
    (baseCam.target?.[1] ?? 0) - (baseCam.position?.[1] ?? 0),
    (baseCam.target?.[2] ?? -1) - (baseCam.position?.[2] ?? 0),
  ];
  const magnitude = Math.hypot(...direction) || 1;
  baseCam.position = [0, 0, 0];
  baseCam.target = direction.map((value) => value / magnitude);

  const color = CAMERA_PALETTE[count % CAMERA_PALETTE.length];
  const interpolation = ui.root.querySelector('[data-role="key-interp"]')?.value || ui.root.querySelector('[data-role="interp"]')?.value || "ease";
  ui.state.cameras.push({
    id,
    name,
    color,
    camera: baseCam,
    keyframes: [{ frame: 0, camera: cloneCamera(baseCam), interpolation }],
  });
  ui.cameraPreviewSignature = "";
  ui.activateCamera(id);
  ui.setStatus(t(`${name} added`));
}

export async function renameCamera(ui, id) {
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera) return;
  const name = (await promptText(t("Rename camera"), t("Camera name"), camera.name))?.trim();
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
  ui.finishCameraEdit();
  ui.syncActiveCameraTrack();
  const copy = JSON.parse(JSON.stringify(source));
  copy.id = nextCameraId(ui.state);
  copy.name = `${source.name} Copy`;
  const count = ui.state.cameras.length;
  copy.color = CAMERA_PALETTE[count % CAMERA_PALETTE.length];

  // Slight lateral offset so the duplicate is immediately visible and distinguishable in 3D
  if (copy.camera?.position) {
    copy.camera.position = [
      Math.round((copy.camera.position[0] + 0.8) * 100) / 100,
      copy.camera.position[1],
      Math.round((copy.camera.position[2] + 0.8) * 100) / 100,
    ];
  }
  if (copy.keyframes) {
    for (const k of copy.keyframes) {
      if (k.camera?.position) {
        k.camera.position = [
          Math.round((k.camera.position[0] + 0.8) * 100) / 100,
          k.camera.position[1],
          Math.round((k.camera.position[2] + 0.8) * 100) / 100,
        ];
      }
    }
  }

  ui.state.cameras.push(copy);
  ui.cameraPreviewSignature = "";
  ui.activateCamera(copy.id);
  ui.setStatus(t(`${copy.name} added`));
}

export async function deleteCamera(ui, id) {
  if (ui.state.cameras.length <= 1) return ui.setStatus(t("At least one camera is required"));
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera || !(await confirmAction(t("Delete camera"), t(`Delete ${camera.name} and its ${camera.keyframes.length} keyframe(s)?`)))) return;
  ui.checkpoint("Delete camera");
  ui.finishCameraEdit();
  const wasActive = id === ui.state.active_camera_id;
  ui.state.cameras = ui.state.cameras.filter((item) => item.id !== id);
  if (id === ui.state.playblast_camera_id) ui.state.playblast_camera_id = ui.state.cameras[0].id;
  ui.cameraPreviewSignature = "";
  if (wasActive) {
    const next = ui.state.cameras[0];
    ui.state.active_camera_id = next.id;
    ui.state.keyframes = next.keyframes;
    ui.state.camera = cloneCamera(next.camera);
    ui.camera = sampleCamera(next, ui.frame, ui.state.objects);
    ui.selectedEntity = "camera";
    ui.selectedObjectId = null;
    ui.selectedObjectIds = new Set();
    ui.selectedKeyFrame = next.keyframes.find((key) => key.frame === ui.frame)?.frame ?? null;
    ui.editingKeyFrame = null;
  }
  ui.serialize();
  ui.refreshCameraSelectors();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t(`${camera.name} deleted`));
}

export function activateCamera(ui, id) {
  const camera = ui.state.cameras.find((item) => item.id === id);
  if (!camera) return;
  ui.finishCameraEdit();
  ui.syncActiveCameraTrack();
  ui.state.active_camera_id = camera.id;
  ui.state.keyframes = camera.keyframes;
  ui.state.camera = cloneCamera(camera.camera);
  ui.camera = sampleCamera(camera, ui.frame, ui.state.objects);
  ui.selectedEntity = "camera";
  ui.selectedObjectId = null;
  ui.selectedObjectIds = new Set();
  ui.selectedKeyFrame = camera.keyframes.find((key) => key.frame === ui.frame)?.frame ?? null;
  ui.editingKeyFrame = null;
  ui.serialize();
  ui.refreshCameraSelectors();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t(`Camera: ${camera.name}`));
}

export function setPlayblastCamera(ui, id) {
  const cuts = sequenceCuts(ui.state);
  const toSequence = id === SEQUENCE_TARGET && cuts.length > 0;
  const camera = toSequence ? null : ui.state.cameras.find((item) => item.id === id);
  if (!toSequence && !camera) return;
  ui.state.playblast_camera_id = toSequence ? SEQUENCE_TARGET : camera.id;
  ui.refreshCameraSelectors();
  ui.serialize();
  ui.refreshObjects();
  ui.renderCameraView();
  ui.setStatus(toSequence
    ? t("Playblast: sequence ({count} shots)").replace("{count}", String(cuts.length))
    : t(`Playblast: ${camera.name}`));
}

export function toggleCameraView(ui) {
  ui.state.camera_view_visible = !ui.state.camera_view_visible;
  for (const el of ui.root.querySelectorAll('[data-role="camera-view-row"]')) el.hidden = !ui.state.camera_view_visible;
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-camera-view"]')) {
    btn.classList.toggle("active", ui.state.camera_view_visible);
    btn.setAttribute("aria-pressed", String(ui.state.camera_view_visible));
  }
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
  drawResolutionGate(context, ui.state, width, height);
}

export const CINEMA_LENSES = [
  { mm: 14, name: "14mm Ultra-Wide" },
  { mm: 18, name: "18mm Super-Wide" },
  { mm: 24, name: "24mm Wide" },
  { mm: 35, name: "35mm Normal-Wide" },
  { mm: 50, name: "50mm Standard" },
  { mm: 85, name: "85mm Portrait" },
  { mm: 105, name: "105mm Medium Tele" },
  { mm: 135, name: "135mm Telephoto" },
];

export function fovToFocalLength(fovDegrees, sensorHeight = 24) {
  const fovClamped = Math.max(1, Math.min(179, Number(fovDegrees) || 35));
  const rad = (fovClamped * Math.PI) / 360;
  return (sensorHeight / 2) / Math.max(1e-9, Math.tan(rad));
}

export { focalLengthToFov };

export function applyCinemaLens(ui, focalLengthMm) {
  const fov = focalLengthToFov(focalLengthMm);
  const activeCam = ui.activeCameraTrack();
  if (activeCam?.keyframes?.length && ui.activeKeyframe()) {
    ui.activeKeyframe().camera.fov = fov;
    ui.scheduleSerialize();
    ui.render();
    ui.refreshKeyEditor();
  } else {
    ui.camera.fov = fov;
    ui.render();
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-fov"]')) el.value = String(fov.toFixed(1));
  for (const el of ui.root.querySelectorAll('[data-role="camera-focal"]')) el.value = formatFocalLength(fov);
  ui.setStatus(`Lens: ${focalLengthMm}mm (FOV ${fov.toFixed(1)}°)`);
}
