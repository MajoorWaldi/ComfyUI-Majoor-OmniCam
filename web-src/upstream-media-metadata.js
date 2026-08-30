/** Apply known upstream dimensions, frame rate and duration to Director widgets. */
export function adoptUpstreamMediaMetadata(ui, media, { frameCount = 0, fps = 0 } = {}) {
  const width = Math.round(Number(media?.videoWidth || media?.naturalWidth) || 0);
  const height = Math.round(Number(media?.videoHeight || media?.naturalHeight) || 0);
  const rate = Math.round(Number(fps) || Number(ui.state?.fps) || Number(ui.fpsWidget?.value) || 24);
  const mediaFrames = Number(media?.duration) > 0 ? Math.round(Number(media.duration) * rate) : 0;
  const frames = Math.round(Number(frameCount) || mediaFrames || 0);
  if (!width || !height) return false;

  ui.widthWidget && (ui.widthWidget.value = width);
  ui.heightWidget && (ui.heightWidget.value = height);
  if (rate) ui.fpsWidget && (ui.fpsWidget.value = rate);
  // Keep graph-facing widgets valid when a still is a one-frame source.
  if (frames && rate) ui.durationWidget && (ui.durationWidget.value = Math.max(0.25, frames / rate));
  ui.syncFromWidgets();
  return true;
}
