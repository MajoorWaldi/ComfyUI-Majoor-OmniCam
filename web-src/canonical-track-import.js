// Importing a canonical camera track into the Director.
//
// Two callers need this: the DCC file import (glTF/FBX/.chan) and the
// Extractor link. They used to differ in small ways that mattered -- one
// adopted the source FPS, one did not; one checkpointed, one did not -- so the
// behaviour lives here once and the differences are arguments.
//
// What this is *not* is a document load. The Extractor solves a camera; it
// does not know about the Director's cards, models, audio, background or
// render mode, and importing must not take any of them away.

import { t } from "./omnicam-i18n.js";
import { activeCameraTrack } from "./state-sync.js";

export const UPSTREAM_METADATA_KEY = "upstream_camera_track";

/**
 * Replace the active camera's keys with a canonical track's.
 *
 * @returns {number} how many keys were imported.
 */
export function applyCanonicalTrack(ui, track, {
  label = "Import camera",
  source = "camera_import",
  fingerprint = "",
  originNodeId = null,
  adoptFps = true,
  checkpoint = true,
  status = true,
} = {}) {
  const keyframes = track?.keyframes;
  if (!Array.isArray(keyframes) || !keyframes.length) {
    throw new Error(t("no camera keys in this file"));
  }

  if (checkpoint) ui.checkpoint(label);

  const camera = activeCameraTrack(ui);
  camera.keyframes = keyframes;
  // state.keyframes aliases the active track; both have to move together or
  // the timeline and the serialized state disagree about what exists.
  ui.state.keyframes = keyframes;

  if (adoptFps && Number.isFinite(Number(track.fps))) {
    ui.state.fps = Math.max(1, Math.round(Number(track.fps)));
    if (ui.fpsWidget) ui.fpsWidget.value = ui.state.fps;
  }
  if (Number.isFinite(Number(track.duration_frames))) {
    ui.state.duration_frames = Math.max(1, Math.round(Number(track.duration_frames)));
  }
  if (ui.durationWidget) {
    ui.durationWidget.value = ui.state.duration_frames / Math.max(1, ui.state.fps);
  }

  if (fingerprint) {
    // Recording what was imported is what lets a still-connected Extractor
    // leave the user's later edits alone.
    ui.state.metadata = {
      ...ui.state.metadata,
      [UPSTREAM_METADATA_KEY]: {
        fingerprint,
        source,
        ...(originNodeId == null ? {} : { origin_node_id: String(originNodeId) }),
      },
    };
  }

  ui.syncActiveCameraTrack();
  ui.setFrame(0);
  ui.refreshKeys();
  ui.render();
  ui.scheduleSerialize();
  if (status) {
    ui.setStatus(t("Imported {count} camera keys from {name}")
      .replace("{count}", String(keyframes.length))
      .replace("{name}", label));
  }
  return keyframes.length;
}
