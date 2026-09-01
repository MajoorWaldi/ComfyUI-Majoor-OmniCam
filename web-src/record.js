// Playblast recording orchestration: deterministic encoder selection,
// realtime fallback, media synchronization, progress reporting, upload.

import { api } from "../../scripts/api.js";
import { captureRealtimePlayblast, uploadPlayblast, waitForSeekingMedia } from "./omnicam-playblast.js";
import { SEQUENCE_TARGET } from "./director/sequence.js";
import { t } from "./i18n.js";
import { storePlayblastManifest } from "./playblast-contract.js";

export async function waitForMediaFrame(ui) {
  await waitForSeekingMedia(ui.cardMediaById.values());
}

export async function captureRealtime(ui) {
  return captureRealtimePlayblast({
    canvas: ui.canvas,
    fps: ui.state.fps,
    frameCount: ui.state.duration_frames,
    renderFrame: (frame) => ui.setFrame(frame, true),
    signal: ui.abortController?.signal,
  });
}

export async function uploadDirectorPlayblast(ui, blob) {
  const uploaded = await uploadPlayblast(api, blob);
  storePlayblastManifest(ui, blob);
  // A sequence recording belongs to the edit, not to any one camera.
  if (ui.state.playblast_camera_id === SEQUENCE_TARGET) {
    ui.state.sequence = { ...(ui.state.sequence || {}), recording_path: uploaded.path };
  } else {
    const camera = ui.state.cameras.find((item) => item.id === ui.state.playblast_camera_id);
    if (camera) camera.recording_path = uploaded.path;
  }
  if (ui.recordingWidget) ui.recordingWidget.value = uploaded.path;
  ui.serialize();
  ui.setStatus(t(`Playblast ready: ${uploaded.name}`));
}

// Drawing-buffer size for the recorded playblast. "viewport" keeps whatever the
// panel currently is; the other modes lock the output to the node's configured
// width x height so the proxy resolution is predictable regardless of layout.
export function playblastDimensions(ui) {
  const current = { width: ui.canvas.width, height: ui.canvas.height };
  const mode = ui.state.playblast_resolution || "viewport";
  if (mode === "viewport") return current;
  const factor = mode === "half" ? 0.5 : mode === "double" ? 2 : 1;
  const outW = Math.max(16, Math.round(Number(ui.state.width) || current.width));
  const outH = Math.max(16, Math.round(Number(ui.state.height) || current.height));
  const cap = 3840;
  const scale = Math.min(factor, cap / Math.max(outW * factor, outH * factor));
  const even = (value) => Math.max(2, Math.round(value * scale / 2) * 2);
  return { width: even(outW), height: even(outH) };
}

export async function makePlayblast(ui) {
  if (ui.recording) return;
  ui.stopPlay();
  ui.recording = true;
  ui.root.classList.add("recording");
  ui.setStatus(t("Encoding deterministic proxy…"));
  const oldFrame = ui.frame;
  const restoreW = ui.canvas.width;
  const restoreH = ui.canvas.height;
  const target = playblastDimensions(ui);
  if (target.width !== ui.canvas.width || target.height !== ui.canvas.height) {
    ui.canvas.width = target.width;
    ui.canvas.height = target.height;
    ui.render();
  }
  try {
    let blob = null;
    const encoderChoice = ui.root.querySelector('[data-role="encoder"]').value;
    // Imported here rather than at module scope: this module is on the
    // Director's startup path, and omnicam-webgl.js pulls in three + mediabunny.
    // By the time a playblast runs the chunk is normally already cached.
    const { encodeDeterministicPlayblast, supportsDeterministicEncoding } = await import("./omnicam-webgl.js");
    if (encoderChoice !== "realtime" && (await supportsDeterministicEncoding(ui.canvas.width, ui.canvas.height))) {
      blob = await encodeDeterministicPlayblast(ui.canvas, ui.state.duration_frames, ui.state.fps, async (frame) => {
        ui.setFrame(frame, true);
        ui.setStatus(t(`Encoding frame ${frame + 1}/${ui.state.duration_frames}…`));
        await waitForMediaFrame(ui);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }, ui.abortController?.signal);
    }
    if (!blob) {
      ui.setStatus(t("WebCodecs unavailable; recording realtime fallback…"));
      blob = await captureRealtime(ui);
    }
    ui.setFrame(oldFrame);
    await uploadDirectorPlayblast(ui, blob);
  } catch (error) {
    console.error(error);
    ui.setStatus(t(`Playblast failed: ${error.message || error}`));
  } finally {
    ui.recording = false;
    ui.root.classList.remove("recording");
    if (ui.canvas.width !== restoreW || ui.canvas.height !== restoreH) {
      ui.canvas.width = restoreW;
      ui.canvas.height = restoreH;
    }
    ui.resizeCanvas?.();
    ui.setFrame(oldFrame);
  }
}
