// Background image and image sequence manager for the OmniCam Director viewport.

import { annotatedAssetUrl } from "./director/core.js";
import { uploadManagedFile } from "./director/media.js";

let comfyApi = null;

export function configureBackgroundManager({ api }) {
  comfyApi = api;
}

async function uploadBackground(file) {
  if (!comfyApi) throw new Error("ComfyUI API is unavailable");
  return uploadManagedFile(comfyApi, { route: "/majoor/omnicam/upload_asset", field: "asset", file });
}

async function cleanupUploads(items) {
  const files = items.map((item) => String(item.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!files.length || !comfyApi) return;
  try {
    await comfyApi.fetchApi("/majoor/omnicam/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
  } catch (_) {}
}

function beginBackgroundRequest(ui) {
  ui.backgroundRequestId = (ui.backgroundRequestId || 0) + 1;
  return ui.backgroundRequestId;
}

export async function loadViewportBgFile(ui, file) {
  if (!file) return;
  const requestId = beginBackgroundRequest(ui);
  let uploaded = null;
  try {
    ui.setStatus(`Uploading background: ${file.name}`);
    uploaded = await uploadBackground(file);
    if (requestId !== ui.backgroundRequestId || ui.disposed) {
      await cleanupUploads([uploaded]);
      return;
    }
    const url = annotatedAssetUrl(uploaded.path);
    ui.state.viewport_bg_image = uploaded.path;
    ui.state.viewport_bg_sequence = [];
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {});
    ui.viewportBgImage = img;
    ui.serialize();
    ui.render();
    ui.setStatus(`Background image set: ${file.name}`);
  } catch (err) {
    if (uploaded) await cleanupUploads([uploaded]);
    if (requestId !== ui.backgroundRequestId || ui.disposed) return;
    ui.setStatus(`Failed to load BG image: ${err.message || err}`);
  }
}

export async function loadViewportBgSequence(ui, files) {
  if (!files || !files.length) return;
  const requestId = beginBackgroundRequest(ui);
  files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  const uploaded = [];
  try {
    ui.setStatus(`Uploading background sequence: ${files.length} frames`);
    for (const file of files) {
      uploaded.push(await uploadBackground(file));
      if (requestId !== ui.backgroundRequestId || ui.disposed) {
        await cleanupUploads(uploaded);
        return;
      }
    }
    const assets = uploaded.map((item) => item.path);
    ui.state.viewport_bg_sequence = assets;
    ui.state.viewport_bg_image = "";
    ui.viewportBgImage = null;
    ui.viewportBgSequenceImages = assets.map((asset) => {
      const img = new Image();
      img.src = annotatedAssetUrl(asset);
      img.decode().catch(() => {});
      return img;
    });
    ui.serialize();
    ui.render();
    ui.setStatus(`Background sequence loaded: ${files.length} frames`);
  } catch (err) {
    await cleanupUploads(uploaded);
    if (requestId !== ui.backgroundRequestId || ui.disposed) return;
    ui.setStatus(`Failed to load BG sequence: ${err.message || err}`);
  }
}

export function clearViewportBgImage(ui) {
  beginBackgroundRequest(ui);
  ui.state.viewport_bg_image = "";
  ui.state.viewport_bg_sequence = [];
  ui.viewportBgImage = null;
  ui.viewportBgSequenceImages = [];
  ui.serialize();
  ui.render();
  ui.setStatus("Background cleared");
}
