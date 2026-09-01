// Sizing and fallback drawing for the SOURCE stage, split out of index.js
// purely to keep that file under the repository's line limit.

import { drawUpstreamPreview } from "../shared/upstream-preview.js";

/**
 * Pick the single visual source the SOURCE stage may expose.
 *
 * An upstream thumbnail is evidence of an untrackable connection, so it wins
 * over both managed-source players. Otherwise native video is preferred until
 * its decoder fails and SourceViewer promotes its decoded-frame fallback.
 */
export function renderSourceStageMedia(ui, showingSource) {
  const upstream = Boolean(ui.upstreamPreviewActive);
  const mode = ui.sourceViewer?.mode || "native";
  const visible = !showingSource ? "none" : upstream ? "upstream" : mode === "fallback" ? "fallback" : "native";
  const setHidden = (role, isVisible) => {
    const element = ui.$(role);
    if (element) element.hidden = !isVisible;
  };
  setHidden("source-video", visible === "native");
  setHidden("fallback-preview", visible === "fallback");
  setHidden("upstream-preview", visible === "upstream");
  return visible;
}

/**
 * Match the overlay's pixel grid to the footage.
 *
 * `object-fit: contain` only letterboxes the canvas the same way as the video
 * if the two share an aspect ratio, so the overlay is sized from the measured
 * source rather than left at its markup default.
 */
export function resizeTrackingOverlay(ui, info) {
  const canvas = ui.$("tracking-overlay");
  const width = Math.round(Number(info?.width) || 0);
  const height = Math.round(Number(info?.height) || 0);
  if (!canvas || width < 1 || height < 1) return false;
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  ui.overlay.draw();
  return true;
}

/**
 * A source Extractor cannot solve yet -- a generator that has not executed,
 * a third-party node with no managed reference -- can often still be shown:
 * if the connected node has already rendered something into its own DOM
 * (a previous run's thumbnail, an upload preview), draw that in place of
 * the empty video element. It proves what is connected; it never proves the
 * source is trackable.
 */
export async function syncUpstreamPreviewCanvas(ui, resolved) {
  const canvas = ui.$("upstream-preview");
  if (!canvas) return;
  const media = !resolved.available ? resolved.previewMedia : null;
  ui.upstreamPreviewActive = media ? await drawUpstreamPreview(media, canvas, 960) : false;
  if (!ui.disposed) ui.render();
}

/** Advance every read-only consumer from the one Extractor frame clock. */
export function showExtractorFrame(ui, frame, { fromVideo = false } = {}) {
  const next = Math.max(0, Number(frame) || 0);
  const moved = ui.state.frame !== next;
  ui.state.frame = next;
  if (moved && ui.overlay.frame !== next) {
    const diagnostics = ui.diagnostics.get(next);
    if (diagnostics) ui.overlay.setDiagnostics(diagnostics);
    else ui.overlay.clear();
  }
  const scrubber = ui.$("scrubber");
  if (scrubber && fromVideo) scrubber.value = String(next);
  ui.viewer?.setFrame(next);
  ui.renderFrameReadouts();
}
