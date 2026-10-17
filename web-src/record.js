import { notifyCompletion } from "./director/completion-toast.js";
// Playblast recording orchestration: deterministic encoder selection,
// realtime fallback, media synchronization, progress reporting, upload.

import { api } from "../../scripts/api.js";
import { captureRealtimePlayblast, uploadPlayblast, waitForSeekingMedia } from "./omnicam-playblast.js";
import { SEQUENCE_TARGET } from "./director/sequence.js";
import { t } from "./i18n.js";
import { storePlayblastManifest } from "./playblast-contract.js";
import { playblastDimensions } from "./playblast-size.js";

export async function waitForMediaFrame(ui) {
  await waitForSeekingMedia(ui.cardMediaById.values());
}

export async function captureRealtime(ui) {
  return captureRealtimePlayblast({
    canvas: ui.canvas,
    fps: ui.state.fps,
    frameCount: ui.state.duration_frames,
    quality: ui.state.playblast_quality,
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
  const message = t("Playblast ready: {value1}", { value1: uploaded.name });
  ui.setStatus(message);
  return message;
}

/**
 * Records the playblast. Resolves to `{ ok, message }` -- the same text the
 * editor shows in its footer -- so a caller with no footer (the node's REC
 * button) can say how it went. Frame progress is announced as a
 * `playblastprogress` event on the runtime.
 */
export async function makePlayblast(ui, { inline = false } = {}) {
  if (ui.recording) return { ok: false, message: "" };
  ui.stopPlay();
  ui.recording = true;
  ui.root.classList.add("recording");
  ui.setStatus(t("Encoding deterministic proxy…"));
  const oldFrame = ui.frame;
  const restoreW = ui.canvas.width;
  const restoreH = ui.canvas.height;
  const target = playblastDimensions(ui, { inline });
  if (target.width !== ui.canvas.width || target.height !== ui.canvas.height) {
    ui.canvas.width = target.width;
    ui.canvas.height = target.height;
    ui.render();
  }
  let outcome = { ok: false, message: "" };
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
        ui.setStatus(t("Encoding frame {value1}/{value2}…", { value1: frame + 1, value2: ui.state.duration_frames }));
        ui.runtime?.dispatchEvent(new CustomEvent("playblastprogress", { detail: { frame: frame + 1, total: ui.state.duration_frames } }));
        await waitForMediaFrame(ui);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }, ui.abortController?.signal, ui.state.playblast_quality);
    }
    if (!blob) {
      ui.setStatus(t("WebCodecs unavailable; recording realtime fallback…"));
      blob = await captureRealtime(ui);
    }
    ui.setFrame(oldFrame);
    outcome = { ok: true, message: await uploadDirectorPlayblast(ui, blob) };
  } catch (error) {
    console.error(error);
    outcome = { ok: false, message: t("Playblast failed: {value1}", { value1: error.message || error }) };
    ui.setStatus(outcome.message);
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
  notifyCompletion(ui, outcome.message, outcome.ok ? "success" : "error");
  return outcome;
}
