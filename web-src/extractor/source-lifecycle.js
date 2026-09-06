import { api } from "../comfy-runtime.js";
import { annotatedAssetUrl } from "../shared/managed-assets.js";
import { resizeTrackingOverlay, syncUpstreamPreviewCanvas } from "./source-stage.js";
import { resolveInteractiveExtractorSource } from "./source-resolver.js";

export function refreshExtractorSource(ui) {
  const mode = ui.extractMode || "camera_track";
  const resolved = resolveInteractiveExtractorSource(ui.node, ui.node.graph, mode);
  const sourceKey = resolved.ref ? `${resolved.ref.kind}:${resolved.ref.value}` : "";
  const sourceChanged = sourceKey !== (ui.sourceKey || "");
  if (sourceChanged) {
    const priorJobId = ui.state.jobId;
    ui.sourceKey = sourceKey;
    ui.describing = "";
    if (priorJobId) void ui.client.stopSolve(priorJobId).catch(() => {});
    ui.dispatch({ type: "SOURCE_RESET", source: { ...resolved, playbackError: "" } });
    ui.coordinator.setRate(24);
    ui.coordinator.setFrameCount(0);
  }
  const reloaded = ui.sourceViewer.setSource(
    resolved.available && resolved.ref ? annotatedAssetUrl(api, resolved.ref.value) : "",
    { source: resolved.available ? resolved.ref : null },
  );
  if (sourceChanged) ui.coordinator.seek(0, "source");
  ui.dispatch({ type: "SOURCE", source: reloaded ? { ...resolved, playbackError: "" } : resolved });
  // Scene Reconstruct reads a still image and has its own progress UI; the
  // frame-count/rate description below exists for the camera-track scrubber
  // and calls a video-only backend route that a still image cannot satisfy.
  if (mode !== "scene_reconstruct") {
    if (resolved.available && resolved.ref) void describeExtractorSource(ui, resolved);
    else adoptExtractorSourceLength(ui, 0);
  }
  syncUpstreamPreviewCanvas(ui, resolved);
  return resolved;
}

export async function describeExtractorSource(ui, resolved) {
  if (ui.describing === resolved.ref?.value) return null;
  ui.describing = resolved.ref?.value;
  try {
    const payload = await ui.client.describeSource(resolved.ref);
    if (ui.disposed || ui.sourceKey !== `${resolved.ref.kind}:${resolved.ref.value}`) return null;
    const info = payload?.info || null;
    ui.dispatch({ type: "SOURCE", source: { info } });
    if (info) {
      ui.coordinator.setRate(Number(info.fps) || ui.sourceViewer.fps);
      adoptExtractorSourceLength(ui, Number(info.frame_count) || 0);
      resizeTrackingOverlay(ui, info);
    }
    return info;
  } catch (error) {
    console.warn("[OmniCam] could not describe the extractor source", error);
    return null;
  }
}

export function adoptExtractorSourceLength(ui, frameCount) {
  const total = Math.max(0, Math.round(Number(frameCount) || 0));
  ui.coordinator.setFrameCount(total);
  if (total === ui.state.frameCount) return;
  ui.dispatch({ type: "FRAME_COUNT", frameCount: total });
  ui.coordinator.seek(ui.coordinator.frame, "source");
}
