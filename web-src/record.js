// Playblast recording orchestration: deterministic encoder selection,
// realtime fallback, media synchronization, progress reporting, upload.

import { api } from "../../scripts/api.js";
import { encodeDeterministicPlayblast, supportsDeterministicEncoding } from "./omnicam-webgl.js";
import { captureRealtimePlayblast, uploadPlayblast, waitForSeekingMedia } from "./omnicam-playblast.js";
import { t } from "./omnicam-i18n.js";

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
  const camera = ui.state.cameras.find((item) => item.id === ui.state.playblast_camera_id);
  if (camera) camera.recording_path = uploaded.path;
  if (ui.recordingWidget) ui.recordingWidget.value = uploaded.path;
  ui.serialize();
  ui.setStatus(t(`Playblast ready: ${uploaded.name}`));
}

export async function makePlayblast(ui) {
  if (ui.recording) return;
  ui.stopPlay();
  ui.recording = true;
  ui.root.classList.add("recording");
  ui.setStatus(t("Encoding deterministic proxy…"));
  const oldFrame = ui.frame;
  try {
    let blob = null;
    const encoderChoice = ui.root.querySelector('[data-role="encoder"]').value;
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
    ui.setFrame(oldFrame);
  }
}
