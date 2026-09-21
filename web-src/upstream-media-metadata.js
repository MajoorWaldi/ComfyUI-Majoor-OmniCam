import { applyMediaAspectToCard } from "./viewport/subject-placeholder.js";

/** Apply known upstream dimensions, frame rate and duration to Director widgets. */
export function adoptUpstreamMediaMetadata(ui, media, { frameCount = 0, fps = 0 } = {}) {
  const width = Math.round(Number(media?.videoWidth || media?.naturalWidth) || 0);
  const height = Math.round(Number(media?.videoHeight || media?.naturalHeight) || 0);
  const rate = Math.round(Number(fps) || Number(ui.state?.fps) || Number(ui.fpsWidget?.value) || 24);
  const mediaFrames = Number(media?.duration) > 0 ? Math.round(Number(media.duration) * rate) : 0;
  const frames = Math.round(Number(frameCount) || mediaFrames || 0);
  if (!width || !height) return false;

  // A genuinely different upstream source (a new file plugged in, or the
  // origin node's output swapped) clears a duration the user typed by hand
  // for the *previous* clip. Re-syncing the SAME still-connected media --
  // which happens on every queue execution, not only on first connect --
  // must not, or a manual edit could never survive a single run.
  const mediaKey = media?.currentSrc || media?.src || media;
  if (ui.__lastUpstreamMediaKey !== mediaKey) {
    ui.__lastUpstreamMediaKey = mediaKey;
    ui.durationManuallySet = false;
  }

  ui.widthWidget && (ui.widthWidget.value = width);
  ui.heightWidget && (ui.heightWidget.value = height);
  if (rate) ui.fpsWidget && (ui.fpsWidget.value = rate);
  // Keep graph-facing widgets valid when a still is a one-frame source.
  if (!ui.durationManuallySet && frames && rate) {
    ui.durationWidget && (ui.durationWidget.value = Math.max(0.25, frames / rate));
  }
  ui.syncFromWidgets();

  const subject = ui.state?.objects?.find((o) => o.id === "subject");
  if (subject) {
    applyMediaAspectToCard(subject, media);
  }
  return true;
}
