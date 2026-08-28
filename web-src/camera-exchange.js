// Camera import / export from the Director.
//
// Import accepts anything a DCC is likely to hand you. Text and glTF go to the
// backend, which owns the canonical track contract. FBX is decoded here
// instead, with the loader the viewport already bundles -- shipping it twice,
// once more in Python, would be absurd.
//
// Export always goes through the backend: the writers live next to the track
// they serialise, and their output is unit-tested there.

import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import { api as comfyApi } from "../../scripts/api.js";
import { AnimationMixer, Quaternion, Vector3 } from "./three-runtime.js";
import { t } from "./omnicam-i18n.js";
import { activeCameraTrack } from "./omnicam-state-sync.js";

/** The canonical payload the backend writers expect. */
function exportableTrack(ui) {
  const camera = activeCameraTrack(ui);
  return {
    schema_version: 1,
    fps: ui.state.fps,
    duration_frames: ui.state.duration_frames,
    width: ui.state.width,
    height: ui.state.height,
    render_mode: ui.state.render_mode,
    keyframes: camera?.keyframes || [],
    objects: ui.state.objects || [],
    metadata: { camera_name: camera?.name || "Camera" },
  };
}

/** Formats the running build can actually produce, fetched once per editor. */
export async function loadExchangeFormats(ui) {
  const select = ui.root.querySelector('[data-role="export-format"]');
  if (!select || select.dataset.ready === "1") return;
  try {
    const response = await comfyApi.fetchApi("/majoor/omnicam/exchange_formats");
    if (!response.ok) return;
    const payload = await response.json();
    select.replaceChildren();
    for (const [id, info] of Object.entries(payload.export || {})) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = info.label || id;
      option.title = info.reads ? `${t("Read by")}: ${info.reads}` : "";
      select.appendChild(option);
    }
    select.dataset.ready = "1";
    ui.exchangeFormats = payload.export || {};
    updateExportNote(ui);
    select.addEventListener("change", () => updateExportNote(ui));
  } catch {
    // The editor works without interchange; a missing route must not break it.
  }
}

function updateExportNote(ui) {
  const note = ui.root.querySelector('[data-role="export-note"]');
  const select = ui.root.querySelector('[data-role="export-format"]');
  if (!note || !select) return;
  const info = (ui.exchangeFormats || {})[select.value];
  note.textContent = info?.reads ? `${t("Read by")}: ${info.reads}` : "";
}

export async function exportCamera(ui) {
  const select = ui.root.querySelector('[data-role="export-format"]');
  const format = select?.value || "glb";
  const track = activeCameraTrack(ui);
  ui.setStatus(t("Exporting camera…"));
  try {
    const response = await comfyApi.fetchApi("/majoor/omnicam/export_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, name: track?.name || "omnicam_camera", track: exportableTrack(ui) }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    ui.setStatus(t("Camera exported to {path}").replace("{path}", data.relative));
  } catch (error) {
    console.error("[OmniCam] camera export failed", error);
    ui.setStatus(t("Camera export failed: {error}").replace("{error}", String(error?.message || error).slice(0, 120)));
  }
}

export function pickCameraFile(ui) {
  ui.root.querySelector('[data-role="camera-file"]')?.click();
}

export async function importCameraFile(ui, file) {
  if (!file) return;
  const extension = `.${(file.name.split(".").pop() || "").toLowerCase()}`;
  ui.setStatus(t("Reading camera from {name}…").replace("{name}", file.name));
  try {
    const track = extension === ".fbx"
      ? await readFbxCamera(ui, file)
      : await readViaBackend(file);
    applyImportedTrack(ui, track, file.name);
  } catch (error) {
    console.error("[OmniCam] camera import failed", error);
    ui.setStatus(t("Camera import failed: {error}").replace("{error}", String(error?.message || error).slice(0, 120)));
  }
}

async function readViaBackend(file) {
  const body = new FormData();
  body.append("file", file, file.name);
  const response = await comfyApi.fetchApi("/majoor/omnicam/import_camera", { method: "POST", body });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()).track;
}

/**
 * FBX is decoded with the viewport's bundled loader. Blender, Maya and Unreal
 * all export FBX cameras, which is why it is worth the extra path.
 */
async function readFbxCamera(ui, file) {
  const buffer = await file.arrayBuffer();
  const scene = new FBXLoader().parse(buffer, "");

  const cameras = [];
  scene.traverse((object) => {
    if (object.isCamera) cameras.push(object);
  });
  if (!cameras.length) throw new Error(t("this FBX contains no camera"));
  const camera = cameras[0];

  const fps = Math.max(1, Number(ui.state.fps) || 24);
  const clip = scene.animations?.[0];
  const frames = clip ? Math.max(1, Math.round(clip.duration * fps) + 1) : 1;
  const keyframes = [];

  const mixer = clip ? new AnimationMixer(scene) : null;
  if (mixer) mixer.clipAction(clip).play();

  const position = new Vector3();
  const quaternion = new Quaternion();
  const forward = new Vector3();
  for (let frame = 0; frame < frames; frame++) {
    if (mixer) {
      mixer.setTime(frame / fps);
      scene.updateMatrixWorld(true);
    }
    camera.getWorldPosition(position);
    camera.getWorldQuaternion(quaternion);
    forward.set(0, 0, -1).applyQuaternion(quaternion);
    keyframes.push({
      frame,
      interpolation: "linear",
      camera: {
        position: [position.x, position.y, position.z],
        target: [position.x + forward.x, position.y + forward.y, position.z + forward.z],
        fov: Number(camera.fov) || 35,
        roll: 0,
        camera_type: "perspective",
        zoom: 1,
        near: Number(camera.near) || 0.01,
        far: Number(camera.far) || 10000,
      },
    });
  }
  if (mixer) mixer.stopAllAction();

  return {
    schema_version: 1,
    fps,
    duration_frames: frames,
    width: ui.state.width,
    height: ui.state.height,
    render_mode: ui.state.render_mode,
    keyframes,
    objects: [],
    metadata: { imported_from: "fbx" },
  };
}

function applyImportedTrack(ui, track, filename) {
  const keyframes = track?.keyframes;
  if (!Array.isArray(keyframes) || !keyframes.length) throw new Error(t("no camera keys in this file"));

  ui.checkpoint("Import camera");
  const camera = activeCameraTrack(ui);
  camera.keyframes = keyframes;
  // state.keyframes aliases the active track; both have to move together.
  ui.state.keyframes = keyframes;
  if (Number.isFinite(track.duration_frames)) {
    ui.state.duration_frames = Math.max(1, Math.round(track.duration_frames));
    if (ui.durationWidget) ui.durationWidget.value = ui.state.duration_frames / Math.max(1, ui.state.fps);
  }
  ui.syncActiveCameraTrack();
  ui.setFrame(0);
  ui.refreshKeys();
  ui.render();
  ui.scheduleSerialize();
  ui.setStatus(t("Imported {count} camera keys from {name}")
    .replace("{count}", String(keyframes.length))
    .replace("{name}", filename));
}
